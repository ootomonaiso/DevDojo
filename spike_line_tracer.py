#!/usr/bin/env pybricks-micropython
"""
SPIKE Prime PID ライントレーサー
- PID制御によるエッジ追従
- 自動キャリブレーション
- ライン消失時のスマートリカバリー
- カーブ検出による動的速度調整
- Raspberry Pi カメラ先読み連携フック (将来拡張用)
"""

from pybricks.hubs import PrimeHub
from pybricks.pupdevices import Motor, ColorSensor
from pybricks.parameters import Port, Direction, Button
from pybricks.tools import wait, StopWatch

# ==================================================
# 設定 ─ ここを自分の機体に合わせて調整
# ==================================================

# --- ポート設定 ---
LEFT_MOTOR_PORT  = Port.A
RIGHT_MOTOR_PORT = Port.B
SENSOR_PORT      = Port.C

# --- モーター向き ---
# 機体を前に動かしたとき、正転(run(正値))になるよう調整
# 逆回転になる場合は Direction.COUNTERCLOCKWISE に変更
LEFT_MOTOR_DIR  = Direction.CLOCKWISE
RIGHT_MOTOR_DIR = Direction.COUNTERCLOCKWISE  # 対称配置の場合は逆

# --- PIDゲイン ---
# チューニング手順: Kp → Kd → Ki の順に調整
#   Kp: まず Kd=Ki=0 にして Kp だけ上げ、ちょうど振動し始める値の 0.6 倍に設定
#   Kd: 振動が収まるまで少しずつ増やす
#   Ki: 直線でロボットが片側に流れるなら少しだけ追加 (通常は不要なほど小さい)
KP = 1.2
KD = 0.8
KI = 0.002

# --- 速度設定 (deg/s) ---
BASE_SPEED = 350   # 通常走行速度
MAX_SPEED  = 700   # モーターに送れる最大値
MIN_SPEED  = 80    # コーナー最大制動後の下限

# --- センサー設定 ---
TRACK_EDGE = 'right'   # 'right': ラインの右エッジ追従 / 'left': 左エッジ追従
LOST_THRESHOLD  = 82   # これ以上(白寄り)でライン消失とみなす
FOUND_THRESHOLD = 75   # リカバリー後、これ以下でライン発見とみなす

# ==================================================
# PID コントローラ
# ==================================================

class PID:
    def __init__(self, kp, ki, kd):
        self.kp, self.ki, self.kd = kp, ki, kd
        self.integral   = 0.0
        self.last_error = 0.0
        self._sw = StopWatch()

    def reset(self):
        self.integral   = 0.0
        self.last_error = 0.0
        self._sw.reset()

    def compute(self, error):
        dt = max(self._sw.time(), 1) / 1000.0  # ms → 秒
        dt = min(dt, 0.1)                       # 微分スパイク防止: 100ms 上限
        self._sw.reset()

        # 積分項 (アンチワインドアップ付き)
        self.integral = max(-1000.0, min(1000.0, self.integral + error * dt))

        # 微分項
        derivative = (error - self.last_error) / dt
        self.last_error = error

        return (self.kp * error) + (self.ki * self.integral) + (self.kd * derivative)


# ==================================================
# ライントレーサー本体
# ==================================================

