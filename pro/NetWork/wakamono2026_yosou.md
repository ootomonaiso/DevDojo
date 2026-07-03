---
sidebar_position: 2
description: 第21回若年者ものづくり競技大会 ITネットワークシステム管理 非公式予想問題(2026)
---

# 第21回 若年者ものづくり競技大会「ITネットワークシステム管理」予想問題(2026・非公式)

:::warning これは公式の競技課題ではありません
第20回(2025年)実施課題と、第21回(2026年)「競技課題概要(参加の手引き)」の公開情報をもとに、学習・練習用としてAIが構成した**非公式の予想問題**です。実際の課題ではドメイン名・IPアドレス・出題内容が異なります。「個別のサービス構築や設定の出題有無に関する問合わせには一切回答できません」と公式に明記されているため、的中を保証するものではありません。
:::

## 0. 出題予想の根拠

- **ネットワーク構成の刷新**: 事業所が「東京・香川1・香川2・大阪」→「東京・富山・大阪」に再編。東京がDMZ+Internal1+Internal2の複雑構成、富山がDMZ+Internalでルータ2台(R-Tym1, R-Tym2)、大阪はクライアントのみ(公式図2)。
- **採点対象がルータ/サーバ/クライアント各3台程度**: 前回「複雑な3サーバ構成の大阪はルータ(R-Osk)が事前設定済み・対象外」だった構図を踏襲し、今回は複雑な東京のルータ(R-Tky)が対象外、**R-Tym1・R-Tym2・R-Osk**が採点対象と予想。
- **富山のDMZを2ルータで挟む構成**: 外側(R-Tym1, PPPoE)+DMZ+内側(R-Tym2)+Internalという二段防御構成を新規要素として設計。
- **新規サービス項目**(公式一覧に追加): 「リバースProxy」「tftp(tftpd-hpa)」「SSH(openssh-server)」→ それぞれリバースプロキシ設定・ルータconfigバックアップ・SSH確認作業として組み込み。
- **世代更新**: サーバOS Debian GNU/Linux 13.x、クライアントOS Windows 11、CML 2.x。**サーバOSインストール作業は競技課題から除外**。
- **競技時間短縮**(3時間30分)を踏まえ、前回よりやや作業量を絞った設計。

## 1. 競技課題の背景と概要

東京事業所、富山事業所及び大阪事業所の三つのネットワークで構成され、ルータISPを経由して「仮想インターネットエリア」に接続されている。

### 1.1 東京事業所

DMZ、内部ネットワークInternal1及びInternal2で構成。**今年度の「複雑な3ノード事業所」であり、ルータR-Tkyは全設定済み・操作禁止**(前回の大阪事業所R-Oskと同じ立ち位置)。

| ノード | 役割 |
|---|---|
| tky-sv1(DMZ, 採点対象) | ネーム、メール、Web、リバースProxy、Proxy |
| tky-sv2(Internal1, 採点対象) | 内部ネーム、ユーザ/グループ、ファイル共有、クォータ、ソフトウェアRAID、DHCP、tftp、SSH |
| tky-client(Internal2, 採点対象) | DHCP接続、Proxy経由ブラウジング、ネットワークドライブ、SSH接続 |

### 1.2 富山事業所

DMZ及び内部ネットワークInternalで構成。**外側(R-Tym1)と内側(R-Tym2)の2台のルータでDMZを挟む二段構え構成**。

| ノード | 役割 |
|---|---|
| R-Tym1(外側, 採点対象) | PPPoEクライアント |
| R-Tym2(内側, 採点対象) | Internal側ルーティング・DHCPリレー |
| tym-sv(DMZ, 採点対象) | ネーム、Web、FTP、DHCP |
| tym-client(Internal, 採点対象) | DHCP接続、Thunderbirdメール送受信、SSH接続 |

### 1.3 大阪事業所

内部ネットワークInternalのみ。今年度の「最も単純な事業所」で、サーバは配置されない。

