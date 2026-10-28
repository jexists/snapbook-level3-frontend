'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  role?: 'dialog' | 'alertdialog';
  labelledBy?: string;
  /** 모바일에서 화면 아래에 붙는 시트로 보여 준다 */
  sheet?: boolean;
}

/**
 * 모든 모달이 같이 쓰는 껍데기. 브라우저 기본 <dialog>라서 ESC로 닫기, 포커스 가두기,
 * 닫을 때 원래 자리로 포커스 돌려주기를 브라우저가 처리한다. 배경 스크롤 잠금은 globals.css.
 */
export function Modal({ open, onClose, children, className, role = 'dialog', labelledBy, sheet }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role={role}
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(event) => {
        // 어두운 배경(대화상자 바깥)을 누르면 닫는다
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'bg-canvas p-6 text-ink',
        sheet
          ? 'mx-auto mb-0 mt-auto w-full max-w-[480px] animate-sheet rounded-t-modal sm:m-auto sm:animate-rise sm:rounded-modal'
          : 'm-auto w-[min(92vw,400px)] animate-rise rounded-modal',
        className,
      )}
    >
      {children}
    </dialog>
  );
}
