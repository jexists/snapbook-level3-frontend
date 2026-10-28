import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'border border-accent bg-accent text-white hover:bg-accent-hover disabled:border-line disabled:bg-line disabled:text-ink-faint',
  secondary: 'border border-line bg-canvas text-ink hover:border-ink-faint disabled:text-ink-faint disabled:hover:border-line',
  ghost: 'border border-transparent text-accent hover:bg-accent-soft disabled:text-ink-faint disabled:hover:bg-transparent',
  danger: 'border border-danger/40 bg-canvas text-danger hover:bg-danger-soft disabled:text-ink-faint disabled:hover:bg-canvas',
};

/** 높이: 작은 36 / 기본 44 / 큰 52 (기본 이상이 모바일 터치 영역 기준) */
const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-small',
  md: 'h-11 px-5 text-body',
  lg: 'h-13 px-7 text-body',
};

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors',
    'disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClass(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      )}
      {children}
      {loading && <span className="sr-only">처리 중</span>}
    </button>
  );
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ href, variant = 'primary', size = 'md', className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}
