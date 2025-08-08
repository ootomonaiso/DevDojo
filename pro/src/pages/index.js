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
          <div className={styles.techGrid}>
            <div className={styles.techCategory}>
              <h3 className={styles.categoryTitle}>Infrastructure</h3>
              <div className={styles.techItems}>
                <div className={styles.techItem}>
                  <span className={styles.techIcon}>🐧</span>
                  <div>
                    <strong>Linux(Ubuntu)基礎</strong>
                    <p>OSの仕組み・コマンドライン操作</p>
                  </div>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techIcon}>🌐</span>
                  <div>
                    <strong>ネットワーク</strong>
                    <p>TCP/IP・HTTP・DNS の基礎</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.techCategory}>
              <h3 className={styles.categoryTitle}>Development</h3>
              <div className={styles.techItems}>
                <div className={styles.techItem}>
                  <span className={styles.techIcon}>🐍</span>
                  <div>
                    <strong>Python API開発</strong>
                    <p>FastAPI・REST API設計</p>
                  </div>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techIcon}>💾</span>
                  <div>
                    <strong>データベース</strong>
                    <p>SQL・NoSQL・ORMの使い方</p>
                  </div>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techIcon}>🤖</span>
                  <div>
                    <strong>AI支援開発</strong>
                    <p>VSCode + Copilot活用術</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.techCategory}>
              <h3 className={styles.categoryTitle}>Engineering</h3>
              <div className={styles.techItems}>
                <div className={styles.techItem}>
                  <span className={styles.techIcon}>📐</span>
                  <div>
                    <strong>設計原則</strong>
                    <p>オブジェクト指向・MVC・Clean Code</p>
                  </div>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techIcon}>🔐</span>
                  <div>
                    <strong>認証・認可</strong>
                    <p>OAuth・JWT・セキュリティ基礎</p>
                  </div>
                </div>
                <div className={styles.techItem}>
                  <span className={styles.techIcon}>🔧</span>
                  <div>
                    <strong>DevOps基礎</strong>
                    <p>Git・GitHub・CI/CD入門</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
