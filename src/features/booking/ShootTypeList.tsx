import { ButtonLink } from '@/components/ui/Button';
import { RetryState, Skeleton } from '@/components/ui/states';
import { ToastOnMount } from '@/components/ui/ToastOnMount';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/time';
import type { ShootType } from '@/types/api';

/** 첫 화면의 촬영 종류·가격 안내 (로그인 없이 볼 수 있어서 서버에서 바로 가져온다) */
export async function ShootTypeList() {
  let shootTypes: ShootType[];
  try {
    shootTypes = await api<ShootType[]>('/shoot-types');
  } catch {
    return (
      <>
        <ToastOnMount message="촬영 종류를 불러오지 못했어요. 새로고침해 주세요." />
        <RetryState action={<ButtonLink href="/" variant="secondary">새로고침</ButtonLink>} />
      </>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {shootTypes.map((shootType) => (
        <li key={shootType.id} className="flex flex-col gap-6 rounded-panel border border-line p-6">
          <div className="flex-1">
            <h3 className="text-lead font-semibold">{shootType.name}</h3>
            {shootType.description && <p className="mt-1 text-small text-ink-soft">{shootType.description}</p>}
          </div>
          <p className="flex items-baseline gap-3">
            <span className="text-lead font-semibold tabular-nums">{formatPrice(shootType.price)}</span>
            <span className="text-small text-ink-faint">{shootType.durationMin}분</span>
          </p>
          <ButtonLink href={`/book?type=${shootType.id}`} variant="secondary" className="w-full">
            예약하기
          </ButtonLink>
        </li>
      ))}
    </ul>
  );
}

/** 촬영 종류를 기다리는 동안 같은 높이로 자리를 잡아 둔다 */
export function ShootTypeListSkeleton() {
  return (
    <div role="status" aria-label="촬영 종류를 불러오는 중" className="grid gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-[220px]" />
      ))}
    </div>
  );
}
