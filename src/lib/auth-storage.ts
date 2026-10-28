import type { LoginResult } from '@/types/api';

// 로그인 정보는 브라우저에 저장한다 (프론트와 백엔드 주소가 달라 쿠키 공유가 어렵기 때문).
// 실제 권한 확인은 백엔드가 토큰으로 한다.
const STORAGE_KEY = 'studio.auth';

export function readAuth(): LoginResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LoginResult) : null;
  } catch {
    return null;
  }
}

export function readToken(): string | null {
  return readAuth()?.token ?? null;
}

export function writeAuth(result: LoginResult | null) {
  try {
    if (result) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // 브라우저 저장소를 쓸 수 없으면 이번 화면에서만 로그인 상태를 유지한다
  }
}