class LineTracer:

    def __init__(self):
        self.hub    = PrimeHub()
        self.left   = Motor(LEFT_MOTOR_PORT,  LEFT_MOTOR_DIR)
        self.right  = Motor(RIGHT_MOTOR_PORT, RIGHT_MOTOR_DIR)
        self.sensor = ColorSensor(SENSOR_PORT)
        self.pid    = PID(KP, KI, KD)

        # キャリブレーション値 (デフォルトは一般的な値、実機では必ずキャリブを)
        self.white  = 90.0
        self.black  = 10.0
        self.target = 50.0  # エッジの目標値 (白と黒の中間)

        # ライン消失管理
        self._lost     = False
        self._lost_dir = 1   # 消失直前の旋回方向: +1 or -1
        self._lost_sw  = StopWatch()

        # Pi カメラ先読み用 (将来拡張)
        self._pi_speed_override    = None
        self._pi_target_override   = None

    # --------------------------------------------------
    # キャリブレーション
    # --------------------------------------------------

    def calibrate(self):
        """
        センサーの白/黒基準値を対話的に取得する。
        """
        def sample_avg(n=30):
            return sum(self.sensor.reflection() for _ in range(n)) / n

        self.hub.display.text("W?")
        print("白い面にセンサーを合わせ → LEFT ボタン")
        while Button.LEFT not in self.hub.buttons.pressed():
            wait(20)
        self.white = sample_avg()
        self.hub.speaker.beep(1000, 200)

        wait(600)

        self.hub.display.text("B?")
        print("黒ライン上にセンサーを合わせ → RIGHT ボタン")
        while Button.RIGHT not in self.hub.buttons.pressed():
            wait(20)
        self.black = sample_avg()
        self.hub.speaker.beep(500, 200)

        self.target = (self.white + self.black) / 2.0
        if self.white <= self.black:
            print("WARNING: 白黒反転。センサー位置を確認してください")
        print(f"CAL done → white={self.white:.1f}  black={self.black:.1f}  target={self.target:.1f}")
        wait(800)

    # --------------------------------------------------
    # ユーティリティ
    # --------------------------------------------------

    def _normalize(self, raw):
        """センサー生値を 0(黒) 〜 100(白) に線形変換"""
        span = self.white - self.black
        if span == 0:
            return 50.0
        return max(0.0, min(100.0, (raw - self.black) / span * 100.0))

    def _drive(self, left_spd: int, right_spd: int) -> None:
        self.left.run( max(-MAX_SPEED, min(MAX_SPEED, left_spd)))
        self.right.run(max(-MAX_SPEED, min(MAX_SPEED, right_spd)))

    def _stop(self):
        self.left.brake()
        self.right.brake()

    # --------------------------------------------------
    # ライン消失リカバリー
    # --------------------------------------------------

    def _recover(self):
        """
        ラインを見失ったときの探索シーケンス。
        True を返す間はリカバリー中、False で完全タイムアウト停止。
        """
        t = self._lost_sw.time()

        if t < 300:
            # フェーズ1: 消失前の方向に素早く旋回
            spd = 220 * self._lost_dir
            self._drive(spd, -spd)

        elif t < 1800:
            # フェーズ2: ジグザグサーチ (300ms ごとに方向反転)
            # phase=0 はフェーズ1と逆方向、_lost_dir で初期向きを決定
            phase = (t // 300) % 2
            spd = 160
            if self._lost_dir * (1 if phase == 0 else -1) < 0:
                self._drive( spd, -spd)
            else:
                self._drive(-spd,  spd)

        else:
            # タイムアウト
            self._stop()
            self.hub.speaker.beep(300, 800)
            return False

        return True

    # --------------------------------------------------
    # Raspberry Pi カメラ連携フック (将来拡張)
    # --------------------------------------------------

    def pi_lookahead(self):
        """
        Raspberry Pi カメラからの先読み情報を受け取るフック。

        実装例 (Pi 側が UART/USB で JSON を送る場合):
            import ujson, sys
            if sys.stdin in select.select([sys.stdin], [], [], 0)[0]:
                data = ujson.loads(sys.stdin.readline())
                self._pi_speed_override  = data.get('speed')
                self._pi_target_override = data.get('target')

        Pi 側でできること:
            - カーブ曲率の先読み → BASE_SPEED を事前に落とす
            - 交差点・停止線の検出 → 特殊ハンドリングに切り替え
            - カラーマーカー認識 → コース分岐の選択
            - オブジェクト検出 → 障害物回避モードへ

        このメソッドが戻り値を持たず副作用として
        self._pi_speed_override / self._pi_target_override を書き換えると、
        以降のループで自動的に反映される設計。
        """
        pass  # 現状はパススルー

    # --------------------------------------------------
    # メインループ
    # --------------------------------------------------

    def run(self):
        self.hub.display.number(0)
        self.hub.speaker.beep(1200, 300)
        self.pid.reset()

        tick = 0
        print(f"=== GO: Kp={KP} Ki={KI} Kd={KD} base={BASE_SPEED} edge={TRACK_EDGE} ===")

        while True:
            # 中央ボタンで緊急停止
            if Button.CENTER in self.hub.buttons.pressed():
                print("=== 手動停止 ===")
                break

            # Pi カメラ先読みフック
            self.pi_lookahead()

            raw = self.sensor.reflection()
            ref = self._normalize(raw)

            # ──── ライン消失判定 ────
            if ref > LOST_THRESHOLD:
                if not self._lost:
                    self._lost     = True
                    self._lost_dir = 1 if self.pid.last_error > 0 else -1
                    self._lost_sw.reset()
                    print(f"LOST (ref={ref:.0f})")

                if not self._recover():
                    break
                wait(8)
                continue

            if self._lost and ref < FOUND_THRESHOLD:
                self._lost = False
                self.pid.reset()
                print(f"FOUND (ref={ref:.0f})")

            # ──── PID 計算 ────
            # エッジ追従: センサーが白側(ライン外)なら正、黒側(ライン内)なら負のエラー
            target = self._pi_target_override if self._pi_target_override else self.target

            if TRACK_EDGE == 'right':
                error = ref - target   # 白方向が正 → 左に補正 → 右モーター加速
            else:
                error = target - ref   # 左エッジの場合は符号反転

            correction = self.pid.compute(error)
            correction = max(-MAX_SPEED, min(MAX_SPEED, correction))

            # ──── 動的速度調整 ────
            # カーブが強いほど (|correction| 大) 減速する
            base = self._pi_speed_override if self._pi_speed_override else BASE_SPEED
            curve_factor = 1.0 - 0.55 * abs(correction) / MAX_SPEED
            speed = max(MIN_SPEED, int(base * curve_factor))

            self._drive(speed + correction, speed - correction)

            # デバッグ出力 (100 tick ごと)
            tick += 1
            if tick % 100 == 0:
                print(f"ref={ref:5.1f}  err={error:+6.1f}  cor={correction:+6.0f}  spd={speed:3d}")

            wait(5)

        self._stop()
        self.hub.speaker.beep(400, 600)
        print("=== STOP ===")

    # --------------------------------------------------
    # スタートシーケンス
    # --------------------------------------------------

    def start(self):
        self.hub.display.text("LT")
        print("LEFT=キャリブレーション / RIGHT=スキップ (5 秒以内)")

        sw = StopWatch()
        while sw.time() < 5000:
            btns = self.hub.buttons.pressed()
            if Button.LEFT  in btns:
                self.calibrate()
                break
            if Button.RIGHT in btns:
                print(f"スキップ (white={self.white} black={self.black})")
                break
            wait(40)

        wait(1000)
        self.run()


# ==================================================
# エントリーポイント
# ==================================================

LineTracer().start()
