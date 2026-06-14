insert into public.quest_templates (goal_id, title, description, stat, exp, difficulty, sort_order)
values
  ('health', '전사 기본 훈련', '저녁 식사 전, 스쿼트 15개 하기', '체력', 18, 'Normal', 1),
  ('health', '숨 고르기', '의자에 앉아 1분 깊게 호흡하기', '멘탈', 10, 'Easy', 2),
  ('health', '정찰 임무', '밖으로 나가 15분 걷기', '체력', 24, 'Normal', 3),
  ('health', '척추 복구 마법', '목과 어깨 스트레칭 5분 하기', '체력', 14, 'Easy', 4),
  ('health', '하늘빛 기록', '오늘 하늘 사진 한 장 남기기', '모험심', 12, 'Hidden', 5),
  ('study', '15분 몰입 던전', '타이머를 켜고 강의나 책상 앞에 15분 앉기', '지식', 22, 'Normal', 1),
  ('study', '지식 조각', '모르는 단어 1개 검색하고 한 줄로 저장하기', '지식', 12, 'Easy', 2),
  ('study', '미래 투자', '책 5페이지 읽기', '지식', 16, 'Easy', 3),
  ('study', '업무 스킬 강화', '단축키나 도구 팁 1개 익히기', '지식', 18, 'Normal', 4),
  ('study', '뇌근육 운동', '오늘 배운 것 3줄 정리하기', '멘탈', 14, 'Easy', 5),
  ('home', '본진 정비', '책상 위 물건 3개 정리하기', '생활력', 16, 'Easy', 1),
  ('home', '인벤토리 청소', '가방 속 필요 없는 물건 1개 버리기', '생활력', 14, 'Easy', 2),
  ('home', '방어구 정비', '빨래를 개거나 세탁기 돌리기', '생활력', 24, 'Normal', 3),
  ('home', '주방 수복', '설거지 바로 하기', '생활력', 18, 'Normal', 4),
  ('home', '냉장고 탐사', '유통기한 지난 음식 1개 확인하기', '자산관리', 12, 'Hidden', 5),
  ('relation', '호감도 상승', '가까운 사람 1명에게 진심 어린 칭찬하기', '관계력', 20, 'Normal', 1),
  ('relation', '길드원 케어', '친구나 가족에게 안부 연락하기', '관계력', 18, 'Normal', 2),
  ('relation', '감사 포션', '고맙다고 말하고 이유도 한 줄 덧붙이기', '관계력', 16, 'Easy', 3),
  ('relation', '어색함 해제', '먼저 인사하기', '관계력', 12, 'Easy', 4),
  ('relation', '작은 도움', '누군가에게 3분 안에 끝나는 도움 주기', '관계력', 22, 'Hidden', 5),
  ('mind', '감정 로그 저장', '오늘 기분을 한 줄로 적기', '멘탈', 12, 'Easy', 1),
  ('mind', '불안 디버깅', '걱정거리 1개를 종이에 쓰기', '멘탈', 16, 'Easy', 2),
  ('mind', '조용한 회복', '5분 동안 아무것도 하지 않고 앉아 있기', '멘탈', 20, 'Normal', 3),
  ('mind', '자존감 회복', '오늘 잘한 일 1개 적기', '멘탈', 14, 'Easy', 4),
  ('mind', '하루 세이브', '자기 전 오늘의 장면 하나 기록하기', '모험심', 18, 'Hidden', 5)
on conflict do nothing;

insert into public.daily_runs (run_date, selected_goal, focus, title)
values
  ('2026-06-01', 'health', '건강', '월요일 회복 루틴'),
  ('2026-06-02', 'study', '공부', '짧은 집중 루틴'),
  ('2026-06-03', 'home', '집안일', '본진 정비의 날'),
  ('2026-06-04', 'mind', '멘탈', '호흡과 감정 정리'),
  ('2026-06-05', 'relation', '관계', '길드원 케어'),
  ('2026-06-07', 'mind', '모험', '주말 작은 모험'),
  ('2026-06-08', 'home', '생활력', '생활력 회복'),
  ('2026-06-09', 'health', '건강', '가벼운 회복'),
  ('2026-06-10', 'study', '예정', '예정된 공부 루틴'),
  ('2026-06-11', 'relation', '예정', '예정된 관계 루틴'),
  ('2026-06-12', 'mind', '예정', '예정된 회고 루틴'),
  ('2026-06-13', 'health', '대기', '주말 준비 루틴'),
  ('2026-06-14', 'mind', '오늘', '오늘 진행 중인 루틴'),
  ('2026-06-15', 'study', '공부', '몰입 강화'),
  ('2026-06-16', 'relation', '관계', '감사 전달'),
  ('2026-06-18', 'mind', '멘탈', '불안 디버깅'),
  ('2026-06-21', 'home', '집안일', '주말 본진 정리'),
  ('2026-06-24', 'health', '건강', '체력 회복'),
  ('2026-06-27', 'mind', '모험', '랜덤 미션'),
  ('2026-06-30', 'mind', '회고', '월말 정리')
