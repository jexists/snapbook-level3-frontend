'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { api, errorMessage } from '@/lib/api';
import { notifyReservationsChanged } from '@/lib/events';

interface SeedResult {
  shootTypes: number;
  customers: number;
  reservations: number;
  aiNotes: number;
  message: string;
}

/** 헤더 관리자 메뉴에서 여는 가상 데이터 창. 이 창 자체가 확인 단계라 한 번 더 묻지 않는다. */
export function SeedDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [running, setRunning] = useState(false);
  const toast = useToast();

  async function reset() {
    setRunning(true);
    try {
      const seeded = await api<SeedResult>('/admin/seed/reset', { method: 'POST' });
      notifyReservationsChanged();
      toast.success(
        `${seeded.message} 촬영 종류 ${seeded.shootTypes}개, 손님 ${seeded.customers}명, 예약 ${seeded.reservations}건, AI 정리 ${seeded.aiNotes}개가 들어갔어요.`,
      );
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setRunning(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="seed-dialog-title" className="w-[min(92vw,480px)]">
      <h2 id="seed-dialog-title" className="text-lead font-semibold">
        가상 데이터를 다시 채울까요?
      </h2>
      <div className="mt-3 flex flex-col gap-2 text-[15px] leading-relaxed text-ink-soft">
        <p>지금 있는 예약·손님·촬영 종류·AI 정리를 지우고, 오늘 날짜에 맞춘 가상 데이터로 바꿔요.</p>
        <p>시연용 손님 계정은 customer1~customer6, 비밀번호는 demo1234예요. 관리자 계정은 그대로 남아요.</p>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
        <Button variant="primary" className="border-danger bg-danger hover:bg-danger/90" loading={running} onClick={reset}>
          다시 채우기
        </Button>
      </div>
    </Modal>
  );
}
