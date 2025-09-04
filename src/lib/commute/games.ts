import { SeededRNG } from '../rng';
import { getSeoulDateKey } from './date';

export interface MeetingItem { title: string; start: string; end: string; minutes: number; }
export interface MeetingSumProblem { meetings: MeetingItem[]; totalMinutes: number; longestIndex: number; }

export function genMeetingSum(seedSalt = ''): MeetingSumProblem {
  const seed = `${getSeoulDateKey()}-meeting-sum-${seedSalt}`;
  const rng = new SeededRNG(seed);
  const titles = ['기획 리뷰','디자인 리뷰','개발 리뷰','개발 점검','QA Block','올핸즈','전사 팀미팅','마케팅팀 미팅','팀 스크럼','팀 위클리'];
  const count = rng.nextInt(4, 6);
  // 시간대: 09:00 ~ 18:00 사이 겹치지 않게 슬롯 생성
  const slots: {start: number; end: number;}[] = [];
  let attempts = 0;
  while (slots.length < count && attempts < 100) {
    attempts++;
    const s = rng.nextInt(9 * 60, 16 * 60);
    const dur = rng.nextInt(30, 90);
    const e = Math.min(s + dur, 18 * 60);
    if (e - s < 15) continue;
    // 겹침 제거
    if (slots.every(x => e <= x.start || s >= x.end)) {
      slots.push({ start: s, end: e });
    }
  }
  slots.sort((a, b) => a.start - b.start);
  const meetings: MeetingItem[] = slots.map((slot, idx) => {
    const title = titles[(idx + Math.floor(rng.next() * titles.length)) % titles.length];
    return {
      title,
      start: toTime(slot.start),
      end: toTime(slot.end),
      minutes: slot.end - slot.start,
    };
  });
  let total = 0; let longestIdx = 0; let maxM = -1;
  meetings.forEach((m, i) => { total += m.minutes; if (m.minutes > maxM) { maxM = m.minutes; longestIdx = i; } });
  return { meetings, totalMinutes: total, longestIndex: longestIdx };
}

