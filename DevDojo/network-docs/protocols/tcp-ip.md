# TCP/IP プロトコル

TCP/IP（Transmission Control Protocol/Internet Protocol）は、インターネットの基盤となるプロトコルスイートです。

## TCP/IPとは

TCP/IPは、異なるコンピューター間でデータを確実に送受信するためのプロトコル群です。

### TCP（Transmission Control Protocol）

- **信頼性の高い通信**: データの到達を保証
- **コネクション型**: 通信前に接続を確立
- **順序保証**: データの順序を維持

### IP（Internet Protocol）

- **アドレス管理**: IPアドレスによる識別
- **ルーティング**: データの経路決定
- **パケット配送**: データをパケット単位で送信

## TCP/IPの階層モデル

1. **アプリケーション層**: HTTP、FTP、SMTPなど
2. **トランスポート層**: TCP、UDP
3. **インターネット層**: IP、ICMP
4. **ネットワークインターフェース層**: Ethernet、WiFiなど

## 実践例

```bash
# IPアドレスの確認
ip addr show

# TCP接続の確認
netstat -tn

# ping を使った接続テスト
ping google.com
```

次は、HTTP/HTTPSプロトコルについて学習していきます。