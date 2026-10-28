import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-line bg-mist text-ink-soft',
  accent: 'border-accent/25 bg-accent-soft text-accent-ink',
  success: 'border-success/25 bg-success-soft text-success',
  warning: 'border-warning/25 bg-warning-soft text-warning',
  danger: 'border-danger/25 bg-danger-soft text-danger',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center rounded-[2px] border px-2 py-0.5 text-caption font-semibold leading-none tracking-[-0.01em]', TONES[tone])}>
      {children}
    </span>
  );
}
