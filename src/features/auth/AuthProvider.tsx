'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readAuth, writeAuth } from '@/lib/auth-storage';
import type { AuthUser, LoginResult } from '@/types/api';

interface AuthContextValue {
  user: AuthUser | null;
  /** 브라우저 저장소를 읽기 전에는 false (그 전에는 로그인 여부를 판단하지 않는다) */
  ready: boolean;
  /** 방금 로그아웃해서 첫 화면으로 가는 중이면 true (그동안 로그인 화면으로 보내지 않는다) */
  signedOut: boolean;
  signIn: (result: LoginResult) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 저장소는 브라우저에서만 읽을 수 있어서 화면이 뜬 뒤에 읽는다
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(readAuth()?.user ?? null);
    setReady(true);
  }, []);

  const signIn = useCallback((result: LoginResult) => {
    writeAuth(result);
    setUser(result.user);
    setSignedOut(false);
  }, []);

  /** 로그인 정보를 지우고 어느 화면에서든 첫 화면으로 보낸다 */
  const signOut = useCallback(() => {
    writeAuth(null);
    setSignedOut(true);
    setUser(null);
    router.replace('/');
  }, [router]);

  const value = useMemo(
    () => ({ user, ready, signedOut, signIn, signOut }),
    [user, ready, signedOut, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 안에서만 쓸 수 있어요.');
  return context;
}
