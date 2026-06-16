'use client';

import { useMemo, useState } from 'react';
import { signOut } from '@/app/auth-actions';
import { saveReflection, updateQuestCompletion } from '@/app/dashboard-actions';
import {
  calculateGrowthReport,
  calculateProgress,
  getCalendarSummary,
  getQuestBonusExp,
  getTodayBooster,
  getWeekHistory,
  GOALS,
  randomizeQuests,
  selectGoal,
  toggleQuest,
  TODAY
} from '@/lib/quest-domain';

type Quest = {
  id: string;
  title: string;
  description: string;
  stat: string;
  exp: number;
  difficulty: string;
  completed: boolean;
  goalId?: string;
};

type Booster = {
  date: string;
  day: number;
  goalId: string;
  goalLabel: string;
  stat: string;
  label: string;
  bonusType: string;
  bonusValue: number;
};

type ReflectionInsight = {
  mood: string;
  energy: number;
  blockers: string[];
  prompts: string[];
  recentNotes: { date: string; mood: string; note: string }[];
  tomorrowIntent: string;
};

type DashboardState = {
  selectedGoal: string;
  selectedView?: ViewId | string;
  questTemplates: Record<string, Quest[]>;
  quests: Quest[];
  diary: string;
  stats: Record<string, number>;
  history: Record<string, { completed: number; total: number; exp: number; focus: string; items: string[] }>;
  monthlyBoosters: Booster[];
  reflection: ReflectionInsight;
  dataSource: string;
};

type ViewId = 'quests' | 'reflection' | 'growth';

const DATA_SOURCE_LABELS = {
  'local-seed': '예시 데이터',
  supabase: 'Supabase 연결됨',
  'supabase-error': '예시 데이터'
};

const VIEWS: { id: ViewId; label: string; description: string }[] = [
  { id: 'quests', label: '오늘의 퀘스트', description: '완료와 보상' },
  { id: 'reflection', label: '하루 회고', description: '감정과 이유' },
  { id: 'growth', label: '성장 리포트', description: '누적 변화' }
];

const DIFFICULTY_LABELS: Record<string, string> = {
  Easy: '가벼움',
  Normal: '보통',
  Hidden: '숨은 퀘스트'
};

