import React, { useMemo, useState } from 'react';
import { ConsoleWindow } from '../../ConsoleWindow';
import { genSchedulingLite } from '../../../lib/commute/games';
import type { SchedulingProblem, STask } from '../../../lib/commute/games';

interface Props { onSubmit: (score: number, details?: Record<string, unknown>, reactionMs?: number) => void; }

type Member = 'A'|'B'|'C';

const nameOf = (id: string): string => ({
  T1: '마트 장보기',
  T2: '계산대 정리',
  T3: '음료 정리',
  T4: '창고 청소',
  T5: '포스터 붙이기',
  T6: '재고 입력',
} as Record<string,string>)[id] || id;

const skillsKo = (skills: ('A'|'B'|'C')[]) => {
  const label = skills.length === 3
    ? '세 명 모두 가능'
    : `알바 ${skills.join('/')}${skills.length===1 ? '만 가능' : ' 가능'}`;
  return label;
};

export const SchedulingLite: React.FC<Props> = ({ onSubmit }) => {
  const problem = useMemo(() => genSchedulingLite('v1'), []);
  const [seq, setSeq] = useState<Record<Member, string[]>>({ A: [], B: [], C: [] });
  const [startedAt] = useState<number>(Date.now());

  const tasksLeft = problem.tasks.filter(t => ![...seq.A, ...seq.B, ...seq.C].includes(t.id));

  const addTask = (m: Member, id: string) => {
    setSeq(s => ({ ...s, [m]: [...s[m], id] }));
  };
  const removeTask = (m: Member, id: string) => setSeq(s => ({ ...s, [m]: s[m].filter(x => x!==id) }));

  const { valid, makespan } = useMemo(() => optimizeWithinAssignment(problem, seq), [problem, seq]);
  const violations = useMemo(() => valid ? [] : evalPlan(problem, seq).violations, [valid, problem, seq]);
  const opt = useMemo(() => exactOptimal(problem), [problem]);
  const best = opt.best;

  const score = valid ? Math.round(100 * (best / makespan)) : 0;

  const handleSubmit = () => {
    const reactionMs = Date.now() - startedAt;
    onSubmit(score, { seq, makespan, best, valid, violations }, reactionMs);
  };

  const checklistOk = valid && tasksLeft.length===0;

  // 표시용 인덱스 맵: 현재 문제 순서 기준 심부름1..N 매핑
  const indexMap = useMemo(() => {
    const m: Record<string, number> = {};
    problem.tasks.forEach((t, i) => { m[t.id] = i + 1; });
    return m;
  }, [problem]);

  

  return (
    <div className="w-full">
      <ConsoleWindow className="mb-2" style={{ padding: '10px' }}>
        <div className="text-xs">
          <div className="text-console-fg/70" style={{paddingBottom: '20px'}}>목표: 모든 심부름을 가장 빨리 끝낼 수 있도록 알바를 배정해보세요.</div>
          <div className="mb-1 font-bold">[심부름 목록]</div>
          <ul className="list-disc pl-2 mb-2" style={{fontSize: '15px', paddingLeft: '20px'}}>
            {problem.tasks.map((t, idx) => {
              const id = t.id;
              const label = `심부름${idx+1}: ${nameOf(id)} (${t.dur}분) → ${skillsKo(t.skills)}`;
              return (
                <li key={id}>
                  <div>{label}</div>
                </li>
              );
            })}
          </ul>
          {problem.tasks.some(x=>x.id==='T6') && (
            <div className="text-console-fg/70 mb-1" style ={{paddingBottom: '10px'}}>
              {`[선행조건] 심부름${indexMap['T3']}을 완료해야 심부름${indexMap['T6']}을 시작할 수 있어요.`}
            </div>
          )}
        </div>
      </ConsoleWindow>

      <div className="console-window mb-2" style={{ padding: '10px' }}>
        <div className="mb-2 text-sm">할당되지 않은 심부름</div>
        <div className="flex flex-col gap-3">
          {tasksLeft.map(t => (
            <TaskChip key={t.id} t={t} displayIndex={indexMap[t.id]} onPick={(m)=>addTask(m, t.id)} />
          ))}
          {tasksLeft.length===0 && <div className="text-console-fg/50">모두 배정됨</div>}
        </div>
      </div>

      {(['A','B','C'] as Member[]).map(m => (
        <div key={m} className="console-window mb-2" style={{ padding: '10px' }}>
          <div className="mb-1 text-sm">알바 {m}</div>
          <div className="flex flex-wrap gap-2">
            {seq[m].map(id => (
              <button key={id} className="pixel-button text-[10px] py-1" onClick={()=>removeTask(m,id)}>{`심부름${indexMap[id] ?? id.replace('T','')}`} ✕</button>
            ))}
            {seq[m].length===0 && <div className="text-console-fg/50 text-[10px]">배정 없음</div>}
          </div>
        </div>
      ))}

      <ConsoleWindow className="mb-2" style={{ padding: '10px' }}>
        <div className="text-xs">답안 분석기</div>
        <div className="mt-1 text-sm">당신의 완료 시간: {makespan}분</div>
        <div className="mt-1 text-sm">최적 완료 시간: {best}분</div>
        <div className="mt-2 text-xs">
          <div>[{valid? '✅':'❌'}] 알바를 잘 배정했는가? </div>
          <div>[{tasksLeft.length===0? '✅':'❌'}] 모든 심부름이 배정됐는가?</div>
          {valid && (
            <div className="mt-1">
              {makespan === best ? (
                <span className="feedback-badge feedback-correct">최적이에요 ✅</span>
              ) : (
                <span className="feedback-badge feedback-wrong">최적까지 {makespan - best}분 단축 가능 ❌</span>
              )}
            </div>
          )}
          {violations.length>0 && (
            <ul className="list-disc pl-5 mt-1 text-console-red">
              {violations.map((v,i)=>(<li key={i}>{v}</li>))}
            </ul>
          )}
        </div>
      </ConsoleWindow>

      <button className="pixel-button w-full" onClick={handleSubmit} disabled={!checklistOk} style={{marginBottom: '20px'}}>
        제출하기 
      </button>
    </div>
  );
};

