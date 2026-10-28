'use client';

import { useState, type FormEvent } from 'react';
import { PageTitle } from '@/components/layout/PageTitle';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FormField } from '@/components/ui/FormField';
import { Checkbox, Input } from '@/components/ui/inputs';
import { SelectMenu } from '@/components/ui/SelectMenu';
import { Loading, RetryState } from '@/components/ui/states';
import { useToast } from '@/components/ui/Toast';
import { useFormErrors } from '@/hooks/use-form-errors';
import { api, errorMessage } from '@/lib/api';
import { formatPrice } from '@/lib/time';
import type { ShootType } from '@/types/api';
import { useAdminShootTypes } from './useShootTypes';

const DURATIONS = [30, 60, 90, 120];

interface Draft {
  name: string;
  description: string;
  durationMin: string;
  price: string;
  isActive: boolean;
}

const toDraft = (item?: ShootType): Draft => ({
  name: item?.name ?? '',
  description: item?.description ?? '',
  durationMin: String(item?.durationMin ?? 30),
  price: String(item?.price ?? 0),
  isActive: item?.isActive ?? true,
});

export function ShootTypeEditor() {
  const { data, error, loading, reload } = useAdminShootTypes();
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ShootType | null>(null);
  const [removing, setRemoving] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const toast = useToast();

  async function remove() {
    if (!deleting) return;
    setRemoving(true);
    try {
      await api(`/admin/shoot-types/${deleting.id}`, { method: 'DELETE' });
      toast.success('촬영 종류를 지웠어요.');
      reload();
    } catch (caught) {
      setFailure(errorMessage(caught));
    } finally {
      setRemoving(false);
      setDeleting(null);
    }
  }

  const done = () => {
    setEditingId(null);
    reload();
  };

  return (
    <>
      <PageTitle
        title="촬영 종류"
        action={
          <Button disabled={editingId === 'new'} onClick={() => setEditingId('new')}>
            촬영 종류 추가
          </Button>
        }
      />
      {loading && !data ? (
        <Loading />
      ) : error || !data ? (
        <RetryState action={<Button variant="secondary" onClick={reload}>다시 불러오기</Button>} />
      ) : (
        <div className="flex flex-col gap-4">
          {editingId === 'new' && (
            <div className="rounded-panel bg-mist p-5">
              <ShootTypeForm onDone={done} onCancel={() => setEditingId(null)} />
            </div>
          )}
          <ul className="divide-y divide-line/70 overflow-hidden rounded-panel border border-line/70">
            {data.map((item) =>
              editingId === item.id ? (
                <li key={item.id} className="bg-mist p-5">
                  <ShootTypeForm item={item} onDone={done} onCancel={() => setEditingId(null)} />
                </li>
              ) : (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[17px] font-semibold">
                      {item.name}
                      {!item.isActive && <span className="ml-2 text-[13px] font-normal text-ink-faint">판매 중지</span>}
                    </span>
                    <span className="text-[14px] text-ink-soft">
                      {item.durationMin}분, {formatPrice(item.price)}
                      {item.description ? `. ${item.description}` : ''}
                    </span>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(item.id)}>수정</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleting(item)}>삭제</Button>
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
      <ConfirmDialog
        open={deleting !== null}
        title={`‘${deleting?.name ?? ''}’을 지울까요?`}
        description="지우면 되돌릴 수 없어요."
        confirmLabel="삭제"
        tone="danger"
        loading={removing}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
      <AlertDialog open={failure !== null} title="촬영 종류를 지우지 못했어요" message={failure ?? ''} onClose={() => setFailure(null)} />
    </>
  );
}

function ShootTypeForm({ item, onDone, onCancel }: { item?: ShootType; onDone: () => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(item));
  const [saving, setSaving] = useState(false);
  const errors = useFormErrors();
  const toast = useToast();
  const set = <K extends keyof Draft>(name: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [name]: value }));
    errors.clearField(name);
  };

  const [confirming, setConfirming] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (item) setConfirming(true);
    else void save();
  }

  async function save() {
    setConfirming(false);
    setSaving(true);
    errors.clear();
    const body = {
      name: draft.name,
      description: draft.description || undefined,
      durationMin: Number(draft.durationMin),
      price: Number(draft.price),
      isActive: draft.isActive,
    };
    try {
      await api(item ? `/admin/shoot-types/${item.id}` : '/admin/shoot-types', { method: item ? 'PATCH' : 'POST', body });
      toast.success(item ? '촬영 종류를 저장했어요.' : '촬영 종류를 추가했어요.');
      onDone();
    } catch (caught) {
      errors.fromError(caught);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
      <FormField label="이름" error={errors.fieldErrors.name}>
        {(field) => <Input id={field.id} aria-invalid={field.invalid} aria-describedby={field.describedBy} value={draft.name} onChange={(event) => set('name', event.target.value)} />}
      </FormField>
      <FormField label="설명" optional error={errors.fieldErrors.description}>
        {(field) => <Input id={field.id} aria-describedby={field.describedBy} value={draft.description} onChange={(event) => set('description', event.target.value)} />}
      </FormField>
      <FormField label="촬영 시간" error={errors.fieldErrors.durationMin}>
        {(field) => (
          <SelectMenu
            id={field.id}
            value={String(draft.durationMin)}
            onChange={(value) => set('durationMin', value)}
            options={DURATIONS.map((minutes) => ({ value: String(minutes), label: `${minutes}분` }))}
          />
        )}
      </FormField>
      <FormField label="가격(원)" error={errors.fieldErrors.price}>
        {(field) => <Input id={field.id} type="number" min={0} step={1000} inputMode="numeric" aria-invalid={field.invalid} aria-describedby={field.describedBy} value={draft.price} onChange={(event) => set('price', event.target.value)} />}
      </FormField>
      <Checkbox label="지금 예약받기" checked={draft.isActive} onChange={(event) => set('isActive', event.target.checked)} />
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button variant="secondary" onClick={onCancel}>닫기</Button>
        <Button type="submit" loading={saving}>{item ? '저장' : '추가'}</Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="촬영 종류를 저장할까요?"
        description="가격과 시간을 바꿔도 이미 들어온 예약의 가격과 시간은 그대로예요."
        confirmLabel="저장"
        onConfirm={save}
        onClose={() => setConfirming(false)}
      />
    </form>
  );
}
