'use client';

import Link from 'next/link';
import { useCallback, useState, type FormEvent, type MouseEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/inputs';
import { SelectMenu } from '@/components/ui/SelectMenu';
import { EmptyState, Loading, RetryState } from '@/components/ui/states';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { CHANNEL_LABELS, STATUS_LABELS } from '@/lib/labels';
import { formatRange } from '@/lib/time';
import type { AdminReservation, Paginated } from '@/types/api';
import { formatPhone } from './ReservationInfo';
import { useAdminShootTypes } from './useShootTypes';

interface Filters {
  q: string;
  from: string;
  to: string;
  status: string;
  shootTypeId: string;
  channel: string;
}

const EMPTY_FILTERS: Filters = { q: '', from: '', to: '', status: '', shootTypeId: '', channel: '' };
const PAGE_SIZE = 20;
/** 머리 행과 결과 행이 같이 쓰는 칸 나눔 */
const ROW_GRID = 'sm:grid-cols-[1.4fr_1fr_1.2fr_110px] sm:items-center sm:gap-4';
/** 날짜 칸 아무 데나 눌러도 달력이 뜨게 한다 */
const openPicker = (event: MouseEvent<HTMLInputElement>) => event.currentTarget.showPicker?.();

export function ReservationSearch() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const { data: shootTypes } = useAdminShootTypes();
  const load = useCallback(
    () => api<Paginated<AdminReservation>>('/admin/reservations', { query: { ...filters, page, size: PAGE_SIZE } }),
    [filters, page],
  );
  const { data, error, loading, reload } = useApi(load);
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const set = (name: keyof Filters) => (value: string) => setDraft((current) => ({ ...current, [name]: value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setFilters(draft);
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={submit} className="grid gap-4 rounded-panel bg-mist p-5 sm:grid-cols-3 lg:grid-cols-6">
        <FormField label="이름 또는 번호">
          {(field) => <Input id={field.id} value={draft.q} placeholder="박가상" onChange={(event) => set('q')(event.target.value)} />}
        </FormField>
        <FormField label="시작 날짜">
          {(field) => <Input id={field.id} type="date" value={draft.from} onClick={openPicker} onChange={(event) => set('from')(event.target.value)} />}
        </FormField>
        <FormField label="끝 날짜">
          {(field) => <Input id={field.id} type="date" value={draft.to} onClick={openPicker} onChange={(event) => set('to')(event.target.value)} />}
        </FormField>
        <FormField label="상태">
          {(field) => (
            <SelectMenu
              id={field.id}
              value={draft.status}
              onChange={set('status')}
              options={[{ value: '', label: '전체' }, ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))]}
            />
          )}
        </FormField>
        <FormField label="촬영 종류">
          {(field) => (
            <SelectMenu
              id={field.id}
              value={draft.shootTypeId}
              onChange={set('shootTypeId')}
              options={[{ value: '', label: '전체' }, ...(shootTypes ?? []).map((item) => ({ value: String(item.id), label: item.name }))]}
            />
          )}
        </FormField>
        <FormField label="예약 경로">
          {(field) => (
            <SelectMenu
              id={field.id}
              value={draft.channel}
              onChange={set('channel')}
              options={[{ value: '', label: '전체' }, ...Object.entries(CHANNEL_LABELS).map(([value, label]) => ({ value, label }))]}
            />
          )}
        </FormField>
        <div className="flex justify-end gap-2 sm:col-span-3 lg:col-span-6">
          <Button variant="secondary" onClick={() => { setDraft(EMPTY_FILTERS); setFilters(EMPTY_FILTERS); setPage(1); }}>
            조건 지우기
          </Button>
          <Button type="submit">찾기</Button>
        </div>
      </form>

      {loading && <Loading />}
      {error && <RetryState action={<Button variant="secondary" onClick={reload}>다시 불러오기</Button>} />}
      {data && !loading && data.items.length === 0 && (
        <EmptyState title="조건에 맞는 예약이 없어요" description="조건을 줄이거나 날짜 범위를 넓혀 보세요." />
      )}
      {data && !loading && data.items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-panel border border-line/70">
            <div className={`hidden bg-mist px-5 py-2.5 text-[13px] text-ink-soft sm:grid ${ROW_GRID}`} aria-hidden>
              <span>날짜·시간</span>
              <span>촬영</span>
              <span>손님</span>
              <span>상태</span>
            </div>
            <ul className="divide-y divide-line/70 border-line/70 sm:border-t">
              {data.items.map((item) => (
                <li key={item.id}>
                  <Link href={`/admin/reservations/${item.id}`} className={`grid justify-items-start gap-1 px-5 py-4 text-left transition-colors hover:bg-mist ${ROW_GRID}`}>
                    <span className="text-[15px] font-semibold">{formatRange(item.startAt, item.endAt)}</span>
                    <span className="text-[14px]">{item.shootType.name} {item.headcount}명</span>
                    <span className="text-[14px] text-ink-soft">
                      {item.customer.name} {formatPhone(item.customer.phone)}
                    </span>
                    <StatusBadge status={item.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>이전</Button>
              <span className="text-[14px] tabular-nums text-ink-soft">{page} / {pages}</span>
              <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>다음</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
