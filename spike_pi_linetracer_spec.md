# SPIKE Prime + Raspberry Pi 4 ライントレーサー 仕様書

## 1. システム概要

LEGO SPIKE Prime をライントレーサー本体とし、Raspberry Pi 4 + Camera Module v2 が前方を先読みして走行パラメータをリアルタイムに補正するシステム。

```
┌─────────────────────────────────────────────────────┐
│  Raspberry Pi 4                                     │
│  ┌───────────────┐    JSON (USB Serial / UART)      │
│  │ pi_lookahead  │ ────────────────────────────────►│
│  │   .py         │ ◄── 20 Hz                        │
│  └───────┬───────┘                                  │
│          │ CSI                                      │
│  ┌───────┴───────┐                                  │
│  │ Camera v2     │ 先読み (カーブ/停止線/マーカー)  │
│  └───────────────┘                                  │
└─────────────────────────────────────────────────────┘
           │ USB-B ケーブル (または UART)
┌──────────▼──────────────────────────────────────────┐
│  SPIKE Prime                                        │
│  ┌───────────────┐                                  │
│  │ spike_line_   │  PID エッジ追従                  │
│  │ tracer.py     │  自動キャリブレーション           │
│  └───────────────┘  ライン消失リカバリー            │
└─────────────────────────────────────────────────────┘
```

---

## 2. ハードウェア構成

### 2-1. 部品一覧

| 部品 | 型番 / 仕様 | 備考 |
|---|---|---|
| メインハブ | LEGO SPIKE Prime ハブ | 45678 |
| 左モーター | SPIKE Prime 大型モーター | Port A |
| 右モーター | SPIKE Prime 大型モーター | Port B |
| カラーセンサー | SPIKE Prime カラーセンサー | Port C |
| Raspberry Pi | Raspberry Pi 4 Model B (2GB 以上推奨) | |
| カメラ | Raspberry Pi Camera Module v2 | Sony IMX219, FOV 62.2°×48.8° |
| 接続ケーブル | USB-A to USB-B (またはあとで説明する UART 配線) | Pi → SPIKE |
| カメラケーブル | CSI リボンケーブル (Camera Module v2 付属) | |

### 2-2. SPIKE Prime ポート割り当て

| ポート | 接続デバイス | 設定 |
|---|---|---|
| A | 左モーター | `Direction.CLOCKWISE` |
| B | 右モーター | `Direction.COUNTERCLOCKWISE` |
| C | カラーセンサー | — |
| F | (UART 接続時のみ) 3.3V UART TX/RX | 115200 baud |

---

## 3. 物理接続

### 3-1. 接続方式 A: USB Serial (推奨・簡単)

```
Raspberry Pi 4                SPIKE Prime
USB-A ポート  ────────────►  USB-B ポート (ハブ側面)
```

**手順:**
1. Pi の USB-A と SPIKE の USB-B を標準の USB-B ケーブルで接続する
2. Pi 側でポートを確認する

```bash
ls /dev/ttyACM*   # → /dev/ttyACM0 が表示されれば OK
```

3. `pi_lookahead.py` の `SERIAL_PORT = "/dev/ttyACM0"` のままで使用

> **注意**: pybricks でプログラムを実行中に `sys.stdin.any()` が機能しない場合は、接続方式 B (UART) を使用してください。

---

### 3-2. 接続方式 B: UART (確実・推奨)

USB Serial で動作しない場合はこちらを使用します。SPIKE Port F と Pi の GPIO UART を直接配線します。

#### SPIKE Prime Port F ピン配置

SPIKE のコネクターは LPF2 (LEGO Power Functions 2) 規格です。
ケーブルを切断または専用変換基板を使用して以下のピンを引き出します。

```
LPF2 コネクター (正面視)
 ┌─────────────────┐
 │ 1  2  3  4  5  6│
 └─────────────────┘
  GND      TX  RX
  (1)      (5) (6)   ← UART に使用するピン
```

| LPF2 ピン | 機能 | 接続先 (Pi GPIO) |
|---|---|---|
| 1 | GND | GPIO GND (Pin 6 など) |
| 5 | SPIKE TX → Pi RX | GPIO 15 (Pin 10, UART RX) |
| 6 | SPIKE RX ← Pi TX | GPIO 14 (Pin 8, UART TX) |

