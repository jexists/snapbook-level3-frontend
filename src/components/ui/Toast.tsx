'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ToastTone = 'error' | 'success';

interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  error: (message: string) => void;
  success: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
const DURATION_MS = 4500;
const MAX_TOASTS = 3;

/** 화면 위쪽에 잠깐 떴다 사라지는 안내. 오류·완료 문구는 모두 여기로 보낸다. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (tone: ToastTone, message: string) => {
      const id = ++nextId.current;
      setToasts((current) => [
        // 같은 문구가 이미 떠 있으면 하나만 남긴다
        ...current.filter((toast) => toast.message !== message).slice(-(MAX_TOASTS - 1)),
        { id, tone, message },
      ]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ error: (message) => show('error', message), success: (message) => show('success', message) }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'animate-rise pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-control border border-l-4 border-line bg-canvas px-4 py-3',
              toast.tone === 'error' ? 'border-l-danger' : 'border-l-success',
            )}
          >
            <p className="flex-1 text-small text-ink">{toast.message}</p>
            <button
              type="button"
              aria-label="안내 닫기"
              className="-my-1 -mr-2 flex size-8 items-center justify-center rounded-control text-lead leading-none text-ink-faint hover:text-ink"
              onClick={() => dismiss(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast는 ToastProvider 안에서만 쓸 수 있어요.');
  return context;
}
