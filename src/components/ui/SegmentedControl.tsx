import { cn } from '@/lib/cn';

interface SegmentedControlProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** 몇 가지 보기 중 하나를 고르는 탭 */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-6 border-b border-line">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              '-mb-px h-11 border-b-2 text-body transition-colors',
              selected ? 'border-accent font-semibold text-ink' : 'border-transparent text-ink-soft hover:text-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
