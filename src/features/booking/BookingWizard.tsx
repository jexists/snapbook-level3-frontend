'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/inputs';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/states';
import { Stepper } from '@/components/ui/Stepper';
import { useToast } from '@/components/ui/Toast';
import { useApi } from '@/hooks/use-api';
import { useFormErrors } from '@/hooks/use-form-errors';
import { ApiError, api, firstErrorMessage } from '@/lib/api';
import { formatDateTime, formatMinutes, formatPrice, formatDate, formatRange, minutesOf } from '@/lib/time';
import type { CustomerReservation, ShootType } from '@/types/api';
import { firstBookableDate } from './booking-dates';
import { DetailsFields, detailsBody, EMPTY_DETAILS, validateDetails, type DetailsValues } from './DetailsFields';
import { ShootTypePicker } from './ShootTypePicker';
import { TermsNotice } from './TermsNotice';
import { WeekGrid, type SlotChoice } from './WeekGrid';

const STEPS = ['촬영 종류', '날짜·시간', '인원·요청', '이용 안내', '확인'];

/**
 * 링크로 들어올 때마다 예약 단계를 처음부터 시작한다.
 * cacheComponents가 페이지 상태를 남겨 두므로 bfcacheId를 key로 써서 새 방문이면 새로 만든다.
 * 브라우저 뒤로/앞으로 가기에서는 bfcacheId가 그대로라 하던 단계가 남는다.
 * 첫 화면에서 고른 촬영 종류(?type=)가 있으면 날짜·시간 단계부터 시작한다.
 */
export function BookingWizard({ shootTypes }: { shootTypes: ShootType[] }) {
  const { bfcacheId } = useRouter();
  const typeParam = useSearchParams().get('type');
  const initialType = shootTypes.find((type) => String(type.id) === typeParam) ?? null;
  const loadUpcoming = useCallback(
    () => api<CustomerReservation[]>('/reservations/mine', { query: { filter: 'upcoming' } }),
    [],
  );
  const upcoming = useApi(loadUpcoming);

  if (upcoming.loading) return <Loading label="예약 내역을 확인하고 있어요" />;
  return (
    <Wizard
      key={`${bfcacheId}:${typeParam}`}
      shootTypes={shootTypes}
      initialType={initialType}
      upcoming={upcoming.data ?? []}
    />
  );
}

/** 같은 촬영 종류의 예약이 이미 있을 때 띄우는 창. 닫으면 다른 촬영 종류를 고를 수 있다. */
function ExistingReservationDialog({
  reservation,
  onClose,
}: {
  reservation: CustomerReservation | null;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <Modal open={reservation !== null} onClose={onClose} labelledBy="existing-reservation-title" sheet>
      {reservation && (
        <>
          <h2 id="existing-reservation-title" className="text-lead font-semibold">
            이미 {reservation.shootType.name} 예약이 있어요
          </h2>
          <p className="mt-2 text-body text-ink-soft">
            예약 내용을 확인하거나 변경하시겠어요? 다른 촬영은 창을 닫고 바로 예약할 수 있어요.
          </p>
          <div className="mt-4 flex flex-col gap-1 rounded-panel border border-line bg-white px-4 py-3">
            <span className="text-small text-ink-soft">{reservation.shootType.name}</span>
            <span className="text-body font-semibold">{formatRange(reservation.startAt, reservation.endAt)}</span>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              취소
            </Button>
            <Button onClick={() => router.replace(`/my/${reservation.id}`)}>예약 보러 가기</Button>
          </div>
        </>
      )}
    </Modal>
  );
}

