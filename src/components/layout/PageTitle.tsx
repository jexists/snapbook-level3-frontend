import type { ReactNode } from 'react';

/** 제목만으로 목적이 분명하면 description을 넘기지 않는다 */
export function PageTitle({ title, description, action }: { title: string; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-title font-semibold tracking-[-0.02em] sm:text-[2.5rem] sm:leading-tight">{title}</h1>
        {description && <p className="mt-2 text-body text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
