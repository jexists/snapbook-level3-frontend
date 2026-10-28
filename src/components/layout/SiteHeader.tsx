'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { ADMIN_NAV, activeAdminHref } from '@/features/admin/admin-nav';
import { SeedDialog } from '@/features/admin/SeedDialog';
import { useAuth } from '@/features/auth/AuthProvider';
import { cn } from '@/lib/cn';
import { STUDIO } from '@/lib/labels';

const NAV_LINK = 'flex h-11 items-center px-2 text-ink-soft hover:text-ink';
/** 메뉴 항목은 배경색으로 포커스를 보여 주므로 전역 포커스 테두리를 끈다 */
const NO_OUTLINE = { outline: 'none' };

/** 손님 화면과 관리자 화면이 같이 쓰는 헤더. 로그인 상태에 따라 오른쪽 메뉴만 바뀐다. */
export function SiteHeader({ wide = false }: { wide?: boolean }) {
  const { user, ready, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur">
      <div
        className={cn(
          'mx-auto flex h-14 items-center justify-between gap-3 px-5 sm:px-8',
          wide ? 'max-w-[1280px]' : 'max-w-[1120px]',
        )}
      >
        <Link href="/" className="text-body font-semibold tracking-tight">
          {STUDIO.name}
        </Link>
        <nav aria-label="계정 메뉴" className="flex min-w-24 items-center justify-end text-small">
          {!ready ? null : user?.role === 'admin' ? (
            <AdminMenu onSignOut={signOut} />
          ) : user ? (
            <button type="button" className={NAV_LINK} onClick={signOut}>
              로그아웃
            </button>
          ) : (
            <>
              <Link href="/login" className={NAV_LINK}>
                로그인
              </Link>
              <span className="text-line" aria-hidden>
                |
              </span>
              <Link href="/signup" className={NAV_LINK}>
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

/** 관리자 화면 전부와 로그아웃을 담은 드롭다운 */
function AdminMenu({ onSignOut }: { onSignOut: () => void }) {
  const pathname = usePathname();
  const active = activeAdminHref(pathname);
  const [open, setOpen] = useState(false);
  const [seedOpen, setSeedOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // 다른 화면으로 옮기면 메뉴를 닫는다
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    const keys: Record<string, number> = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key in keys) {
      event.preventDefault();
      items[keys[event.key]]?.focus();
    } else if (event.key === 'Tab') {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(
          'flex h-9 items-center gap-1.5 rounded-control border px-3 font-medium transition-colors',
          open ? 'border-ink-faint bg-mist text-ink' : 'border-line text-ink hover:border-ink-faint',
        )}
        onClick={() => setOpen((value) => !value)}
      >
        관리자
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden className={cn('transition-transform', open && 'rotate-180')}>
          <path d="m1 1 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="관리자 메뉴"
          onKeyDown={moveFocus}
          className="absolute right-0 top-[calc(100%+6px)] w-48 animate-rise rounded-panel border border-line bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(27,28,26,0.25)]"
        >
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              style={NO_OUTLINE}
              aria-current={item.href === active ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                'flex h-10 items-center justify-between rounded-control px-3 outline-none hover:bg-mist focus-visible:bg-mist',
                item.href === active ? 'font-semibold text-accent' : 'text-ink',
              )}
            >
              {item.label}
              {item.href === active && <span className="size-1.5 rounded-full bg-accent" aria-hidden />}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            style={NO_OUTLINE}
            onClick={() => {
              setOpen(false);
              setSeedOpen(true);
            }}
            className="flex h-10 w-full items-center rounded-control px-3 text-left text-ink outline-none hover:bg-mist focus-visible:bg-mist"
          >
            가상 데이터
          </button>
          <div className="my-1.5 h-px bg-line" role="separator" />
          <button
            type="button"
            role="menuitem"
            style={NO_OUTLINE}
            onClick={onSignOut}
            className="flex h-10 w-full items-center rounded-control px-3 text-left text-ink-soft outline-none hover:bg-mist hover:text-ink focus-visible:bg-mist"
          >
            로그아웃
          </button>
        </div>
      )}
      <SeedDialog open={seedOpen} onClose={() => setSeedOpen(false)} />
    </div>
  );
}
