'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  /** FormField가 넘겨 주는 id (라벨이 이 버튼을 가리킨다) */
  id?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  disabled?: boolean;
}

/** 목록이 이보다 아래 공간이 좁으면 위로 펼친다 */
const LIST_MAX_HEIGHT = 288;

/**
 * 브라우저 기본 select 대신 쓰는 고르기 칸. 버튼을 누르면 목록이 펼쳐지고
 * ↑↓·Home·End로 옮기고 Enter·Space로 고르며 ESC·바깥 클릭으로 닫힌다.
 */
export function SelectMenu({
  id,
  options,
  value,
  onChange,
  className,
  disabled,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
}: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [placeAbove, setPlaceAbove] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  function openList() {
    const rect = triggerRef.current?.getBoundingClientRect();
    setPlaceAbove(rect ? window.innerHeight - rect.bottom < LIST_MAX_HEIGHT && rect.top > window.innerHeight - rect.bottom : false);
    setActiveIndex(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  function close(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    close();
  }

  useEffect(() => {
    if (!open) return;
    listRef.current?.focus();
    const closeOnOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  // 키보드로 옮긴 항목이 목록 밖으로 나가지 않게 스크롤한다
  useLayoutEffect(() => {
    if (open) listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function handleTriggerKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  }

  function handleListKey(event: KeyboardEvent<HTMLUListElement>) {
    const last = options.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: Math.min(activeIndex + 1, last),
      ArrowUp: Math.max(activeIndex - 1, 0),
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      setActiveIndex(moves[event.key]);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close(false);
    }
  }

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-describedby={describedBy}
        data-invalid={invalid || undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKey}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-control border bg-canvas pl-3.5 pr-3 text-left text-body text-ink transition-colors',
          'hover:border-ink-faint focus:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20',
          'disabled:cursor-not-allowed disabled:bg-mist disabled:text-ink-faint data-invalid:border-danger',
          open ? 'border-accent ring-2 ring-accent/20' : 'border-line',
        )}
      >
        <span className={cn('truncate', !selected && 'text-ink-faint')}>{selected?.label ?? '선택해 주세요'}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden className={cn('shrink-0 text-ink-faint transition-transform', open && 'rotate-180')}>
          <path d="m1 1.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={id}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={handleListKey}
          // 포커스는 목록 안의 강조 항목으로 보여 주므로 전역 포커스 테두리는 끈다
          style={{ maxHeight: LIST_MAX_HEIGHT, outline: 'none' }}
          className={cn(
            'absolute left-0 z-30 w-full min-w-44 animate-rise overflow-y-auto rounded-panel border border-line bg-white p-1.5 outline-none',
            'shadow-[0_16px_40px_-16px_rgba(27,28,26,0.3)]',
            placeAbove ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]',
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={cn(
                  'flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-control px-3 text-body',
                  index === activeIndex && 'bg-mist',
                  isSelected ? 'font-semibold text-accent' : 'text-ink',
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <svg width="14" height="11" viewBox="0 0 14 11" fill="none" aria-hidden className="shrink-0">
                    <path d="m1.5 5.5 3.5 3.5 7.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