on conflict (run_date) do update
set selected_goal = excluded.selected_goal,
    focus = excluded.focus,
    title = excluded.title;

insert into public.daily_quests (run_id, run_date, goal_id, title, description, stat, exp, difficulty, completed, sort_order, completed_at)
select r.id, r.run_date, q.goal_id, q.title, q.description, q.stat, q.exp, q.difficulty, q.completed, q.sort_order,
       case when q.completed then r.run_date::timestamptz + interval '21 hours' else null end
from public.daily_runs r
join (
  values
    ('2026-06-01'::date, 'health', '스쿼트 15개', '저녁 식사 전, 스쿼트 15개 하기', '체력', 18, 'Normal', true, 1),
    ('2026-06-01'::date, 'health', '산책 15분', '밖으로 나가 15분 걷기', '체력', 24, 'Normal', true, 2),
    ('2026-06-01'::date, 'mind', '하루 회고', '자기 전 오늘의 장면 하나 기록하기', '모험심', 12, 'Hidden', true, 3),
    ('2026-06-01'::date, 'study', '책 5페이지', '책 5페이지 읽기', '지식', 16, 'Easy', true, 4),
    ('2026-06-01'::date, 'relation', '먼저 인사', '먼저 인사하기', '관계력', 12, 'Easy', false, 5),
    ('2026-06-03'::date, 'home', '책상 정리', '책상 위 물건 3개 정리하기', '생활력', 16, 'Easy', true, 1),
    ('2026-06-03'::date, 'home', '설거지', '설거지 바로 하기', '생활력', 18, 'Normal', true, 2),
    ('2026-06-03'::date, 'home', '빨래 개기', '빨래를 개거나 세탁기 돌리기', '생활력', 24, 'Normal', true, 3),
    ('2026-06-03'::date, 'mind', '기분 한 줄', '오늘 기분을 한 줄로 적기', '멘탈', 12, 'Easy', true, 4),
    ('2026-06-03'::date, 'health', '스트레칭 5분', '목과 어깨 스트레칭 5분 하기', '체력', 14, 'Easy', true, 5),
    ('2026-06-08'::date, 'home', '책상 정리', '책상 위 물건 3개 정리하기', '생활력', 16, 'Easy', true, 1),
    ('2026-06-08'::date, 'home', '빨래 돌리기', '빨래를 개거나 세탁기 돌리기', '생활력', 24, 'Normal', true, 2),
    ('2026-06-08'::date, 'home', '냉장고 확인', '유통기한 지난 음식 1개 확인하기', '자산관리', 12, 'Hidden', true, 3),
    ('2026-06-08'::date, 'study', '3줄 정리', '오늘 배운 것 3줄 정리하기', '멘탈', 14, 'Easy', true, 4),
    ('2026-06-08'::date, 'relation', '안부 연락', '친구나 가족에게 안부 연락하기', '관계력', 18, 'Normal', false, 5),
    ('2026-06-09'::date, 'health', '숨 고르기', '의자에 앉아 1분 깊게 호흡하기', '멘탈', 10, 'Easy', true, 1),
    ('2026-06-09'::date, 'health', '스트레칭 5분', '목과 어깨 스트레칭 5분 하기', '체력', 14, 'Easy', true, 2),
    ('2026-06-09'::date, 'study', '자료 열기', '공부 자료 1개만 열어보기', '지식', 12, 'Easy', false, 3),
    ('2026-06-09'::date, 'home', '바닥 물건 3개', '바닥 물건 3개 치우기', '생활력', 12, 'Easy', false, 4),
    ('2026-06-09'::date, 'mind', '잘한 일 1개', '오늘 잘한 일 1개 적기', '멘탈', 14, 'Easy', false, 5),
    ('2026-06-14'::date, 'home', '책상 정리', '책상 위 물건 3개 정리하기', '생활력', 16, 'Easy', true, 1),
    ('2026-06-14'::date, 'mind', '감정 로그 저장', '오늘 기분을 한 줄로 적기', '멘탈', 12, 'Easy', true, 2),
    ('2026-06-14'::date, 'health', '산책 15분', '밖으로 나가 15분 걷기', '체력', 24, 'Normal', false, 3),
    ('2026-06-14'::date, 'relation', '안부 연락', '친구나 가족에게 안부 연락하기', '관계력', 18, 'Normal', false, 4),
    ('2026-06-14'::date, 'study', '3줄 정리', '오늘 배운 것 3줄 정리하기', '멘탈', 14, 'Easy', false, 5)
) as q(run_date, goal_id, title, description, stat, exp, difficulty, completed, sort_order)
on q.run_date = r.run_date
on conflict do nothing;

insert into public.daily_reflections (run_date, content, mood)
values
  ('2026-06-14', '아직 전부 끝내지는 못했지만 책상 정리와 감정 로그를 먼저 완료했다.', 'calm')
on conflict (run_date) do update
set content = excluded.content,
    mood = excluded.mood;
