# ファイル操作

Linuxでのファイル操作は、日常的な作業の基本となります。効率的なファイル管理方法を学んでいきましょう。

## 基本的なファイル操作

### ファイルの作成

```bash
# 空ファイルの作成
touch filename.txt

# テキストファイルの作成
echo "Hello World" > hello.txt

# 複数行のテキスト作成
cat > sample.txt << EOF
1行目のテキスト
2行目のテキスト
EOF
```

### ファイルのコピー

```bash
# ファイルのコピー
cp source.txt destination.txt

# ディレクトリのコピー
cp -r source_dir/ destination_dir/

# 複数ファイルのコピー
cp file1.txt file2.txt /target/directory/
```

### ファイルの移動・リネーム

```bash
# ファイルの移動
mv file.txt /new/location/

# ファイルのリネーム
mv oldname.txt newname.txt

# 複数ファイルの移動
mv *.txt /documents/
```

### ファイルの削除

```bash
# ファイルの削除
rm filename.txt

# 強制削除
rm -f filename.txt

# ディレクトリの削除
rm -r directory/
rm -rf directory/  # 強制削除
```

## ファイル情報の確認

```bash
# ファイル詳細情報
ls -l filename.txt

# ファイルサイズの確認
du -h filename.txt

# ファイルタイプの確認
file filename.txt
```

安全のため、重要なファイルを削除する前は必ずバックアップを取りましょう。