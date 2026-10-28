import { addDays, todayKey, weekdayOf } from '@/lib/time';
import type { Role } from '@/types/api';

/** 주간 달력을 처음 열 날짜: 손님은 내일, 관리자는 오늘 (일요일이면 월요일) */
export function firstBookableDate(role: Role, now = new Date()): string {
  const date = role === 'admin' ? todayKey(now) : addDays(todayKey(now), 1);
  return weekdayOf(date) === 0 ? addDays(date, 1) : date;
}
