import { Badge } from '@/components/ui/Badge';
import { CHANNEL_LABELS } from '@/lib/labels';
import { formatPrice } from '@/lib/time';
import type { AdminReservation } from '@/types/api';
import { AiNoteSection } from './AiNoteSection';

/** 관리자만 보는 예약 정보: 연락처, 예약 경로, 노쇼 이력, 손님 글, AI 정리 */
export function ReservationInfo({ reservation, layout = 'inline' }: { reservation: AdminReservation; layout?: 'inline' | 'grid' }) {
  const { customer } = reservation;
  const badges = (
    <>
      {!customer.hasAccount && <Badge>계정 없음</Badge>}
      {reservation.noShowCount > 0 && <Badge tone="danger">노쇼 이력 {reservation.noShowCount}회</Badge>}
    </>
  );
  return (
    <div className="flex flex-col gap-4 text-[14px]">
      {layout === 'grid' ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-line/70 pb-5 sm:grid-cols-4">
          {[
            ['손님', <span key="name" className="flex flex-wrap items-center gap-2">{customer.name}{badges}</span>],
            ['연락처', formatPhone(customer.phone)],
            ['예약 경로', CHANNEL_LABELS[reservation.channel]],
            ['가격', formatPrice(reservation.price)],
          ].map(([label, value]) => (
            <div key={label as string} className="flex flex-col gap-1">
              <dt className="text-[12px] text-ink-faint">{label}</dt>
              <dd className="text-[15px] tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-ink-soft">
          <span>
            <span className="text-ink">{customer.name}</span> {formatPhone(customer.phone)}
          </span>
          <span>예약 경로 {CHANNEL_LABELS[reservation.channel]}</span>
          <span>{formatPrice(reservation.price)}</span>
          {badges}
        </div>
      )}
      {(reservation.purpose || reservation.specialRequest) && (
        <div>
          <p className="text-[12px] text-ink-faint">손님이 쓴 글</p>
          {reservation.purpose && <p className="mt-1">사용 목적: {reservation.purpose}</p>}
          {reservation.specialRequest && <p className="mt-1 whitespace-pre-wrap leading-relaxed">{reservation.specialRequest}</p>}
        </div>
      )}
      <AiNoteSection note={reservation.aiNote} hasRequest={Boolean(reservation.purpose || reservation.specialRequest)} />
    </div>
  );
}

export function formatPhone(phone: string) {
  return phone.replace(/^(\d{3})(\d{4})(\d{4})$/, '$1-$2-$3');
}
