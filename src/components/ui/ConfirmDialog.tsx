'use client';

import type { ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** 되돌리기 어려운 일 전에 한 번 더 묻는 창 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = '닫기',
  tone = 'primary',
  loading,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="confirm-dialog-title" sheet>
      <h2 id="confirm-dialog-title" className="text-lead font-semibold">
        {title}
      </h2>
      {description && <div className="mt-2 text-body text-ink-soft">{description}</div>}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          className={tone === 'danger' ? 'border-danger bg-danger hover:bg-danger/90' : undefined}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
