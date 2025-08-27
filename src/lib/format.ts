/**
 * 천 단위 구분자 추가
 */
export function formatWithThousandSeparator(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 소수점 자릿수 지정
 */
export function formatDecimal(value: number, decimals: number = 0): string {
  return value.toFixed(decimals);
}

/**
 * 천 단위 구분자와 소수점을 모두 적용
 */
export function formatNumber(value: number, options: { 
  thousand?: boolean; 
  decimals?: number; 
} = {}): string {
  const { thousand = false, decimals = 0 } = options;
  
  let formatted = formatDecimal(value, decimals);
  
  if (thousand) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    formatted = parts.join('.');
  }
  
  return formatted;
}

/**
 * 입력값에서 숫자만 추출
 */
export function extractNumber(input: string): string {
  return input.replace(/[^\d.]/g, '');
}

/**
 * 입력값을 숫자로 변환 (실패 시 0)
 */
export function parseNumber(input: string): number {
  const cleaned = extractNumber(input);
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