const TaskChip: React.FC<{t: STask; displayIndex: number; onPick: (m: Member)=>void}> = ({ t, displayIndex, onPick }) => {
  return (
    <div className="border-2 w-full" style={{ padding: '10px' }}>
      <div className="font-bold text-sm">심부름{displayIndex} • {nameOf(t.id)}</div>
      <div className="text-sm">{t.dur}분</div>
      <div className="text-console-fg/70 mb-2 text-xs">{skillsKo(t.skills)}</div>
      <div className="flex gap-2 w-full">
        {(['A','B','C'] as Member[]).map(m => (
          <button
            key={m}
            className="pixel-button flex-1 text-sm py-2"
            onClick={()=>onPick(m)}
          >알바 {m}</button>
        ))}
      </div>
    </div>
  );
};

function evalPlan(p: SchedulingProblem, seq: Record<Member,string[]>) {
  const tasks = new Map(p.tasks.map(t=>[t.id,t] as const));
  // 스킬락/중복/선행 위반 체크
  const all = [...seq.A, ...seq.B, ...seq.C];
  const violations: string[] = [];
  // 모든 태스크는 1회 배정만 허용
  const dup = all.find((id, idx) => all.indexOf(id) !== idx);
  if (dup) violations.push(`중복 배정: ${dup}`);
  // 스킬락 검증
  (['A','B','C'] as Member[]).forEach(m => {
    for (const id of seq[m]) {
      const t = tasks.get(id)!;
      if (!t.skills.includes(m)) violations.push(`스킬 위반: ${id}는 ${m} 불가`);
    }
  });
  // 선행 검증
  for (const t of p.tasks) {
    if (!t.prereq || t.prereq.length===0) continue;
    const lane = laneOf(seq, t.id);
    const idx = lane ? seq[lane].indexOf(t.id) : -1;
    for (const pre of t.prereq) {
      const laneP = laneOf(seq, pre);
      if (!laneP) { violations.push(`선행 누락: ${pre} → ${t.id}`); continue; }
      // 시간 계산으로 검증은 아래서 다시
      if (laneP === lane && seq[lane].indexOf(pre) > idx) violations.push(`선행 순서 위반: ${pre} → ${t.id}`);
    }
  }
  if (violations.length>0) return { valid: false, violations, makespan: 0 };

  // 시작/종료 시간 계산 (각 레인 직렬, 선행은 완료 후 시작)
  const laneEnd: Record<Member, number> = { A: 0, B: 0, C: 0 };
  const finish: Record<string, number> = {};
  (['A','B','C'] as Member[]).forEach(m => {
    let t0 = 0;
    for (const id of seq[m]) {
      const t = tasks.get(id)!;
      let start = t0;
      if (t.prereq && t.prereq.length>0) {
        const reqEnd = Math.max(...t.prereq.map(r => finish[r] ?? 0));
        start = Math.max(start, reqEnd);
      }
      const end = start + t.dur;
      finish[id] = end; t0 = end;
    }
    laneEnd[m] = t0;
  });
  const makespan = Math.max(laneEnd.A, laneEnd.B, laneEnd.C);
  // 선행 시간 위반 재검증
  for (const t of p.tasks) {
    if (t.prereq && t.prereq.length>0) {
      const end = finish[t.id] ?? 0;
      const reqEnd = Math.max(...t.prereq.map(r => finish[r] ?? 0));
      if (end - (tasks.get(t.id)!.dur) < reqEnd) violations.push(`선행 시간 위반: ${t.prereq.join(',')} → ${t.id}`);
    }
  }
  return { valid: violations.length===0, violations, makespan };
}

function laneOf(seq: Record<Member,string[]>, id: string): Member | null {
  for (const m of ['A','B','C'] as Member[]) if (seq[m].includes(id)) return m;
  return null;
}

