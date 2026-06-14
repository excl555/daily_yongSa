export const GOALS = [
  { id: 'health', label: '건강', stat: '체력', icon: 'activity' },
  { id: 'study', label: '공부', stat: '지식', icon: 'book' },
  { id: 'home', label: '집안일', stat: '생활력', icon: 'home' },
  { id: 'relation', label: '관계', stat: '관계력', icon: 'spark' },
  { id: 'mind', label: '멘탈', stat: '멘탈', icon: 'moon' }
];

export const TODAY = '2026-06-14';

export const QUESTS_BY_GOAL = {
  health: [
    createQuest('q-health-1', '전사 기본 훈련', '저녁 식사 전, 스쿼트 15개 하기', '체력', 18, 'Normal'),
    createQuest('q-health-2', '숨 고르기', '의자에 앉아 1분 깊게 호흡하기', '멘탈', 10, 'Easy'),
    createQuest('q-health-3', '정찰 임무', '밖으로 나가 15분 걷기', '체력', 24, 'Normal'),
    createQuest('q-health-4', '척추 복구 마법', '목과 어깨 스트레칭 5분 하기', '체력', 14, 'Easy'),
    createQuest('q-health-5', '하늘빛 기록', '오늘 하늘 사진 한 장 남기기', '모험심', 12, 'Hidden')
  ],
  study: [
    createQuest('q-study-1', '15분 몰입 던전', '타이머를 켜고 강의나 책상 앞에 15분 앉기', '지식', 22, 'Normal'),
    createQuest('q-study-2', '지식 조각', '모르는 단어 1개 검색하고 한 줄로 저장하기', '지식', 12, 'Easy'),
    createQuest('q-study-3', '미래 투자', '책 5페이지 읽기', '지식', 16, 'Easy'),
    createQuest('q-study-4', '업무 스킬 강화', '단축키나 도구 팁 1개 익히기', '지식', 18, 'Normal'),
    createQuest('q-study-5', '뇌근육 운동', '오늘 배운 것 3줄 정리하기', '멘탈', 14, 'Easy')
  ],
  home: [
    createQuest('q-home-1', '본진 정비', '책상 위 물건 3개 정리하기', '생활력', 16, 'Easy'),
    createQuest('q-home-2', '인벤토리 청소', '가방 속 필요 없는 물건 1개 버리기', '생활력', 14, 'Easy'),
    createQuest('q-home-3', '방어구 정비', '빨래를 개거나 세탁기 돌리기', '생활력', 24, 'Normal'),
    createQuest('q-home-4', '주방 수복', '설거지 바로 하기', '생활력', 18, 'Normal'),
    createQuest('q-home-5', '냉장고 탐사', '유통기한 지난 음식 1개 확인하기', '자산관리', 12, 'Hidden')
  ],
  relation: [
    createQuest('q-relation-1', '호감도 상승', '가까운 사람 1명에게 진심 어린 칭찬하기', '관계력', 20, 'Normal'),
    createQuest('q-relation-2', '길드원 케어', '친구나 가족에게 안부 연락하기', '관계력', 18, 'Normal'),
    createQuest('q-relation-3', '감사 포션', '고맙다고 말하고 이유도 한 줄 덧붙이기', '관계력', 16, 'Easy'),
    createQuest('q-relation-4', '어색함 해제', '먼저 인사하기', '관계력', 12, 'Easy'),
    createQuest('q-relation-5', '작은 도움', '누군가에게 3분 안에 끝나는 도움 주기', '관계력', 22, 'Hidden')
  ],
  mind: [
    createQuest('q-mind-1', '감정 로그 저장', '오늘 기분을 한 줄로 적기', '멘탈', 12, 'Easy'),
    createQuest('q-mind-2', '불안 디버깅', '걱정거리 1개를 종이에 쓰기', '멘탈', 16, 'Easy'),
    createQuest('q-mind-3', '조용한 회복', '5분 동안 아무것도 하지 않고 앉아 있기', '멘탈', 20, 'Normal'),
    createQuest('q-mind-4', '자존감 회복', '오늘 잘한 일 1개 적기', '멘탈', 14, 'Easy'),
    createQuest('q-mind-5', '하루 세이브', '자기 전 오늘의 장면 하나 기록하기', '모험심', 18, 'Hidden')
  ]
};

