'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/inputs';
import { SelectMenu } from '@/components/ui/SelectMenu';
import { Loading, RetryState } from '@/components/ui/states';
import { useToast } from '@/components/ui/Toast';
import { useFormErrors } from '@/hooks/use-form-errors';
import { api } from '@/lib/api';
import { notifyReservationsChanged } from '@/lib/events';
import { CHANNEL_LABELS } from '@/lib/labels';
import { formatPhoneInput, phoneDigits } from '@/lib/phone';
import { formatDate, formatMinutes, minutesOf } from '@/lib/time';
import type { AdminReservation, ReservationChannel } from '@/types/api';
import { firstBookableDate } from '../booking/booking-dates';
import { DetailsFields, detailsBody, EMPTY_DETAILS, validateDetails, type DetailsValues } from '../booking/DetailsFields';
import { WeekGrid, type SlotChoice } from '../booking/WeekGrid';
import { useAdminShootTypes } from './useShootTypes';

const CHANNELS = (Object.keys(CHANNEL_LABELS) as ReservationChannel[]).filter((channel) => channel !== 'online');

/** 전화·방문 예약을 관리자가 직접 넣는다 */
export function AdminReservationForm() {
  const router = useRouter();
  const params = useSearchParams();
  const presetDate = params.get('date');
  const presetTime = params.get('time');
  const { data: shootTypes, error, loading, reload } = useAdminShootTypes();
  const errors = useFormErrors();
  const toast = useToast();
  const [failure, setFailure] = useState<string | null>(null);
  const [gridVersion, setGridVersion] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<ReservationChannel>('phone');
  const [shootTypeId, setShootTypeId] = useState<number | null>(null);
  const [slot, setSlot] = useState<SlotChoice | null>(presetDate && presetTime ? { date: presetDate, time: presetTime } : null);
  const [details, setDetails] = useState<DetailsValues>(EMPTY_DETAILS);
  const [saving, setSaving] = useState(false);

  if (loading) return <Loading />;
  if (error || !shootTypes) return <RetryState action={<Button variant="secondary" onClick={reload}>다시 불러오기</Button>} />;
  const active = shootTypes.filter((item) => item.isActive);
  const shootType = active.find((item) => item.id === shootTypeId) ?? active[0];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const local = validateDetails(details);
    if (Object.keys(local).length > 0) return errors.setLocal(local);
    if (!slot) return toast.error('날짜와 시간을 골라 주세요.');
    errors.clear();
    setSaving(true);
    try {
      const created = await api<AdminReservation>('/admin/reservations', {
        method: 'POST',
        body: { name, phone: phoneDigits(phone), channel, shootTypeId: shootType.id, ...slot, ...detailsBody(details) },
      });
      notifyReservationsChanged();
      router.push(`/admin?date=${created.startAt.slice(0, 10)}`);
    } catch (caught) {
      errors.fromError(caught, setFailure);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]" noValidate>
      <div className="flex flex-col gap-5">
        <FormField label="이름" error={errors.fieldErrors.name}>
          {(field) => (
            <Input id={field.id} aria-describedby={field.describedBy} aria-invalid={field.invalid} placeholder="홍가상" value={name} onChange={(event) => { setName(event.target.value); errors.clearField('name'); }} />
          )}
        </FormField>
        <FormField label="전화번호" error={errors.fieldErrors.phone}>
          {(field) => (
            <Input id={field.id} type="tel" inputMode="numeric" maxLength={13} aria-describedby={field.describedBy} aria-invalid={field.invalid} placeholder="숫자만 적어 주세요" value={phone} onChange={(event) => { setPhone(formatPhoneInput(event.target.value)); errors.clearField('phone'); }} />
          )}
        </FormField>
        <FormField label="예약 경로" optional>
          {(field) => (
            <SelectMenu
              id={field.id}
              value={channel}
              onChange={(value) => setChannel(value as ReservationChannel)}
              options={CHANNELS.map((item) => ({ value: item, label: CHANNEL_LABELS[item] }))}
            />
          )}
        </FormField>
        <FormField label="촬영 종류">
          {(field) => (
            <SelectMenu
              id={field.id}
              value={String(shootType.id)}
              onChange={(value) => {
                setShootTypeId(Number(value));
                setSlot(null);
              }}
              options={active.map((item) => ({ value: String(item.id), label: `${item.name} (${item.durationMin}분)` }))}
            />
          )}
        </FormField>
        <DetailsFields
          values={details}
          errors={errors.fieldErrors}
          onChange={(field, value) => {
            setDetails((current) => ({ ...current, [field]: value }));
            errors.clearField(field);
          }}
        />
      </div>

      <div className="flex flex-col gap-5">
        <WeekGrid
          key={gridVersion}
          shootTypeId={shootType.id}
          durationMin={shootType.durationMin}
          initialDate={slot?.date ?? firstBookableDate('admin')}
          selected={slot}
          onSelect={setSlot}
        />
        <div className="flex flex-wrap items-center justify-end gap-2">
          <p className="mr-auto text-[15px] font-semibold" aria-live="polite">
            {slot && `${formatDate(slot.date)} ${slot.time}~${formatMinutes(minutesOf(slot.time) + shootType.durationMin)}`}
          </p>
          <Button variant="secondary" onClick={() => router.back()}>취소</Button>
          <Button type="submit" loading={saving}>예약 추가</Button>
        </div>
      </div>
      <AlertDialog
        open={failure !== null}
        title="예약을 추가하지 못했어요"
        message={failure ?? ''}
        onClose={() => {
          setFailure(null);
          setSlot(null);
          setGridVersion((value) => value + 1);
        }}
      />
    </form>
  );
}