| ノード | 役割 |
|---|---|
| R-Osk(採点対象) | インタフェース、経路制御、NAT、ACL、DHCPサーバ(ルータ自身) |
| osk-client(採点対象) | DHCP接続、ルート証明書導入、HTTPS閲覧 |

### 1.4 仮想インターネットエリア

sv(採点対象外・検証用): 認証局、ネーム、Web、メールサービスが稼働。

- 認証局: secret.tky-skills.jp、secret.wakamono-net.orgの証明書を発行済み。ルート証明書 `cacert.crt` は `http://www.wakamono-net.org/CA/` から入手可能。
- ネーム: sv.wakamono-net.org、www.wakamono-net.org、www6.wakamono-net.org、secret.wakamono-net.org、www.gamehub.net。MXはsv.wakamono-net.org。
- Web: `http://www.wakamono-net.org/`、`http://www.gamehub.net`、`https://secret.wakamono-net.org/`
- ex-client(対象外・検証用): ISPよりIPv4/IPv6を払い出し。

**採点対象まとめ(予想)**

- ルータ: R-Tym1・R-Tym2・R-Osk
- サーバ: tky-sv1・tky-sv2・tym-sv
- クライアント: tky-client・osk-client・tym-client
- 対象外: R-Tky、sv、ex-client

## 2. ルータの設定

富山事業所R-Tym1・R-Tym2、大阪事業所R-Oskの設定を行う。**R-Tkyは操作禁止。**

### 2.1 共通設定

| ホスト名 | コンソールパスワード | イネーブルパスワード |
|---|---|---|
| R-Tym1 | cisco | cisco |
| R-Tym2 | cisco | cisco |
| R-Osk | cisco | cisco |

ターミナル環境:

- コマンド誤入力によるDNS検索を行わない
- タイムゾーンをJSTに設定
- コンソール接続時、自動ログアウト機能を無効化
- コンソール接続時、Moreページング機能を無効化
- コンソール接続時、表示割り込みに対する入力補完を有効化
- コンソール接続時、常に特権モードでアクセス可能にする

別紙表1に基づき各インタフェースにIPv4/IPv6アドレスを設定する。

### 2.2 R-Tym1(富山・外側/DMZ側)

**経路制御**: IPv4デフォルト経路(PPPoE経由)、IPv6デフォルト経路を設定。R-Tym2配下のInternal(192.168.20.0/24)へのスタティックルートを設定。

**PPPoEクライアント**(CHAP認証、MTU 1492Byte):

| ユーザ名 | パスワード |
|---|---|
| tym-user | Ty26pass |

**アドレス変換**:

- tym-svのIPv4アドレスをダイヤラインタフェースのアドレス(動的払出)へ静的変換(グローバルアドレスが動的のためインタフェース指定NATを使用)
- Internal内ノードのIPv4アドレスをダイヤラインタフェースのアドレスへ動的変換

**アクセス制御(IPv4)**:

- tym-svの発信トラフィックへの戻りを許可
- Internal内ノードの発信トラフィックへの戻りを許可
- tym-sv上のDNS/Web(80)/FTP(21)サービスへのトラフィックを許可
- tym-sv、R-Tym1へのエコー要求を許可
- 上記以外は許可しない

### 2.3 R-Tym2(富山・内側/Internal側)

**経路制御**: R-Tym1経由のIPv4/IPv6デフォルト経路を設定。

**アクセス制御(DMZ⇔Internal間)**: DMZ側からInternal側への新規セッションは(Internal発の戻りを除き)遮断。Internal側からtym-svへのDNS/Web/FTP/DHCPは許可。R-Tym2へのエコー要求を許可。

**DHCPリレー**: tym-svのDHCPサーバがInternal(tym-client)へサービス提供できるよう設定。

### 2.4 R-Osk(大阪)

**経路制御**: IPv4デフォルト経路を設定。

**アドレス変換**: osk-clientのIPv4アドレスをGi0/0インタフェースアドレスへ動的変換。

**アクセス制御(IPv4)**: R-Oskへのエコー要求のみ許可、それ以外は許可しない。

**DHCPサーバ**(192.168.30.0/24):

