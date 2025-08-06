# テキスト処理

Linuxでのテキスト処理は、データ解析や自動化において重要なスキルです。

## 基本的なテキスト処理コマンド

### ファイルの表示

```bash
# ファイル全体を表示
cat filename.txt

# ページ単位で表示
less filename.txt
more filename.txt

# 先頭・末尾の表示
head -n 10 filename.txt  # 先頭10行
tail -n 10 filename.txt  # 末尾10行
```

### テキストの検索

```bash
# パターン検索
grep "pattern" filename.txt
grep -i "pattern" filename.txt  # 大文字小文字を区別しない
grep -r "pattern" directory/    # ディレクトリ内を再帰検索
```

### テキストの加工

```bash
# 行の並び替え
sort filename.txt
sort -r filename.txt  # 逆順

# 重複行の削除
uniq filename.txt
sort filename.txt | uniq  # ソート後に重複削除
```

効率的なテキスト処理をマスターしましょう。