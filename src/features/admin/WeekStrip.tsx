'use client';

import { useCallback } from 'react';
import { useLiveApi } from '@/hooks/use-live-api';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { addDays, formatShortDate, mondayOf, weekdayLabel } from '@/lib/time';
import type { DayCount } from '@/types/api';

/** 고른 날이 들어 있는 주의 월~토와 날짜별 건수 */
export function WeekStrip({ selected, onSelect }: { selected: string; onSelect: (date: string) => void }) {
  const monday = mondayOf(selected);
  const load = useCallback(() => api<DayCount[]>('/admin/calendar/week', { query: { date: monday } }), [monday]);
  const { data } = useLiveApi(load);
  const counts = new Map((data ?? []).map((item) => [item.date, item.count]));

  return (
    <div className="grid grid-cols-6 gap-1.5">
      {Array.from({ length: 6 }, (_, index) => addDays(monday, index)).map((date) => (
        <button
          key={date}
          type="button"
          onClick={() => onSelect(date)}
          aria-pressed={date === selected}
          className={cn(
            'rounded-control py-2 text-[13px] leading-snug transition-colors',
            date === selected ? 'bg-ink text-white' : 'bg-mist text-ink hover:bg-mist-deep',
          )}
        >
          <span className="font-semibold">{weekdayLabel(date)}</span> {formatShortDate(date)}
          <span className={cn('block text-[12px]', date === selected ? 'text-white/70' : 'text-ink-faint')}>
            {counts.get(date) ?? 0}건
          </span>
        </button>
      ))}
    </div>
  );
}
