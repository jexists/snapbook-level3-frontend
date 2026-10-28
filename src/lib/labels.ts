import type { ReservationChannel, ReservationStatus } from '@/types/api';

export const STATUS_LABELS: Record<ReservationStatus, string> = {
  confirmed: '예약 확정',
  cancelled_by_customer: '손님 취소',
  cancelled_by_admin: '관리자 취소',
  changed: '변경됨',
  completed: '촬영 완료',
  no_show: '노쇼',
};

export const CHANNEL_LABELS: Record<ReservationChannel, string> = {
  online: '온라인',
  phone: '전화',
  visit: '방문',
  instagram: '인스타그램 DM',
  other: '기타',
};

export const PURPOSE_OPTIONS = ['여권·비자', '취업', '가족 기념', '프로필', '기타'];

export const STUDIO = {
  name: '마재원 사진관',
  phone: '02-000-0000',
  hours: '월~토 10:00~18:00',
  lunch: '점심 12:00~13:00',
  closed: '일요일 휴무',
};
