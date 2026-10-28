import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('size-5 animate-spin rounded-full border-2 border-line border-t-accent', className)}
      aria-hidden
    />
  );
}

/** 화면 전체를 기다리는 동안 가운데에 작게 보여 주는 로딩 */
export function Loading({ label = '불러오는 중', className }: { label?: string; className?: string }) {
  return (
    <div role="status" className={cn('flex min-h-[40vh] flex-col items-center justify-center gap-3', className)}>
      <Spinner />
      <span className="text-small text-ink-soft">{label}</span>
    </div>
  );
}

/** 실제 내용과 같은 크기를 미리 잡아 두는 자리 표시 (불러온 뒤 화면이 밀리지 않게) */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse-soft rounded-control bg-mist', className)} aria-hidden />;
}

/** 목록 행 모양의 로딩 자리 */
export function SkeletonRows({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div role="status" aria-label="불러오는 중" className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-20 rounded-panel" />
      ))}
    </div>
  );
}

interface MessageStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: MessageStateProps) {
  return (
    <div className={cn('flex flex-col items-start gap-1.5 py-10', className)}>
      <p className="text-lead font-semibold">{title}</p>
      {description && <p className="text-body text-ink-soft">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

/**
 * 불러오기에 실패한 자리. 오류 문구는 토스트로 이미 보여 주므로 여기서는 다시 시도할 방법만 둔다.
 */
export function RetryState({ action, className }: { action?: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col items-start gap-3 py-10', className)}>
      <p className="text-body text-ink-soft">내용을 불러오지 못했어요. 다시 시도해 주세요.</p>
      {action}
    </div>
  );
}

/** 화면 안에 계속 보여야 하는 안내 (예: 취소 마감이 지났어요). 오류는 토스트·모달로 보낸다. */
export function Notice({ children }: { children: ReactNode }) {
  return <p className="rounded-control bg-warning-soft px-4 py-3 text-small text-warning">{children}</p>;
}
