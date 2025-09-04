// Asia/Seoul 기준 날짜 키를 반환 (YYYY-MM-DD)
export function getSeoulDateKey(date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
    const parts = fmt.formatToParts(date);
    const y = parts.find(p => p.type === 'year')?.value || '0000';
    const m = parts.find(p => p.type === 'month')?.value || '01';
    const d = parts.find(p => p.type === 'day')?.value || '01';
    return `${y}-${m}-${d}`;
  } catch {
    // Intl 미지원 환경 대비 (fallback)
    const k = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // KST
    const y = k.getUTCFullYear();
    const m = String(k.getUTCMonth() + 1).padStart(2, '0');
    const d = String(k.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

