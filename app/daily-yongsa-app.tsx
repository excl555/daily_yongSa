'use client';

import { useMemo, useState } from 'react';
import {
  calculateProgress,
  getCalendarSummary,
  getWeekHistory,
  GOALS,
  randomizeQuests,
  selectGoal,
  toggleQuest
} from '@/lib/quest-domain';

type Quest = {
  id: string;
  title: string;
  description: string;
  stat: string;
  exp: number;
  difficulty: string;
  completed: boolean;
};

type DashboardState = {
  selectedGoal: string;
  questTemplates: Record<string, Quest[]>;
  quests: Quest[];
  diary: string;
  stats: Record<string, number>;
  history: Record<string, { completed: number; total: number; exp: number; focus: string; items: string[] }>;
  dataSource: string;
};

const DATA_SOURCE_LABELS = {
  'local-seed': '예시 데이터',
  supabase: 'Supabase 연결됨',
  'supabase-error': '예시 데이터'
};

export function DailyYongsaApp({ initialState }: { initialState: DashboardState }) {
  const [state, setState] = useState(initialState);
  const progress = useMemo(() => calculateProgress(state), [state]);
  const calendar = useMemo(() => getCalendarSummary(state), [state]);
  const weekHistory = useMemo(() => getWeekHistory(state), [state]);
  const activeStats = useMemo(
    () =>
      Object.entries(state.stats).map(([name, value]) => {
        const gain = progress.statGains[name] || 0;
        return { name, value: value + gain, gain };
      }),
    [progress, state.stats]
  );

  return (
    <div className="app-shell" data-app>
      <aside className="sidebar" aria-label="워크스페이스">
        <a className="brand" href="/" aria-label="하루 용사 홈">
          <span className="brand-mark">勇</span>
          <span>
            <strong>하루 용사</strong>
            <small>개인 퀘스트 노트</small>
          </span>
        </a>

        <nav className="side-nav" aria-label="페이지 메뉴">
          <a className="is-active" href="#quests">
            오늘의 퀘스트
          </a>
          <a href="#diary">하루 회고</a>
          <a href="#report">성장 리포트</a>
        </nav>

        <div className="sidebar-card">
          <span className="tag tag-purple">데모 상태</span>
          <p>
            데이터: <strong data-data-source>{DATA_SOURCE_LABELS[state.dataSource as keyof typeof DATA_SOURCE_LABELS] || '예시 데이터'}</strong>
          </p>
        </div>
      </aside>

      <main className="page">
        <header className="page-header">
          <div className="breadcrumbs">하루 용사 / 오늘</div>
          <div className="page-icon" aria-hidden="true">
            ⚔
          </div>
          <h1>오늘의 퀘스트</h1>
          <p className="lead">
            실제 사용자가 오늘 받은 퀘스트를 처리하고, 완료 기록을 캘린더로 쌓는 화면입니다.
          </p>

          <div className="property-grid" aria-label="오늘 진행 상황">
            <div className="property">
              <span className="property-label">클리어</span>
              <strong data-completed>
                {progress.completed} / {progress.total}
              </strong>
            </div>
            <div className="property">
              <span className="property-label">경험치</span>
              <strong data-exp>{progress.totalExp} EXP</strong>
            </div>
            <div className="property">
              <span className="property-label">칭호</span>
              <strong data-title>{progress.title}</strong>
            </div>
          </div>
        </header>

        <section className="goal-section" aria-label="목표 선택">
          <div className="section-title">
            <span>목표</span>
            <p>오늘 집중할 영역을 고르면 퀘스트 목록이 바뀝니다.</p>
          </div>
          <div className="goal-tabs" data-goals>
            {GOALS.map((goal) => (
              <button
                className={`goal-tab ${goal.id === state.selectedGoal ? 'is-active' : ''}`}
                type="button"
                key={goal.id}
                aria-pressed={goal.id === state.selectedGoal}
                onClick={() => setState((current) => selectGoal(current, goal.id))}
              >
                <Icon name={goal.icon} />
                <span>{goal.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="content-grid">
          <section className="workspace-card quest-board" id="quests">
            <div className="section-heading">
              <div>
                <span className="kicker">Database</span>
                <h2>일일퀘스트</h2>
              </div>
              <div className="section-actions">
                <button className="secondary-button" type="button" onClick={() => setState((current) => randomizeQuests(current))}>
                  랜덤 다시 뽑기
                </button>
                <div className="progress-shell" aria-hidden="true">
                  <span style={{ width: `${progress.percent}%` }} />
                </div>
              </div>
            </div>
            <div className="quest-list" data-quests>
              {state.quests.map((quest) => (
                <article className={`quest-card ${quest.completed ? 'is-complete' : ''}`} key={quest.id}>
                  <button
                    className="quest-check"
                    type="button"
                    aria-label={`${quest.title} 완료 전환`}
                    onClick={() => setState((current) => toggleQuest(current, quest.id))}
                  >
                    <Icon name={quest.completed ? 'check' : 'circle'} />
                  </button>
                  <div className="quest-copy">
                    <div className="quest-meta">
                      <span>{quest.difficulty}</span>
                      <span>
                        {quest.stat} +{Math.ceil(quest.exp / 8)}
                      </span>
                      <span>{quest.exp} EXP</span>
                    </div>
                    <h3>{quest.title}</h3>
                    <p>{quest.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="side-column">
            <section className="workspace-card stats-panel" id="report">
              <div className="section-heading compact">
                <div>
                  <span className="kicker">Properties</span>
                  <h2>성장 스탯</h2>
                </div>
              </div>
              <div className="stat-list" data-stats>
                {activeStats.map((stat) => (
                  <div className="stat-row" key={stat.name}>
                    <div>
                      <strong>{stat.name}</strong>
                      <span>{stat.gain ? `+${stat.gain}` : '대기'}</span>
                    </div>
                    <div className="stat-track" aria-hidden="true">
                      <span style={{ width: `${Math.min(stat.value * 3, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="workspace-card diary-panel" id="diary">
              <div className="section-heading compact">
                <div>
                  <span className="kicker">Journal</span>
                  <h2>하루 회고</h2>
                </div>
              </div>
              <textarea
                value={state.diary}
                maxLength={180}
                placeholder="오늘 가장 괜찮았던 장면을 한 줄로 남겨보세요."
                onChange={(event) => setState((current) => ({ ...current, diary: event.target.value }))}
              />
              <div className="diary-preview">
                <span className="tag tag-peach">오늘의 한 줄</span>
                <p>{state.diary.trim() || '오늘의 회고를 남기면 이곳에 하루의 장면이 저장됩니다.'}</p>
              </div>
            </section>
          </aside>
        </div>

        <section className="calendar-grid" aria-label="퀘스트 기록 캘린더">
          <section className="workspace-card calendar-panel">
            <div className="section-heading">
              <div>
                <span className="kicker">Calendar</span>
                <h2>{calendar.monthLabel} 기록</h2>
              </div>
              <span className="calendar-summary">
                {calendar.completedDays}일 기록 · {calendar.totalExp} EXP
              </span>
            </div>
            <div className="month-calendar" data-month-calendar>
              {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                <span className="calendar-weekday" key={day}>
                  {day}
                </span>
              ))}
              <span className="calendar-spacer" />
              {calendar.days.map((day) => (
                <button
                  className={`calendar-day ${day.hasEntry ? 'has-entry' : ''} ${day.date === '2026-06-14' ? 'is-today' : ''}`}
                  type="button"
                  key={day.date}
                >
                  <span>{day.day}</span>
                  <small>{day.hasEntry ? `${day.completed}/${day.total}` : ''}</small>
                </button>
              ))}
            </div>
          </section>

          <section className="workspace-card week-panel">
            <div className="section-heading compact">
              <div>
                <span className="kicker">Timeline</span>
                <h2>이번 주에 한 것</h2>
              </div>
            </div>
            <div className="week-list" data-week-history>
              {weekHistory.map((entry) => (
                <article className={`week-entry ${entry.date === '2026-06-14' ? 'is-today' : ''}`} key={entry.date}>
                  <div className="week-date">
                    <strong>{entry.weekday}</strong>
                    <span>{entry.dayLabel}</span>
                  </div>
                  <div className="week-detail">
                    <div className="week-row">
                      <span className="tag tag-sky">{entry.focus}</span>
                      <span>
                        {entry.completed}/{entry.total} · {entry.exp} EXP
                      </span>
                    </div>
                    <p>{entry.items.length ? entry.items.join(' · ') : '아직 기록 없음'}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, string[]> = {
    activity: ['M3 12h4l3-8 4 16 3-8h4'],
    book: ['M5 4h10a4 4 0 0 1 4 4v14H9a4 4 0 0 1-4-4V4Z', 'M9 18h10'],
    home: ['m3 11 9-8 9 8', 'M5 10v10h14V10'],
    spark: ['m12 2 2.2 6.8L21 11l-6.8 2.2L12 21l-2.2-7.8L3 11l6.8-2.2L12 2Z'],
    moon: ['M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z'],
    check: ['m5 12 5 5L20 7'],
    circle: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z']
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {(paths[name] || paths.spark).map((path) => (
        <path d={path} key={path} />
      ))}
    </svg>
  );
}
