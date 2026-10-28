'use client';

import { useEffect } from 'react';
import { onReservationsChanged } from '@/lib/events';
import { useApi } from './use-api';

/** useApi와 같지만, 예약이 바뀌었다는 알림을 받으면 다시 불러온다 */
export function useLiveApi<T>(load: (() => Promise<T>) | null) {
  const state = useApi(load);
  const { reload } = state;
  useEffect(() => onReservationsChanged(reload), [reload]);
  return state;
}