- 192.168.30.1〜20を配布
- 優先DNSサーバとしてsvのIPv4アドレスを配布
- デフォルトゲートウェイを配布

## 3. サーバPCの設定

東京tky-sv1・tky-sv2、富山tym-svの設定を行う。**OSインストールは競技課題から除外**(Debian 13.x事前導入済み)。

### 共通設定(3台共通)

- 別紙表2に基づきIPv4/IPv6アドレスを設定
- IPv4/IPv6デフォルトゲートウェイを設定
- masterユーザにsudoによるroot権限実行を許可
- openssh-serverを導入し、rootログイン禁止・masterユーザでのSSHログインを許可

### tky-sv1(東京・DMZ)

**ネームサービス(bind9)**: DNSSEC検証無効化。反復問い合わせを行わない。再帰問い合わせは東京事業所ネットワークからのみ許可。tky-skills.jpの外部向けマスタ+内部向けスレーブ(マスタはtky-sv2)。mail.tky-skills.jpをMXレコード登録。tky-sv1/www/mailの正引きに応答。

**メールサービス**: postfix(SMTP認証なし)。内部ネットワークからのみ外部転送許可。tky-skills.jp宛は自身にスプール。admin@→master@のエイリアス設定。dovecot-imapd(平文認証許可)。

**Webサービス・リバースProxy(nginx)**:

- `http://www.tky-skills.jp/` → "Tokyo Office Official Site"
- `https://secure.tky-skills.jp/` → "Secure Site"(sv発行証明書を`http://www.wakamono-net.org/tky/`から入手)
- `http://in-www.tky-skills.jp/`(内部限定) → "Internal Site"
- `/app/`配下をtky-sv2:8081へリバースプロキシ

**Proxyサービス(squid)**: 内部ネットワークへTCP8080番で提供。URLに"game"を含むサイトへのアクセスを禁止。

### tky-sv2(東京・Internal1)

**ネームサービス**: tky-skills.jpの内部向けマスタ。自身にないレコードはtky-sv1へ回送。

**ユーザ・グループ管理**:

| アカウント | パスワード | ホームディレクトリ |
|---|---|---|
| taro | pass | /home/taro |
| jiro | pass | /home/jiro |
| saburo | pass | /home/saburo |

- saburoのアカウント有効期限を2026年12月31日に設定
- グループg_shareを作成し、taro・jiroをメンバとする
- グループg_shareに/var/shareへ全アクセス許可

**ファイル共有(samba)**: `/var/share`を共有名`share`としてInternal2へ提供。g_shareメンバに読み書き許可、SMBパスワードは`smbPass`。

**ディスククォータ(quota)**: g_shareに対し/var/shareのSoftリミット100MB、Hardリミット200MB。

**ソフトウェアRAID(mdadm)**: 未使用ディスク(/dev/sdb, /dev/sdc)でRAID1構成(デバイス名/dev/md0)、/var/shareへマウント。

**DHCPサービス(isc-dhcp-server)**: Internal2(tky-client)へ192.168.10.101〜120を配布。DNSはtky-sv2、ゲートウェイを配布(R-Tkyが中継)。

**tftpサービス(tftpd-hpa)**: R-Oskのrunning-configを転送・保存できるようにする。

### tym-sv(富山・DMZ)

**ネームサービス**: toyama-skills.jpのマスタサーバ。tym-sv.toyama-skills.jp、www.toyama-skills.jpの正引きに応答。

**Webサービス(nginx)**: 80番ポート、www.toyama-skills.jp → "Toyama Office Official Site"。

**FTPサービス**: 21番ポートへの接続要求に応答。

**DHCPサービス(isc-dhcp-server)**: Internal(tym-client)へ192.168.20.201〜210を配布。DNSはtym-sv、ゲートウェイを配布(R-Tym2が中継)。

## 4. クライアントPCの設定

東京tky-client、大阪osk-client、富山tym-clientの設定を行う。DHCPで自動設定(構築できない場合は手動設定)。全クライアントにTera Termインストール済み。

### tky-client(東京・Internal2)

