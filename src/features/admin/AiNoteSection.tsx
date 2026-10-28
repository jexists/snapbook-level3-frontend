import type { AiNote } from '@/types/api';
import { formatDateTime } from '@/lib/time';

const STATUS_TEXT: Record<Exclude<AiNote['status'], 'done'>, string> = {
  failed: 'AI 정리를 만들지 못했어요. "AI 다시 정리"를 눌러 주세요.',
  no_key: 'GPT 키가 설정되지 않아 AI 정리를 만들지 않았어요.',
};

/** 손님이 쓴 글과 AI 정리를 나눠서 보여 준다 */
export function AiNoteSection({ note, hasRequest }: { note: AiNote | null; hasRequest: boolean }) {
  if (!hasRequest) return <p className="text-[14px] text-ink-faint">요청 글이 없어서 AI 정리가 없어요.</p>;
  if (!note) return <p className="text-[14px] text-ink-faint">AI가 요청 글을 정리하고 있어요. 잠시 뒤 새로고침해 주세요.</p>;
  if (note.status !== 'done' || !note.content) {
    return <p className="text-[14px] text-warning">{STATUS_TEXT[note.status === 'done' ? 'failed' : note.status]}</p>;
  }

  const { content } = note;
  const rows = [
    ['목적', content.purpose],
    ['분위기', content.mood],
    ['의상', content.outfit],
    ['주의사항', content.cautions],
  ];
  return (
    <div className="rounded-control border border-accent/30 bg-accent-soft/50 p-4">
      <p className="text-[12px] text-accent-ink">AI 정리, {formatDateTime(note.generatedAt)} 저장</p>
      <dl className="mt-2 grid grid-cols-[64px_1fr] gap-x-3 gap-y-1.5 text-[14px]">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-ink-soft">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <dt className="text-ink-soft">준비</dt>
        <dd>
          <ul className="flex flex-col gap-0.5">
            {content.checklist.map((item) => (
              <li key={item}>□ {item}</li>
            ))}
          </ul>
        </dd>
      </dl>
    </div>
  );
}
