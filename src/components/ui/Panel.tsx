import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PanelProps {
  children: ReactNode;
  className?: string;
  tone?: 'plain' | 'mist';
}

/** 내용을 묶는 면. 흰 면은 얇은 테두리, 회색 면은 테두리 없이. */
export function Panel({ children, className, tone = 'plain' }: PanelProps) {
  return (
    <section className={cn('rounded-panel', tone === 'plain' ? 'border border-line bg-canvas' : 'bg-mist', className)}>
      {children}
    </section>
  );
}

/** 줄로 나뉜 목록 */
export function ListRows({ children, className }: { children: ReactNode; className?: string }) {
  return <ul className={cn('divide-y divide-line', className)}>{children}</ul>;
}
