import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildHistoryFromRows,
  calculateProgress,
  createInitialState,
  getCalendarSummary,
  getWeekHistory,
  mapQuestTemplateRows,
  randomizeQuests,
  selectGoal,
  toggleQuest
} from './lib/quest-domain.js';

describe('daily quest prototype state', () => {
  it('starts with five health quests and no progress', () => {
    const state = createInitialState();
    const progress = calculateProgress(state);

    assert.equal(state.selectedGoal, 'health');
    assert.equal(state.quests.length, 5);
    assert.equal(progress.completed, 0);
    assert.equal(progress.totalExp, 0);
  });

  it('toggles a quest and adds its exp to progress', () => {
    const state = createInitialState();
    const updated = toggleQuest(state, 'q-health-1');
    const progress = calculateProgress(updated);

    assert.equal(updated.quests[0].completed, true);
    assert.equal(progress.completed, 1);
    assert.equal(progress.totalExp, updated.quests[0].exp);
  });

  it('shows no completed quests for a newly selected goal', () => {
    const state = toggleQuest(createInitialState(), 'q-health-1');
    const updated = selectGoal(state, 'study');
    const progress = calculateProgress(updated);

    assert.equal(updated.selectedGoal, 'study');
    assert.match(updated.quests[0].id, /^q-study-/);
    assert.equal(progress.completed, 0);
  });

  it('keeps checked quests when switching away from and back to a goal', () => {
    const checkedHealth = toggleQuest(createInitialState(), 'q-health-1');
    const study = selectGoal(checkedHealth, 'study');
    const restoredHealth = selectGoal(study, 'health');

    assert.equal(restoredHealth.quests.find((quest) => quest.id === 'q-health-1')?.completed, true);
    assert.equal(calculateProgress(restoredHealth).completed, 1);
  });

  it('creates five randomized quests from multiple categories', () => {
    const state = createInitialState();
    const updated = randomizeQuests(state, () => 0.42);
    const categories = new Set(updated.quests.map((quest) => quest.goalId));

    assert.equal(updated.quests.length, 5);
    assert.ok(categories.size >= 2);
    assert.equal(updated.quests.every((quest) => quest.completed === false), true);
  });

  it('summarizes monthly and weekly fake quest history', () => {
    const state = createInitialState();
    const summary = getCalendarSummary(state);
    const weekEntries = getWeekHistory(state);

    assert.equal(summary.monthLabel, '2026년 6월');
    assert.equal(summary.days.length, 30);
    assert.ok(summary.completedDays > 0);
    assert.equal(weekEntries.length, 7);
    assert.ok(weekEntries.some((entry) => entry.items.length > 0));
  });

  it('maps Supabase quest templates into grouped app templates', () => {
    const grouped = mapQuestTemplateRows([
      {
        id: 'template-1',
        goal_id: 'health',
        title: '아침 스트레칭',
        description: '기상 후 스트레칭 3분',
        stat: '체력',
        exp: 12,
        difficulty: 'Easy'
      },
      {
        id: 'template-2',
        goal_id: 'study',
        title: '문서 읽기',
        description: '문서 1개 읽기',
        stat: '지식',
        exp: 16,
        difficulty: 'Normal'
      }
    ]);

    assert.equal(grouped.health.length, 1);
    assert.equal(grouped.study[0].goalId, 'study');
    assert.equal(grouped.health[0].completed, false);
  });

  it('builds calendar history from Supabase run and quest rows', () => {
    const history = buildHistoryFromRows(
      [
        {
          run_date: '2026-06-14',
          selected_goal: 'health',
          focus: '건강'
        }
      ],
      [
        { run_date: '2026-06-14', title: '물 마시기', completed: true, exp: 8 },
        { run_date: '2026-06-14', title: '산책 10분', completed: false, exp: 16 }
      ]
    );

    assert.equal(history['2026-06-14'].completed, 1);
    assert.equal(history['2026-06-14'].total, 2);
    assert.equal(history['2026-06-14'].exp, 8);
    assert.deepEqual(history['2026-06-14'].items, ['물 마시기']);
  });
});