> SPIKE Prime の I/O は 3.3V です。Pi GPIO も 3.3V なのでレベル変換不要です。

#### Raspberry Pi 4 GPIO 配線図

```
Pi GPIO (40pin ヘッダー)         SPIKE Port F
                                  LPF2 変換ケーブル
  Pin  8  (GPIO 14 / TX) ──────► ピン 6 (RX)
  Pin 10  (GPIO 15 / RX) ◄────── ピン 5 (TX)
  Pin  6  (GND)          ──────► ピン 1 (GND)
```

#### Pi 側の UART 有効化

```bash
# /boot/firmware/config.txt (Pi OS Bookworm) または /boot/config.txt に追記
sudo nano /boot/firmware/config.txt
```

```ini
# 追記内容
enable_uart=1
dtoverlay=disable-bt        # Bluetooth と競合する場合
```

```bash
sudo reboot
ls /dev/ttyAMA0   # → 存在すれば OK
```

`pi_lookahead.py` の `SERIAL_PORT` を変更:

```python
SERIAL_PORT = "/dev/ttyAMA0"
```

SPIKE 側 `spike_line_tracer.py` の `pi_lookahead()` を UART 方式に変更:

```python
def pi_lookahead(self):
    import ujson
    from pybricks.iodevices import UARTDevice

    if not hasattr(self, '_uart'):
        self._uart = UARTDevice(Port.F, baudrate=115200)

    # 2 秒受信なし → オーバーライドをクリア
    if self._pi_sw.time() - self._pi_last_rx > 2000:
        self._pi_speed_override  = None
        self._pi_target_override = None

    if not self._uart.waiting():
        return

    try:
        raw = self._uart.read(self._uart.waiting())
        data = ujson.loads(raw.decode())
        self._pi_speed_override  = data.get('speed')
        self._pi_target_override = data.get('target')
        self._pi_last_rx = self._pi_sw.time()
        event = data.get('event')
        if event:
            self._handle_pi_event(event)
    except Exception:
        pass
```

---

### 3-3. カメラ取り付け

Camera Module v2 はロボット前部に以下の姿勢で固定します。

```
側面図:
         ┌──────────────┐
         │  Pi + カメラ │  ← カメラは前方向き
         └──────┬───────┘
         ロボット本体
         ──────────────────  地面
         ←── 走行方向
```

| パラメータ | 推奨値 | 理由 |
|---|---|---|
| カメラ高さ | 地面から 20〜30 cm | 十分な先読み距離を確保 |
| 下向き傾斜角 | 30〜45° | ROI が走行コース内に収まるよう |
| 水平方向 | ロボット進行軸と一致 | 左右の対称性を確保 |

> カメラ取り付け後、`pi_lookahead.py` の `ROI_TOP` / `ROI_BOTTOM` を実際の映像に合わせて調整してください（後述）。

---

## 4. ソフトウェア構成

### 4-1. ファイル一覧

| ファイル | 実行環境 | 役割 |
|---|---|---|
| `spike_line_tracer.py` | SPIKE Prime (pybricks-micropython) | ライントレーサー本体 |
| `pi_lookahead.py` | Raspberry Pi 4 (Python 3.9+) | カメラ先読みモジュール |

### 4-2. Pi 側セットアップ

```bash
# 必要パッケージのインストール
sudo apt update
sudo apt install python3-picamera2 python3-opencv python3-numpy python3-serial

# 動作確認 (dry-run モード: SPIKE 未接続でも動く)
python3 pi_lookahead.py
# → [dry-run] {"speed":null,"target":null,"event":null} が流れれば OK
```

### 4-3. SPIKE 側セットアップ

pybricks IDE (code.pybricks.com) で `spike_line_tracer.py` を開き、ハブへ転送する。

---

## 5. 通信プロトコル

### 5-1. フォーマット

Pi → SPIKE 方向のみの単方向通信です。  
JSON を改行 (`\n`) 区切りで送信します。

```json
{"speed":300,"target":null,"event":null}
```

| フィールド | 型 | 意味 |
|---|---|---|
| `speed` | `int \| null` | 推奨速度 [deg/s]。`null` = SPIKE の `BASE_SPEED` を使用 |
| `target` | `float \| null` | 目標反射値。`null` = キャリブレーション値を使用 (現状常に `null`) |
| `event` | `str \| null` | 特殊イベント名 (下表参照)。`null` = 通常走行 |

