import React, { useState, useEffect, useRef } from 'react';
import { Marp } from '@marp-team/marp-core';
import styles from './styles.module.css';

interface MarpViewerProps {
  markdownContent: string;
  theme?: string;
  descriptions?: string[];
}

const MarpViewer: React.FC<MarpViewerProps> = ({ 
  markdownContent, 
  theme = 'default',
  descriptions = []
}) => {
  const [slides, setSlides] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [marpCSS, setMarpCSS] = useState<string>('');
  const [showDescription, setShowDescription] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const processMarpContent = async () => {
      try {
        // Marpインスタンス作成
        const marp = new Marp({
          html: true,
          emoji: {
            shortcode: true,
            unicode: true
          }
        });

        // Markdownをレンダリング
        const { html, css } = marp.render(markdownContent);

        // CSSを保存
        setMarpCSS(css);

        // HTMLを安全に解析して各<section>を取り出す（DOMParser）
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const sections = Array.from(doc.querySelectorAll('section'));

        const processedSlides = sections.map((sec) => {
          sec.classList.add('marpit-slide');
          return sec.outerHTML;
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
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
          }
          break;
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
      const styleId = 'marp-generated-style';
      let existingStyle = document.getElementById(styleId);
      
      if (existingStyle) {
        existingStyle.remove();
      }

      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = `
        ${marpCSS}
        
        /* Docusaurus x Marp minimal overrides */
        .marpit-slide {
          box-sizing: border-box !important;
          max-width: 900px !important;
          width: 100% !important;
          margin: 0 auto !important;
          height: 100% !important; /* 比率ボックスに合わせて縦をフィット */
          display: block !important;
          padding: 16px !important;
          background: var(--ifm-background-surface, #fff) !important;
          border-radius: 8px !important;
          border: 1px solid var(--ifm-color-emphasis-300) !important;
          overflow: auto !important; /* 内容が多い場合は内部スクロール */
          box-shadow: 0 2px 6px rgba(0,0,0,0.06) !important; /* 目立たない影 */
        }
        .marpit-slide::before, .marpit-slide::after { display: none !important; content: none !important; }
        .marpit-slide img, .marpit-slide video { max-width: 100% !important; height: auto !important; }
  .marpit-slide pre { overflow-x: auto !important; }
  .marpit-slide > * { max-width: 100% !important; }
  .marpit-slide > :last-child { margin-bottom: 0 !important; }
        .marpit-slide h1 { font-size: clamp(1.6rem, 4vw, 2.2rem) !important; margin: 0 0 0.75rem !important; text-align: center !important; color: var(--ifm-color-primary) !important; }
        .marpit-slide h2 { font-size: clamp(1.4rem, 3.5vw, 1.8rem) !important; margin: 0 0 0.5rem !important; text-align: center !important; color: var(--ifm-color-secondary) !important; }

        /* Dark theme adjustments */
        [data-theme='dark'] .marpit-slide {
          background: #0f1115 !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: #fff !important; /* 本文を白に */
          box-shadow: 0 2px 10px rgba(0,0,0,0.5) !important;
        }
        [data-theme='dark'] .marpit-slide p,
        [data-theme='dark'] .marpit-slide li,
        [data-theme='dark'] .marpit-slide ul,
        [data-theme='dark'] .marpit-slide ol,
        [data-theme='dark'] .marpit-slide span,
        [data-theme='dark'] .marpit-slide strong,
        [data-theme='dark'] .marpit-slide em {
          color: #fff !important;
        }
        [data-theme='dark'] .marpit-slide li::marker { color: rgba(255,255,255,0.7) !important; }
        [data-theme='dark'] .marpit-slide a { color: #9ad1ff !important; }
        [data-theme='dark'] .marpit-slide pre {
          background: var(--ifm-code-background) !important;
          color: var(--ifm-code-color) !important;
        }
        [data-theme='dark'] .marpit-slide code {
          background: var(--ifm-code-background) !important;
          color: var(--ifm-code-color) !important;
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

      {/* スライド表示エリア（16:9の比率ボックス） */}
      <div className={styles.slideContainer}>
        <div className={styles.ratioBox}>
          <div 
            className={styles.slideStage}
            dangerouslySetInnerHTML={{ 
              __html: slides[currentSlide] || '' 
            }}
          />
        </div>
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

        {descriptions && descriptions.length > 0 && (
          <button
            onClick={() => setShowDescription(!showDescription)}
            className={`${styles.controlButton} ${showDescription ? styles.active : ''}`}
          >
            📝 スピーカーノート
          </button>
        )}
      </div>

      {/* スピーカーノート（説明文） */}
      {descriptions && descriptions.length > 0 && showDescription && (
        <div className={styles.descriptionPanel}>
          <h4>📝 スピーカーノート - スライド {currentSlide + 1}</h4>
          <div className={styles.descriptionContent}>
            {descriptions[currentSlide] ? (
              <div dangerouslySetInnerHTML={{ __html: descriptions[currentSlide] }} />
            ) : (
              <p>このスライドには説明文がありません。</p>
            )}
          </div>
        </div>
      )}

      {/* キーボードヘルプ */}
      <div className={styles.help}>
        💡 キーボード操作: ← → (前後), Space (次), Home/End (最初/最後)
      </div>
    </div>
  );
};

export default MarpViewer;
