import { cn } from '@/lib/cn';

interface StepperProps {
  steps: string[];
  current: number;
}

/** 예약 단계 표시 (실제로 순서가 있는 흐름이라 번호를 쓴다) */
export function Stepper({ steps, current }: StepperProps) {
  return (
    <div className="flex flex-col gap-3">
      <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, index) => {
          const state = index < current ? 'done' : index === current ? 'current' : 'todo';
          return (
            <li key={step} aria-current={state === 'current' ? 'step' : undefined} className="flex flex-col gap-2">
              <span className={cn('h-0.5 transition-colors', state === 'todo' ? 'bg-mist-deep' : 'bg-accent')} />
              <span
                className={cn(
                  'hidden text-caption sm:block',
                  state === 'current' ? 'font-semibold text-ink' : 'text-ink-faint',
                )}
              >
                {index + 1}. {step}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-caption text-ink-faint sm:hidden" aria-hidden>
        {current + 1}/{steps.length} 단계
      </p>
    </div>
  );
}
