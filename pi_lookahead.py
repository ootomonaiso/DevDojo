#!/usr/bin/env python3
"""
Raspberry Pi 4 + Camera Module v2  →  SPIKE Prime 先読みモジュール

■ ハードウェア
  - Raspberry Pi 4
  - Camera Module v2 (Sony IMX219, FOV 62.2°×48.8°)
  - SPIKE Prime: USB ケーブルで接続 (/dev/ttyACM0, 115200 baud)
  - カメラはロボット前方上部に取り付け、前方・下方向きに固定

■ 検出内容と出力フィールド
  JSON を改行区切りで送信: {"speed": int|null, "target": null, "event": str|null}

  speed  : カーブ曲率から算出した推奨速度。直線では null (SPIKE 側が BASE_SPEED を使用)
  target : 現状は常に null (将来拡張用)
  event  : "stop"       — 停止線検出
           "intersect"  — 交差点検出
           "marker_red" / "marker_blue" / "marker_green" — カラーマーカー検出

■ セットアップ
  sudo apt install python3-picamera2 python3-opencv python3-numpy python3-serial
  python3 pi_lookahead.py
"""

from __future__ import annotations

import json
import sys
import time
from typing import Optional

import cv2
import numpy as np
import serial
from picamera2 import Picamera2

# ──────────────────────────────────────────────────────────────
# 設定
# ──────────────────────────────────────────────────────────────

SERIAL_PORT   = "/dev/ttyACM0"   # SPIKE Prime の USB シリアルポート
SERIAL_BAUD   = 115200
SEND_HZ       = 20               # 最大送信レート [Hz]
SEND_INTERVAL = 1.0 / SEND_HZ

# 撮影解像度 (Camera Module v2 は 3280×2464 最大; 処理速度優先で低解像度を使用)
FRAME_W = 320
FRAME_H = 240

# ルックアヘッド ROI (画像上部ほど遠方)
# 0.0 = 画像上端, 1.0 = 画像下端
ROI_TOP    = 0.10   # 上端 10% は天井など不要なものが映るためスキップ
ROI_BOTTOM = 0.65   # それ以下はセンサーが担当する近傍のため除外

N_SLICES = 8        # カーブ検出用スライス数

# 速度パラメータ (SPIKE 側の BASE_SPEED / MIN_SPEED と合わせる)
BASE_SPEED = 350
MIN_SPEED  = 100

# カーブ曲率しきい値 (実機で調整)
STRAIGHT_CURV = 0.0008   # これ以下は直線 → 速度オーバーライドなし (null)
MAX_CURV      = 0.008    # これ以上は最急カーブ

# 停止線検出: 画像下部 ROI 内で水平ラインを Hough 変換で検出
STOPLINE_ROI_TOP    = 0.75   # 停止線検出 ROI の上端
STOPLINE_MIN_LENGTH = 0.55   # 画像幅に対する最小ライン長の比率

# カラーマーカー検出 ROI
MARKER_ROI_TOP    = 0.55
MARKER_ROI_BOTTOM = 0.75
MARKER_MIN_AREA   = 500     # マーカーとみなす最小面積 [px²]

# HSV 色範囲 (H: 0-179, S: 0-255, V: 0-255)
# 赤は色相が 0 付近と 170 付近に跨るため 2 範囲を OR で結合
COLOR_RANGES: dict[str, list[tuple[np.ndarray, np.ndarray]]] = {
    "red": [
        (np.array([0,   120,  70]), np.array([10,  255, 255])),
        (np.array([170, 120,  70]), np.array([179, 255, 255])),
    ],
    "blue":  [(np.array([100, 150, 70]), np.array([130, 255, 255]))],
    "green": [(np.array([40,  100, 70]), np.array([80,  255, 255]))],
}

# ──────────────────────────────────────────────────────────────
# カメラ初期化
# ──────────────────────────────────────────────────────────────

def setup_camera() -> Picamera2:
    cam = Picamera2()
    cfg = cam.create_preview_configuration(
        main={"size": (FRAME_W, FRAME_H), "format": "BGR888"},
        controls={"FrameRate": 30},
    )
    cam.configure(cfg)
    cam.start()
    time.sleep(1.5)   # AEC / AWB の収束を待つ
    return cam


# ──────────────────────────────────────────────────────────────
# シリアル初期化
# ──────────────────────────────────────────────────────────────

