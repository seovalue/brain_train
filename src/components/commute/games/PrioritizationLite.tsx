import React, { useMemo, useState } from 'react';
import { ConsoleWindow } from '../../ConsoleWindow';
import { genPrioritizationLite } from '../../../lib/commute/games';
import type { PrioritizationProblem } from '../../../lib/commute/games';

interface Props { onSubmit: (score: number, details?: Record<string, unknown>, reactionMs?: number) => void; }

export const PrioritizationLite: React.FC<Props> = ({ onSubmit }) => {
  const problem = useMemo(() => genPrioritizationLite('v1'), []);
  const [selected, setSelected] = useState<string[]>([]);
  const [startedAt] = useState<number>(Date.now());

  const used = selected.reduce((s, id) => s + problem.items.find(x=>x.id===id)!.time, 0);
  const value = selected.reduce((s, id) => s + problem.items.find(x=>x.id===id)!.value, 0);
  const violations = validate(problem, selected, used);
  const opt = optimal(problem);
  const score = violations.length===0 && opt.value>0 ? Math.round(100 * value / opt.value) : 0;

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const handleSubmit = () => {
    const reactionMs = Date.now() - startedAt;
    onSubmit(score, { selected, used, value, opt }, reactionMs);
  };

  return (
    <div className="w-full">
      <ConsoleWindow className="mb-2" style={{ padding: '10px' }}>
      <div className="text-xs mb-2 text-console-fg/80 whitespace-pre-line">
  {`각 일에는 소요시간과 점수가 있어요.
정해진 시간 ${problem.totalTime}분 안에,
점수를 가장 많이 얻을 수 있도록 할 일을 고르세요.`}
</div>
<div className="text-xs mb-2 text-console-fg/80 whitespace-pre-line" style={{padding: '10px', fontSize: '14px'}}>
  {`[규칙]
- 필수: 반드시 포함해야 하는 일
- 선행: 선행 작업이 먼저 끝나야 함
- 충돌: 같이 고를 수 없는 일`}
</div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {problem.items.map(it => {
            const isSel = selected.includes(it.id);
            return (
              <button
                key={it.id}
                className={`game-card relative ${isSel ? 'border-console-green' : ''}`}
                style={{ color: 'var(--console-fg)' }}
                onClick={()=>toggle(it.id)}
              >
                {isSel && (
                  <span
                    className="absolute top-1 right-1 text-[10px]"
                    style={{ border: '2px solid var(--console-green)', color: 'var(--console-green)', padding: '2px 6px' }}
                  >선택됨</span>
                )}
                <div className="text-sm font-bold">{it.id}</div>
                <div>{it.time}분/+{it.value}</div>
                {it.required && <div className="text-console-red">필수</div>}
                {it.after && <div className="text-console-fg/70">선행: {it.after}</div>}
                {it.mutexWith && <div className="text-console-fg/70">충돌: {it.mutexWith}</div>}
                <div className="text-console-fg/50">탭하여 선택/해제</div>
              </button>
            );
          })}
        </div>
      </ConsoleWindow>

      <div className="console-window mb-2 text-xs" style={{ padding: '10px' }}>
        <div>남은 시간 게이지</div>
        <div className="progress-bar mt-1">
          <div className="progress-fill" style={{ width: `${Math.min(100, Math.round(used/problem.totalTime*100))}%` }}></div>
        </div>
        <div className="mt-1">사용시간: {used}m / {problem.totalTime}m • 총가치: {value} (OPT {opt.value})</div>
        {violations.length>0 && (
          <ul className="list-disc pl-5 mt-1 text-console-red">
            {violations.map((v,i)=>(<li key={i}>{v}</li>))}
          </ul>
        )}
      </div>

      <button className="pixel-button w-full" onClick={handleSubmit} disabled={violations.length>0} style={{marginBottom: '20px'}}>제출하기</button>
    </div>
  );
};

function validate(p: PrioritizationProblem, sel: string[], used: number): string[] {
  const msgs: string[] = [];
  if (used > p.totalTime) msgs.push('시간 초과');
  for (const it of p.items) {
    if (it.required && !sel.includes(it.id)) msgs.push(`필수 포함 필요: ${it.id}`);
    if (it.after && sel.includes(it.id) && !sel.includes(it.after)) msgs.push(`선행 필요: ${it.after} → ${it.id}`);
    if (it.mutexWith && sel.includes(it.id) && sel.includes(it.mutexWith)) msgs.push(`배타 충돌: ${it.id} × ${it.mutexWith}`);
  }
  return msgs;
}

function optimal(p: PrioritizationProblem): { value: number; set: string[] } {
  // 작은 문제 → 전체 부분집합 탐색 + 제약 필터
  const ids = p.items.map(i=>i.id);
  let best = 0; let bestSet: string[] = [];
  const items = new Map(p.items.map(i=>[i.id,i] as const));
  for (let mask=0; mask < (1<<ids.length); mask++) {
    const set: string[] = [];
    for (let i=0;i<ids.length;i++) if (mask & (1<<i)) set.push(ids[i]);
    const used = set.reduce((s,id)=> s + items.get(id)!.time, 0);
    const val = set.reduce((s,id)=> s + items.get(id)!.value, 0);
    if (used>p.totalTime) continue;
    // 제약 체크
    let ok = true;
    for (const it of p.items) {
      if (it.required && !set.includes(it.id)) { ok=false; break; }
      if (it.after && set.includes(it.id) && !set.includes(it.after)) { ok=false; break; }
      if (it.mutexWith && set.includes(it.id) && set.includes(it.mutexWith)) { ok=false; break; }
    }
    if (!ok) continue;
    if (val > best) { best = val; bestSet = set; }
  }
  return { value: best, set: bestSet };
}