function Wizard({
  shootTypes,
  initialType,
  upcoming,
}: {
  shootTypes: ShootType[];
  initialType: ShootType | null;
  /** 손님의 다가오는 예약. 촬영 종류마다 하나씩만 예약할 수 있게 확인한다 (불러오지 못하면 빈 목록) */
  upcoming: CustomerReservation[];
}) {
  const bookedOf = (type: ShootType | null) =>
    upcoming.find((reservation) => reservation.shootType.id === type?.id) ?? null;
  // 첫 화면에서 이미 예약한 촬영 종류를 골라 왔으면 종류 고르기부터 시작하고 창을 띄운다
  const initialBooked = bookedOf(initialType);
  const [step, setStep] = useState(initialType && !initialBooked ? 1 : 0);
  const [shootType, setShootType] = useState<ShootType | null>(initialBooked ? null : initialType);
  const [booked, setBooked] = useState<CustomerReservation | null>(initialBooked);
  const [slot, setSlot] = useState<SlotChoice | null>(null);
  const [details, setDetails] = useState<DetailsValues>(EMPTY_DETAILS);
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState<CustomerReservation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errors = useFormErrors();
  const toast = useToast();
  /** 마지막 단계에서 예약이 안 됐을 때 띄우는 창. 시간이 찼으면 닫을 때 시간 고르기로 돌아간다. */
  const [failure, setFailure] = useState<{ message: string; backToSlot: boolean } | null>(null);

  const goTo = (next: number) => {
    errors.clear();
    setStep(next);
  };

  function next() {
    if (step === 1 && !slot) return toast.error('날짜와 시간을 골라 주세요.');
    if (step === 2) {
      const local = validateDetails(details);
      if (Object.keys(local).length > 0) return errors.setLocal(local);
    }
    if (step === 3 && !agreed) return toast.error('이용 안내에 동의해야 예약할 수 있어요.');
    goTo(step + 1);
  }

  async function submit() {
    if (!shootType || !slot) return;
    errors.clear();
    setSubmitting(true);
    try {
      const reservation = await api<CustomerReservation>('/reservations', {
        method: 'POST',
        body: { shootTypeId: shootType.id, ...slot, ...detailsBody(details), agreeTerms: agreed },
      });
      setDone(reservation);
    } catch (error) {
      setFailure({
        message: firstErrorMessage(error),
        backToSlot: error instanceof ApiError && error.status === 409,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return <BookingDone reservation={done} />;

  const endTime = slot && shootType ? formatMinutes(minutesOf(slot.time) + shootType.durationMin) : null;

  return (
    <div className="flex flex-col gap-8">
      <Stepper steps={STEPS} current={step} />
      <div key={step} className="animate-rise">
        <h2 className="mb-6 text-heading font-semibold tracking-[-0.02em]">{STEP_TITLES[step]}</h2>

        {step === 0 && (
          <ShootTypePicker
            shootTypes={shootTypes}
            selectedId={shootType?.id ?? null}
            bookedIds={upcoming.map((reservation) => reservation.shootType.id)}
            onSelect={(picked) => {
              const existing = bookedOf(picked);
              if (existing) return setBooked(existing);
              if (picked.id !== shootType?.id) setSlot(null);
              setShootType(picked);
              goTo(1);
            }}
          />
        )}

        {step === 1 && shootType && (
          <WeekGrid
            shootTypeId={shootType.id}
            durationMin={shootType.durationMin}
            initialDate={slot?.date ?? firstBookableDate('customer')}
            selected={slot}
            onSelect={setSlot}
            summary={
              <div
                className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-1 rounded-panel bg-mist px-5 py-3 text-body"
                aria-live="polite"
              >
                <span className="text-small text-ink-soft">{shootType.name} {shootType.durationMin}분</span>
                {slot ? (
                  <span className="font-semibold">{formatDate(slot.date)} {slot.time}~{endTime}</span>
                ) : (
                  <span className="text-ink-soft">시작 시간을 누르면 {shootType.durationMin}분이 잡혀요.</span>
                )}
              </div>
            }
          />
        )}

        {step === 2 && (
          <DetailsFields
            values={details}
            errors={errors.fieldErrors}
            onChange={(name, value) => {
              setDetails((current) => ({ ...current, [name]: value }));
              errors.clearField(name);
            }}
          />
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <TermsNotice />
            <Checkbox
              label="위 내용을 확인했고 동의해요"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
          </div>
        )}

        {step === 4 && shootType && slot && (
          <dl className="grid grid-cols-[88px_1fr] gap-y-3 rounded-panel bg-mist p-5 text-body sm:p-6">
            <dt className="text-ink-soft">촬영</dt>
            <dd className="font-semibold">{shootType.name} ({shootType.durationMin}분)</dd>
            <dt className="text-ink-soft">날짜·시간</dt>
            <dd className="font-semibold">{formatDate(slot.date)} {slot.time}~{endTime}</dd>
            <dt className="text-ink-soft">인원</dt>
            <dd>{details.headcount}명</dd>
            {details.purpose && (
              <>
                <dt className="text-ink-soft">사용 목적</dt>
                <dd>{details.purpose}</dd>
              </>
            )}
            {details.specialRequest.trim() && (
              <>
                <dt className="text-ink-soft">요청사항</dt>
                <dd className="whitespace-pre-wrap">{details.specialRequest.trim()}</dd>
              </>
            )}
            <dt className="text-ink-soft">가격</dt>
            <dd>{formatPrice(shootType.price)} (촬영 당일 현장 결제)</dd>
          </dl>
        )}

      </div>

      <ExistingReservationDialog reservation={booked} onClose={() => setBooked(null)} />

      <AlertDialog
        open={failure !== null}
        title="예약하지 못했어요"
        message={failure?.message ?? ''}
        onClose={() => {
          if (failure?.backToSlot) {
            setSlot(null);
            goTo(1);
          }
          setFailure(null);
        }}
      />

      {step > 0 && (
        <div className="flex justify-between gap-3 border-t border-line pt-6">
          <Button variant="secondary" onClick={() => goTo(step - 1)}>
            이전
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>다음</Button>
          ) : (
            <Button loading={submitting} onClick={submit}>
              예약하기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const STEP_TITLES = [
  '촬영 종류를 선택해 주세요',
  '날짜와 시간을 선택해 주세요',
  '촬영 정보를 입력해 주세요',
  '이용 안내를 확인해 주세요',
  '예약 내용을 확인해 주세요',
];

function BookingDone({ reservation }: { reservation: CustomerReservation }) {
  return (
    <div className="animate-rise flex flex-col items-start py-6">
      <h2 className="text-title font-semibold tracking-[-0.02em]">예약했어요</h2>
      <dl className="mt-6 grid w-full grid-cols-[88px_1fr] gap-y-3 rounded-panel bg-mist p-5 text-body sm:p-6">
        <dt className="text-ink-soft">촬영</dt>
        <dd className="font-semibold">{reservation.shootType.name}</dd>
        <dt className="text-ink-soft">날짜·시간</dt>
        <dd className="font-semibold">{formatRange(reservation.startAt, reservation.endAt)}</dd>
      </dl>
      <p className="mt-4 text-small text-ink-soft">
        결제는 촬영 당일 현장에서 해요. 변경과 취소는 {formatDateTime(reservation.deadline)}까지 할 수 있어요.
      </p>
      <ButtonLink href="/my" className="mt-8 w-full sm:w-auto">
        예약 확인하기
      </ButtonLink>
    </div>
  );
}
