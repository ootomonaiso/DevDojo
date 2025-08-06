# システム情報の確認

Linuxシステムの状態や情報を確認するための基本的なコマンドを学習します。

## システム情報コマンド

### ハードウェア情報

```bash
# CPU情報
cat /proc/cpuinfo
lscpu

# メモリ情報
free -h
cat /proc/meminfo

# ディスク情報
df -h         # ディスク使用量
lsblk         # ブロックデバイス
```

### システム状態

```bash
# システム稼働時間
uptime

# 現在のユーザー
whoami
who
w

# プロセス情報
ps aux
top
htop
```

### ネットワーク情報

```bash
# ネットワーク設定
ip addr show
ifconfig

# ネットワーク接続
netstat -tuln
ss -tuln
```

システムの健康状態を定期的に確認しましょう。