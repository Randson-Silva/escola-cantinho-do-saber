import type React from 'react';

// ============================================================================
// INPUT MASKS UTILITIES
// ============================================================================

/**
 * Aplica máscara de CPF: 000.000.000-00
 */
export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

/**
 * Aplica máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
 */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Remove a máscara e retorna apenas os dígitos
 */
export function unmask(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Handler para aplicar máscara em evento de input
 */
export function handleMaskedInput(
  e: React.ChangeEvent<HTMLInputElement>,
  maskFn: (value: string) => string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
): void {
  const maskedValue = maskFn(e.target.value);
  const syntheticEvent = {
    ...e,
    target: {
      ...e.target,
      name: e.target.name,
      value: maskedValue,
    },
  };
  onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
}

