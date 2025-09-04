export function median(values: number[]): number {
  if (!values.length) return 0;
  const arr = [...values].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : Math.round((arr[mid - 1] + arr[mid]) / 2);
}

export function baseScore(correct: boolean, skipped = false): number {
  if (skipped) return -2;
  return correct ? 10 : -5;
}

export function clamp(min: number, v: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

