'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { todayKey } from '@/lib/time';

const HIDDEN_DATE_KEY = 'welcome-modal-hidden-date';

function readHiddenDate(): string | null {
  try {
    return window.localStorage.getItem(HIDDEN_DATE_KEY);
  } catch {
    return null;
  }
}

function writeHiddenDate(date: string) {
  try {
    window.localStorage.setItem(HIDDEN_DATE_KEY, date);
  } catch {
    // 저장이 막힌 브라우저에서는 이번 방문에서만 닫힌다
  }
}

/**
 * 첫 화면에 처음 들어오면 예약하기/예약 확인하기를 고르게 하는 창.
 * 닫기는 이번 화면에서만 닫고, "오늘 하루 보지 않기"는 오늘 날짜(한국 시간)를 저장해
 * 같은 날에는 새로고침하거나 다른 화면에 다녀와도 다시 띄우지 않는다.
 */
export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 저장소는 브라우저에서만 읽을 수 있어서 화면이 뜬 뒤에 읽는다
    if (readHiddenDate() !== todayKey()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, []);

  return (
    <Modal open={open} onClose={() => setOpen(false)} labelledBy="welcome-modal-title" sheet>
      <div className="flex items-start justify-between gap-4">
        <h2 id="welcome-modal-title" className="font-display text-heading font-semibold">
          무엇을 도와드릴까요?
        </h2>
        <button
          type="button"
          aria-label="닫기"
          className="-mr-2 -mt-2 flex size-11 shrink-0 items-center justify-center rounded-control text-heading leading-none text-ink-faint hover:text-ink"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/book" className={buttonClass('primary', 'lg')} onClick={() => setOpen(false)}>
          예약하기
        </Link>
        <Link href="/my" className={buttonClass('secondary', 'lg')} onClick={() => setOpen(false)}>
          예약 확인하기
        </Link>
      </div>
      <button
        type="button"
        className="mt-3 flex h-11 w-full items-center justify-center text-small text-ink-soft hover:text-ink"
        onClick={() => {
          writeHiddenDate(todayKey());
          setOpen(false);
        }}
      >
        오늘 하루 보지 않기
      </button>
    </Modal>
  );
}