const INITIAL_STATS = {
  지식: 12,
  체력: 18,
  생활력: 9,
  관계력: 11,
  멘탈: 15,
  자산관리: 7,
  모험심: 13
};

function createQuest(id, title, description, stat, exp, difficulty) {
  return { id, title, description, stat, exp, difficulty, completed: false };
}

export function createInitialState(overrides = {}) {
  const questTemplates = overrides.questTemplates || cloneTemplateGroups(QUESTS_BY_GOAL);

  return {
    selectedGoal: 'health',
    questTemplates,
    quests: cloneQuests('health', questTemplates),
    diary: '',
    stats: { ...INITIAL_STATS },
    history: createFakeHistory(),
    dataSource: 'local-seed',
    ...overrides
  };
}

export function selectGoal(currentState, goalId) {
  const templates = currentState.questTemplates || QUESTS_BY_GOAL;
  const nextGoal = templates[goalId] ? goalId : currentState.selectedGoal;

  return {
    ...currentState,
    selectedGoal: nextGoal,
    quests: cloneQuests(nextGoal, templates)
  };
}

export function toggleQuest(currentState, questId) {
  const quests = currentState.quests.map((quest) =>
    quest.id === questId ? { ...quest, completed: !quest.completed } : quest
  );

  return {
    ...currentState,
    quests
  };
}

export function randomizeQuests(currentState, rng = Math.random) {
  const templates = currentState.questTemplates || QUESTS_BY_GOAL;
  const selectedPool = shuffle(cloneQuests(currentState.selectedGoal, templates), rng).slice(0, 2);
  const otherPool = Object.keys(templates)
    .filter((goalId) => goalId !== currentState.selectedGoal)
    .flatMap((goalId) => cloneQuests(goalId, templates));
  const mixedPool = shuffle(otherPool, rng).slice(0, 3);

  return {
    ...currentState,
    quests: shuffle([...selectedPool, ...mixedPool], rng).map((quest, index) => ({
      ...quest,
      id: `daily-random-${index + 1}-${quest.id}`,
      completed: false
    }))
  };
}

export function calculateProgress(currentState) {
  const completedQuests = currentState.quests.filter((quest) => quest.completed);
  const totalExp = completedQuests.reduce((sum, quest) => sum + quest.exp, 0);
  const statGains = completedQuests.reduce((gains, quest) => {
    gains[quest.stat] = (gains[quest.stat] || 0) + Math.ceil(quest.exp / 8);
    return gains;
  }, {});

  return {
    completed: completedQuests.length,
    total: currentState.quests.length,
    percent: Math.round((completedQuests.length / currentState.quests.length) * 100),
    totalExp,
    statGains,
    title: getClearTitle(completedQuests.length, currentState.quests.length)
  };
}

export function getCalendarSummary(currentState) {
  const days = Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const date = `2026-06-${String(day).padStart(2, '0')}`;
    const entry = currentState.history[date] || null;

    return {
      date,
      day,
      entry,
      hasEntry: Boolean(entry),
      completed: entry?.completed || 0,
      total: entry?.total || 5,
      exp: entry?.exp || 0
    };
  });

  return {
    monthLabel: '2026년 6월',
    days,
    completedDays: days.filter((day) => day.hasEntry && day.completed > 0).length,
    totalExp: days.reduce((sum, day) => sum + day.exp, 0)
  };
}

export function getWeekHistory(currentState) {
  const start = new Date(`${TODAY}T00:00:00`);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = formatDate(date);
    const entry = currentState.history[iso] || {
      completed: 0,
      total: 5,
      exp: 0,
      focus: '대기',
      items: []
    };

    return {
      date: iso,
      dayLabel: `${date.getMonth() + 1}/${date.getDate()}`,
      weekday: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
      ...entry
    };
  });
}

export function mapQuestTemplateRows(rows) {
  return rows.reduce((groups, row) => {
    const goalId = row.goal_id || row.goalId;
    if (!groups[goalId]) groups[goalId] = [];
    groups[goalId].push({
      id: row.id,
      title: row.title,
      description: row.description,
      stat: row.stat,
      exp: Number(row.exp),
      difficulty: row.difficulty,
      goalId,
      completed: false
    });
    return groups;
  }, {});
}

