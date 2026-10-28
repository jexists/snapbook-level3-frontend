import { Suspense } from 'react';
import { Loading } from '@/components/ui/states';
import { AdminShell } from '@/features/admin/AdminShell';
import { RequireRole } from '@/features/auth/RequireRole';

// 관리자 화면은 브라우저에서 로그인 정보를 확인한 뒤에야 그릴 수 있어서
// 미리 그려 두는 "즉시 이동" 검사에서 뺀다 (Next.js 권장 방법).
export const instant = false;

export default function AdminPanelLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <Suspense fallback={<Loading />}>
      <RequireRole role="admin">
        <AdminShell>{children}</AdminShell>
      </RequireRole>
    </Suspense>
  );
}
