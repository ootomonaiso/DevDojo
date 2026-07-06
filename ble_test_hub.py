#!/usr/bin/env pybricks-micropython
"""
BLE 疎通テスト — SPIKE Prime (ハブ側)

Pi から Bluetooth 経由で 1 文字受け取れるかだけを確認する最小プログラム。

使い方:
  1. code.pybricks.com か pybricksdev でこのプログラムを SPIKE に転送
  2. ハブの中央ボタンで起動 → ディスプレイに "?" が出る
  3. Pi 側で ble_test_pi.py を実行
  4. ディスプレイが "?" → "A" に変わり、ビープが鳴れば経路 OK

ポイント:
  - Pybricks では sys.stdin.any() は使えない。uselect.poll を使う。
  - stdin は「プログラムを起動した接続」= ここでは BLE 経由で届く。
"""

from pybricks.hubs import PrimeHub
from pybricks.tools import wait
from usys import stdin
from uselect import poll

hub = PrimeHub()

kb = poll()
kb.register(stdin)

hub.display.char("?")            # 待機中
hub.speaker.beep(800, 100)       # 起動確認のビープ

count = 0
while True:
    # 中央ボタンで終了
    from pybricks.parameters import Button
    if Button.CENTER in hub.buttons.pressed():
        break

    if kb.poll(0):               # データが来ていれば
        b = stdin.buffer.read(1) # 1 バイト読む (bytes)
        if b == b"A":
            count += 1
            hub.speaker.beep(1000, 150)
            hub.display.char("A")
        elif b:
            # A 以外が来た場合も受信自体は成功しているので表示
            hub.display.char("*")
    wait(10)

hub.display.char(" ")