export function DailyYongsaApp({
  initialState,
  userEmail
}: {
  initialState: DashboardState;
  userEmail: string;
}) {
  const initialView = isViewId(initialState.selectedView) ? initialState.selectedView : 'quests';
  const [state, setState] = useState<DashboardState>(() => ({
    ...initialState,
    selectedView: initialView,
    monthlyBoosters: initialState.monthlyBoosters || [],
    reflection: initialState.reflection || {
      mood: '차분함',
      energy: 70,
      blockers: [],
      prompts: [],
      recentNotes: [],
      tomorrowIntent: ''
    }
  }));
  const [view, setView] = useState<ViewId>(initialView);
  const progress = useMemo(() => calculateProgress(state), [state]);
  const calendar = useMemo(() => getCalendarSummary(state), [state]);
  const weekHistory = useMemo(() => getWeekHistory(state), [state]);
  const growthReport = useMemo(() => calculateGrowthReport(state), [state]);
  const todayBooster = useMemo(() => getTodayBooster(state.monthlyBoosters || [], TODAY), [state.monthlyBoosters]);
  const activeGoal = GOALS.find((goal) => goal.id === state.selectedGoal) || GOALS[0];
  const completedQuests = useMemo(
    () => Object.values(state.questTemplates).flatMap((quests) => quests).filter((quest) => quest.completed),
    [state.questTemplates]
  );

  return (
    <div className="app-shell" data-app>
      <aside className="sidebar" aria-label="워크스페이스">
        <a className="brand" href="/" aria-label="하루 용사 홈">
          <span className="brand-mark">하</span>
          <span>
            <strong>하루 용사</strong>
            <small>생활형 성장 노트</small>
          </span>
        </a>

        <nav className="side-nav" aria-label="페이지 메뉴">
          {VIEWS.map((item) => (
            <button
              className={view === item.id ? 'is-active' : ''}
              type="button"
              key={item.id}
              onClick={() => setView(item.id)}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </nav>

        <div className="sidebar-card booster-mini">
          <span className="tag tag-purple">오늘의 부스터</span>
          <strong>{todayBooster ? todayBooster.label : '부스터 없음'}</strong>
          <p>{todayBooster ? `${todayBooster.goalLabel} 퀘스트 EXP +${todayBooster.bonusValue}%` : '오늘은 기본 성장일입니다.'}</p>
        </div>

        <div className="sidebar-card">
          <span className="tag tag-sky">로그인됨</span>
          <p>
            데이터: <strong data-data-source>{DATA_SOURCE_LABELS[state.dataSource as keyof typeof DATA_SOURCE_LABELS] || '예시 데이터'}</strong>
          </p>
          <p>
            계정: <strong>{userEmail}</strong>
          </p>
          <form action={signOut}>
            <button className="logout-button" type="submit">
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <main className="page">
        {view === 'quests' ? (
          <QuestView
            state={state}
            progress={progress}
            activeGoal={activeGoal}
            todayBooster={todayBooster}
            completedQuests={completedQuests}
            onGoalChange={(goalId) => setState((current) => selectGoal(current, goalId))}
            onRandomize={() => setState((current) => randomizeQuests(current))}
            onToggle={(quest) => {
              setState((current) => toggleQuest(current, quest.id));
              void updateQuestCompletion(quest.id, !quest.completed);
            }}
          />
        ) : null}

        {view === 'reflection' ? (
          <ReflectionView
            state={state}
            progress={progress}
            completedQuests={completedQuests}
            onDiaryChange={(diary) => setState((current) => ({ ...current, diary }))}
            onDiarySave={(diary) => {
              void saveReflection(diary);
            }}
          />
        ) : null}

        {view === 'growth' ? (
          <GrowthView state={state} progress={progress} calendar={calendar} weekHistory={weekHistory} report={growthReport} />
        ) : null}
      </main>
    </div>
  );
}

function isViewId(value: unknown): value is ViewId {
  return value === 'quests' || value === 'reflection' || value === 'growth';
}

function QuestView({
  state,
  progress,
  activeGoal,
  todayBooster,
  completedQuests,
  onGoalChange,
  onRandomize,
  onToggle
}: {
  state: DashboardState;
  progress: ReturnType<typeof calculateProgress>;
  activeGoal: (typeof GOALS)[number];
  todayBooster: Booster | null;
  completedQuests: Quest[];
  onGoalChange: (goalId: string) => void;
  onRandomize: () => void;
  onToggle: (quest: Quest) => void;
}) {
  const remainingCount = Math.max(progress.total - progress.completed, 0);

  return (
    <section className="view-stack" data-view="quests">
      <header className="page-header">
        <div className="breadcrumbs">하루 용사 / 오늘의 퀘스트</div>
        <div className="page-icon" aria-hidden="true">
          ✓
        </div>
        <h1>오늘의 퀘스트</h1>
        <p className="lead">오늘 할 일을 처리하고 즉시 EXP, 스탯, 부스터 보상을 확인합니다. 목표 탭은 필터일 뿐, 전체 클리어 총합은 계속 유지됩니다.</p>

        <div className="property-grid" aria-label="오늘 진행 상황">
          <MetricCard label="클리어" value={`${progress.completed} / ${progress.total}`} dataAttr="completed" />
          <MetricCard label="오늘 EXP" value={`${progress.totalExp} EXP`} helper={`기본 ${progress.baseExp} + 보너스 ${progress.bonusExp}`} dataAttr="exp" />
          <MetricCard label="칭호" value={progress.title} dataAttr="title" />
        </div>
      </header>

      <section className="booster-hero" data-booster>
        <div>
          <span className="kicker">Monthly Event</span>
          <h2>{todayBooster ? todayBooster.label : '오늘은 기본 성장일'}</h2>
          <p>
            {todayBooster
              ? `${todayBooster.goalLabel} 퀘스트를 완료하면 EXP가 ${todayBooster.bonusValue}% 더 쌓입니다.`
              : '부스터가 없는 날에도 클리어 기록은 성장 리포트에 누적됩니다.'}
          </p>
        </div>
        <div className="booster-score">
          <strong>{todayBooster ? `+${todayBooster.bonusValue}%` : '기본'}</strong>
          <span>{todayBooster ? todayBooster.stat : '전체 스탯'}</span>
        </div>
      </section>

      <section className="goal-section" aria-label="목표 선택">
        <div className="section-title">
          <span>목표 필터</span>
          <p>건강, 공부, 집안일, 관계, 멘탈 중 오늘 볼 퀘스트 영역을 선택합니다.</p>
        </div>
        <div className="goal-tabs" data-goals>
          {GOALS.map((goal) => (
            <button
              className={`goal-tab ${goal.id === state.selectedGoal ? 'is-active' : ''} ${todayBooster?.goalId === goal.id ? 'has-boost' : ''}`}
              type="button"
              key={goal.id}
              aria-pressed={goal.id === state.selectedGoal}
              onClick={() => onGoalChange(goal.id)}
            >
              <Icon name={goal.icon} />
              <span>{goal.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="content-grid">
        <section className="workspace-card quest-board">
          <div className="section-heading">
            <div>
              <span className="kicker">Quest Database</span>
              <h2>{activeGoal.label} 퀘스트</h2>
            </div>
            <div className="section-actions">
              <button className="secondary-button" type="button" onClick={onRandomize}>
                랜덤 다시 뽑기
              </button>
              <div className="progress-shell" aria-hidden="true">
                <span style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          </div>

          <div className="quest-list" data-quests>
            {state.quests.map((quest) => {
              const bonusExp = getQuestBonusExp(quest, todayBooster);
              const boosted = bonusExp > 0;

              return (
                <article className={`quest-card ${quest.completed ? 'is-complete' : ''} ${boosted ? 'is-boosted' : ''}`} key={quest.id}>
                  <button className="quest-check" type="button" aria-label={`${quest.title} 완료 전환`} onClick={() => onToggle(quest)}>
                    <Icon name={quest.completed ? 'check' : 'circle'} />
                  </button>
                  <div className="quest-copy">
                    <div className="quest-meta">
                      <span>{DIFFICULTY_LABELS[quest.difficulty] || quest.difficulty}</span>
                      <span>
                        {quest.stat} +{Math.ceil((quest.exp + bonusExp) / 8)}
                      </span>
                      <span>{quest.exp + bonusExp} EXP</span>
                      {boosted ? <span className="boost-tag">BOOST +{bonusExp}</span> : null}
                    </div>
                    <h3>{quest.title}</h3>
                    <p>{quest.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="side-column">
          <section className="workspace-card stats-panel">
            <div className="section-heading compact">
              <div>
                <span className="kicker">All Stats</span>
                <h2>오늘 오른 능력치</h2>
              </div>
            </div>
            <StatList stats={state.stats} gains={progress.statGains} />
          </section>

          <section className="workspace-card mission-panel">
            <span className="kicker">Bonus Conditions</span>
            <h2>오늘 남은 동기</h2>
            <div className="mission-list">
              <MissionItem label="전체 클리어" value={`${progress.completed}/${progress.total}`} done={progress.completed === progress.total} />
              <MissionItem label="부스터 퀘스트" value={todayBooster ? todayBooster.goalLabel : '없음'} done={Boolean(todayBooster && completedQuests.some((quest) => quest.goalId === todayBooster.goalId))} />
              <MissionItem label="남은 퀘스트" value={`${remainingCount}개`} done={remainingCount === 0} />
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ReflectionView({
  state,
  progress,
  completedQuests,
  onDiaryChange,
  onDiarySave
}: {
  state: DashboardState;
  progress: ReturnType<typeof calculateProgress>;
  completedQuests: Quest[];
  onDiaryChange: (diary: string) => void;
  onDiarySave: (diary: string) => void;
}) {
  const insight = state.reflection;

  return (
    <section className="view-stack" data-view="reflection">
      <header className="page-header reflection-header">
        <div className="breadcrumbs">하루 용사 / 하루 회고</div>
        <div className="page-icon page-icon-peach" aria-hidden="true">
          ✎
        </div>
        <h1>하루 회고</h1>
        <p className="lead">오늘 한 행동을 감정과 맥락으로 묶습니다. 클리어 수보다 중요한 것은 내일 다시 움직일 이유를 남기는 것입니다.</p>
      </header>

      <div className="reflection-layout">
        <section className="workspace-card reflection-editor">
          <div className="section-heading">
            <div>
              <span className="kicker">Journal</span>
              <h2>오늘의 한 줄과 세부 회고</h2>
            </div>
            <span className="tag tag-peach">에너지 {insight.energy}%</span>
          </div>

          <textarea
            value={state.diary}
            maxLength={500}
            placeholder="오늘 가장 기억에 남는 장면, 미룬 이유, 내일 다시 시도할 작은 전략을 적어보세요."
            onChange={(event) => onDiaryChange(event.target.value)}
            onBlur={(event) => onDiarySave(event.target.value)}
          />

          <div className="prompt-grid" data-reflection-prompts>
            {insight.prompts.map((prompt) => (
              <button className="prompt-card" type="button" key={prompt}>
                {prompt}
              </button>
            ))}
          </div>
        </section>

        <aside className="side-column">
          <section className="workspace-card reflection-summary">
            <span className="kicker">Today Summary</span>
            <h2>오늘 완료 요약</h2>
            <div className="summary-row">
              <strong>{progress.completed}개 완료</strong>
              <span>{progress.totalExp} EXP</span>
            </div>
            <ul className="compact-list">
              {completedQuests.slice(0, 6).map((quest) => (
                <li key={quest.id}>{quest.title}</li>
              ))}
              {!completedQuests.length ? <li>아직 완료한 퀘스트가 없습니다.</li> : null}
            </ul>
          </section>

          <section className="workspace-card reflection-summary">
            <span className="kicker">Mood Tags</span>
            <h2>오늘의 상태</h2>
            <div className="tag-cloud">
              <span className="tag tag-sky">{insight.mood}</span>
              {insight.blockers.map((blocker) => (
                <span className="tag tag-purple" key={blocker}>
                  {blocker}
                </span>
              ))}
            </div>
            <p className="soft-copy">내일 의도: {insight.tomorrowIntent}</p>
          </section>
        </aside>
      </div>

      <section className="workspace-card recent-reflections">
        <div className="section-heading compact">
          <div>
            <span className="kicker">Timeline</span>
            <h2>최근 7일 회고 흐름</h2>
          </div>
        </div>
        <div className="reflection-timeline">
          {insight.recentNotes.map((note) => (
            <article className="reflection-note" key={`${note.date}-${note.note}`}>
              <span>{note.date}</span>
              <strong>{note.mood}</strong>
              <p>{note.note}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function GrowthView({
  state,
  progress,
  calendar,
  weekHistory,
  report
}: {
  state: DashboardState;
  progress: ReturnType<typeof calculateProgress>;
  calendar: ReturnType<typeof getCalendarSummary>;
  weekHistory: ReturnType<typeof getWeekHistory>;
  report: ReturnType<typeof calculateGrowthReport>;
}) {
  return (
    <section className="view-stack" data-view="growth">
      <header className="page-header">
        <div className="breadcrumbs">하루 용사 / 성장 리포트</div>
        <div className="page-icon page-icon-mint" aria-hidden="true">
          ↑
        </div>
        <h1>성장 리포트</h1>
        <p className="lead">월간 클리어, 능력치 성장, 부스터 효과를 모아 실제로 어떤 방향으로 성장 중인지 보여줍니다.</p>
        <div className="property-grid report-grid">
          <MetricCard label="월간 EXP" value={`${report.monthlyExp + progress.totalExp}`} helper={`부스터 보너스 ${report.boosterBonusExp} 추정`} />
          <MetricCard label="클리어율" value={`${report.completionRate}%`} helper={`${report.completed}/${report.total}`} />
          <MetricCard label="플레이 스타일" value={report.playStyle} helper={report.recommendation} />
        </div>
      </header>

      <div className="report-layout">
        <section className="workspace-card report-panel">
          <div className="section-heading">
            <div>
              <span className="kicker">Stats</span>
              <h2>능력치 성장 보드</h2>
            </div>
            <span className="tag tag-sky">최고 스탯 {report.strongestStat}</span>
          </div>
          <div className="stat-card-grid" data-growth-report>
            {report.statCards.map((stat) => (
              <article className="stat-card" key={stat.name}>
                <div>
                  <strong>{stat.name}</strong>
                  <span>Lv. {stat.value}</span>
                </div>
                <div className="stat-track" aria-hidden="true">
                  <span style={{ width: `${stat.percent}%` }} />
                </div>
                <small>{stat.gain ? `오늘 +${stat.gain}` : '오늘 변화 없음'}</small>
              </article>
            ))}
          </div>
        </section>

        <aside className="side-column">
          <section className="workspace-card report-panel">
            <span className="kicker">Insight</span>
            <h2>이번 달 요약</h2>
            <div className="report-facts">
              <MissionItem label="최고 연속 기록" value={`${report.bestStreak}일`} done />
              <MissionItem label="보완할 능력치" value={report.weakestStat} done={false} />
              <MissionItem label="부스터 날짜" value={`${report.boosterDays.length}일`} done />
            </div>
          </section>

          <section className="workspace-card report-panel">
            <span className="kicker">Focus Mix</span>
            <h2>영역별 클리어 비중</h2>
            <div className="focus-list">
              {report.focusRanking.slice(0, 5).map(([focus, count]) => (
                <div className="focus-row" key={focus}>
                  <span>{focus}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="calendar-grid">
        <section className="workspace-card calendar-panel">
          <div className="section-heading">
            <div>
              <span className="kicker">Calendar</span>
              <h2>{calendar.monthLabel} 기록과 부스터</h2>
            </div>
            <span className="calendar-summary">
              {calendar.completedDays}일 기록 · 부스터 {calendar.boosterDays}일
            </span>
          </div>
          <div className="month-calendar" data-month-calendar>
            {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
              <span className="calendar-weekday" key={day}>
                {day}
              </span>
            ))}
            <span className="calendar-spacer" />
            {calendar.days.map((day) => (
              <button
                className={`calendar-day ${day.hasEntry ? 'has-entry' : ''} ${day.booster ? 'has-booster' : ''} ${day.date === TODAY ? 'is-today' : ''}`}
                type="button"
                key={day.date}
                title={day.booster ? `${day.booster.label}: ${day.booster.goalLabel}` : undefined}
              >
                <span>{day.day}</span>
                <small>{day.hasEntry ? `${day.completed}/${day.total}` : day.booster ? 'BOOST' : ''}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="workspace-card week-panel">
          <div className="section-heading compact">
            <div>
              <span className="kicker">Weekly Timeline</span>
              <h2>이번 주 성장 로그</h2>
            </div>
          </div>
          <div className="week-list" data-week-history>
            {weekHistory.map((entry) => (
              <article className={`week-entry ${entry.date === TODAY ? 'is-today' : ''}`} key={entry.date}>
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
    </section>
  );
}

function MetricCard({ label, value, helper, dataAttr }: { label: string; value: string; helper?: string; dataAttr?: string }) {
  const props = dataAttr ? { [`data-${dataAttr}`]: true } : {};
  return (
    <div className="property">
      <span className="property-label">{label}</span>
      <strong {...props}>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </div>
  );
}

function StatList({ stats, gains }: { stats: Record<string, number>; gains: Record<string, number> }) {
  return (
    <div className="stat-list" data-stats>
      {Object.entries(stats).map(([name, value]) => {
        const gain = gains[name] || 0;
        return (
          <div className="stat-row" key={name}>
            <div>
              <strong>{name}</strong>
              <span>{gain ? `+${gain}` : '대기'}</span>
            </div>
            <div className="stat-track" aria-hidden="true">
              <span style={{ width: `${Math.min((value + gain) * 3, 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MissionItem({ label, value, done }: { label: string; value: string; done: boolean }) {
  return (
    <div className={`mission-item ${done ? 'is-done' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
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
