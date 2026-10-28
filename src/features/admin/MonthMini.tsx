'use client';

import { useCallback } from 'react';
import { useLiveApi } from '@/hooks/use-live-api';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { addDays, monthKey, shiftMonth, weekdayOf } from '@/lib/time';
import type { DayCount } from '@/types/api';

const WEEKDAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토'];

/** 예약 수에 따라 막대 진하기를 정한다 (없음 / 1 / 2~3 / 4 이상) */
function densityClass(count: number) {
  if (count >= 4) return 'bg-accent';
  if (count >= 2) return 'bg-accent/55';
  if (count >= 1) return 'bg-accent/25';
  return 'bg-transparent';
}

interface MonthMiniProps {
  month: string;
  today: string;
  selected: string;
  onMonthChange: (month: string) => void;
  onSelect: (date: string) => void;
}

/** 왼쪽 한 달 달력: 날짜 밑 막대로 예약이 얼마나 있는지 한눈에 본다 */
export function MonthMini({ month, today, selected, onMonthChange, onSelect }: MonthMiniProps) {
  const load = useCallback(() => api<DayCount[]>('/admin/calendar/month', { query: { month } }), [month]);
  const { data } = useLiveApi(load);
  const counts = new Map((data ?? []).map((item) => [item.date, item.count]));
  const first = `${month}-01`;
  const days: string[] = [];
  for (let date = first; date.startsWith(month); date = addDays(date, 1)) days.push(date);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[16px] font-semibold">
          {month.slice(0, 4)}년 {Number(month.slice(5))}월
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={selected === today && month === monthKey(today)}
            className="h-8 rounded-control border border-line px-2.5 text-[13px] text-ink hover:border-ink-faint disabled:border-transparent disabled:text-ink-faint"
            onClick={() => {
              onMonthChange(monthKey(today));
              onSelect(today);
            }}
          >
            오늘
          </button>
          <button type="button" aria-label="이전 달" className="size-8 rounded-control text-ink-soft hover:bg-mist" onClick={() => onMonthChange(shiftMonth(month, -1))}>
            ‹
          </button>
          <button type="button" aria-label="다음 달" className="size-8 rounded-control text-ink-soft hover:bg-mist" onClick={() => onMonthChange(shiftMonth(month, 1))}>
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[12px]">
        {WEEKDAY_HEADERS.map((label) => (
          <span key={label} className="pb-1 text-ink-faint">
            {label}
          </span>
        ))}
        {Array.from({ length: weekdayOf(first) }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {days.map((date) => {
          const count = counts.get(date) ?? 0;
          const sunday = weekdayOf(date) === 0;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelect(date)}
              aria-pressed={date === selected}
              aria-label={`${Number(date.slice(8))}일 예약 ${count}건${sunday ? ', 휴무' : ''}`}
              className={cn(
                'flex flex-col items-center gap-1 rounded-slot py-1.5 transition-colors hover:bg-mist',
                sunday && 'text-ink-faint',
                date === today && 'font-semibold text-accent',
                date === selected && 'viewfinder bg-accent-soft',
              )}
            >
              {Number(date.slice(8))}
              <span className={cn('h-1 w-3.5 rounded-full', densityClass(count))} aria-hidden />
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3 text-[11px] text-ink-faint" aria-hidden>
        예약 수
        {[1, 2, 4].map((count) => (
          <span key={count} className="flex items-center gap-1">
            <span className={cn('h-1 w-3.5 rounded-full', densityClass(count))} />
            {count === 1 ? '1' : count === 2 ? '2~3' : '4+'}
          </span>
        ))}
      </div>
    </div>
  );
}
