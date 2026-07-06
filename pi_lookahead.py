#!/usr/bin/env python3
"""
Raspberry Pi 4 + Camera Module v2  →  SPIKE Prime (Pybricks) BLE 先読みモジュール

■ 通信方式: Bluetooth (BLE)
  Pybricks は「実行中プログラムへの USB シリアル送信」を未サポートのため、
  外部からデータを流し込める口は BLE の stdin だけ。Raspberry Pi 内蔵の
  Bluetooth で SPIKE に接続し、プログラムを起動した接続と同じ stdin へ送る。
  → Port F の配線加工も USB データケーブルも不要。

■ 前提
  - SPIKE 側に spike_line_tracer.py を転送済みで、ハブのボタンで起動しておく
    (spike_line_tracer.py は受信データが 2 秒来なければ自律走行に切り替わる)
  - カメラはロボット前方上部に、前方・下方向きに固定 (Camera Module v2)

■ 構成 (同期 CV と非同期 BLE の橋渡し)
  - カメラ+OpenCV は同期処理なので専用スレッドで回し、最新の指示を共有変数に置く
  - BLE 送信は asyncio(bleak) 側で SEND_HZ 間隔に最新指示を読んで送る
  - BLE が切れたら自動で再スキャン・再接続する

■ セットアップ
  sudo apt install python3-picamera2 python3-opencv python3-numpy
  pip install bleak
  python3 pi_lookahead.py
"""

from __future__ import annotations

import asyncio
import json
import sys
import threading
import time
from typing import Optional

import cv2
import numpy as np
from picamera2 import Picamera2

from bleak import BleakScanner, BleakClient

# ──────────────────────────────────────────────────────────────
# BLE 設定
# ──────────────────────────────────────────────────────────────

HUB_NAME          = "Pybricks Hub"   # 既定名。code.pybricks.com で確認・変更可
PYBRICKS_CMD_CHAR = "c5f50002-8280-46da-89f4-6d8051e4aeef"
STDIN_CMD         = 0x06             # "write stdin" コマンドバイト
BLE_MAX_WRITE     = 100              # 1 回の write の最大バイト数 (MTU 安全側)
SCAN_TIMEOUT      = 10.0             # スキャンのタイムアウト [s]
RECONNECT_WAIT    = 2.0             # 再接続までの待ち [s]

SEND_HZ       = 20                   # 最大送信レート [Hz]
SEND_INTERVAL = 1.0 / SEND_HZ

# ──────────────────────────────────────────────────────────────
# 撮影・検出パラメータ
# ──────────────────────────────────────────────────────────────

# 撮影解像度 (Camera Module v2 は最大 3280×2464; 処理速度優先で低解像度)
FRAME_W = 320
FRAME_H = 240

# ルックアヘッド ROI (0.0 = 画像上端/遠方, 1.0 = 画像下端/近傍)
ROI_TOP    = 0.10
ROI_BOTTOM = 0.65

N_SLICES = 8        # カーブ検出用スライス数

# 速度パラメータ (SPIKE 側の BASE_SPEED / MIN_SPEED と合わせる)
BASE_SPEED = 350
MIN_SPEED  = 100

# カーブ曲率しきい値 (実機で調整)
STRAIGHT_CURV = 0.0008   # これ以下は直線 → 速度オーバーライドなし (null)
MAX_CURV      = 0.008    # これ以上は最急カーブ

# 停止線検出 ROI
STOPLINE_ROI_TOP    = 0.75
STOPLINE_MIN_LENGTH = 0.55

# カラーマーカー検出 ROI
MARKER_ROI_TOP    = 0.55
MARKER_ROI_BOTTOM = 0.75
MARKER_MIN_AREA   = 500

# HSV 色範囲 (H: 0-179, S: 0-255, V: 0-255)
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
    # FrameDurationLimits の単位はマイクロ秒。30fps = 33333 μs
    cfg = cam.create_preview_configuration(
        main={"size": (FRAME_W, FRAME_H), "format": "BGR888"},
        controls={"FrameDurationLimits": (33333, 33333)},
    )
    cam.configure(cfg)
    cam.start()
    time.sleep(1.5)   # AEC / AWB の収束を待つ
    return cam


# ──────────────────────────────────────────────────────────────
# 前処理: グレースケール + 適応的2値化
# ──────────────────────────────────────────────────────────────

def preprocess(frame_bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    binary = cv2.adaptiveThreshold(
        blur, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=31, C=10,
    )
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    return cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)


# ──────────────────────────────────────────────────────────────
# カーブ曲率検出
# ──────────────────────────────────────────────────────────────

