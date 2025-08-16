---
marp: true
theme: default
paginate: true
backgroundColor: #fff
style: |
  section {
    font-family: 'Helvetica Neue', Arial, sans-serif;
  }
  h1 {
    color: #2563eb;
  }
  h2 {
    color: #7c3aed;
  }
---

# JavaScript基礎講座 🚀
## 第1回：JavaScriptとは

**講師**: 田中太郎  
**日程**: 2025年8月11日

---

# JavaScriptとは何か？

JavaScriptは**Webページに命を吹き込む**プログラミング言語です。

## 主な特徴

- 🌐 **ブラウザで動作** - HTMLと組み合わせて使用
- ⚡ **動的でインタラクティブ** - ユーザーの操作に反応
- 📱 **マルチプラットフォーム** - Web, モバイル, デスクトップ
- 🔄 **イベント駆動** - クリックや入力に応じて処理実行

---

# どこで使われている？

## Webフロントエンド
- React, Vue.js, Angular
- インタラクティブなUI作成

## サーバーサイド
- Node.js
- API開発、データベース操作

## モバイルアプリ
- React Native, Ionic
- クロスプラットフォーム開発

---

# 変数の宣言 📝

JavaScriptでは**3つの方法**で変数を宣言できます。

```javascript
// 現代的な書き方（推奨）
let userName = '山田太郎';      // 再代入可能
const userAge = 25;            // 再代入不可（定数）

// 古い書き方（非推奨）
var userCity = 'Tokyo';        // スコープに問題あり
```

## 💡 使い分けのコツ
1. **const** 👑 - 値が変わらない場合（最優先）
2. **let** ✨ - 値が変わる場合
3. **var** ❌ - 使わない

---

# 実践例：ユーザー情報管理

```javascript
// ユーザー情報（変更されない）
const userId = 'user_123';
const userName = 'Alice';

// 状態情報（変更される可能性）
let loginCount = 0;
let lastLogin = null;
let isOnline = false;

// ログイン処理の例
function login() {
    loginCount = loginCount + 1;  // または loginCount++
    lastLogin = new Date();
    isOnline = true;
    
    console.log(`${userName}さんがログインしました`);
}
```

---

# 関数の基本 🔧

関数は**処理をまとめて再利用**するための重要な仕組みです。

## 関数宣言の方法

```javascript
// 1. 関数宣言
function greet(name) {
    return `こんにちは、${name}さん！`;
}

// 2. 関数式（アロー関数）
const greet = (name) => {
    return `こんにちは、${name}さん！`;
};

// 3. 短縮形（1行の場合）
const greet = (name) => `こんにちは、${name}さん！`;
```

---

# 実習問題 💪

以下の課題に取り組んでみましょう！

## 問題1: 自己紹介関数
名前と年齢を受け取って、自己紹介文を返す関数を作成してください。

```javascript
const introduce = (name, age) => {
    // ここにコードを書いてください
};

// テスト
console.log(introduce('田中', 25));
// 期待結果: "私の名前は田中です。年齢は25歳です。"
```

---

# 解答例 ✅

```javascript
// 問題1の解答
const introduce = (name, age) => {
    return `私の名前は${name}です。年齢は${age}歳です。`;
};

// より実用的な例
const createUser = (name, age, email) => {
    return {
        name: name,
        age: age,
        email: email,
        createdAt: new Date(),
        isActive: true
    };
};

const user = createUser('山田', 30, 'yamada@example.com');
console.log(user);
```

---

# 次回予告 📅

## 第2回：DOM操作の基本
- HTMLとJavaScriptの連携
- 要素の取得と操作
- イベントリスナーの設定
- 実際のWebページ制作

### 宿題 📚
今日学んだ変数と関数を使って、簡単な計算機能を作ってみましょう！

**次回**: 2025年8月18日（日）10:00-12:00
