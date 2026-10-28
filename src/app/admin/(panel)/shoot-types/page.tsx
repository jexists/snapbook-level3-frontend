import type { Metadata } from 'next';
import { ShootTypeEditor } from '@/features/admin/ShootTypeEditor';

// 로그인 확인 뒤에 그려지는 화면이라 즉시 이동 검사에서 뺀다 (layout.tsx 참고)
export const instant = false;

export const metadata: Metadata = { title: '촬영 종류' };

export default function ShootTypesPage() {
  return (
    <div className="max-w-[880px]">
      <ShootTypeEditor />
    </div>
  );
}
