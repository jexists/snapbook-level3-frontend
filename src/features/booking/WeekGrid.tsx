'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { RetryState, Skeleton } from '@/components/ui/states';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { cn } from '@/lib/cn';
import { addDays, formatMinutes, formatShortDate, minutesOf, mondayOf, weekdayLabel } from '@/lib/time';
import type { WeekAvailability } from '@/types/api';

export interface SlotChoice {
  date: string;
  time: string;
}

interface WeekGridProps {
  shootTypeId: number;
  durationMin: number;
  /** 처음 보여 줄 주에 들어 있는 날짜 */
  initialDate: string;
  selected: SlotChoice | null;
  onSelect: (choice: SlotChoice) => void;
  /** 예약 변경 중이면 자기 예약 시간은 비어 있는 것으로 본다 */
  excludeReservationId?: number;
  /** 주 이동 버튼 위에 보여 줄 선택 요약 */
  summary?: ReactNode;
}

const SLOT_MINUTES = 30;
const LUNCH_START = 12 * 60;
const LUNCH_END = 13 * 60;

/** 월~토 6일 × 30분 칸 주간 달력. 안 되는 칸은 회색이고 누를 수 없다. */
export function WeekGrid({
  shootTypeId,
  durationMin,
  initialDate,
  selected,
  onSelect,
  excludeReservationId,
  summary,
}: WeekGridProps) {
  const [weekStart, setWeekStart] = useState(() => mondayOf(initialDate));
  const load = useCallback(
    () =>
      api<WeekAvailability>('/availability/week', {
        query: { start: weekStart, shootTypeId, excludeReservationId },
      }),
    [weekStart, shootTypeId, excludeReservationId],
  );
  const { data, error, loading, reload } = useApi(load);

  const covers = (date: string, time: string) =>
    selected?.date === date &&
    minutesOf(time) >= minutesOf(selected.time) &&
    minutesOf(time) < minutesOf(selected.time) + durationMin;

  return (
    <div className="flex flex-col gap-4">
      {summary}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="w-9 px-0"
          disabled={!data?.hasPrevWeek}
          onClick={() => setWeekStart((start) => addDays(start, -7))}
          aria-label="이전 주"
        >
          ‹
        </Button>
        <p className="min-w-36 text-center text-body font-semibold tabular-nums" aria-live="polite">
          {formatShortDate(weekStart)} ~ {formatShortDate(addDays(weekStart, 5))}
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="w-9 px-0"
          disabled={!data?.hasNextWeek}
          onClick={() => setWeekStart((start) => addDays(start, 7))}
          aria-label="다음 주"
        >
          ›
        </Button>
      </div>

      {loading && !data && <WeekGridSkeleton />}
      {error && !data && <RetryState action={<Button variant="secondary" onClick={reload}>다시 불러오기</Button>} />}
      {data && (
        <div
          role="grid"
          aria-label="예약 가능한 시간"
          aria-busy={loading}
          className={cn('grid gap-1.5 transition-opacity', loading && 'opacity-50')}
          style={{ gridTemplateColumns: '40px repeat(6, minmax(0, 1fr))' }}
        >
          <div role="row" className="contents">
            <span />
            {data.days.map((day) => (
              <span key={day.date} role="columnheader" className="pb-1 text-center text-caption leading-tight text-ink-soft">
                <span className="block font-semibold text-ink">{weekdayLabel(day.date)}</span>
                {formatShortDate(day.date)}
              </span>
            ))}
          </div>
          {data.days[0].slots.map((slot, rowIndex) => (
            <div role="row" key={slot.time} className="contents">
              <span role="rowheader" className="flex items-center text-caption tabular-nums text-ink-faint">
                {slot.time}
              </span>
              {data.days.map((day) => {
                const cell = day.slots[rowIndex];
                const isStart = selected?.date === day.date && selected.time === cell.time;
                const isCovered = covers(day.date, cell.time);
                const isLunch = minutesOf(cell.time) >= LUNCH_START && minutesOf(cell.time) < LUNCH_END;
                const label = isStart
                  ? cell.time
                  : isCovered
                    ? ''
                    : isLunch
                      ? '점심'
                      : cell.reason === 'BOOKED'
                        ? '마감'
                        : '';
                return (
                  <button
                    key={day.date}
                    type="button"
                    role="gridcell"
                    aria-selected={isStart}
                    aria-disabled={!cell.available}
                    aria-label={`${formatShortDate(day.date)} ${cell.time} ${cell.available ? '예약 가능' : (cell.reasonText ?? '예약 불가')}`}
                    title={cell.available ? `${cell.time}~${formatMinutes(minutesOf(cell.time) + durationMin)}` : (cell.reasonText ?? undefined)}
                    onClick={() => cell.available && onSelect({ date: day.date, time: cell.time })}
                    className={cn(
                      'h-9 rounded-slot border text-caption transition-colors',
                      isStart
                        ? 'viewfinder border-accent bg-accent font-semibold text-white'
                        : isCovered
                          ? 'border-accent/50 bg-accent-soft text-accent-ink'
                          : cell.available
                            ? 'border-line bg-canvas hover:border-accent hover:bg-accent-soft'
                            : 'cursor-not-allowed border-transparent bg-mist text-ink-faint',
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] border border-line bg-canvas" aria-hidden />
          예약 가능
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-[3px] bg-mist-deep/70" aria-hidden />
          예약 불가
        </span>
        <span className="text-ink-faint">일요일 휴무</span>
      </div>
      <span className="sr-only">한 칸은 {SLOT_MINUTES}분이에요.</span>
    </div>
  );
}

/** 달력과 같은 크기로 자리를 잡아, 불러온 뒤 화면이 밀리지 않게 한다 */
function WeekGridSkeleton() {
  return (
    <div role="status" aria-label="예약 가능한 시간을 불러오는 중">
      <Skeleton className="h-[42rem] sm:h-[44rem]" />
    </div>
  );
}
