# Docusaurus講座サイト - スライドインターフェース仕様書

## プロジェクト概要
Docusaurusを使用した講座資料配布兼スケジュール発表ページの構築。スライドとその説明文を表示し、ユーザーが自分でページをめくりながら説明文が連動して切り替わるインタラクティブなインターフェースを実装する。

## 主要機能要件

### 1. スライド表示機能
- スライド画像/コンテンツの表示
- 前/次ページのナビゲーション
- ページ番号の表示
- キーボードショートカット対応（矢印キー、スペースキーなど）

### 2. 説明文連動機能
- スライドの切り替えに応じた説明文の自動更新
- 説明文のフェードイン/アウト効果
- マークダウン形式での説明文記述対応

### 3. UI/UX要件
- レスポンシブデザイン対応
- タッチ/スワイプ操作対応（モバイル）
- プログレスバー表示
- フルスクリーンモード対応

## 推奨パッケージ・ライブラリ

### 1. Swiper.js
**用途**: スライドカルーセル機能
**特徴**:
- 軽量で高性能
- タッチ/スワイプ対応
- 豊富なカスタマイズオプション
- TypeScript対応

```bash
npm install swiper
```

### 2. Framer Motion
**用途**: アニメーション・トランジション効果
**特徴**:
- React専用アニメーションライブラリ
- 宣言的なアニメーション記述
- パフォーマンス最適化済み

```bash
npm install framer-motion
```

### 3. React Markdown
**用途**: 説明文のマークダウン表示
**特徴**:
- マークダウンのReactコンポーネント化
- シンタックスハイライト対応
- プラグイン拡張可能

```bash
npm install react-markdown remark-gfm
```

### 4. React Hotkeys Hook
**用途**: キーボードショートカット実装
**特徴**:
- 簡単なキーボードイベント処理
- React Hook形式で使いやすい

```bash
npm install react-hotkeys-hook
```

### 5. 代替案：Reveal.js（埋め込み）
**用途**: 完全なプレゼンテーション機能
**特徴**:
- 本格的なスライドプレゼンテーション
- 豊富なテーマとプラグイン
- Docusaurusに埋め込み可能

```bash
npm install reveal.js
```

## 技術仕様

### コンポーネント構成
```
SlidePresentation/
├── index.tsx              // メインコンポーネント
├── SlideViewer.tsx        // スライド表示部
├── DescriptionPanel.tsx   // 説明文表示部
├── NavigationControls.tsx // ナビゲーション部
└── styles.module.css      // スタイル定義
```

### データ構造
```typescript
interface SlideData {
  id: string;
  title: string;
  imageUrl?: string;
  content?: React.ReactNode;
  description: string; // マークダウン形式
}

interface PresentationConfig {
  slides: SlideData[];
  autoPlay?: boolean;
  loop?: boolean;
  showProgress?: boolean;
  allowKeyboard?: boolean;
}
```

### 状態管理
- React useStateまたはuseReducerで現在のスライド状態を管理
- スライドインデックスの変更時に説明文を同期更新
- ローカルストレージで進捗保存（オプション）

## Docusaurus統合方法

### 1. カスタムReactコンポーネントとして実装
```javascript
// docusaurus.config.js
module.exports = {
  // ...
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: [
    // カスタムプラグインの追加
  ],
};
```

### 2. MDXページでの使用
```mdx
---
title: "講座スライド"
---

import SlidePresentation from '@site/src/components/SlidePresentation';

# 講座タイトル

<SlidePresentation 
  slides={slideData} 
  showProgress={true}
  allowKeyboard={true}
/>
```

### 3. 静的アセット管理
```
static/
├── slides/
│   ├── slide-01.png
│   ├── slide-02.png
│   └── ...
└── presentations/
    └── course-data.json
```

## スライドデータの保存・管理方法

### 方法1: JSON + 画像ファイル（推奨）
**構造**:
```
static/
├── presentations/
│   ├── course-01/
│   │   ├── slides/
│   │   │   ├── slide-01.png
│   │   │   ├── slide-02.png
│   │   │   └── slide-03.png
│   │   └── data.json
│   └── course-02/
│       ├── slides/
│       └── data.json
```

