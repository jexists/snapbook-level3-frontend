import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const FIELD =
  'w-full rounded-control border border-line bg-canvas px-3.5 text-body text-ink ' +
  'placeholder:text-ink-faint transition-colors hover:border-ink-faint focus:border-accent focus:outline-none ' +
  'focus:ring-2 focus:ring-accent/20 disabled:bg-mist disabled:text-ink-faint aria-[invalid=true]:border-danger';

const CHEVRON =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none' stroke='%2374766f' stroke-width='1.6'%3E%3Cpath d='m1 1.5 5 5 5-5'/%3E%3C/svg%3E\")] " +
  'bg-[length:12px_8px] bg-[right_14px_center] bg-no-repeat';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD, 'h-11', className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(FIELD, CHEVRON, 'h-11 appearance-none pr-10', className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, 'min-h-28 py-2.5 leading-relaxed', className)} {...props} />;
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

/** 줄 전체가 눌리는 체크박스 (높이 44px) */
export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn('flex min-h-11 cursor-pointer items-center gap-3 text-body', className)}>
      <input type="checkbox" className="size-5 shrink-0 accent-accent" {...props} />
      {label}
    </label>
  );
}