function heuristicBest(p: SchedulingProblem): number {
  // 아주 단순한 휴리스틱: 가능한 레인 중 현재 끝시간 최소 레인에 배치, 선행 충족
  const done = new Set<string>();
  const laneEnd: Record<Member, number> = { A: 0, B: 0, C: 0 };
  const finish: Record<string, number> = {};
  const remaining = [...p.tasks];
  while (remaining.length) {
    const t = remaining.shift()!;
    // 선행이 있으면 뒤로 미룸
    if (t.prereq && t.prereq.some(r => !done.has(r))) { remaining.push(t); continue; }
    const candidates = (['A','B','C'] as Member[]).filter(m => t.skills.includes(m));
    let bestM: Member = candidates[0];
    let bestStart = Number.POSITIVE_INFINITY;
    for (const m of candidates) {
      const start = Math.max(laneEnd[m], t.prereq && t.prereq.length? Math.max(...t.prereq.map(r => finish[r])) : 0);
      if (start < bestStart) { bestStart = start; bestM = m; }
    }
    const end = bestStart + t.dur; laneEnd[bestM] = end; finish[t.id] = end; done.add(t.id);
  }
  return Math.max(laneEnd.A, laneEnd.B, laneEnd.C);
}

// 정확한 최적 해 탐색 (6개 문제여서 완전탐색 가능)
function exactOptimal(p: SchedulingProblem): { best: number; seq: Record<Member, string[]> } {
  // 가능한 멤버 할당 도메인
  const domain: Record<string, Member[]> = {} as any;
  for (const t of p.tasks) domain[t.id] = t.skills as Member[];

  // 모든 할당 조합 생성 (백트래킹)
  const assigns: Record<Member, string[]>[] = [];
  const ids = p.tasks.map(t=>t.id);
  const cur: Record<Member, string[]> = { A: [], B: [], C: [] };
  function backtrack(i: number) {
    if (i >= ids.length) { assigns.push({ A: [...cur.A], B: [...cur.B], C: [...cur.C] }); return; }
    const id = ids[i];
    for (const m of domain[id]) {
      cur[m] = [...cur[m], id];
      backtrack(i+1);
      cur[m] = cur[m].slice(0, -1);
    }
  }
  backtrack(0);

  // 각 할당에 대해 레인별 순서의 모든 순열을 탐색하여 최소 makespan 계산
  let best = Number.POSITIVE_INFINITY;
  let bestSeq: Record<Member, string[]> = { A: [], B: [], C: [] };

  const permute = (arr: string[]): string[][] => {
    if (arr.length <= 1) return [arr];
    const out: string[][] = [];
    const used = new Array(arr.length).fill(false);
    const cur: string[] = [];
    function dfs() {
      if (cur.length === arr.length) { out.push([...cur]); return; }
      for (let i=0;i<arr.length;i++) if (!used[i]) { used[i]=true; cur.push(arr[i]); dfs(); cur.pop(); used[i]=false; }
    }
    dfs();
    return out;
  };

  for (const a of assigns) {
    const perA = permute(a.A);
    const perB = permute(a.B);
    const perC = permute(a.C);
    for (const sA of perA) for (const sB of perB) for (const sC of perC) {
      const seq = { A: sA, B: sB, C: sC } as Record<Member,string[]>;
      const { valid, makespan } = evalPlan(p, seq);
      if (!valid) continue;
      if (makespan < best) { best = makespan; bestSeq = { A: [...sA], B: [...sB], C: [...sC] }; }
    }
  }

  // 모든 조합이 invalid일 일은 없지만, 방어적으로 처리
  if (!Number.isFinite(best)) {
    // fallback: 휴리스틱 결과 사용
    best = heuristicBest(p);
  }
  return { best, seq: bestSeq };
}

// 사용자가 심부름을 어떤 알바에게 배정했는지만 보고, 순서는 내부적으로 최적화한다.
function optimizeWithinAssignment(p: SchedulingProblem, assigned: Record<Member, string[]>): { valid: boolean; makespan: number } {
  const permute = (arr: string[]): string[][] => {
    if (arr.length <= 1) return [arr];
    const out: string[][] = [];
    const used = new Array(arr.length).fill(false);
    const cur: string[] = [];
    function dfs() {
      if (cur.length === arr.length) { out.push([...cur]); return; }
      for (let i=0;i<arr.length;i++) if (!used[i]) { used[i]=true; cur.push(arr[i]); dfs(); cur.pop(); used[i]=false; }
    }
    dfs();
    return out;
  };

  let best = Number.POSITIVE_INFINITY;
  let anyValid = false;
  const perA = permute(assigned.A);
  const perB = permute(assigned.B);
  const perC = permute(assigned.C);
  for (const sA of perA) for (const sB of perB) for (const sC of perC) {
    const { valid, makespan } = evalPlan(p, { A: sA, B: sB, C: sC });
    if (!valid) continue;
    anyValid = true;
    if (makespan < best) best = makespan;
  }
  if (!anyValid) return { valid: false, makespan: 0 };
  return { valid: true, makespan: best };
}