def detect_curve(binary: np.ndarray) -> tuple[float, list[tuple[int, int]]]:
    """
    ルックアヘッド ROI を N スライスに分割し、各スライスのライン重心から
    2次多項式 x = a*y² + b*y + c を当てはめて曲率を推定する。
    """
    h, w = binary.shape
    y_top   = int(h * ROI_TOP)
    y_bot   = int(h * ROI_BOTTOM)
    slice_h = max(1, (y_bot - y_top) // N_SLICES)

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
    """曲率から推奨速度を返す。直線判定時は None (= SPIKE 側に委ねる)。"""
    abs_c = abs(curvature)
    if abs_c <= STRAIGHT_CURV:
        return None
    t = min(1.0, (abs_c - STRAIGHT_CURV) / (MAX_CURV - STRAIGHT_CURV))
    speed = int(BASE_SPEED * (1.0 - 0.65 * t))   # 最大 65% 減速
    return max(MIN_SPEED, speed)


# ──────────────────────────────────────────────────────────────
# 停止線検出 (Hough 水平ライン)
# ──────────────────────────────────────────────────────────────

def detect_stopline(frame_bgr: np.ndarray) -> bool:
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
        if abs(y2 - y1) < 8:   # ほぼ水平
            return True
    return False


# ──────────────────────────────────────────────────────────────
# 交差点検出 (ライン幅の急増)
# ──────────────────────────────────────────────────────────────

def detect_intersection(binary: np.ndarray) -> bool:
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
# 共有状態 (カメラスレッド → BLE 送信タスク)
# ──────────────────────────────────────────────────────────────

class Shared:
    def __init__(self) -> None:
        self.lock    = threading.Lock()
        self.speed: Optional[int] = None
        self.event: Optional[str] = None
        self.frames  = 0
        self.running = True

    def update(self, speed: Optional[int], event: Optional[str]) -> None:
        with self.lock:
            self.speed  = speed
            self.event  = event
            self.frames += 1

    def snapshot(self) -> tuple[Optional[int], Optional[str]]:
        with self.lock:
            return self.speed, self.event


# ──────────────────────────────────────────────────────────────
# カメラ+CV スレッド
# ──────────────────────────────────────────────────────────────

def camera_worker(shared: Shared) -> None:
    cam = setup_camera()
    t_start = time.monotonic()
    print("[camera] 開始", file=sys.stderr)
    try:
        while shared.running:
            frame_bgr = cam.capture_array()
            binary    = preprocess(frame_bgr)

            curvature, _ = detect_curve(binary)
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

            shared.update(speed, event)

            if shared.frames % 150 == 0:
                fps = shared.frames / (time.monotonic() - t_start)
                print(
                    f"[camera] {fps:.1f} fps  curv={curvature:+.5f}  "
                    f"spd={speed}  ev={event}",
                    file=sys.stderr,
                )
    except Exception as e:
        print(f"[camera] エラー: {e}", file=sys.stderr)
    finally:
        cam.stop()
        print("[camera] 停止", file=sys.stderr)


# ──────────────────────────────────────────────────────────────
# BLE 送信
# ──────────────────────────────────────────────────────────────

def on_notify(_char, data: bytearray) -> None:
    """ハブからの通知 (stdout など) を best-effort で表示する。"""
    try:
        text = bytes(data[1:]).decode()
    except Exception:
        return
    if text.strip():
        sys.stderr.write("[hub] " + text)


async def send_line(client: BleakClient, line: bytes) -> None:
    """1 行 (JSON+改行) を stdin へ。MTU 超えは分割して送る。"""
    for i in range(0, len(line), BLE_MAX_WRITE):
        chunk = line[i:i + BLE_MAX_WRITE]
        await client.write_gatt_char(
            PYBRICKS_CMD_CHAR, bytes([STDIN_CMD]) + chunk, response=True
        )


async def stream_to_hub(shared: Shared) -> None:
    """ハブに接続し、最新の指示を SEND_HZ で送り続ける。切断時は再接続。"""
    while shared.running:
        print(f"[BLE] '{HUB_NAME}' をスキャン中...", file=sys.stderr)
        device = await BleakScanner.find_device_by_name(HUB_NAME, timeout=SCAN_TIMEOUT)
        if device is None:
            print("[BLE] 見つからない。ハブ起動/他機器の接続を確認 → 再試行",
                  file=sys.stderr)
            await asyncio.sleep(RECONNECT_WAIT)
            continue

        try:
            async with BleakClient(device) as client:
                print(f"[BLE] 接続: {device.address}", file=sys.stderr)
                try:
                    await client.start_notify(PYBRICKS_CMD_CHAR, on_notify)
                except Exception:
                    pass

                prev = 0.0
                while shared.running and client.is_connected:
                    now = time.monotonic()
                    if now - prev >= SEND_INTERVAL:
                        speed, event = shared.snapshot()
                        payload = {"speed": speed, "target": None, "event": event}
                        line = (json.dumps(payload, separators=(",", ":")) + "\n").encode()
                        await send_line(client, line)
                        prev = now
                    await asyncio.sleep(0.002)
        except Exception as e:
            print(f"[BLE] 切断/エラー: {e}", file=sys.stderr)

        if shared.running:
            print(f"[BLE] {RECONNECT_WAIT:.0f}s 後に再接続", file=sys.stderr)
            await asyncio.sleep(RECONNECT_WAIT)


# ──────────────────────────────────────────────────────────────
# メイン
# ──────────────────────────────────────────────────────────────

def main() -> None:
    shared = Shared()
    cam_thread = threading.Thread(target=camera_worker, args=(shared,), daemon=True)
    cam_thread.start()

    print("[pi_lookahead] 開始 — Ctrl+C で停止", file=sys.stderr)
    try:
        asyncio.run(stream_to_hub(shared))
    except KeyboardInterrupt:
        print("\n[pi_lookahead] 停止要求", file=sys.stderr)
    finally:
        shared.running = False
        cam_thread.join(timeout=2.0)
        print("[pi_lookahead] 終了", file=sys.stderr)


if __name__ == "__main__":
    main()