export function buildHistoryFromRows(runRows, questRows) {
  const questsByDate = questRows.reduce((groups, quest) => {
    if (!groups[quest.run_date]) groups[quest.run_date] = [];
    groups[quest.run_date].push(quest);
    return groups;
  }, {});

  return runRows.reduce((history, run) => {
    const quests = questsByDate[run.run_date] || [];
    const completedQuests = quests.filter((quest) => quest.completed);
    history[run.run_date] = {
      completed: completedQuests.length,
      total: quests.length || run.total || 5,
      exp: completedQuests.reduce((sum, quest) => sum + Number(quest.exp || 0), 0),
      focus: run.focus || run.selected_goal || '기록',
      items: completedQuests.map((quest) => quest.title)
    };
    return history;
  }, {});
}

export function cloneTemplateGroups(groups) {
  return Object.entries(groups).reduce((copy, [goalId, quests]) => {
    copy[goalId] = quests.map((quest) => ({ ...quest, goalId, completed: false }));
    return copy;
  }, {});
}

export function cloneQuests(goalId, groups = QUESTS_BY_GOAL) {
  return (groups[goalId] || []).map((quest) => ({ ...quest, goalId, completed: false }));
}

function getClearTitle(completed, total) {
  if (completed === total) return '전설을 남긴 하루';
  if (completed >= 3) return '작심삼일 브레이커';
  if (completed >= 1) return '첫 걸음을 뗀 용사';
  return '출정 대기 중';
}

function createFakeHistory() {
  return {
    '2026-06-01': historyEntry(4, 5, 72, '건강', ['스쿼트 15개', '산책 15분', '하루 회고']),
    '2026-06-02': historyEntry(3, 5, 54, '공부', ['책 5페이지', '단어 1개 검색', '강의 15분']),
    '2026-06-03': historyEntry(5, 5, 92, '집안일', ['책상 정리', '설거지', '빨래 개기']),
    '2026-06-04': historyEntry(2, 5, 34, '멘탈', ['기분 한 줄', '깊게 호흡']),
    '2026-06-05': historyEntry(4, 5, 78, '관계', ['안부 연락', '칭찬하기', '먼저 인사']),
    '2026-06-07': historyEntry(3, 5, 48, '모험', ['다른 길 걷기', '하늘 사진', '노래 듣기']),
    '2026-06-08': historyEntry(4, 5, 68, '생활력', ['책상 정리', '빨래 돌리기', '냉장고 확인']),
    '2026-06-09': historyEntry(2, 5, 28, '건강', ['숨 고르기', '스트레칭 5분']),
    '2026-06-10': historyEntry(0, 5, 0, '예정', []),
    '2026-06-11': historyEntry(0, 5, 0, '예정', []),
    '2026-06-12': historyEntry(0, 5, 0, '예정', []),
    '2026-06-13': historyEntry(1, 5, 12, '대기', ['물 한 컵 마시기']),
    '2026-06-14': historyEntry(2, 5, 30, '오늘', ['책상 위 물건 3개 정리', '감정 로그 저장']),
    '2026-06-15': historyEntry(5, 5, 88, '공부', ['강의 15분', '3줄 정리', '단축키 익히기']),
    '2026-06-16': historyEntry(3, 5, 52, '관계', ['가족에게 감사', '친구 안부']),
    '2026-06-18': historyEntry(4, 5, 74, '멘탈', ['걱정 쓰기', '조용히 앉기', '잘한 일 적기']),
    '2026-06-21': historyEntry(2, 5, 30, '집안일', ['가방 정리', '설거지']),
    '2026-06-24': historyEntry(5, 5, 96, '건강', ['걷기 15분', '스쿼트', '스트레칭']),
    '2026-06-27': historyEntry(3, 5, 50, '모험', ['하늘 사진', '새 노래', '편의점 미션']),
    '2026-06-30': historyEntry(4, 5, 80, '회고', ['월말 회고', '다음 목표 정리'])
  };
}

function historyEntry(completed, total, exp, focus, items) {
  return { completed, total, exp, focus, items };
}

function shuffle(items, rng) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(rng() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
