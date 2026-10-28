'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Notice, RetryState, Skeleton } from '@/components/ui/states';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { useApi } from '@/hooks/use-api';
import { api, errorMessage } from '@/lib/api';
import { STUDIO } from '@/lib/labels';
import { formatDateTime, formatPrice, formatRange } from '@/lib/time';
import type { CustomerReservation } from '@/types/api';

export function ReservationDetail() {
  const { id } = useParams<{ id: string }>();
  const load = useCallback(() => api<CustomerReservation>(`/reservations/${id}`), [id]);
  const { data, error, loading, reload } = useApi(load);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();

  async function cancel() {
    setCancelling(true);
    try {
      await api(`/reservations/${id}/cancel`, { method: 'POST' });
      toast.success('예약을 취소했어요.');
      reload();
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  }

  if (loading && !data) return <DetailSkeleton />;
  if (error || !data) return <RetryState action={<ButtonLink href="/my" variant="secondary">예약 목록으로</ButtonLink>} />;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/my" className="-mb-2 inline-flex min-h-11 items-center gap-1 self-start text-small text-ink-soft hover:text-ink">
        <span aria-hidden>‹</span> 예약 목록
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-title font-semibold tracking-[-0.02em]">{data.shootType.name}</h1>
        <StatusBadge status={data.status} />
      </div>

      <dl className="grid grid-cols-[88px_1fr] gap-y-3 rounded-panel border border-line bg-white p-5 text-body sm:p-6">
        <dt className="text-ink-soft">날짜·시간</dt>
        <dd className="font-semibold">{formatRange(data.startAt, data.endAt)}</dd>
        <dt className="text-ink-soft">인원</dt>
        <dd>{data.headcount}명</dd>
        {data.purpose && (
          <>
            <dt className="text-ink-soft">사용 목적</dt>
            <dd>{data.purpose}</dd>
          </>
        )}
        {data.specialRequest && (
          <>
            <dt className="text-ink-soft">요청사항</dt>
            <dd className="whitespace-pre-wrap">{data.specialRequest}</dd>
          </>
        )}
        <dt className="text-ink-soft">가격</dt>
        <dd>{formatPrice(data.price)} (촬영 당일 현장 결제)</dd>
      </dl>

      {data.status === 'confirmed' &&
        (data.canModify ? (
          <div className="flex flex-col gap-4">
            <div
              role="note"
              className="flex items-start gap-3 rounded-control border border-warning/25 bg-warning-soft px-4 py-3 text-small text-warning"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden className="mt-px shrink-0">
                <path d="M10 2.5 18.5 17h-17L10 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M10 8v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="10" cy="14.4" r="0.9" fill="currentColor" />
              </svg>
              <p>
                변경과 취소는 <strong className="font-semibold">{formatDateTime(data.deadline)}</strong>까지만 할 수 있어요.
                <br className="hidden sm:block" /> 이후에는 사진관으로 전화해 주세요.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <ButtonLink href={`/my/${data.id}/change`} variant="secondary">
                예약 변경
              </ButtonLink>
              <Button variant="danger" onClick={() => setConfirming(true)}>
                예약 취소
              </Button>
            </div>
          </div>
        ) : (
          <Notice>
            변경·취소 가능 시간이 지났어요. 사진관으로 전화해 주세요. {STUDIO.phone}
          </Notice>
        ))}

      <ConfirmDialog
        open={confirming}
        title="예약을 취소할까요?"
        description="취소한 예약은 되돌릴 수 없어요. 같은 시간이 필요하면 다시 예약해 주세요."
        confirmLabel="예약 취소"
        cancelLabel="그대로 두기"
        tone="danger"
        loading={cancelling}
        onConfirm={cancel}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}

/** 상세 화면과 같은 높이로 자리를 잡는다 */
function DetailSkeleton() {
  return (
    <div role="status" aria-label="불러오는 중" className="flex flex-col gap-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-44 rounded-panel" />
      <Skeleton className="h-11 w-full sm:w-64" />
    </div>
  );
}
