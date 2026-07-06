#!/usr/bin/env python3
"""
BLE 疎通テスト — Raspberry Pi (送信側)

SPIKE Prime (Pybricks) を Bluetooth で見つけて接続し、stdin に "A" を送る。
ble_test_hub.py をハブで起動した状態で実行すること。

セットアップ:
  pip install bleak

判定:
  ハブのディスプレイが "?" → "A" に変わり、ビープが鳴れば全経路 OK。
"""

import asyncio
import sys

from bleak import BleakScanner, BleakClient

# Pybricks ハブの BLE 設定
HUB_NAME = "Pybricks Hub"   # 既定名。code.pybricks.com で確認・変更可
PYBRICKS_CMD_CHAR = "c5f50002-8280-46da-89f4-6d8051e4aeef"
STDIN_CMD = 0x06            # "write stdin" コマンドバイト


def on_notify(_char, data: bytearray) -> None:
    """ハブからの通知 (stdout など) を best-effort で表示する。"""
    try:
        text = bytes(data[1:]).decode()
    except Exception:
        return
    if text.strip():
        sys.stderr.write("[hub] " + text)


async def main() -> None:
    print(f"[BLE] '{HUB_NAME}' をスキャン中...")
    device = await BleakScanner.find_device_by_name(HUB_NAME, timeout=10.0)
    if device is None:
        print("[BLE] 見つからない。確認事項:")
        print("  - ハブの電源が入っていて ble_test_hub.py が起動しているか")
        print("  - 他の機器 (PC/スマホ/code.pybricks.com) が BLE を掴んでいないか")
        print(f"  - ハブ名が '{HUB_NAME}' と一致しているか")
        return

    print(f"[BLE] 発見: {device.address} — 接続中...")
    async with BleakClient(device) as client:
        print("[BLE] 接続成功")
        try:
            await client.start_notify(PYBRICKS_CMD_CHAR, on_notify)
        except Exception:
            pass  # 通知購読は任意 (失敗しても送信は可能)

        for i in range(5):
            await client.write_gatt_char(
                PYBRICKS_CMD_CHAR, bytes([STDIN_CMD]) + b"A", response=True
            )
            print(f"[BLE] 'A' 送信 ({i + 1}/5)")
            await asyncio.sleep(0.5)

        print("[BLE] 完了。ハブが 'A' 表示＆ビープしていれば成功。")
        await asyncio.sleep(0.5)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