def setup_serial() -> Optional[serial.Serial]:
    try:
        ser = serial.Serial(SERIAL_PORT, SERIAL_BAUD, timeout=0)
        print(f"[serial] connected: {SERIAL_PORT}", file=sys.stderr)
        return ser
    except serial.SerialException as e:
        print(f"[serial] WARN: {e} — dry-run モードで起動", file=sys.stderr)
        return None


# ──────────────────────────────────────────────────────────────
# 前処理: グレースケール + 適応的2値化
# ──────────────────────────────────────────────────────────────

def preprocess(frame_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    # 適応的2値化: 局所的な照明ムラに強い
    binary = cv2.adaptiveThreshold(
        blur, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=31, C=10,
    )
    # 小ノイズ除去
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    return cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)


# ──────────────────────────────────────────────────────────────
# カーブ曲率検出
# ──────────────────────────────────────────────────────────────

def detect_curve(binary: np.ndarray) -> tuple[float, list[tuple[int, int]]]:
    """
    ルックアヘッド ROI を N スライスに分割し、各スライスのライン重心から
    2次多項式 x = a*y² + b*y + c を当てはめて曲率を推定する。

    カメラ座標系: y は下方向が正 (画像上端=0, 下端=FRAME_H)
    Returns:
        curvature : float  絶対値が大きいほど急カーブ (符号は左右)
        centers   : list[(y, x)]  デバッグ・可視化用
    """
    h, w = binary.shape
    y_top    = int(h * ROI_TOP)
    y_bot    = int(h * ROI_BOTTOM)
    slice_h  = max(1, (y_bot - y_top) // N_SLICES)

    centers: list[tuple[int, int]] = []
    for i in range(N_SLICES):
        y0 = y_top + i * slice_h
        y1 = min(y0 + slice_h, y_bot)
        strip = binary[y0:y1, :]
        cols  = np.where(strip.sum(axis=0) > 0)[0]
        if len(cols) < 5:
            continue
        centers.append(((y0 + y1) // 2, int(np.mean(cols))))

    if len(centers) < 3:
        return 0.0, centers

    ys = np.array([c[0] for c in centers], dtype=np.float64)
    xs = np.array([c[1] for c in centers], dtype=np.float64)

    a, b, _ = np.polyfit(ys, xs, 2)

    y_eval = float(ys.mean())
    dxdy   = 2.0 * a * y_eval + b
    curv   = (2.0 * a) / (1.0 + dxdy ** 2) ** 1.5

    return float(curv), centers


# ──────────────────────────────────────────────────────────────
# 速度計算
# ──────────────────────────────────────────────────────────────

def curvature_to_speed(curvature: float) -> Optional[int]:
    """
    曲率から推奨速度を返す。直線判定時は None (= SPIKE 側に委ねる)。
    """
    abs_c = abs(curvature)
    if abs_c <= STRAIGHT_CURV:
        return None   # 速度オーバーライド不要
    t = min(1.0, (abs_c - STRAIGHT_CURV) / (MAX_CURV - STRAIGHT_CURV))
    speed = int(BASE_SPEED * (1.0 - 0.65 * t))   # 最大 65% 減速
    return max(MIN_SPEED, speed)


# ──────────────────────────────────────────────────────────────
# 停止線検出 (Hough 水平ライン)
# ──────────────────────────────────────────────────────────────

def detect_stopline(frame_bgr: np.ndarray) -> bool:
    """
    画像下部 ROI 内に水平方向のラインがあれば True。
    BINARY_INV では白い停止線が 0 になり検出できないため、
    グレースケールの Canny エッジを入力とする。
    """
    h, w = frame_bgr.shape[:2]
    y0      = int(h * STOPLINE_ROI_TOP)
    roi_bgr = frame_bgr[y0:, :]
    gray    = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2GRAY)
    edges   = cv2.Canny(gray, 50, 150)

    lines = cv2.HoughLinesP(
        edges, rho=1, theta=np.pi / 180,
        threshold=40,
        minLineLength=int(w * STOPLINE_MIN_LENGTH),
        maxLineGap=15,
    )
    if lines is None:
        return False

    for line in lines:
        x1, y1, x2, y2 = line[0]
        if abs(y2 - y1) < 8:   # 傾き 8px 未満 → 水平ライン
            return True
    return False


# ──────────────────────────────────────────────────────────────
# 交差点検出 (ライン幅の急激な増加)
# ──────────────────────────────────────────────────────────────

def detect_intersection(binary: np.ndarray) -> bool:
    """
    ルックアヘッド ROI 内でライン幅が中央値の 2.2 倍以上に広がる
    スライスが存在すれば交差点とみなす。
    """
    h, w = binary.shape
    y_top   = int(h * ROI_TOP)
    y_bot   = int(h * ROI_BOTTOM)
    slice_h = max(1, (y_bot - y_top) // N_SLICES)

    widths: list[float] = []
    for i in range(N_SLICES):
        y0    = y_top + i * slice_h
        y1    = min(y0 + slice_h, y_bot)
        strip = binary[y0:y1, :]
        cols  = np.where(strip.sum(axis=0) > 0)[0]
        if len(cols) >= 2:
            widths.append(float(cols[-1] - cols[0]))

    if len(widths) < 3:
        return False

    med = float(np.median(widths))
    return bool(np.max(widths) > med * 2.2)


# ──────────────────────────────────────────────────────────────
# カラーマーカー検出
# ──────────────────────────────────────────────────────────────

def detect_color_marker(frame_bgr: np.ndarray) -> Optional[str]:
    """
    マーカー ROI 内で MARKER_MIN_AREA 以上のカラーブロブを検出する。
    複数色が同時に検出された場合は優先度順 (red > blue > green) で返す。
    """
    h = frame_bgr.shape[0]
    y0  = int(h * MARKER_ROI_TOP)
    y1  = int(h * MARKER_ROI_BOTTOM)
    roi = frame_bgr[y0:y1, :]
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)

    for color_name, ranges in COLOR_RANGES.items():
        mask: Optional[np.ndarray] = None
        for lo, hi in ranges:
            m = cv2.inRange(hsv, lo, hi)
            mask = m if mask is None else cv2.bitwise_or(mask, m)
        if mask is not None and int(mask.sum()) // 255 >= MARKER_MIN_AREA:
            return color_name
    return None


# ──────────────────────────────────────────────────────────────
# JSON 送信
# ──────────────────────────────────────────────────────────────

def send_command(
    ser: Optional[serial.Serial],
    speed: Optional[int],
    target: Optional[float],
    event: Optional[str],
) -> None:
    payload = {"speed": speed, "target": target, "event": event}
    line = json.dumps(payload, separators=(",", ":")) + "\n"
    if ser is not None:
        try:
            ser.write(line.encode())
        except serial.SerialException as e:
            print(f"[serial] write error: {e}", file=sys.stderr)
    else:
        print(f"[dry-run] {line.strip()}", file=sys.stderr)


# ──────────────────────────────────────────────────────────────
# メインループ
# ──────────────────────────────────────────────────────────────

def main() -> None:
    cam = setup_camera()
    ser = setup_serial()

    prev_send = 0.0
    frame_cnt = 0
    t_start   = time.monotonic()

    print("[pi_lookahead] 開始 — Ctrl+C で停止", file=sys.stderr)

    try:
        while True:
            frame_bgr = cam.capture_array()
            binary    = preprocess(frame_bgr)

            curvature, _centers = detect_curve(binary)
            speed = curvature_to_speed(curvature)

            # イベント優先度: 停止線 > 交差点 > カラーマーカー
            event: Optional[str] = None
            if detect_stopline(frame_bgr):
                event = "stop"
                speed = 0
            elif detect_intersection(binary):
                event = "intersect"
                speed = MIN_SPEED
            else:
                marker = detect_color_marker(frame_bgr)
                if marker:
                    event = f"marker_{marker}"

            now = time.monotonic()
            if now - prev_send >= SEND_INTERVAL:
                send_command(ser, speed, None, event)
                prev_send = now

            frame_cnt += 1
            if frame_cnt % 150 == 0:
                fps = frame_cnt / (time.monotonic() - t_start)
                print(
                    f"[pi_lookahead] {fps:.1f} fps  "
                    f"curv={curvature:+.5f}  spd={speed}  ev={event}",
                    file=sys.stderr,
                )

    except KeyboardInterrupt:
        print("\n[pi_lookahead] 停止", file=sys.stderr)
    finally:
        cam.stop()
        if ser is not None:
            ser.close()


if __name__ == "__main__":
    main()
