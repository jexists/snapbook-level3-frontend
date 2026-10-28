'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/lib/api';

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
}

interface Result<T> {
  load: () => Promise<T>;
  version: number;
  data: T | null;
  error: string | null;
}

/**
 * 화면이 열릴 때 백엔드에서 데이터를 가져온다. load가 바뀌면 다시 가져온다.
 * 다시 가져오는 동안에는 이전 데이터를 그대로 보여 주고, 실패하면 오류 토스트를 띄운다.
 */
export function useApi<T>(load: (() => Promise<T>) | null): ApiState<T> {
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    if (!load) return;
    let active = true;
    load()
      .then((data) => active && setResult({ load, version, data, error: null }))
      .catch((caught: unknown) => {
        if (!active) return;
        const message = errorMessage(caught);
        toast.error(message);
        setResult((previous) => ({ load, version, data: previous?.data ?? null, error: message }));
      });
    return () => {
      active = false;
    };
  }, [load, version, toast]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const loading = Boolean(load) && (result?.load !== load || result.version !== version);
  return { data: result?.data ?? null, error: loading ? null : (result?.error ?? null), loading, reload };
}
