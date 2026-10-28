/** 관리자 화면 목록. 공통 헤더의 관리자 메뉴가 이 순서대로 보여 준다. */
export const ADMIN_NAV = [
  { href: '/admin', label: '일정' },
  { href: '/admin/reservations', label: '예약 검색' },
  { href: '/admin/reservations/new', label: '예약 추가' },
  { href: '/admin/shoot-types', label: '촬영 종류' },
] as const;

/** 지금 주소에 해당하는 관리자 메뉴 (가장 길게 맞는 주소 기준) */
export function activeAdminHref(pathname: string): string | null {
  const matches = ADMIN_NAV.filter((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}
