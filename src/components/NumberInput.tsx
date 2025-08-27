import React, { useState, useEffect } from 'react';
import { formatNumber, parseNumber } from '../lib/format';

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  format?: { thousand?: boolean; decimals?: number };
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  format = { thousand: false, decimals: 0 },
  placeholder = "0",
  disabled = false,
  maxLength
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // maxLength 체크
    if (maxLength && inputValue.length > maxLength) return;
    
    const numericValue = inputValue.replace(/[^\d.]/g, '');
    
    // 소수점 처리
    const parts = numericValue.split('.');
    if (parts.length > 2) return; // 소수점이 2개 이상이면 무시
    
    if (parts[1] && parts[1].length > (format.decimals || 0)) return; // 소수점 자릿수 제한
    
    setDisplayValue(numericValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    const numValue = parseNumber(displayValue);
    const formatted = formatNumber(numValue, format);
    setDisplayValue(formatted);
    onChange(formatted);
  };

  return (
    <input
      type="text"
      className="number-input w-full"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      inputMode="decimal"
      maxLength={maxLength}
    />
  );
};