### 5-2. イベント一覧

| event 値 | 意味 | SPIKE 側の動作 |
|---|---|---|
| `"stop"` | 停止線検出 | 停止 → ビープ → CENTER ボタンで再開 (最大 10 秒待機) |
| `"intersect"` | 交差点検出 | `MIN_SPEED` に減速 (将来拡張: 分岐選択) |
| `"marker_red"` | 赤マーカー検出 | 現状はパススルー (将来拡張用) |
| `"marker_blue"` | 青マーカー検出 | 〃 |
| `"marker_green"` | 緑マーカー検出 | 〃 |

### 5-3. タイムアウト

SPIKE 側は **2 秒間受信なし** でオーバーライドを `null` にリセットし、自律走行に切り替えます。Pi が落ちてもロボットが止まらない設計です。

---

## 6. 設定パラメータ

### 6-1. SPIKE 側 (`spike_line_tracer.py`)

```python
# --- ポート ---
LEFT_MOTOR_PORT  = Port.A
RIGHT_MOTOR_PORT = Port.B
SENSOR_PORT      = Port.C

# --- モーター向き ---
LEFT_MOTOR_DIR  = Direction.CLOCKWISE
RIGHT_MOTOR_DIR = Direction.COUNTERCLOCKWISE

# --- PID ゲイン ---
KP = 1.2    # 比例ゲイン
KD = 0.8    # 微分ゲイン
KI = 0.002  # 積分ゲイン

# --- 速度 [deg/s] ---
BASE_SPEED = 350
MAX_SPEED  = 700
MIN_SPEED  = 80

# --- エッジ追従 ---
TRACK_EDGE       = 'right'  # 'right' or 'left'
LOST_THRESHOLD   = 82       # 白寄り → ライン消失
FOUND_THRESHOLD  = 75       # 再検出しきい値
```

### 6-2. Pi 側 (`pi_lookahead.py`)

```python
SERIAL_PORT   = "/dev/ttyACM0"  # 接続方式に応じて変更

# --- 撮影 ---
FRAME_W = 320
FRAME_H = 240

# --- ルックアヘッド ROI (0.0=上端, 1.0=下端) ---
ROI_TOP    = 0.10   # カメラ角度に合わせて調整
ROI_BOTTOM = 0.65

# --- カーブ速度制御 ---
STRAIGHT_CURV = 0.0008  # これ以下は直線扱い
MAX_CURV      = 0.008   # これ以上は最急カーブ

# --- 停止線検出 ---
STOPLINE_ROI_TOP    = 0.75   # 停止線 ROI の上端
STOPLINE_MIN_LENGTH = 0.55   # 検出するライン長 (画像幅比)

# --- カラーマーカー ---
MARKER_ROI_TOP    = 0.55
MARKER_ROI_BOTTOM = 0.75
MARKER_MIN_AREA   = 500      # マーカー最小面積 [px²]
```

---

## 7. キャリブレーション手順

### 7-1. センサーキャリブレーション (SPIKE)

1. ロボットの電源を入れ、プログラムを起動
2. ハブディスプレイに `LT` が表示される
3. **LEFT ボタン** を押すとキャリブレーションモード開始
4. `W?` 表示 → センサーを **白い面** に合わせ → **LEFT ボタン**
5. `B?` 表示 → センサーを **黒ライン上** に合わせ → **RIGHT ボタン**
6. ビープ音が鳴り、キャリブレーション完了
7. **RIGHT ボタン** を押すとキャリブレーションをスキップ（前回値を使用）

### 7-2. ROI 調整 (Pi カメラ)

カメラを取り付けた状態で以下を実行し、映像を確認します。

```python
# 確認スクリプト (Pi で実行)
from picamera2 import Picamera2
import cv2

cam = Picamera2()
cam.configure(cam.create_preview_configuration(
    main={"size": (320, 240), "format": "BGR888"}
))
cam.start()

while True:
    frame = cam.capture_array()
    # ROI 境界を描画
    h = frame.shape[0]
    cv2.line(frame, (0, int(h * 0.10)), (320, int(h * 0.10)), (0, 255, 0), 1)
    cv2.line(frame, (0, int(h * 0.65)), (320, int(h * 0.65)), (0, 255, 0), 1)
    cv2.line(frame, (0, int(h * 0.75)), (320, int(h * 0.75)), (255, 0, 0), 1)
    cv2.imshow("ROI check", frame)
    if cv2.waitKey(1) == ord('q'):
        break

cam.stop()
cv2.destroyAllWindows()
```

