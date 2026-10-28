'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState, RetryState, Skeleton } from '@/components/ui/states';
import { useApi } from '@/hooks/use-api';
import { api, firstErrorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { dateOf, formatDate, formatMinutes, formatRange, minutesOf } from '@/lib/time';
import type { CustomerReservation } from '@/types/api';
import { WeekGrid, type SlotChoice } from '../booking/WeekGrid';

export function ChangeReservation() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const load = useCallback(() => api<CustomerReservation>(`/reservations/${id}`), [id]);
  const { data, error, loading } = useApi(load);
  const [slot, setSlot] = useState<SlotChoice | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  /** 변경에 실패하면 달력을 새로 불러와 바뀐 빈 시간을 보여 준다 */
  const [gridVersion, setGridVersion] = useState(0);

  async function change() {
    if (!data || !slot) return;
    setSaving(true);
    try {
      const changed = await api<CustomerReservation>(`/reservations/${id}/change`, {
        method: 'POST',
        body: { shootTypeId: data.shootType.id, ...slot },
      });
      router.replace(`/my/${changed.id}`);
    } catch (caught) {
      setFailure(firstErrorMessage(caught));
      setSaving(false);
      setConfirming(false);
    }
  }

  if (loading) return <Skeleton className="h-[48rem]" />;
  if (error || !data) return <RetryState action={<ButtonLink href={`/my/${id}`} variant="secondary">예약 내용으로 돌아가기</ButtonLink>} />;
  if (!data.canModify) {
    return (
      <EmptyState
        title="예약을 변경할 수 없어요"
        description="취소된 예약이거나 변경 가능 시간이 지났어요. 사진관으로 전화해 주세요."
        action={<ButtonLink href={`/my/${id}`} variant="secondary">예약 내용으로 돌아가기</ButtonLink>}
      />
    );
  }

  const endTime = slot ? formatMinutes(minutesOf(slot.time) + data.shootType.durationMin) : null;
  const newTime = slot ? `${formatDate(slot.date)} ${slot.time}~${endTime}` : null;
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-title font-semibold tracking-[-0.02em]">예약 변경</h1>
      <div className="grid overflow-hidden rounded-panel border border-line bg-white sm:grid-cols-[1fr_auto_1fr]" aria-live="polite">
        <div className="flex flex-col gap-1 px-5 py-4">
          <span className="text-caption font-medium text-ink-faint">지금 예약</span>
          <span className="text-body font-semibold">{formatRange(data.startAt, data.endAt)}</span>
          <span className="text-small text-ink-soft">
            {data.shootType.name} · {data.shootType.durationMin}분
          </span>
        </div>
        <span aria-hidden className="hidden items-center text-ink-faint sm:flex">→</span>
        <div className={cn('flex flex-col gap-1 border-t border-line px-5 py-4 sm:border-t-0', slot && 'bg-accent-soft/60')}>
          <span className={cn('text-caption font-medium', slot ? 'text-accent' : 'text-ink-faint')}>새 시간</span>
          {newTime ? (
            <span className="text-body font-semibold text-accent-ink">{newTime}</span>
          ) : (
            <span className="text-body text-ink-faint">아래 달력에서 골라 주세요</span>
          )}
        </div>
      </div>
      <WeekGrid
        key={gridVersion}
        shootTypeId={data.shootType.id}
        durationMin={data.shootType.durationMin}
        initialDate={dateOf(data.startAt)}
        selected={slot}
        onSelect={setSlot}
        excludeReservationId={data.id}
      />
      {/* 모바일 예약 앱처럼 고른 시간과 변경 버튼을 화면 아래에 띄워 둔다 */}
      <div className="sticky bottom-0 z-10 -mx-5 mt-2 border-t border-line/70 bg-canvas/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_24px_-16px_rgba(27,28,26,0.25)] backdrop-blur sm:bottom-4 sm:mx-0 sm:rounded-panel sm:border sm:px-5 sm:pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <span className="text-caption text-ink-faint">{slot ? '새 시간' : '변경할 시간'}</span>
            <span className={cn('truncate text-body', slot ? 'font-semibold' : 'text-ink-soft')}>
              {newTime ?? '시작 시간을 골라 주세요'}
            </span>
          </div>
          <Button disabled={!slot} onClick={() => setConfirming(true)} className="shrink-0">
            이 시간으로 변경
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        title="예약을 변경할까요?"
        description="새 예약이 확정되면 기존 예약은 자동으로 취소돼요."
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
