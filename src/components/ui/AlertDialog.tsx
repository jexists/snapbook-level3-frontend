'use client';

import { Button } from './Button';
import { Modal } from './Modal';

interface AlertDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

/** 진행이 멈추는 중요한 오류(예약·변경 실패)를 확인 버튼 하나로 알리는 창 */
export function AlertDialog({ open, title, message, onClose }: AlertDialogProps) {
  return (
    <Modal open={open} onClose={onClose} role="alertdialog" labelledBy="alert-dialog-title" sheet>
      <h2 id="alert-dialog-title" className="text-lead font-semibold">
        {title}
      </h2>
      <p className="mt-2 text-body text-ink-soft">{message}</p>
      <Button className="mt-6 w-full" onClick={onClose}>
        확인
      </Button>
    </Modal>
  );
}

/** AlertDialog에 넘길 상태: 제목과 문구가 있으면 열린다 */
export interface AlertState {
  title: string;
  message: string;
}