**data.jsonの例**:
```json
{
  "id": "course-01",
  "title": "JavaScript基礎講座",
  "description": "JavaScript の基本文法を学ぶ講座",
  "slides": [
    {
      "id": "slide-01",
      "title": "JavaScriptとは",
      "imageUrl": "/presentations/course-01/slides/slide-01.png",
      "description": "# JavaScriptとは\n\nJavaScriptはWebページに動的な動作を追加するプログラミング言語です。\n\n- ブラウザで実行される\n- インタラクティブなUI作成\n- サーバーサイドでも利用可能"
    },
    {
      "id": "slide-02", 
      "title": "変数の宣言",
      "imageUrl": "/presentations/course-01/slides/slide-02.png",
      "description": "# 変数の宣言\n\n```javascript\nlet name = 'John';\nconst age = 25;\nvar city = 'Tokyo';\n```"
    }
  ]
}
```

### 方法2: Markdown + Frontmatter
**構造**:
```
content/
├── presentations/
│   ├── course-01.md
│   └── course-02.md
static/
├── slides/
│   ├── course-01/
│   └── course-02/
```

**course-01.mdの例**:
```markdown
---
id: course-01
title: JavaScript基礎講座
description: JavaScript の基本文法を学ぶ講座
slides:
  - id: slide-01
    title: JavaScriptとは
    imageUrl: /slides/course-01/slide-01.png
  - id: slide-02
    title: 変数の宣言
    imageUrl: /slides/course-01/slide-02.png
---

## Slide 1: JavaScriptとは

JavaScriptはWebページに動的な動作を追加するプログラミング言語です。

- ブラウザで実行される
- インタラクティブなUI作成
- サーバーサイドでも利用可能

---

## Slide 2: 変数の宣言

```javascript
let name = 'John';
const age = 25;
var city = 'Tokyo';
```
```

### 方法3: MDX形式（高度な表現）
**特徴**: JSXコンポーネントを直接埋め込み可能

```mdx
---
title: "JavaScript基礎講座"
---

import { CodeBlock } from '@site/src/components/CodeBlock';
import { InteractiveDemo } from '@site/src/components/InteractiveDemo';

export const slideData = [
  {
    id: 'slide-01',
    title: 'JavaScriptとは',
    content: (
      <div>
        <h1>JavaScriptとは</h1>
        <p>Webページに動的な動作を追加する言語</p>
        <InteractiveDemo />
      </div>
    ),
    description: `# JavaScriptとは
Webページに動的な動作を追加するプログラミング言語です。`
  }
];

<SlidePresentation slides={slideData} />
```

### 方法4: Marp統合（Markdownスライド）
**特徴**: MarkdownからHTML/PDFスライドを生成

**必要パッケージ**:
```bash
npm install @marp-team/marp-core @marp-team/marp-cli
npm install --save-dev @marp-team/marpit
```

**スライドMarkdown例** (`presentations/course-01.md`):
```markdown
---
marp: true
theme: default
paginate: true
backgroundColor: #fff
---

# JavaScript基礎講座
## 第1回：JavaScriptとは

プレゼンター: 山田太郎
日付: 2025年8月10日

---

# JavaScriptとは

JavaScriptはWebページに**動的な動作**を追加するプログラミング言語です。

- 🌐 ブラウザで実行される
- ⚡ インタラクティブなUI作成
- 🚀 サーバーサイドでも利用可能

---

# 変数の宣言

```javascript
// ES6以降の推奨記法
let name = 'John';        // 再代入可能
const age = 25;           // 再代入不可
var city = 'Tokyo';       // 旧記法（非推奨）
```

**ポイント**: `const` → `let` → `var` の順で使用を検討

---

# 実習課題

以下のコードを実行してみましょう：

```javascript
console.log('Hello, World!');
```

💡 **説明**: コンソールに文字列を出力する基本的な命令です。
```

