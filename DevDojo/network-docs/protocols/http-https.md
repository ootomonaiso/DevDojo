# HTTP/HTTPS プロトコル

HTTP（HyperText Transfer Protocol）とHTTPS（HTTP Secure）は、WebブラウザとWebサーバー間の通信に使用されるプロトコルです。

## HTTPとは

HTTPは、Webページやデータを転送するためのプロトコルです。

### HTTPの特徴

- **ステートレス**: 各リクエストは独立
- **テキストベース**: 人間が読みやすい形式
- **リクエスト/レスポンス**: クライアントサーバーモデル

### HTTPメソッド

- **GET**: データの取得
- **POST**: データの送信
- **PUT**: データの更新
- **DELETE**: データの削除

## HTTPSとは

HTTPSは、HTTPにSSL/TLSによる暗号化を追加したプロトコルです。

### HTTPSの利点

- **暗号化**: 通信内容の保護
- **認証**: サーバーの身元確認
- **完全性**: データの改ざん検出

## 実践例

```bash
# HTTPリクエストの送信
curl http://example.com

# HTTPSリクエストの送信
curl https://example.com

# ヘッダー情報の確認
curl -I https://google.com
```

Webアプリケーション開発では、これらのプロトコルの理解が不可欠です。