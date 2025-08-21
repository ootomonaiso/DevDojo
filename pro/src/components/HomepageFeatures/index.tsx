
import type { ReactNode } from 'react';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h3">開催予定</Heading>
            <iframe
              src="https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID&ctz=Asia%2FTokyo"
              style={{ border: 0, width: '100%', height: '400px' }}
              frameBorder="0"
              scrolling="no"
              title="Google Calendar"
            />
          </div>
          <div className="col col--6">
            <Heading as="h3">講座内容</Heading>
            <ul>
              <li>Linux入門講座 - 8月25日 14:00～</li>
              <li>ネットワーク基礎 - 8月28日 16:00～</li>
              <li>AIコーディング体験 - 9月2日 13:00～</li>
            </ul>
            <p>各講座の詳細は「ドキュメントを見る」からご確認ください。</p>
          </div>
        </div>
      </div>
    </section>
  );
}
