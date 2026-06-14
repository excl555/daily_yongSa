import { createClient } from '@/utils/supabase/server';
import {
  buildHistoryFromRows,
  cloneTemplateGroups,
  cloneQuests,
  createInitialState,
  mapQuestTemplateRows,
  QUESTS_BY_GOAL,
  TODAY
} from '@/lib/quest-domain';

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

export async function getDashboardState(userId?: string) {
  if (!userId) return createInitialState();

  try {
    const supabase = await createClient();

    const templateResult = (await supabase
      .from('quest_templates')
      .select('*')
      .eq('active', true)
      .order('goal_id', { ascending: true })
      .order('sort_order', { ascending: true })) as QueryResult<Record<string, unknown>>;

    if (templateResult.error || !templateResult.data?.length) {
      return createInitialState();
    }

    await ensureUserSeedData(supabase, userId);

    const [runResult, questResult, reflectionResult] = await Promise.all([
      supabase
        .from('daily_runs')
        .select('*')
        .eq('user_id', userId)
        .gte('run_date', '2026-06-01')
        .lte('run_date', '2026-06-30')
        .order('run_date', { ascending: true }) as unknown as Promise<QueryResult<Record<string, unknown>>>,
      supabase
        .from('daily_quests')
        .select('*')
        .eq('user_id', userId)
        .gte('run_date', '2026-06-01')
        .lte('run_date', '2026-06-30')
        .order('sort_order', { ascending: true }) as unknown as Promise<QueryResult<Record<string, unknown>>>,
      supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', userId)
        .eq('run_date', TODAY)
        .limit(1) as unknown as Promise<QueryResult<Record<string, unknown>>>
    ]);

    const questTemplates = {
      ...cloneTemplateGroups(QUESTS_BY_GOAL),
      ...mapQuestTemplateRows(templateResult.data)
    };

    const overrides: Record<string, unknown> = {
      questTemplates,
      diary: String(reflectionResult.data?.[0]?.content || ''),
      dataSource: runResult.error || questResult.error ? 'local-seed' : 'supabase'
    };

    if (runResult.data?.length) {
      overrides.history = buildHistoryFromRows(runResult.data, questResult.data || []);
    }

    const todayRun = runResult.data?.find((run) => run.run_date === TODAY);
    const todayQuests = (questResult.data || []).filter((quest) => quest.run_date === TODAY);

    if (todayRun?.selected_goal) {
      overrides.selectedGoal = String(todayRun.selected_goal);
    }

    if (todayQuests.length) {
      overrides.quests = todayQuests.map(mapDailyQuestRow);
    } else if (todayRun?.selected_goal) {
      overrides.quests = cloneQuests(String(todayRun.selected_goal), questTemplates);
    }

    return createInitialState(overrides);
  } catch {
    return createInitialState();
  }
}

async function ensureUserSeedData(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const existing = (await supabase
    .from('daily_runs')
    .select('id')
    .eq('user_id', userId)
    .limit(1)) as QueryResult<Record<string, unknown>>;

  if (existing.error || existing.data?.length) return;

  const seedState = createInitialState();
  const historyEntries = Object.entries(seedState.history);
  const runRows = historyEntries.map(([runDate, entry]) => ({
    user_id: userId,
    run_date: runDate,
    user_label: 'account_user',
    selected_goal: getGoalForFocus(entry.focus),
    focus: entry.focus,
    title: runDate === TODAY ? '오늘 진행 중인 루틴' : `${entry.focus} 루틴`
  }));

  await supabase.from('daily_runs').insert(runRows);

  const runResult = (await supabase
    .from('daily_runs')
    .select('id, run_date')
    .eq('user_id', userId)
    .gte('run_date', '2026-06-01')
    .lte('run_date', '2026-06-30')) as QueryResult<Record<string, unknown>>;

  const runsByDate = new Map((runResult.data || []).map((run) => [String(run.run_date), String(run.id)]));
  const questRows = historyEntries.flatMap(([runDate, entry]) => {
    const runId = runsByDate.get(runDate);
    if (!runId) return [];

    const expPerCompleted = entry.completed ? Math.max(8, Math.round(entry.exp / entry.completed)) : 0;

    return Array.from({ length: entry.total || 5 }, (_, index) => {
      const completed = index < entry.completed;
      return {
        user_id: userId,
        run_id: runId,
        run_date: runDate,
        goal_id: getGoalForFocus(entry.focus),
        title: completed ? entry.items[index] || `완료 퀘스트 ${index + 1}` : `대기 퀘스트 ${index + 1}`,
        description: completed ? '계정 생성 시 준비된 예시 완료 기록입니다.' : '아직 완료하지 않은 예시 퀘스트입니다.',
        stat: completed ? '모험심' : '멘탈',
        exp: completed ? expPerCompleted : 0,
        difficulty: completed ? 'Easy' : 'Normal',
        completed,
        sort_order: index + 1,
        completed_at: completed ? `${runDate}T21:00:00+09:00` : null
      };
    });
  });

  if (questRows.length) {
    await supabase.from('daily_quests').insert(questRows);
  }

  await supabase.from('daily_reflections').insert({
    user_id: userId,
    run_date: TODAY,
    user_label: 'account_user',
    content: '아직 전부 끝내지는 못했지만 책상 정리와 감정 로그를 먼저 완료했다.',
    mood: 'calm'
  });
}

function mapDailyQuestRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    stat: String(row.stat),
    exp: Number(row.exp),
    difficulty: String(row.difficulty),
    goalId: String(row.goal_id),
    completed: Boolean(row.completed)
  };
}

function getGoalForFocus(focus: string) {
  if (focus.includes('건강')) return 'health';
  if (focus.includes('공부')) return 'study';
  if (focus.includes('집안') || focus.includes('생활')) return 'home';
  if (focus.includes('관계')) return 'relation';
  return 'mind';
}
