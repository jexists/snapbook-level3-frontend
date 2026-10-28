/** 숫자만 남겨 11자리까지 자르고 010-1234-5678 꼴로 하이픈을 넣는다 (입력 중에도 쓴다) */
export function formatPhoneInput(raw: string): string {
  const digits = phoneDigits(raw).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/** 서버로 보낼 때는 숫자만 */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '');
}
