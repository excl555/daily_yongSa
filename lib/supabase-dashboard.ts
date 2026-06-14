import { createClient } from '@/utils/supabase/server';
import {
  buildHistoryFromRows,
  cloneTemplateGroups,
  createInitialState,
  mapQuestTemplateRows,
  QUESTS_BY_GOAL,
  TODAY
} from '@/lib/quest-domain';

type QueryResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

export async function getDashboardState() {
  try {
    const supabase = await createClient();

    const [templateResult, runResult, questResult, reflectionResult] = await Promise.all([
      supabase
        .from('quest_templates')
        .select('*')
        .eq('active', true)
        .order('goal_id', { ascending: true })
        .order('sort_order', { ascending: true }) as unknown as Promise<QueryResult<Record<string, unknown>>>,
      supabase
        .from('daily_runs')
        .select('*')
        .gte('run_date', '2026-06-01')
        .lte('run_date', '2026-06-30')
        .order('run_date', { ascending: true }) as unknown as Promise<QueryResult<Record<string, unknown>>>,
      supabase
        .from('daily_quests')
        .select('*')
        .gte('run_date', '2026-06-01')
        .lte('run_date', '2026-06-30')
        .order('sort_order', { ascending: true }) as unknown as Promise<QueryResult<Record<string, unknown>>>,
      supabase
        .from('daily_reflections')
        .select('*')
        .eq('run_date', TODAY)
        .limit(1) as unknown as Promise<QueryResult<Record<string, unknown>>>
    ]);

    if (templateResult.error || !templateResult.data?.length) {
      return createInitialState();
    }

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

    return createInitialState(overrides);
  } catch {
    return createInitialState();
  }
}