function toTime(minFromMidnight: number): string {
  const h = Math.floor(minFromMidnight / 60);
  const m = minFromMidnight % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface TeamSplitLine { name: string; qty: number; unit: number; }
export interface TeamSplitProblem { members: number; lines: TeamSplitLine[]; extraLeader: number; perPerson: number; }

export function genTeamSplit(seedSalt = ''): TeamSplitProblem {
  const rng = new SeededRNG(`${getSeoulDateKey()}-team-split-${seedSalt}`);
  const members = rng.nextInt(4, 10);
  const kimbapUnit = rng.pick([1200, 1500, 1800, 2000]); // 1000원 제외
  const menu: TeamSplitLine[] = [
    { name: '김밥', qty: rng.nextInt(3, 9), unit: kimbapUnit },
    { name: '떡볶이', qty: rng.nextInt(1, 3), unit: 6000 },
    { name: '음료', qty: rng.nextInt(3, members), unit: 5000 },
  ];
  const extraLeader = rng.pick([0, 2000, 5000]);
  const total = menu.reduce((s, l) => s + l.qty * l.unit, 0);
  const rest = Math.max(total - extraLeader, 0);
  const per = Math.round(rest / members); // 1원 반올림
  return { members, lines: menu, extraLeader, perPerson: per };
}

export interface DeployProblem { project: string; today: string; release: string; daysLeft: number; qaDays: number; engineerDue: string; }
export function genDeployCountdown(seedSalt = ''): DeployProblem {
  const rng = new SeededRNG(`${getSeoulDateKey()}-deploy-${seedSalt}`);
  const names = ['하마보다 입 크게 벌리기','재빠르게 달리기','꽤 높이 점프하기','고양이와 하이파이브하기','사마귀보다 정확히 찌르기','거미보다 크게 집짓기'];
  const today = new Date();
  const add = rng.nextInt(10, 30);
  const release = new Date(today.getTime() + add * 24 * 3600 * 1000);
  const daysLeft = add;
  const qaDays = rng.nextInt(6, 13);
  // QA는 릴리즈 당일까지 포함. QA 시작일 = 릴리즈일 - (QA일수 - 1)
  // 엔지니어 마감일은 QA 시작일로 정의
  const engineerDue = new Date(release.getTime() - (qaDays - 1) * 24 * 3600 * 1000);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return {
    project: rng.pick(names),
    today: fmt(today),
    release: fmt(release),
    daysLeft,
    qaDays,
    engineerDue: fmt(engineerDue),
  };
}

// Scheduling-lite: 텍스트 모드 예시 데이터 생성
export interface STask { id: string; dur: number; skills: ('A'|'B'|'C')[]; prereq?: string[]; }
export interface SchedulingProblem { members: ('A'|'B'|'C')[]; tasks: STask[]; }

export function genSchedulingLite(seedSalt = ''): SchedulingProblem {
  // 날짜 기반 시드로 매일 값이 바뀌도록 설정
  const rng = new SeededRNG(`${getSeoulDateKey()}-sched-${seedSalt}`);
  const members: ('A'|'B'|'C')[] = ['A','B','C'];
  const candidate: STask[] = [
    { id: 'T1', dur: rng.nextInt(20, 30), skills: ['A','B'] }, // 마트 장보기
    { id: 'T2', dur: rng.nextInt(8, 15), skills: ['A'] },      // 계산대 정리
    { id: 'T3', dur: rng.nextInt(12, 18), skills: ['B','C'] }, // 음료 정리 (선행)
    { id: 'T4', dur: rng.nextInt(15, 25), skills: ['A','B','C'] }, // 창고 청소
    { id: 'T5', dur: rng.nextInt(25, 35), skills: ['C'] },     // 포스터 붙이기
    { id: 'T6', dur: rng.nextInt(12, 18), skills: ['B'], prereq: ['T3'] }, // 재고 입력 (T3 이후)
  ];
  // 보장: T3 선행 → T6
  candidate.find(t => t.id === 'T3')!.prereq = [];
  candidate.find(t => t.id === 'T6')!.prereq = ['T3'];

  // 최대 4개 심부름으로 제한: 6개 후보 중 4개 선택 (T6 포함 시 T3도 강제 포함)
  const ids = ['T1','T2','T3','T4','T5','T6'];
  // Fisher–Yates shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  let pickIds = ids.slice(0, 4);
  if (pickIds.includes('T6') && !pickIds.includes('T3')) {
    // T6가 있는데 T3이 없으면, T3을 포함시키고 하나를 제외
    // T6는 유지하고, T3이 아닌 다른 항목 하나를 교체
    const replaceIndex = pickIds.findIndex(id => id !== 'T6');
    if (replaceIndex >= 0) pickIds[replaceIndex] = 'T3';
  }
  const tasks = candidate.filter(t => pickIds.includes(t.id));
  return { members, tasks };
}

// Prioritization-lite 문제: 시간/가치와 일부 제약
export interface PItem { id: string; time: number; value: number; required?: boolean; after?: string; mutexWith?: string; }
export interface PrioritizationProblem { totalTime: number; items: PItem[]; }

export function genPrioritizationLite(seedSalt = ''): PrioritizationProblem {
  const rng = new SeededRNG(`${getSeoulDateKey()}-prio-${seedSalt}`);
  const totalTime = 120;
  const items: PItem[] = [
    { id: 'T1', time: rng.nextInt(15, 30), value: rng.nextInt(8, 16), required: rng.next() < 0.3 },
    { id: 'T2', time: rng.nextInt(10, 25), value: rng.nextInt(6, 14) },
    { id: 'T3', time: rng.nextInt(20, 35), value: rng.nextInt(8, 18), after: 'T2' },
    { id: 'T4', time: rng.nextInt(25, 40), value: rng.nextInt(10, 20) },
    { id: 'T5', time: rng.nextInt(10, 20), value: rng.nextInt(4, 12), mutexWith: 'T4' },
    { id: 'T6', time: rng.nextInt(15, 30), value: rng.nextInt(6, 14) },
  ];
  return { totalTime, items };
}
