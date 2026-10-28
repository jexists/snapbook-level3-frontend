'use client';

import { useEffect } from 'react';
import { useToast } from './Toast';

/** 서버에서 불러오기에 실패했을 때, 화면이 뜨면서 오류 토스트를 한 번 띄운다 */
export function ToastOnMount({ message }: { message: string }) {
  const toast = useToast();
  useEffect(() => toast.error(message), [toast, message]);
  return null;
}
