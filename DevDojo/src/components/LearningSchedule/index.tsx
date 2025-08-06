import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type CalendarEvent = {
  date: string;
  title: string;
  type: 'lecture' | 'practice' | 'project' | 'review';
  completed?: boolean;
};

/*
 * カレンダー設定の変更方法:
 * 
 * 1. 開始時期を変更する場合:
 *    - startYear: 開始年
 *    - startMonth: 開始月 (0ベース: 0=1月, 9=10月, 11=12月)
 * 
 * 2. スケジュールを変更する場合:
 *    - calendarEvents配列の日付とイベントを編集
 *    - date形式: 'YYYY-MM-DD'
 *    - type: 'lecture'(講義), 'practice'(実習), 'project'(プロジェクト), 'review'(レビュー)
 * 
 * 3. 複数月に対応する場合:
 *    - calendarEvents配列に他の月のイベントを追加
 *    - 表示月を切り替える機能を後で追加可能
 */

// カレンダー設定（変更可能）
const CALENDAR_CONFIG = {
  startYear: 2025,
  startMonth: 9, // 10月 (0ベースなので9)
  title: '学習カレンダー',
  description: 'DevDojoの学習スケジュール（予定）'
};

// 今月のカレンダーデータ
const currentMonth = CALENDAR_CONFIG.startMonth;
const currentYear = CALENDAR_CONFIG.startYear;
const currentDate = new Date().getDate();

// テンプレート用のサンプルスケジュール
const calendarEvents: CalendarEvent[] = [
  // 第1週: Web開発の基礎
  { date: '2025-10-01', title: 'HTML/CSS基礎', type: 'lecture' },
  { date: '2025-10-02', title: 'JavaScript基礎', type: 'lecture' },
  { date: '2025-10-03', title: '実習: ポートフォリオサイト', type: 'practice' },
  
  // 第2週: React入門
  { date: '2025-10-06', title: 'React基礎', type: 'lecture' },
  { date: '2025-10-07', title: 'コンポーネント設計', type: 'practice' },
  { date: '2025-10-08', title: 'State管理', type: 'lecture' },
  { date: '2025-10-09', title: '実習: Todoアプリ', type: 'project' },
  { date: '2025-10-10', title: '週次レビュー', type: 'review' },
  
  // 第3週: TypeScript
  { date: '2025-10-13', title: 'TypeScript入門', type: 'lecture' },
  { date: '2025-10-14', title: '型システム', type: 'practice' },
  { date: '2025-10-15', title: 'React + TypeScript', type: 'practice' },
  { date: '2025-10-16', title: '実習: TypeScript演習', type: 'practice' },
  { date: '2025-10-17', title: '週次レビュー', type: 'review' },
  
  // 第4週: バックエンド開発
  { date: '2025-10-20', title: 'Node.js基礎', type: 'lecture' },
  { date: '2025-10-21', title: 'Express.js', type: 'practice' },
  { date: '2025-10-22', title: 'REST API作成', type: 'project' },
  { date: '2025-10-23', title: 'API実習', type: 'practice' },
  { date: '2025-10-24', title: '週次レビュー', type: 'review' },
  
  // 第5週: データベース
  { date: '2025-10-27', title: 'データベース基礎', type: 'lecture' },
  { date: '2025-10-28', title: 'SQL実習', type: 'practice' },
  { date: '2025-10-29', title: 'ORM実習', type: 'practice' },
  { date: '2025-10-30', title: 'DB設計実習', type: 'practice' },
  { date: '2025-10-31', title: '月次レビュー', type: 'review' },
  
  // 11月の予定例（追加可能）
  // { date: '2025-11-03', title: 'フロントエンド総復習', type: 'review' },
  // { date: '2025-11-04', title: 'フルスタック開発', type: 'project' },
  // { date: '2025-11-05', title: 'デプロイメント', type: 'lecture' },
  // { date: '2025-11-06', title: '最終プロジェクト', type: 'project' },
];

// カレンダーの日付を生成
function generateCalendarDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  const endDate = new Date(lastDay);
  
  // 月曜始まりにするため、日曜日の場合は6を引く
  const startWeekday = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  startDate.setDate(1 - startWeekday);
  
  const dates = [];
  const current = new Date(startDate);
  
  while (current <= endDate || dates.length % 7 !== 0) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
    
    // 6週間で十分
    if (dates.length >= 42) break;
  }
  
  return dates;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function CalendarDay({ date, events, isCurrentMonth, isToday }: {
  date: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}) {
  const dayEvents = events.filter(event => event.date === formatDate(date));
  
  return (
    <div className={clsx(
      styles.calendarDay,
      !isCurrentMonth && styles.otherMonth,
      isToday && styles.today
    )}>
      <div className={styles.dayNumber}>
        {date.getDate()}
      </div>
      <div className={styles.dayEvents}>
        {dayEvents.map((event, index) => (
          <div
            key={index}
            className={clsx(
              styles.event,
              styles[event.type],
              event.completed && styles.completed
            )}
            title={event.title}
          >
            <span className={styles.eventTitle}>{event.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LearningSchedule(): React.JSX.Element {
  const dates = generateCalendarDates(currentYear, currentMonth);
  const monthNames = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];
  const weekdays = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <section className={styles.scheduleSection}>
      <div className="container">
        <div className="text--center margin-bottom--lg">
          <Heading as="h2">{CALENDAR_CONFIG.title}</Heading>
          <p className={styles.scheduleDescription}>
            {CALENDAR_CONFIG.description}
            <br />
            <small>
              {currentYear}年{monthNames[currentMonth]} | 
              開始時期は調整可能です
            </small>
          </p>
        </div>
        
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            {weekdays.map((day) => (
              <div key={day} className={styles.weekdayHeader}>
                {day}
              </div>
            ))}
          </div>
          
          <div className={styles.calendarGrid}>
            {dates.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth;
              const isToday = date.getDate() === currentDate && isCurrentMonth;
              
              return (
                <CalendarDay
                  key={index}
                  date={date}
                  events={calendarEvents}
                  isCurrentMonth={isCurrentMonth}
                  isToday={isToday}
                />
              );
            })}
          </div>
        </div>
        
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={clsx(styles.legendColor, styles.lecture)}></span>
            <span>講義</span>
          </div>
          <div className={styles.legendItem}>
            <span className={clsx(styles.legendColor, styles.practice)}></span>
            <span>実習</span>
          </div>
          <div className={styles.legendItem}>
            <span className={clsx(styles.legendColor, styles.project)}></span>
            <span>プロジェクト</span>
          </div>
          <div className={styles.legendItem}>
            <span className={clsx(styles.legendColor, styles.review)}></span>
            <span>レビュー</span>
          </div>
        </div>
      </div>
    </section>
  );
}
