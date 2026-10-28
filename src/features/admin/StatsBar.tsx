'use client';

import { useCallback } from 'react';
import { useLiveApi } from '@/hooks/use-live-api';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { monthKey, todayKey } from '@/lib/time';
import type { MonthStats } from '@/types/api';

/** 현황 숫자 3개: 이번 달 예약, 취소(변경으로 생긴 자동 취소 제외), 노쇼 */
export function StatsBar() {
  const month = monthKey(todayKey());
  const load = useCallback(() => api<MonthStats>('/admin/stats', { query: { month } }), [month]);
  const { data } = useLiveApi(load);
  const items = [
    { label: `${Number(month.slice(5))}월 예약`, value: data?.reservations, warn: false },
    { label: '취소', value: data?.cancelled, warn: true },
    { label: '노쇼', value: data?.noShow, warn: true },
  ];

  return (
    <dl aria-label="이번 달 현황" className="grid flex-1 grid-cols-3 gap-3 sm:max-w-[560px]">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1 rounded-panel bg-mist px-5 py-4">
          <dt className="text-[13px] text-ink-soft">{item.label}</dt>
          <dd className={cn('text-[28px] font-semibold leading-none tabular-nums', item.warn && (item.value ?? 0) > 0 && 'text-danger')}>
            {item.value ?? '–'}
          </dd>
        </div>
      ))}
    </dl>
  );
}
