import { FormField } from '@/components/ui/FormField';
import { Input, Textarea } from '@/components/ui/inputs';
import { SelectMenu } from '@/components/ui/SelectMenu';
import { PURPOSE_OPTIONS } from '@/lib/labels';

export interface DetailsValues {
  headcount: string;
  purpose: string;
  specialRequest: string;
}

export const EMPTY_DETAILS: DetailsValues = { headcount: '1', purpose: '', specialRequest: '' };

export const REQUEST_MAX = 300;

/** 인원·사용 목적·특별 요청 입력 (손님 예약과 관리자 예약이 같이 쓴다) */
export function DetailsFields({
  values,
  errors,
  onChange,
}: {
  values: DetailsValues;
  errors: Record<string, string>;
  onChange: (name: keyof DetailsValues, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <FormField label="촬영 인원 (1~10명)" error={errors.headcount}>
        {(field) => (
          <Input
            id={field.id}
            type="number"
            min={1}
            max={10}
            inputMode="numeric"
            className="max-w-40"
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid}
            value={values.headcount}
            onChange={(event) => onChange('headcount', event.target.value)}
          />
        )}
      </FormField>
      <FormField label="사진 사용 목적" optional error={errors.purpose}>
        {(field) => (
          <SelectMenu
            id={field.id}
            className="max-w-60"
            aria-describedby={field.describedBy}
            value={values.purpose}
            onChange={(value) => onChange('purpose', value)}
            options={[
              { value: '', label: '고르지 않음' },
              ...PURPOSE_OPTIONS.map((option) => ({ value: option, label: option })),
            ]}
          />
        )}
      </FormField>
      <FormField
        label="특별 요청사항"
        optional
        error={errors.specialRequest}
        hint={`${values.specialRequest.length}/${REQUEST_MAX}자`}
      >
        {(field) => (
          <Textarea
            id={field.id}
            maxLength={REQUEST_MAX}
            aria-describedby={field.describedBy}
            aria-invalid={field.invalid}
            placeholder="원하는 분위기, 옷차림, 함께 오는 분 등을 적어 주세요."
            value={values.specialRequest}
            onChange={(event) => onChange('specialRequest', event.target.value)}
          />
        )}
      </FormField>
    </div>
  );
}

/** 화면에서 먼저 확인하는 인원 규칙 (최종 확인은 백엔드) */
export function validateDetails(values: DetailsValues): Record<string, string> {
  const headcount = Number(values.headcount);
  return Number.isInteger(headcount) && headcount >= 1 && headcount <= 10
    ? {}
    : { headcount: '촬영 인원은 1~10명으로 입력해 주세요.' };
}

export function detailsBody(values: DetailsValues) {
  return {
    headcount: Number(values.headcount),
    purpose: values.purpose || undefined,
    specialRequest: values.specialRequest.trim() || undefined,
  };
}
