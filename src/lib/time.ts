// 화면에 보이는 날짜·시간은 모두 한국 시간 기준이다.
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function todayKey(now = new Date()): string {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

/** 한국 시간으로 지금이 하루 0시부터 몇 분 지났는지 */
export function nowMinutes(now = new Date()): number {
  const shifted = new Date(now.getTime() + KST_OFFSET_MS);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

export function addDays(dateKey: string, days: number): string {
  return new Date(Date.parse(`${dateKey}T00:00:00Z`) + days * 86_400_000)
    .toISOString()
    .slice(0, 10);
}

export function weekdayOf(dateKey: string): number {
  return new Date(`${dateKey}T00:00:00Z`).getUTCDay();
}

export function mondayOf(dateKey: string): string {
  const weekday = weekdayOf(dateKey);
  return addDays(dateKey, weekday === 0 ? -6 : 1 - weekday);
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const index = year * 12 + (monthNumber - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

/** '10월 28일 (수)' */
export function formatDate(dateKey: string): string {
  const [, month, day] = dateKey.split('-').map(Number);
  return `${month}월 ${day}일 (${WEEKDAYS[weekdayOf(dateKey)]})`;
}

/** '10/28' */
export function formatShortDate(dateKey: string): string {
  const [, month, day] = dateKey.split('-').map(Number);
  return `${month}/${day}`;
}

export function weekdayLabel(dateKey: string): string {
  return WEEKDAYS[weekdayOf(dateKey)];
}

/** 백엔드가 주는 '2026-10-28T10:00:00+09:00'에서 날짜와 시각을 꺼낸다 */
export function dateOf(iso: string): string {
  return iso.slice(0, 10);
}

export function timeOf(iso: string): string {
  return iso.slice(11, 16);
}

export function formatDateTime(iso: string): string {
  return `${formatDate(dateOf(iso))} ${timeOf(iso)}`;
}

export function formatRange(startIso: string, endIso: string): string {
  return `${formatDate(dateOf(startIso))} ${timeOf(startIso)}~${timeOf(endIso)}`;
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}

export function minutesOf(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatMinutes(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}