**Marp統合コンポーネント**:
```typescript
// src/components/MarpSlideViewer.tsx
import React, { useEffect, useState } from 'react';
import { Marp } from '@marp-team/marp-core';

interface MarpSlideViewerProps {
  markdownPath: string;
  currentSlide: number;
  onSlideChange: (slideIndex: number) => void;
}

export const MarpSlideViewer: React.FC<MarpSlideViewerProps> = ({
  markdownPath,
  currentSlide,
  onSlideChange,
}) => {
  const [slides, setSlides] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMarpPresentation = async () => {
      try {
        // Markdownファイルを読み込み
        const response = await fetch(markdownPath);
        const markdown = await response.text();
        
        // Marpでスライドに変換
        const marp = new Marp({
          html: true,
          breaks: false,
        });
        
        const { html, css } = marp.render(markdown);
        
        // スライドを個別に分割
        const slideElements = html.split('<section');
        const processedSlides = slideElements
          .filter(slide => slide.trim())
          .map(slide => `<section${slide}`);
        
        setSlides(processedSlides);
        
        // CSSを動的に追加
        if (css) {
          const styleSheet = document.createElement('style');
          styleSheet.textContent = css;
          document.head.appendChild(styleSheet);
        }
      } catch (error) {
        console.error('Failed to load Marp presentation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMarpPresentation();
  }, [markdownPath]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="marp-slide-viewer">
      <div 
        className="slide-content"
        dangerouslySetInnerHTML={{ 
          __html: slides[currentSlide] || '' 
        }}
      />
      
      <div className="slide-controls">
        <button 
          onClick={() => onSlideChange(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          前へ
        </button>
        <span>{currentSlide + 1} / {slides.length}</span>
        <button 
          onClick={() => onSlideChange(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
        >
          次へ
        </button>
      </div>
    </div>
  );
};
```

**説明文との連動**:
```typescript
// src/components/MarpPresentationWithNotes.tsx
import React, { useState } from 'react';
import { MarpSlideViewer } from './MarpSlideViewer';
import ReactMarkdown from 'react-markdown';

interface SlideNote {
  slideIndex: number;
  content: string;
}

interface MarpPresentationProps {
  markdownPath: string;
  notes: SlideNote[];
}

export const MarpPresentationWithNotes: React.FC<MarpPresentationProps> = ({
  markdownPath,
  notes,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const currentNote = notes.find(note => note.slideIndex === currentSlide);

  return (
    <div className="marp-presentation-container">
      <div className="slide-section">
        <MarpSlideViewer
          markdownPath={markdownPath}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
        />
      </div>
      
      <div className="notes-section">
        <h3>スライド解説</h3>
        {currentNote ? (
          <ReactMarkdown>{currentNote.content}</ReactMarkdown>
        ) : (
          <p>このスライドには解説がありません。</p>
        )}
      </div>
    </div>
  );
};
```

**ビルドスクリプト統合**:
```json
// package.json
{
  "scripts": {
    "build:marp": "marp presentations/*.md --output static/generated-slides/ --html",
    "dev:marp": "marp presentations/*.md --server --watch",
    "build": "npm run build:marp && docusaurus build"
  }
}
```

**プロジェクト構造**:
```
presentations/
├── course-01.md           // Marpスライド
├── course-02.md
└── notes/
    ├── course-01-notes.json // スライド解説データ
    └── course-02-notes.json
static/
├── generated-slides/      // Marp生成HTML
│   ├── course-01.html
│   └── course-02.html
src/components/
├── MarpSlideViewer.tsx
└── MarpPresentationWithNotes.tsx
```

**解説データ例** (`presentations/notes/course-01-notes.json`):
```json
{
  "courseId": "course-01",
  "title": "JavaScript基礎講座",
  "notes": [
    {
      "slideIndex": 0,
      "content": "# 講座の概要\n\nこの講座では、JavaScriptの基本的な文法から実践的な使い方まで学習します。\n\n**学習目標**:\n- 変数と関数の理解\n- DOM操作の習得\n- 非同期処理の基礎"
    },
    {
      "slideIndex": 1,
      "content": "# JavaScriptの特徴\n\nJavaScriptは**プロトタイプベース**のオブジェクト指向言語です。\n\n**重要なポイント**:\n- 動的型付け\n- 関数はファーストクラスオブジェクト\n- クロージャをサポート"
    }
  ]
}
```