- Microsoft EdgeにProxy(tky-sv1, 8080番)を設定し、`http://www.wakamono-net.org/`を表示できること
- taroの権限でtky-sv2の共有`share`をZ:ドライブに割当
- Tera TermでSSH接続しtky-sv2へmasterユーザでログインできることを確認

### osk-client(大阪・Internal)

- svが発行するルート証明書を信頼されたルート証明機関としてインストール
- Microsoft Edgeで`https://secret.wakamono-net.org/`をエラーなく表示できること

### tym-client(富山・Internal)

- Thunderbirdをインストールし、送受信メールサーバ共に`mail.tky-skills.jp`(tky-sv1)を設定、tky-sv1上のアカウントで送受信できること
- Tera TermでSSH接続しtym-svへmasterユーザでログインできることを確認

## 5. 別紙 表1: ルータ接続、IPアドレス(予想)

| ノード名 | インタフェース | IPv4アドレス | IPv6アドレス | 接続先 |
|---|---|---|---|---|
| ISP | 非公開 | 200.99.1.254/24 | 2001:DB8:1:1::FF/64 | sv, ex-client |
| ISP | 非公開 | 201.10.0.1/29 | — | R-Tky(対象外) |
| ISP | 非公開 | PPPoE(動的) | 2001:DB8:3:1::FF/64 | R-Tym1 |
| ISP | 非公開 | 201.10.0.17/29 | — | R-Osk |
| R-Tky(対象外) | Gi0/0 | 201.10.0.2/29 | — | ISP |
| R-Tky(対象外) | Gi0/1 | 10.100.0.254/24 | 2001:DB8:2:100::FF/64 | tky-sv1 |
| R-Tky(対象外) | Gi0/2 | 10.200.0.254/24 | 2001:DB8:2:200::FF/64 | tky-sv2 |
| R-Tky(対象外) | Gi0/3 | 192.168.10.254/24 | — | tky-client |
| R-Tym1(対象) | Gi0/0(Dialer) | PPPoE(動的) | 2001:DB8:3:1::1/64 | ISP |
| R-Tym1(対象) | Gi0/1 | 172.16.1.254/24 | 2001:DB8:3:10::FF/64 | tym-sv, R-Tym2 |
| R-Tym2(対象) | Gi0/0 | 172.16.1.253/24 | 2001:DB8:3:10::FE/64 | R-Tym1(DMZ側) |
| R-Tym2(対象) | Gi0/1 | 192.168.20.254/24 | — | tym-client |
| R-Osk(対象) | Gi0/0 | 201.10.0.18/29 | — | ISP |
| R-Osk(対象) | Gi0/1 | 192.168.30.254/24 | — | osk-client |

## 6. 別紙 表2: 各ノードのIPアドレス及びアカウント、パスワード(予想)

| ノード名 | IPv4アドレス | IPv6アドレス | 管理者アカウント | 管理者パスワード | 備考 |
|---|---|---|---|---|---|
| sv | 200.99.1.1 | 2001:DB8:1:1::1 | 非公開 | 非公開 | 対象外(検証用) |
| ex-client | DHCPで取得 | DHCPで取得 | user | なし | 対象外(検証用) |
| tky-sv1 | 10.100.0.1 | 2001:DB8:2:100::1 | root / master | Young2026 / pass | 採点対象 |
| tky-sv2 | 10.200.0.1 | 2001:DB8:2:200::1 | root / master | Young2026 / pass | 採点対象 |
| tky-client | DHCPで取得 | — | user | なし | 採点対象 |
| tym-sv | 172.16.1.1 | 2001:DB8:3:10::1 | root / master | Young2026 / pass | 採点対象 |
| tym-client | DHCPで取得 | — | user | なし | 採点対象 |
| osk-client | DHCPで取得 | — | user | なし | 採点対象 |

※パスワード等はすべて演習用の仮値です。実際の競技では競技委員が別途指定します。

---

*本資料は第20回(2025年)実課題冊子及び第21回(2026年)競技課題概要の公開情報をもとに構成した非公式の予想問題であり、実際の出題を保証するものではありません。*
