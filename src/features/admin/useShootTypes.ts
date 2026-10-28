'use client';

import { useCallback } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { ShootType } from '@/types/api';

/** 관리자 화면에서 쓰는 촬영 종류 목록 (판매 중지된 것도 포함) */
export function useAdminShootTypes() {
  const load = useCallback(() => api<ShootType[]>('/admin/shoot-types'), []);
  return useApi(load);
}
