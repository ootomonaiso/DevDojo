import Layout from '@theme/Layout';
import styles from './index.module.css';

export default function Home() {
  return (
    <Layout
      title="大友情報道場(仮)"
      description="インフラからアプリ制作まで幅広く学べる部員用技術勉強会のポータルページ"
    >
      <div className={styles.heroSection}>
        <div className={styles.bgWave}></div>
        <h1 className={styles.heroTitle}>大友情報道場<small className={styles.kari}>(仮)</small></h1>
        <p className={styles.heroLead}>インフラからアプリ制作まで幅広く学べる<br />部員用技術勉強会のポータルページ</p>
      </div>
      <main className={styles.mainContent}>
        <section className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📋</span>
            概要
          </h2>
          <div className={styles.card}>
            <div className={styles.overview}>
              <div className={styles.overviewItem}>
                <strong className={styles.label}>目的</strong>
                <span>インフラからアプリ開発まで幅広い技術領域をカバーした実践的な学習コミュニティ</span>
              </div>
              <div className={styles.overviewItem}>
                <strong className={styles.label}>対象</strong>
                <span>部員・技術に興味のある学習者</span>
              </div>
              <div className={styles.overviewItem}>
                <strong className={styles.label}>形式</strong>
                <span>ハンズオン形式の勉強会 + オンライン教材</span>
              </div>
            </div>
          </div>
        </section>
        
        <section className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📅</span>
            開始期間予定
          </h2>
          <div className={styles.card}>
            <p style={{textAlign: 'center', color: 'var(--ifm-color-emphasis-600)', fontSize: '1.1rem', padding: '2rem'}}>
              ここにGoogleカレンダーを埋め込み予定
            </p>
          </div>
        </section>

        <section className={styles.cardSection}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🛠️</span>
            行う予定の講座
          </h2>
          <div className={styles.card}>
            <div className={styles.courseGrid}>
              <div className={styles.courseItem}>
                <h3>🐧 Linux(Ubuntu)基礎</h3>
                <p>OSの仕組み・コマンドライン操作</p>
              </div>
              <div className={styles.courseItem}>
                <h3>🌐 ネットワーク</h3>
                <p>TCP/IP・HTTP・DNS の基礎</p>
              </div>
              <div className={styles.courseItem}>
                <h3>🐍 Python API開発</h3>
                <p>FastAPI・REST API設計</p>
              </div>
              <div className={styles.courseItem}>
                <h3>💾 データベース</h3>
                <p>SQL・NoSQL・ORMの使い方</p>
              </div>
              <div className={styles.courseItem}>
                <h3>🤖 AI支援開発</h3>
                <p>VSCode + Copilot活用術</p>
              </div>
              <div className={styles.courseItem}>
                <h3>📐 設計原則</h3>
                <p>オブジェクト指向・MVC・Clean Code</p>
              </div>
              <div className={styles.courseItem}>
                <h3>🔐 認証・認可</h3>
                <p>OAuth・JWT・セキュリティ基礎</p>
              </div>
              <div className={styles.courseItem}>
                <h3>🔧 DevOps基礎</h3>
                <p>Git・GitHub・CI/CD入門</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
