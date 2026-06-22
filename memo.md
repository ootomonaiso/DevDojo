PyBricks dev USBデバッグ トラブルシュート手順書
前提・確認済み事項
ハブ: SPIKE Prime
Bluetooth接続: 正常動作
DFUモード書き込み: 正常、DFUドライバも問題なし
純正USBケーブル使用
WinUSBを当てたがZadigに通常起動時のデバイスが出てこない
Step 1: デバイスマネージャーで状態確認
PyBricks通常起動・USB接続した状態で確認：

確認場所	見つかった場合の意味
ポート（COMとLPT）	WindowsがCDCデバイスとして掴んでいる → Step 2へ
ほかのデバイス（!マーク）	ドライバ未割当の状態 → Step 3へ
ユニバーサルシリアルバスデバイス	WinUSBが当たっているか確認 → Step 4へ
どこにも出ない	USB通信自体が確立していない → Step 5へ
Step 2: COMポートとして認識されている場合
WindowsがCDC/シリアルとして先に掴んでいる状態。

デバイスマネージャーで該当COMデバイスを右クリック → ドライバーのアンインストール（「このデバイスのドライバーソフトウェアを削除する」にチェック）
ハブを抜き差し
Zadigを開き Options > List All Devices をON
該当デバイスを選択してWinUSBを適用
Step 3: !マーク付き不明デバイスの場合
デバイス名・VID/PIDをメモ（プロパティ → 詳細 → ハードウェアID）
Zadigで Options > List All Devices をON
対象デバイスを選んでWinUSBを適用
Step 4: WinUSBが当たっているように見えるがデバッグできない場合
code.pybricks.com を Chrome または Edge（Chromiumベース）で開いているか確認
ブラウザのWebUSBフィルターに引っかかっていないか確認（シークレットモードで試す）
別のUSBポート（USB 2.0）で試す
Step 5: デバイスマネージャーに何も出ない場合
USB通信が確立していない可能性。

ハブが通常起動しているか確認（電源ランプの色・点滅パターン）
別のUSBケーブル・ポートで試す（純正でも断線の可能性はゼロではない）
PyBricksファームウェアのバージョンを確認・最新に更新
Step 1の結果を教えてもらえれば次のステップに進めます。