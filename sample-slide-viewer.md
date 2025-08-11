# Docusaurus統合スライドビューワー - サンプル実装

## 1. シンプルなMarkdownスライドビューワー

### コンポーネント実装

**src/components/MarkdownSlideViewer/index.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './styles.module.css';

interface SlideData {
  id: string;
  title: string;
  content: string;
  speakerNotes?: string;
}

interface MarkdownSlideViewerProps {
  slides: SlideData[];
  title: string;
}

const MarkdownSlideViewer: React.FC<MarkdownSlideViewerProps> = ({ 
  slides, 
  title 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  // キーボード操作
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
          }
          break;
        case 'ArrowLeft':
          if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
          }
          break;
        case 'n':
          setShowNotes(!showNotes);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length, showNotes]);

  const currentSlideData = slides[currentSlide];

  return (
    <div className={styles.slideViewer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.progress}>
          <span>{currentSlide + 1} / {slides.length}</span>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.slideContainer}>
          <div className={styles.slide}>
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {currentSlideData?.content || ''}
            </ReactMarkdown>
          </div>

          {showNotes && currentSlideData?.speakerNotes && (
            <div className={styles.notesPanel}>
              <h4>📝 スピーカーノート</h4>
              <ReactMarkdown>
                {currentSlideData.speakerNotes}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className={styles.button}
        >
          ← 前へ
        </button>

        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`${styles.button} ${showNotes ? styles.active : ''}`}
        >
          📝 ノート
        </button>

        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className={styles.button}
        >
          次へ →
        </button>
      </div>

      <div className={styles.help}>
        💡 操作: ← → (前後), Space (次), N (ノート表示)
      </div>
    </div>
  );
};

export default MarkdownSlideViewer;
```

### スタイル定義

**src/components/MarkdownSlideViewer/styles.module.css**
```css
.slideViewer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--ifm-color-primary);
}

.title {
  margin: 0;
  color: var(--ifm-color-primary);
  font-size: 1.8rem;
}

.progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.progressBar {
  width: 200px;
  height: 6px;
  background-color: var(--ifm-color-emphasis-200);
  border-radius: 3px;
  overflow: hidden;
}

.progressFill {
  height: 100%;
  background-color: var(--ifm-color-primary);
  transition: width 0.3s ease;
}

.content {
  min-height: 500px;
  margin-bottom: 30px;
}

.slideContainer {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
}

.slide {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--ifm-color-emphasis-200);
  min-height: 400px;
}

.slide h1 {
  color: var(--ifm-color-primary);
  border-bottom: 3px solid var(--ifm-color-primary);
  padding-bottom: 10px;
  margin-bottom: 25px;
}

.slide h2 {
  color: var(--ifm-color-secondary);
  margin-top: 30px;
  margin-bottom: 15px;
}

.slide ul {
  font-size: 1.1rem;
  line-height: 1.6;
}

.slide li {
  margin-bottom: 8px;
}

.notesPanel {
  background-color: var(--ifm-color-emphasis-100);
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid var(--ifm-color-warning);
}

.notesPanel h4 {
  margin-top: 0;
  color: var(--ifm-color-emphasis-700);
}

.controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.button {
  padding: 12px 24px;
  border: 2px solid var(--ifm-color-primary);
  background: white;
  color: var(--ifm-color-primary);
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.button:hover:not(:disabled) {
  background: var(--ifm-color-primary);
  color: white;
  transform: translateY(-1px);
}

.button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.button.active {
  background: var(--ifm-color-primary);
  color: white;
}

.help {
  text-align: center;
  color: var(--ifm-color-emphasis-600);
  font-size: 0.9rem;
  font-style: italic;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .slide {
    padding: 20px;
    min-height: 300px;
  }
  
  .controls {
    flex-wrap: wrap;
  }
  
  .button {
    padding: 10px 18px;
    font-size: 0.9rem;
  }
}

/* ダークモード対応 */
[data-theme='dark'] .slide {
  background: var(--ifm-background-color);
  color: var(--ifm-font-color-base);
  border-color: var(--ifm-color-emphasis-300);
}

[data-theme='dark'] .button {
  background: var(--ifm-background-color);
}
```

## 2. 実際の使用例

### MDXページでの使用

**docs/courses/javascript-basics.mdx**
```mdx
---
title: JavaScript基礎講座
description: JavaScriptの基本的な使い方を学ぶ講座
---

import MarkdownSlideViewer from '@site/src/components/MarkdownSlideViewer';

# JavaScript基礎講座

export const slideData = [
  {
    id: 'intro',
    title: 'JavaScriptとは',
    content: `# JavaScriptとは 🚀

JavaScriptは**Webページに動的な動作**を追加するプログラミング言語です。

## 主な特徴

- 🌐 **ブラウザで実行** - HTMLと連携してインタラクティブなWebページを作成
- ⚡ **イベント駆動** - ユーザーの操作に応じて処理を実行
- 🔄 **動的型付け** - 変数の型を実行時に決定
- 📦 **豊富なライブラリ** - React, Vue.js, Node.jsなど

> 💡 **Point**: 今やWebフロントエンドには欠かせない言語です！`,
    speakerNotes: `## 講師用メモ

### 導入のポイント
- 受講者の多くは初心者を想定
- HTMLとCSSの基礎知識があることを前提とする
- 実際のWebサイト例を見せながら説明すると効果的

### 時間配分
- この説明: 5分
- 質疑応答: 2分

### 次のスライドへの繋ぎ
「では実際にJavaScriptで何ができるのか、簡単なコードから見ていきましょう」`
  },
  {
    id: 'variables',
    title: '変数の宣言',
    content: `# 変数の宣言 📝

JavaScriptでは3つの方法で変数を宣言できます。

## 基本的な書き方

\`\`\`javascript
// ES6以降の推奨記法
let name = '田中太郎';        // 再代入可能
const age = 25;              // 再代入不可（定数）
var city = 'Tokyo';          // 旧記法（非推奨）
\`\`\`

## 使い分けのルール

1. **const** 👑 - 値が変わらない場合（最優先）
2. **let** ✨ - 値が変わる場合
3. **var** ❌ - 使わない（スコープの問題あり）

## 実例

\`\`\`javascript
const userName = 'Alice';     // ユーザー名（変更されない）
let score = 0;               // スコア（ゲーム中に変化）
let level = 1;               // レベル（上がることがある）
\`\`\``,
    speakerNotes: `## 講師用メモ

### 強調すべきポイント
- constを最初に使う習慣をつけさせる
- varは「古いJavaScript」として扱い、使わないことを徹底
- let vs constの判断基準を明確に

### 実演コード
受講者と一緒にブラウザのコンソールで実際に変数を宣言してみる

### よくある質問への回答
Q: 「なぜvarを使わないの？」
A: 「ホイスティングとスコープの問題で予期しない動作をするため」`
  },
  {
    id: 'functions',
    title: '関数の基本',
    content: `# 関数の基本 🔧

関数は**処理をまとめて再利用**するための仕組みです。

## 関数宣言の方法

### 1. 関数宣言

\`\`\`javascript
function greet(name) {
    return \`こんにちは、\${name}さん！\`;
}

// 使用例
const message = greet('山田');
console.log(message); // "こんにちは、山田さん！"
\`\`\`

### 2. 関数式（推奨）

\`\`\`javascript
const greet = (name) => {
    return \`こんにちは、\${name}さん！\`;
};

// さらに短縮形
const greet = (name) => \`こんにちは、\${name}さん！\`;
\`\`\`

## 💡 アロー関数の使い分け

- **短い処理** → アロー関数
- **複雑な処理** → 通常の関数宣言`,
    speakerNotes: `## 講師用メモ

### デモンストレーション
1. まず関数宣言から説明
2. 次にアロー関数を紹介
3. 実際にコンソールで両方を実行して比較

### 注意点
- thisの扱いの違いは後の回で説明
- まずは「書き方の違い」として理解させる

### 次回予告
「次回は関数を使って実際にWebページを動かしてみます」`
  },
  {
    id: 'practice',
    title: '実習問題',
    content: `# 実習問題 💪

学習した内容を使って、実際にコードを書いてみましょう！

## 問題1: 自己紹介関数

以下の要件を満たす関数を作成してください：

- 名前と年齢を受け取る
- 「私の名前は○○です。年齢は△△歳です。」という文字列を返す

\`\`\`javascript
// ここに関数を書いてください
const introduce = (name, age) => {
    // あなたのコードをここに
};

// テスト用
console.log(introduce('田中', 25));
// 期待値: "私の名前は田中です。年齢は25歳です。"
\`\`\`

## 問題2: 計算機能

2つの数値を受け取って、足し算の結果を返す関数を作成してください。

\`\`\`javascript
const add = (a, b) => {
    // あなたのコードをここに
};

console.log(add(10, 20)); // 期待値: 30
\`\`\`

## 🎯 チャレンジ問題

配列の平均値を計算する関数を作ってみましょう！`,
    speakerNotes: `## 講師用メモ

### 実習の進め方
1. 5分間個人作業
2. 隣の人と答え合わせ（3分）
3. 全体で解答例を共有（5分）

### 解答例
\`\`\`javascript
// 問題1
const introduce = (name, age) => {
    return \`私の名前は\${name}です。年齢は\${age}歳です。\`;
};

// 問題2
const add = (a, b) => {
    return a + b;
};

// チャレンジ問題
const average = (numbers) => {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};
\`\`\`

### 評価ポイント
- テンプレートリテラルの使用
- アロー関数の活用
- returnの適切な使用`
  }
];

<MarkdownSlideViewer 
  slides={slideData} 
  title="JavaScript基礎講座 - 第1回"
/>

## 📚 補足資料

### 参考リンク
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/ja/docs/Web/JavaScript)
- [JavaScript.info](https://javascript.info/)

### 次回予告
次回は「DOM操作の基本」を学習します。HTMLとJavaScriptを連携させて、実際にWebページを動的に変更してみましょう！
```

## 3. データを外部ファイルで管理する場合

### JSON形式でのデータ管理

**static/slide-data/javascript-basics.json**
```json
{
  "courseId": "javascript-basics",
  "title": "JavaScript基礎講座 - 第1回",
  "description": "JavaScriptの基本文法を学ぶ講座",
  "slides": [
    {
      "id": "intro",
      "title": "JavaScriptとは",
      "content": "# JavaScriptとは 🚀\n\nJavaScriptは**Webページに動的な動作**を追加するプログラミング言語です。\n\n## 主な特徴\n\n- 🌐 **ブラウザで実行** - HTMLと連携してインタラクティブなWebページを作成\n- ⚡ **イベント駆動** - ユーザーの操作に応じて処理を実行",
      "speakerNotes": "## 講師用メモ\n\n### 導入のポイント\n- 受講者の多くは初心者を想定\n- HTMLとCSSの基礎知識があることを前提とする"
    }
  ]
}
```

### 動的ローディング版コンポーネント

**src/components/SlideViewerFromJSON/index.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import MarkdownSlideViewer from '../MarkdownSlideViewer';

interface SlideViewerFromJSONProps {
  dataPath: string;
}

const SlideViewerFromJSON: React.FC<SlideViewerFromJSONProps> = ({ dataPath }) => {
  const [slideData, setSlideData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSlideData = async () => {
      try {
        const response = await fetch(dataPath);
        if (!response.ok) {
          throw new Error(`Failed to load slide data: ${response.statusText}`);
        }
        const data = await response.json();
        setSlideData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSlideData();
  }, [dataPath]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>スライドデータを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <div>エラー: {error}</div>
      </div>
    );
  }

  return (
    <MarkdownSlideViewer 
      slides={slideData.slides} 
      title={slideData.title}
    />
  );
};

export default SlideViewerFromJSON;
```

### JSONを使用したMDXページ

**docs/courses/javascript-basics-json.mdx**
```mdx
---
title: JavaScript基礎講座（JSON版）
---

import SlideViewerFromJSON from '@site/src/components/SlideViewerFromJSON';

# JavaScript基礎講座

<SlideViewerFromJSON dataPath="/slide-data/javascript-basics.json" />
```

## 4. 必要な依存関係

**package.json**
```json
{
  "dependencies": {
    "react-markdown": "^8.0.0",
    "react-syntax-highlighter": "^15.5.0",
    "remark-gfm": "^3.0.0"
  },
  "devDependencies": {
    "@types/react-syntax-highlighter": "^15.5.0"
  }
}
```

## 使用方法

1. コンポーネントをプロジェクトに配置
2. 必要な依存関係をインストール
3. MDXページでコンポーネントをインポートして使用
4. スライドデータを直接埋め込むか、JSONファイルから読み込む

これで、Markdownで書いたスライドをDocusaurus内で直接表示できます！
