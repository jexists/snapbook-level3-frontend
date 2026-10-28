'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import { useLiveApi } from '@/hooks/use-live-api';
import { api } from '@/lib/api';
import { addDays, monthKey, todayKey } from '@/lib/time';
import type { DayCount } from '@/types/api';
import { DayTimeline } from './DayTimeline';
import { MonthMini } from './MonthMini';
import { StatsBar } from './StatsBar';
import { WeekStrip } from './WeekStrip';

/** 관리자 첫 화면: 왼쪽 한 달 달력·바로가기, 오른쪽 주간 줄·하루 일정 */
export function AdminSchedule() {
  const router = useRouter();
  const pathname = usePathname();
  const [today] = useState(() => todayKey());
  const tomorrow = addDays(today, 1);
  const date = useSearchParams().get('date') ?? today;
  const [month, setMonth] = useState(monthKey(date));

  const select = (next: string) => {
    setMonth(monthKey(next));
    router.replace(`${pathname}?date=${next}`, { scroll: false });
  };

  const loadSoon = useCallback(() => api<DayCount[]>('/admin/calendar/week', { query: { date: today } }), [today]);
  const { data: soon } = useLiveApi(loadSoon);
  const countOf = (day: string) => soon?.find((item) => item.date === day)?.count ?? 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <StatsBar />
        <ButtonLink href="/admin/reservations/new">예약 추가</ButtonLink>
      </div>
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <MonthMini month={month} today={today} selected={date} onMonthChange={setMonth} onSelect={select} />
          <nav aria-label="바로가기" className="flex flex-col overflow-hidden rounded-panel bg-mist text-[14px]">
            <Shortcut label="오늘 할 일" count={countOf(today)} active={date === today} onClick={() => select(today)} />
            <Shortcut label="내일 할 일" count={countOf(tomorrow)} active={date === tomorrow} onClick={() => select(tomorrow)} />
          </nav>
        </aside>
        <section className="flex flex-col gap-6">
          <WeekStrip selected={date} onSelect={select} />
          <DayTimeline key={date} date={date} />
        </section>
      </div>
    </div>
  );
}

function Shortcut({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-between border-b border-line/60 px-4 last:border-b-0 py-3 text-left hover:bg-mist-deep ${active ? 'font-semibold' : ''}`}
    >
      {label}
      <span className="text-ink-soft">{count}건</span>
    </button>
  );
}
