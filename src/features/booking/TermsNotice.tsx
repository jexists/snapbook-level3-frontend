import { STUDIO } from '@/lib/labels';

const TERMS = [
  '예약 변경과 취소는 촬영 전날 18:00까지 할 수 있어요. 그 뒤에는 사진관으로 전화해 주세요.',
  '예약을 바꾸면 새 시간이 확정된 뒤 기존 예약은 자동으로 취소돼요.',
  '결제는 촬영 당일 현장에서 해요.',
  '예약하고 오지 않으면 다음 예약 때 참고할 수 있어요.',
  '이름과 연락처는 예약 관리에만 써요.',
];

export function TermsNotice() {
  return (
    <div className="rounded-panel bg-mist p-5 sm:p-6">
      <p className="text-lead font-semibold">이용 안내</p>
      <ul className="mt-3 flex flex-col gap-2.5 text-body text-ink-soft">
        {TERMS.map((term) => (
          <li key={term} className="flex gap-2.5">
            <span className="mt-2.5 size-1 shrink-0 rounded-full bg-ink-faint" aria-hidden />
            {term}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-small text-ink-faint">문의 {STUDIO.phone}</p>
    </div>
  );
}
