import { STATUS_LABELS } from '@/lib/labels';
import type { ReservationStatus } from '@/types/api';
import { Badge, type BadgeTone } from './Badge';

const STATUS_TONES: Record<ReservationStatus, BadgeTone> = {
  confirmed: 'accent',
  completed: 'success',
  no_show: 'danger',
  cancelled_by_customer: 'neutral',
  cancelled_by_admin: 'neutral',
  changed: 'neutral',
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>;
}
