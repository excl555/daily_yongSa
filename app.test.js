import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildHistoryFromRows,
  calculateProgress,
  calculateGrowthReport,
  createInitialState,
  generateMonthlyBoosters,
  getCalendarSummary,
  getTodayBooster,
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
    const state = createInitialState({ monthlyBoosters: [] });
    const updated = toggleQuest(state, 'q-health-1');
    const progress = calculateProgress(updated);

    assert.equal(updated.quests[0].completed, true);
    assert.equal(progress.completed, 1);
    assert.equal(progress.totalExp, updated.quests[0].exp);
  });

  it('keeps total progress visible when a newly selected goal has no checked quests', () => {
    const state = toggleQuest(createInitialState(), 'q-health-1');
    const updated = selectGoal(state, 'study');
    const progress = calculateProgress(updated);

    assert.equal(updated.selectedGoal, 'study');
    assert.match(updated.quests[0].id, /^q-study-/);
    assert.equal(updated.quests.every((quest) => quest.completed === false), true);
    assert.equal(progress.completed, 1);
    assert.equal(progress.total, 25);
  });

  it('keeps checked quests when switching away from and back to a goal', () => {
    const checkedHealth = toggleQuest(createInitialState(), 'q-health-1');
    const study = selectGoal(checkedHealth, 'study');
    const restoredHealth = selectGoal(study, 'health');

    assert.equal(restoredHealth.quests.find((quest) => quest.id === 'q-health-1')?.completed, true);
    assert.equal(calculateProgress(restoredHealth).completed, 1);
  });

  it('adds stat gains from checked quests across different goals', () => {
    const healthChecked = toggleQuest(createInitialState({ monthlyBoosters: [] }), 'q-health-1');
    const studyChecked = toggleQuest(selectGoal(healthChecked, 'study'), 'q-study-1');
    const progress = calculateProgress(studyChecked);
    const healthStat = healthChecked.questTemplates.health.find((quest) => quest.id === 'q-health-1').stat;
    const studyStat = studyChecked.questTemplates.study.find((quest) => quest.id === 'q-study-1').stat;

    assert.equal(progress.completed, 2);
    assert.equal(progress.totalExp, 40);
    assert.equal(progress.statGains[healthStat], 3);
    assert.equal(progress.statGains[studyStat], 3);
  });

  it('creates ten monthly booster days across multiple goals', () => {
    const boosters = generateMonthlyBoosters('2026-06');
    const dates = new Set(boosters.map((booster) => booster.date));
    const goals = new Set(boosters.map((booster) => booster.goalId));

    assert.equal(boosters.length, 10);
    assert.equal(dates.size, 10);
    assert.ok(goals.size >= 4);
    assert.equal(boosters.every((booster) => booster.bonusValue > 0), true);
  });

  it('adds booster bonus exp to today progress for matching goals', () => {
    const state = createInitialState();
    const booster = { date: '2026-06-14', goalId: 'health', bonusValue: 30, label: '건강 부스터' };
    const updated = toggleQuest(state, 'q-health-1');
    const progress = calculateProgress({ ...updated, monthlyBoosters: [booster] });

    assert.equal(getTodayBooster([booster], '2026-06-14')?.goalId, 'health');
    assert.equal(progress.baseExp, updated.questTemplates.health[0].exp);
    assert.equal(progress.bonusExp, 6);
    assert.equal(progress.totalExp, updated.questTemplates.health[0].exp + 6);
  });

  it('builds a growth report from history, stats, and boosters', () => {
    const state = createInitialState({ monthlyBoosters: generateMonthlyBoosters('2026-06') });
    const report = calculateGrowthReport(state);

    assert.ok(report.monthlyExp > 0);
    assert.ok(report.completionRate > 0);
    assert.ok(report.bestStreak >= 1);
    assert.ok(report.statCards.length >= 5);
    assert.ok(report.boosterDays.length === 10);
    assert.ok(report.playStyle.length > 0);
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
