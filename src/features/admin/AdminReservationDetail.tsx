'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading, RetryState } from '@/components/ui/states';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApi } from '@/hooks/use-api';
import { api, firstErrorMessage } from '@/lib/api';
import { notifyReservationsChanged } from '@/lib/events';
import { dateOf, formatDate, formatMinutes, formatRange, minutesOf } from '@/lib/time';
import type { AdminReservation } from '@/types/api';
import { WeekGrid, type SlotChoice } from '../booking/WeekGrid';
import { ReservationActions } from './ReservationActions';
import { ReservationInfo } from './ReservationInfo';

/** 검색 결과에서 들어오는 예약 상세 (펼친 상세와 같은 내용 + 시간 변경) */
export function AdminReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const load = useCallback(() => api<AdminReservation>(`/admin/reservations/${id}`), [id]);
  const { data, error, loading, reload } = useApi(load);
  const [current, setCurrent] = useState<AdminReservation | null>(null);
  const [slot, setSlot] = useState<SlotChoice | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [gridVersion, setGridVersion] = useState(0);

  if (loading && !data) return <Loading />;
  if (error || !data) return <RetryState action={<ButtonLink href="/admin/reservations" variant="secondary">예약 검색으로</ButtonLink>} />;
  const reservation = current?.id === data.id ? current : data;

  async function change() {
    if (!slot) return;
    setSaving(true);
    try {
      const changed = await api<AdminReservation>(`/admin/reservations/${reservation.id}/change`, {
        method: 'POST',
        body: { shootTypeId: reservation.shootType.id, ...slot },
      });
      notifyReservationsChanged();
      router.replace(`/admin/reservations/${changed.id}`);
    } catch (caught) {
      setFailure(firstErrorMessage(caught));
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col items-start gap-2">
          <StatusBadge status={reservation.status} />
          <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.02em]">
            {reservation.shootType.name} {reservation.headcount}명
          </h1>
          <p className="text-[17px] tabular-nums text-ink-soft">{formatRange(reservation.startAt, reservation.endAt)}</p>
        </div>
        <ReservationActions
          reservation={reservation}
          onUpdated={(next) => (next ? setCurrent(next) : reload())}
        />
      </header>

      <section className="rounded-panel border border-line/70 p-6">
        <ReservationInfo reservation={reservation} layout="grid" />
      </section>

      {reservation.status === 'confirmed' && (
        <section id="change" className="flex flex-col gap-4">
          <h2 className="text-[24px] font-semibold tracking-[-0.02em]">시간 변경</h2>
          <WeekGrid
            key={gridVersion}
            shootTypeId={reservation.shootType.id}
            durationMin={reservation.shootType.durationMin}
            initialDate={dateOf(reservation.startAt)}
            selected={slot}
            onSelect={setSlot}
            excludeReservationId={reservation.id}
          />
          <div className="flex flex-wrap items-center justify-end gap-3">
            {slot && (
              <p className="mr-auto text-[15px]">
                새 시간: {formatDate(slot.date)} {slot.time}~{formatMinutes(minutesOf(slot.time) + reservation.shootType.durationMin)}
              </p>
            )}
            <Button disabled={!slot} onClick={() => setConfirming(true)}>이 시간으로 변경</Button>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirming}
        title="예약을 변경하시겠습니까?"
        description="새로운 예약이 확정되면 기존 예약은 자동으로 취소됩니다."
        confirmLabel="변경하기"
        loading={saving}
        onConfirm={change}
        onClose={() => setConfirming(false)}
      />
      <AlertDialog
        open={failure !== null}
        title="예약을 바꾸지 못했어요"
        message={failure ?? ''}
        onClose={() => {
          setFailure(null);
          setSlot(null);
          setGridVersion((value) => value + 1);
        }}
      />
    </div>
  );
}
