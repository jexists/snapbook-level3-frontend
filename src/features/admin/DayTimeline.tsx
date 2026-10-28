'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loading, RetryState } from '@/components/ui/states';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLiveApi } from '@/hooks/use-live-api';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatDate, formatMinutes, minutesOf, nowMinutes, timeOf, todayKey, weekdayOf } from '@/lib/time';
import type { AdminReservation, DaySchedule } from '@/types/api';
import { PrepList } from './PrepList';
import { ReservationActions } from './ReservationActions';
import { ReservationInfo } from './ReservationInfo';

const OPEN = 10 * 60;
const CLOSE = 18 * 60;
const LUNCH_START = 12 * 60;
const LUNCH_END = 13 * 60;
const SLOT = 30;
const ROW_HEIGHT = 36;

/** 오른쪽 하루 일정: 10~18시를 세로로, 예약은 촬영 시간만큼 높이를 가진 블록.
 *  날짜가 바뀌면 부모가 key로 새로 그려서 펼친 상태를 비운다. */
export function DayTimeline({ date }: { date: string }) {
  const load = useCallback(() => api<DaySchedule>('/admin/calendar/day', { query: { date } }), [date]);
  const { data, loading, reload } = useLiveApi(load);
  const [openId, setOpenId] = useState<number | null>(null);
  const [overrides, setOverrides] = useState<Record<number, AdminReservation>>({});
  const [openedAt] = useState(() => ({ date: todayKey(), minutes: nowMinutes() }));
  const isPast = (minute: number) =>
    date < openedAt.date || (date === openedAt.date && minute < openedAt.minutes);

  if (loading && !data) return <Loading />;
  if (!data) return <RetryState action={<Button variant="secondary" onClick={reload}>다시 불러오기</Button>} />;

  const reservations = data.reservations.map((item) => overrides[item.id] ?? item);
  const byStart = new Map(reservations.map((item) => [minutesOf(timeOf(item.startAt)), item]));
  const label = data.isToday ? '오늘' : data.isTomorrow ? '내일' : null;
  const rows = [];
  for (let minute = OPEN; minute < CLOSE; ) {
    if (minute === LUNCH_START) {
      rows.push(
        <TimelineRow key="lunch" time={formatMinutes(minute)}>
          <div className="flex items-center rounded-slot bg-mist px-3 text-[13px] text-ink-faint" style={{ height: ROW_HEIGHT * 2 - 6 }}>
            점심시간
          </div>
        </TimelineRow>,
      );
      minute = LUNCH_END;
      continue;
    }
    const reservation = byStart.get(minute);
    if (reservation) {
      const slots = Math.max(1, reservation.shootType.durationMin / SLOT);
      rows.push(
        <TimelineRow key={minute} time={formatMinutes(minute)}>
          <ReservationBlock
            reservation={reservation}
            minHeight={ROW_HEIGHT * slots - 6}
            open={openId === reservation.id}
            onToggle={() => setOpenId((current) => (current === reservation.id ? null : reservation.id))}
            onUpdated={(next) => next && setOverrides((current) => ({ ...current, [next.id]: next }))}
          />
        </TimelineRow>,
      );
      minute += reservation.shootType.durationMin;
      continue;
    }
    rows.push(
      <TimelineRow key={minute} time={formatMinutes(minute)}>
        {isPast(minute) ? (
          <span className="flex items-center px-3 text-[13px] text-ink-faint/70" style={{ height: ROW_HEIGHT - 6 }}>
            지난 시간
          </span>
        ) : (
        <Link
          href={`/admin/reservations/new?date=${date}&time=${formatMinutes(minute)}`}
          className="flex items-center rounded-slot border border-dashed border-line px-3 text-[13px] text-ink-faint transition-colors hover:border-accent hover:text-accent"
          style={{ height: ROW_HEIGHT - 6 }}
        >
          + 비어 있음
        </Link>
        )}
      </TimelineRow>,
    );
    minute += SLOT;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[24px] font-semibold tracking-[-0.02em]">
          {formatDate(date)}
          {label && <span className="ml-2 align-middle text-[13px] font-medium text-accent">{label}</span>}
        </h2>
        <span className="text-[14px] text-ink-soft">{reservations.length}건</span>
      </div>
      {weekdayOf(date) === 0 ? (
        <p className="rounded-panel bg-mist p-6 text-[15px] text-ink-soft">일요일은 휴무예요.</p>
      ) : (
        <>
          <PrepList prep={data.prep} kakaoPreview={data.kakaoPreview} />
          <ol className="flex flex-col">{rows}</ol>
        </>
      )}
    </div>
  );
}

function TimelineRow({ time, children }: { time: string; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[48px_1fr] gap-3 pb-1.5">
      <span className="pt-1.5 text-[12px] tabular-nums text-ink-faint">{time}</span>
      {children}
    </li>
  );
}

interface ReservationBlockProps {
  reservation: AdminReservation;
  minHeight: number;
  open: boolean;
  onToggle: () => void;
  onUpdated: (next: AdminReservation | null) => void;
}

function ReservationBlock({ reservation, minHeight, open, onToggle, onUpdated }: ReservationBlockProps) {
  const finished = reservation.status !== 'confirmed';
  return (
    <div
      className={cn(
        'rounded-slot transition-colors',
        finished ? 'bg-mist' : 'bg-accent-soft',
        open && 'ring-1 ring-accent',
      )}
      style={{ minHeight }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-col gap-0.5 px-3 py-2 text-left"
      >
        <span className="flex w-full flex-wrap items-center justify-between gap-2">
          <span className={cn('text-[14px] font-semibold', finished ? 'text-ink-soft' : 'text-accent-ink')}>
            {reservation.shootType.name} {reservation.headcount}명
            <span className="ml-2 font-normal text-ink">{reservation.customer.name}</span>
          </span>
          <span className="flex items-center gap-2 text-[12px] text-ink-soft">
            {timeOf(reservation.startAt)}~{timeOf(reservation.endAt)}
            {finished && <StatusBadge status={reservation.status} />}
          </span>
        </span>
        {!open && reservation.aiNote?.oneLine && (
          <span className="text-[12px] text-ink-soft">AI 정리: {reservation.aiNote.oneLine}</span>
        )}
      </button>
      {open && (
        <div className="animate-rise flex flex-col gap-4 border-t border-accent/20 px-3 py-3">
          <ReservationInfo reservation={reservation} />
          <ReservationActions reservation={reservation} onUpdated={onUpdated} />
        </div>
      )}
    </div>
  );
}
