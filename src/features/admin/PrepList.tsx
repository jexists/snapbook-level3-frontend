'use client';

import { useState } from 'react';
import type { PrepItem } from '@/types/api';

/** 이 날 준비할 것: 저장된 AI 정리의 한 줄 요약을 시간순으로 모은다 */
export function PrepList({ prep, kakaoPreview }: { prep: PrepItem[]; kakaoPreview: string | null }) {
  const [showKakao, setShowKakao] = useState(false);
  if (prep.length === 0 && !kakaoPreview) return null;

  return (
    <div className="rounded-panel bg-mist p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold">이 날 준비할 것</p>
        {kakaoPreview && (
          <button type="button" className="text-[13px] text-accent hover:underline" onClick={() => setShowKakao((value) => !value)} aria-expanded={showKakao}>
            {showKakao ? '카카오톡 미리보기 닫기' : '카카오톡 미리보기'}
          </button>
        )}
      </div>
      {prep.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1.5 text-[14px]">
          {prep.map((item) => (
            <li key={item.reservationId} className="grid grid-cols-[48px_1fr] gap-3">
              <span className="tabular-nums text-ink-soft">{item.time}</span>
              <span>
                {item.shootType} {item.headcount}명, {item.oneLine}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[14px] text-ink-soft">정리된 요청 글이 없어요.</p>
      )}
      {showKakao && kakaoPreview && (
        <div className="animate-rise mt-4 max-w-[340px] rounded-[16px] bg-[#fee500] p-4 text-[13px] leading-relaxed text-[#3c1e1e]">
          <p className="whitespace-pre-wrap">{kakaoPreview}</p>
          <p className="mt-2 text-[11px] opacity-70">미리보기예요. 실제로 보내지 않아요.</p>
        </div>
      )}
    </div>
  );
}
