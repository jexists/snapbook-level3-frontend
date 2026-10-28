'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState, RetryState, SkeletonRows } from '@/components/ui/states';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { formatRange } from '@/lib/time';
import type { CustomerReservation } from '@/types/api';

type Filter = 'upcoming' | 'past' | 'cancelled';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'upcoming', label: '예정' },
  { value: 'past', label: '지난 예약' },
  { value: 'cancelled', label: '취소' },
];

const EMPTY: Record<Filter, { title: string; description: string }> = {
  upcoming: { title: '예정된 예약이 없어요', description: '촬영 종류와 시간을 선택해 예약하세요.' },
  past: { title: '지난 예약이 없어요', description: '촬영을 마친 예약이 여기에 표시돼요.' },
  cancelled: { title: '취소한 예약이 없어요', description: '취소한 예약이 여기에 표시돼요.' },
};

export function MyReservations() {
  const [filter, setFilter] = useState<Filter>('upcoming');
  const load = useCallback(
    () => api<CustomerReservation[]>('/reservations/mine', { query: { filter } }),
    [filter],
  );
  const { data, error, loading, reload } = useApi(load);

  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl label="예약 보기" options={FILTERS} value={filter} onChange={setFilter} />
      {loading && <SkeletonRows />}
      {error && <RetryState action={<Button variant="secondary" onClick={reload}>다시 불러오기</Button>} />}
      {data && !loading && data.length === 0 && (
        <EmptyState
          {...EMPTY[filter]}
          action={filter === 'upcoming' ? <ButtonLink href="/book">예약하기</ButtonLink> : undefined}
        />
      )}
      {data && !loading && data.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.map((reservation) => (
            <li key={reservation.id}>
              <Link
                href={`/my/${reservation.id}`}
                className="flex min-h-20 flex-wrap items-center justify-between gap-3 rounded-panel border border-line p-5 transition-colors hover:border-ink-faint"
              >
                <span className="flex flex-col gap-1">
                  <span className="text-lead font-semibold">{reservation.shootType.name}</span>
                  <span className="text-body text-ink-soft">
                    {formatRange(reservation.startAt, reservation.endAt)}, {reservation.headcount}명
                  </span>
                </span>
                <StatusBadge status={reservation.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
