// 예약이 바뀌면 현황 숫자·달력 같은 다른 부분이 다시 불러오도록 알린다.
const EVENT = 'studio:reservations-changed';

export function notifyReservationsChanged() {
  window.dispatchEvent(new Event(EVENT));
}

export function onReservationsChanged(listener: () => void) {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