- **緑の上線** (`ROI_TOP`): コース外のものが映り込まないよう上端を設定
- **緑の下線** (`ROI_BOTTOM`): センサーが担当する近傍の手前で止める
- **青の線** (`STOPLINE_ROI_TOP`): 停止線が確実にこの下に映るよう設定

### 7-3. カラーマーカー HSV 調整

実際の照明環境で以下のスクリプトを実行し、HSV 値を計測します。

```python
# HSV 計測スクリプト (Pi で実行)
from picamera2 import Picamera2
import cv2
import numpy as np

cam = Picamera2()
cam.configure(cam.create_preview_configuration(
    main={"size": (320, 240), "format": "BGR888"}
))
cam.start()

def on_click(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        bgr = frame[y, x]
        hsv = cv2.cvtColor(np.uint8([[bgr]]), cv2.COLOR_BGR2HSV)[0][0]
        print(f"BGR={bgr}  HSV={hsv}  → H±10, S>100, V>50 を目安に設定")

cv2.namedWindow("HSV check")
cv2.setMouseCallback("HSV check", on_click)

while True:
    frame = cam.capture_array()
    cv2.imshow("HSV check", frame)
    if cv2.waitKey(1) == ord('q'):
        break

cam.stop()
```

マーカーをクリックして表示された HSV 値を `COLOR_RANGES` に設定します。

---

## 8. PID チューニング手順

```
1. KD=0, KI=0 にして KP だけ上げる
   → ロボットがちょうど振動し始める値 (Ku) を見つける
   → KP = Ku × 0.6 に設定

2. KP を固定したまま KD を少しずつ上げる
   → 振動が収まるまで増やす (過大にすると高周波ノイズが増幅される)

3. 直線でロボットが片側に流れる場合のみ KI を少量追加
   → 通常 0.001〜0.005 程度で十分

4. Pi 先読みとの組み合わせ確認
   → Pi がカーブ手前で速度を落とすため、KP / KD は
      単体時より気持ち大きめでも安定しやすい
```

---

## 9. 起動手順

### 毎回の起動順序

```
1. Pi を起動し OS が立ち上がるのを待つ (約 30 秒)
2. SPIKE Prime の電源を入れる
3. USB ケーブルを Pi の USB-A に接続
4. Pi で以下を実行:
      python3 pi_lookahead.py
5. SPIKE のプログラムを起動 (センターボタン長押し or pybricks IDE から実行)
6. LEFT ボタン: キャリブレーション実施
   RIGHT ボタン: スキップして即走行開始
```

### 自動起動 (Pi)

```bash
# /etc/rc.local または systemd service を使用する場合
sudo nano /etc/systemd/system/pi_lookahead.service
```

```ini
[Unit]
Description=SPIKE Pi Lookahead
After=multi-user.target

[Service]
ExecStart=/usr/bin/python3 /home/pi/pi_lookahead.py
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable pi_lookahead
sudo systemctl start pi_lookahead
```

---

## 10. トラブルシューティング

| 症状 | 原因 | 対処 |
|---|---|---|
| Pi が `/dev/ttyACM0` を認識しない | ドライバー未インストール / ケーブル不良 | `lsusb` で SPIKE が見えるか確認。ケーブルを差し替え |
| SPIKE が Pi のデータを受け取らない | `sys.stdin.any()` 非対応 | 接続方式 B (UART) に切り替え |
| カーブで速度が落ちない | `STRAIGHT_CURV` が大きすぎる | 値を小さく (`0.0003` 程度に) |
| 停止線で止まらない | `STOPLINE_MIN_LENGTH` が大きすぎる / ROI がずれている | 値を小さくし ROI を再調整 |
| カラーマーカーを誤検知する | HSV 範囲が広すぎる | スクリプトで実測し範囲を絞る |
| ライン消失時にリカバリーしない | `LOST_THRESHOLD` が低い | 白面でのセンサー値を確認し値を上げる |
| ロボットが振動する | KP が高すぎる | KP を 20% ずつ下げてテスト |
