# MarpをDocusaurusで使う実装サンプル

## 1. 実際のMarp統合ビューワー

### 必要な依存関係

```bash
npm install @marp-team/marp-core
npm install @marp-team/marpit
npm install jsdom  # サーバーサイドレンダリング用
```

### MarpをReactで使うコンポーネント

**src/components/MarpViewer/index.tsx**
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { Marp } from '@marp-team/marp-core';
import styles from './styles.module.css';

interface MarpViewerProps {
  markdownContent: string;
  theme?: string;
}

# MarpViewer を Docusaurus で再利用する手順書
const MarpViewer: React.FC<MarpViewerProps> = ({ 
  markdownContent, 
  theme = 'default' 
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
      try {
        // Marpインスタンス作成
        const marp = new Marp({
          html: true,
          emoji: {
            shortcode: true,
            unicode: true
          }

        // テーマ設定
        if (theme !== 'default') {
        }

        // Markdownをレンダリング

        // CSSを保存
        setMarpCSS(css);

        // HTMLからスライドを分割
        const slideMatches = html.split(/<section[^>]*>/);
        const processedSlides = slideMatches
          .slice(1) // 最初の空要素を除去
          .map(slide => {
            // 各スライドを完全なsectionタグで包む
            return `<section class="marpit-slide">${slide}`;
          });

        setSlides(processedSlides);

      } catch (error) {
        console.error('Marp処理エラー:', error);
      }
    };

    processMarpContent();
  }, [markdownContent, theme]);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
          }
          break;
        case 'PageUp':
          e.preventDefault();
          }
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  // CSS動的追加
  useEffect(() => {
    if (marpCSS) {
      let existingStyle = document.getElementById(styleId);
      
      if (existingStyle) {
      }

        ${marpCSS}
        
        /* DocusaurusとMarpの統合用CSS */
        .marpit-slide {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
          border-radius: 8px !important;
          overflow: auto !important;
        
          font-size: 2.5rem !important;
          margin-bottom: 1rem !important;
        }
        
          font-size: 2rem !important;
          margin-bottom: 0.8rem !important;
        }
        .marpit-slide ul {
          font-size: 1.2rem !important;
        }
        
          background: var(--ifm-code-background) !important;
          color: var(--ifm-code-color) !important;
        }
        .marpit-slide pre {
          background: var(--ifm-code-background) !important;
          overflow-x: auto !important;
          width: 100% !important;
        }
      `;
      
      document.head.appendChild(styleElement);
    }

    return () => {
      const styleElement = document.getElementById('marp-generated-style');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [marpCSS]);

  if (slides.length === 0) {
    return (
      <div className={styles.loading}>
        <div>Marpスライドを生成中...</div>
      </div>
    );
  }

  return (
    <div className={styles.marpContainer} ref={containerRef}>
      {/* ヘッダー */}
      <div className={styles.header}>
        <h2>Marpスライド</h2>
        <div className={styles.slideCounter}>
          {currentSlide + 1} / {slides.length}
        </div>
      </div>

      {/* プログレスバー */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progress}
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* スライド表示エリア */}
      <div className={styles.slideContainer}>
        <div 
          className={styles.slide}
          dangerouslySetInnerHTML={{ 
            __html: slides[currentSlide] || '' 
          }}
        />
      </div>

      {/* コントロール */}
      <div className={styles.controls}>
        <button
          onClick={() => setCurrentSlide(0)}
          disabled={currentSlide === 0}
          className={styles.controlButton}
        >
          ⏮️ 最初
        </button>
        
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className={styles.controlButton}
        >
          ⬅️ 前
        </button>

        <span className={styles.slideInfo}>
          {currentSlide + 1} / {slides.length}
        </span>

        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className={styles.controlButton}
        >
          次 ➡️
        </button>
        
        <button
          onClick={() => setCurrentSlide(slides.length - 1)}
          disabled={currentSlide === slides.length - 1}
          className={styles.controlButton}
        >
          最後 ⏭️
        </button>
      </div>

      {/* キーボードヘルプ */}
      <div className={styles.help}>
        💡 キーボード操作: ← → (前後), Space (次), Home/End (最初/最後)
      </div>
    </div>
  );
};

export default MarpViewer;
```

### スタイルファイル

**src/components/MarpViewer/styles.module.css**
```css
.marpContainer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: var(--ifm-color-emphasis-600);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--ifm-color-primary);
}

.header h2 {
  margin: 0;
  color: var(--ifm-color-primary);
}

.slideCounter {
  font-weight: bold;
  color: var(--ifm-color-emphasis-700);
}

.progressBar {
  width: 100%;
  height: 4px;
  background-color: var(--ifm-color-emphasis-200);
  border-radius: 2px;
  margin-bottom: 30px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: var(--ifm-color-primary);
  transition: width 0.3s ease;
}

.slideContainer {
  margin-bottom: 30px;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: stretch;
}

.slide {
  width: 100%;
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 8px;
  overflow: hidden;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.controlButton {
  padding: 10px 16px;
  border: 2px solid var(--ifm-color-primary);
  background: white;
  color: var(--ifm-color-primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.controlButton:hover:not(:disabled) {
  background: var(--ifm-color-primary);
  color: white;
  transform: translateY(-1px);
}

.controlButton:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

.slideInfo {
  padding: 10px 20px;
  background: var(--ifm-color-emphasis-100);
  border-radius: 6px;
  font-weight: bold;
  color: var(--ifm-color-emphasis-800);
}

.help {
  text-align: center;
  color: var(--ifm-color-emphasis-600);
  font-size: 0.85rem;
  font-style: italic;
}

/* レスポンシブ */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .controlButton {
    width: 200px;
  }
}

/* ダークモード */
[data-theme='dark'] .controlButton {
  background: var(--ifm-background-color);
  border-color: var(--ifm-color-primary);
}

[data-theme='dark'] .slideInfo {
  background: var(--ifm-color-emphasis-200);
  color: var(--ifm-color-emphasis-900);
}
```

## 2. 実際のMarpスライドMarkdown

**static/marp-slides/javascript-intro.md**
```markdown
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
```

## 3. MDXページでの使用例

**docs/courses/marp-javascript.mdx**
```mdx
---
title: JavaScript基礎講座（Marp版）
description: Marpを使ったインタラクティブなJavaScript講座
---

import MarpViewer from '@site/src/components/MarpViewer';

# JavaScript基礎講座（Marp版）

export const marpContent = `---
marp: true
theme: default
paginate: true
backgroundColor: #fff
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

---

# 変数の宣言 📝

\`\`\`javascript
// 現代的な書き方（推奨）
let userName = '山田太郎';      // 再代入可能
const userAge = 25;            // 再代入不可（定数）

// 古い書き方（非推奨）
var userCity = 'Tokyo';        // スコープに問題あり
\`\`\`

## 💡 使い分けのコツ
1. **const** 👑 - 値が変わらない場合（最優先）
2. **let** ✨ - 値が変わる場合
3. **var** ❌ - 使わない
`;

<MarpViewer markdownContent={marpContent} />

## 📚 補足情報

この講座では実際のMarp記法を使用しています：
- `---` でスライド区切り
- Front matterでテーマ設定
- 絵文字とマークダウン記法をフル活用

### Marpの特徴
- **軽量** - 純粋なMarkdownベース  
- **テーマ豊富** - 多数の既製テーマ  
- **PDF出力** - 配布資料として活用可能
```

## 4. ファイルから読み込む版

**src/components/MarpFileViewer/index.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import MarpViewer from '../MarpViewer';

interface MarpFileViewerProps {
  filePath: string;
  title?: string;
}

const MarpFileViewer: React.FC<MarpFileViewerProps> = ({ filePath, title }) => {
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMarpFile = async () => {
      try {
        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error(`ファイルの読み込みに失敗: ${response.statusText}`);
        }
        const content = await response.text();
        setMarkdownContent(content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadMarpFile();
  }, [filePath]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Marpファイルを読み込み中...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>エラー: {error}</div>;
  }

  return <MarpViewer markdownContent={markdownContent} />;
};

export default MarpFileViewer;
```

### ファイル版の使用例

**docs/courses/marp-from-file.mdx**
```mdx
---
title: Marpファイル読み込み版
---

import MarpFileViewer from '@site/src/components/MarpFileViewer';

# JavaScript基礎講座（ファイル版）

<MarpFileViewer 
  filePath="/marp-slides/javascript-intro.md"
  title="JavaScript基礎講座"
/>
```

これで、本物のMarp記法で書いたMarkdownをDocusaurus内で直接表示できます！

**主な違い**：
- 実際の`@marp-team/marp-core`を使用
- Marp固有の記法（`---`区切り、front matter等）に対応
- Marpのテーマシステムを活用
- PDF出力等のMarp機能も利用可能

これなら本格的なMarpスライドとして使えますよ！
