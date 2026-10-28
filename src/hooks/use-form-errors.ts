'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { ApiError, errorMessage } from '@/lib/api';

/**
 * 입력칸별 오류(fieldErrors)는 칸 밑에 보여 주고,
 * 칸에 붙지 않는 오류는 토스트로 띄운다 (onMessage를 주면 그쪽으로, 예: 모달).
 */
export function useFormErrors() {
  const toast = useToast();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  return {
    fieldErrors,
    clear() {
      setFieldErrors({});
    },
    clearField(name: string) {
      setFieldErrors((current) => {
        if (!(name in current)) return current;
        const next = { ...current };
        delete next[name];
        return next;
      });
    },
    setLocal(errors: Record<string, string>) {
      setFieldErrors(errors);
    },
    fromError(error: unknown, onMessage: (message: string) => void = toast.error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setFieldErrors(error.fieldErrors);
      } else {
        setFieldErrors({});
        onMessage(errorMessage(error));
      }
    },
  };
}
