import React from 'react';
import Layout from '@theme/Layout';
import styles from './index.module.css';
import Link from '@docusaurus/Link';

export default function Home() {
  return (
    <Layout
      title="ポートフォリオ"
      description="エンジニアのポートフォリオ兼技術ブログです。"
    >
      <header className="hero hero--primary">
        <div className="container">
          <h1 className="hero__title">大友内装(粒)</h1>
          <p className="hero__subtitle">フルスタックエンジニアになりたかったエンジニア / やっぱWebなんすわ</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link className="button button--secondary button--lg" to="/docs/intro">
              技術記事を見る
            </Link>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <a href="https://github.com/ootomonaiso" target="_blank" style={{ marginRight: '1rem' }}>
              GitHub
            </a>
            <a href="https://x.com/ootomonaiso" target="_blank">
              X (旧Twitter)
            </a>
          </div>
        </div>
      </header>

      <main className="container margin-vert--lg">
        <h2>主なスキル</h2>
        <ul>
          <li>React / TypeScript</li>
          <li>Python / 機械学習</li>
          <li>Proxmox / サーバー構築</li>
        </ul>

        <h2 style={{ marginTop: '2rem' }}>プロジェクト紹介</h2>
        <div className="row">
          <div className="col col--6">
            <div className="card">
              <div className="card__header">
                <h3>Rocket Simulator</h3>
              </div>
              <div className="card__body">
                <p>物理エンジンを使ったロケット飛行シミュレーション。3D描画と風の影響も反映。</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
