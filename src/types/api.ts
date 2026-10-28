// 백엔드 응답 모양 (backend/src/modules/*/ *.views.ts, *.dto.ts 와 이름을 맞춘다)

export type Role = 'customer' | 'admin';

export interface AuthUser {
  id: number;
  role: Role;
  name: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

export interface ShootType {
  id: number;
  name: string;
  description: string | null;
  durationMin: number;
  price: number;
  isActive: boolean;
}

export type ReservationStatus =
  | 'confirmed'
  | 'cancelled_by_customer'
  | 'cancelled_by_admin'
  | 'changed'
  | 'completed'
  | 'no_show';

export type ReservationChannel = 'online' | 'phone' | 'visit' | 'instagram' | 'other';

export interface CustomerReservation {
  id: number;
  shootType: { id: number; name: string; durationMin: number };
  startAt: string;
  endAt: string;
  headcount: number;
  purpose: string | null;
  specialRequest: string | null;
  price: number;
  status: ReservationStatus;
  deadline: string;
  canModify: boolean;
}

export interface AiNoteContent {
  purpose: string;
  mood: string;
  outfit: string;
  cautions: string;
  checklist: string[];
}

export interface AiNote {
  status: 'done' | 'failed' | 'no_key';
  content: AiNoteContent | null;
  oneLine: string | null;
  generatedAt: string;
}

export interface AdminReservation extends Omit<CustomerReservation, 'canModify'> {
  customer: { id: number; name: string; phone: string; hasAccount: boolean };
  channel: ReservationChannel;
  noShowCount: number;
  aiNote: AiNote | null;
  changedFromId: number | null;
  createdAt: string;
}

export interface SlotView {
  time: string;
  available: boolean;
  reason: string | null;
  reasonText: string | null;
}

export interface WeekAvailability {
  weekStart: string;
  shootTypeId: number;
  durationMin: number;
  hasPrevWeek: boolean;
  hasNextWeek: boolean;
  days: { date: string; weekday: number; slots: SlotView[] }[];
}

export interface DayCount {
  date: string;
  count: number;
}

export interface PrepItem {
  reservationId: number;
  time: string;
  shootType: string;
  headcount: number;
  oneLine: string;
}

export interface DaySchedule {
  date: string;
  isToday: boolean;
  isTomorrow: boolean;
  reservations: AdminReservation[];
  prep: PrepItem[];
  kakaoPreview: string | null;
}

export interface MonthStats {
  month: string;
  reservations: number;
  cancelled: number;
  noShow: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

/** 백엔드 공통 오류 형식 */
export interface ErrorBody {
  statusCode: number;
  message: string;
  fieldErrors?: Record<string, string>;
}
