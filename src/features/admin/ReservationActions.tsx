'use client';

import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { api, errorMessage } from '@/lib/api';
import { notifyReservationsChanged } from '@/lib/events';
import type { AdminReservation } from '@/types/api';

/** 관리자의 예약 처리 버튼: 촬영 완료, 노쇼, 변경, AI 다시 정리, 취소 */
export function ReservationActions({
  reservation,
  onUpdated,
}: {
  reservation: AdminReservation;
  onUpdated: (next: AdminReservation | null) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const toast = useToast();
  const [openedAt] = useState(() => Date.now());
  const started = new Date(reservation.startAt).getTime() <= openedAt;
  const active = ['confirmed', 'completed', 'no_show'].includes(reservation.status);
  const hasRequest = Boolean(reservation.purpose || reservation.specialRequest);

  async function run(key: string, action: () => Promise<AdminReservation | null>, success: string) {
    setBusy(key);
    try {
      onUpdated(await action());
      toast.success(success);
      notifyReservationsChanged();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  }

  const setStatus = (status: 'completed' | 'no_show') =>
    run(
      status,
      () => api<AdminReservation>(`/admin/reservations/${reservation.id}/status`, { method: 'PATCH', body: { status } }),
      status === 'completed' ? '촬영 완료로 표시했어요.' : '노쇼로 표시했어요.',
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {active && started && (
          <>
            <Button size="sm" variant="secondary" loading={busy === 'completed'} disabled={reservation.status === 'completed'} onClick={() => setStatus('completed')}>
              촬영 완료
            </Button>
            <Button size="sm" variant="secondary" loading={busy === 'no_show'} disabled={reservation.status === 'no_show'} onClick={() => setStatus('no_show')}>
              노쇼
            </Button>
          </>
        )}
        {reservation.status === 'confirmed' && (
          <ButtonLink size="sm" variant="secondary" href={`/admin/reservations/${reservation.id}#change`}>
            변경
          </ButtonLink>
        )}
        {hasRequest && (
          <Button
            size="sm"
            variant="ghost"
            loading={busy === 'ai'}
            onClick={() =>
              run(
                'ai',
                async () => {
                  await api(`/admin/reservations/${reservation.id}/ai-note`, { method: 'POST' });
                  return api<AdminReservation>(`/admin/reservations/${reservation.id}`);
                },
                'AI가 요청 글을 다시 정리했어요.',
              )
            }
          >
            AI 다시 정리
          </Button>
        )}
        {reservation.status === 'confirmed' && (
          <Button size="sm" variant="danger" onClick={() => setConfirmCancel(true)}>
            취소
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={confirmCancel}
        title="이 예약을 취소할까요?"
        description={`${reservation.customer.name}님의 예약을 관리자 취소로 바꿔요. 되돌릴 수 없어요.`}
        confirmLabel="예약 취소"
        cancelLabel="그대로 두기"
        tone="danger"
        loading={busy === 'cancel'}
        onConfirm={() => {
          setConfirmCancel(false);
          void run(
            'cancel',
            () => api<AdminReservation>(`/admin/reservations/${reservation.id}/cancel`, { method: 'POST' }),
            '예약을 취소했어요.',
          );
        }}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}