### 方法5: CMS統合（大規模運用）
**Headless CMS選択肢**:
- Strapi
- Contentful  
- Sanity
- Ghost

**利点**:
- 非技術者でも編集可能
- リアルタイム更新
- 画像最適化自動化
- バージョン管理

### データローディングパターン

#### 静的インポート（ビルド時）
```typescript
// src/data/presentations.ts
import course01Data from '../../static/presentations/course-01/data.json';
import course02Data from '../../static/presentations/course-02/data.json';

export const presentations = {
  'course-01': course01Data,
  'course-02': course02Data,
};
```

#### 動的インポート（ランタイム）
```typescript
// src/hooks/usePresentation.ts
import { useState, useEffect } from 'react';

export const usePresentation = (courseId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPresentation = async () => {
      try {
        const response = await fetch(`/presentations/${courseId}/data.json`);
        const presentationData = await response.json();
        setData(presentationData);
      } catch (error) {
        console.error('Failed to load presentation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPresentation();
  }, [courseId]);

  return { data, loading };
};
```

### スライド作成ワークフロー

#### 1. 手動作成
```bash
# スライド用ディレクトリ作成
mkdir -p static/presentations/new-course/slides

# スライド画像を配置
# PowerPoint, Keynote, Google Slidesからエクスポート

# data.jsonを作成
```

#### 2. 自動化スクリプト（PowerShell）
```powershell
# scripts/create-presentation.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$CourseId,
    
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$true)]
    [string]$SlideDir
)

$presentationDir = "static/presentations/$CourseId"
$slidesDir = "$presentationDir/slides"

# ディレクトリ作成
New-Item -ItemType Directory -Force -Path $slidesDir

# スライド画像をコピー
Copy-Item "$SlideDir/*" -Destination $slidesDir

# data.jsonテンプレート生成
$template = @{
    id = $CourseId
    title = $Title  
    slides = @()
}

$template | ConvertTo-Json -Depth 3 | Out-File "$presentationDir/data.json" -Encoding UTF8
```

### 推奨アプローチ
**小〜中規模**: 方法1（JSON + 画像）
- シンプルで管理しやすい
- バージョン管理に適している
- パフォーマンスが良い

**大規模・チーム開発**: 方法4（CMS統合）
- コンテンツ管理が容易
- 権限管理が可能
- スケーラブル

## スケジュール機能要件

### カレンダー表示
- React Big Calendar または FullCalendar.js の使用を検討
- 講座スケジュールの表示
- イベント詳細のモーダル表示

### 資料配布機能
- ダウンロードリンクの管理
- PDFビューアー統合（react-pdf）
- アクセス制御（必要に応じて）

## パフォーマンス考慮事項

1. **画像の最適化**: WebP形式の使用、遅延読み込み
2. **コード分割**: Dynamic Importでの遅延読み込み
3. **メモ化**: React.memo、useMemo、useCallbackの活用
4. **バンドルサイズ**: 不要な依存関係の排除

## 開発手順

1. **Phase 1**: 基本的なスライドビューアーの実装
2. **Phase 2**: 説明文連動機能の追加
3. **Phase 3**: UI/UXの改善とアニメーション追加
4. **Phase 4**: スケジュール機能の統合
5. **Phase 5**: モバイル対応とパフォーマンス最適化

## 参考リンク

- [Docusaurus公式ドキュメント](https://docusaurus.io/)
- [Swiper.js公式サイト](https://swiperjs.com/)
- [Framer Motion公式サイト](https://www.framer.com/motion/)
- [React Markdown](https://github.com/remarkjs/react-markdown)

---
作成日: 2025年8月10日
更新日: 2025年8月10日
