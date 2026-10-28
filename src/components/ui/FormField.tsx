import { useId, type ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** 라벨, 입력칸, 안내·오류 문구를 한 묶음으로 보여 준다 */
export function FormField({ label, error, hint, optional, children }: FormFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-faint">(선택)</span>}
      </label>
      {children({ id, describedBy: message ? messageId : undefined, invalid: Boolean(error) })}
      {message && (
        <p id={messageId} className={error ? 'text-small text-danger' : 'text-small text-ink-faint'}>
          {message}
        </p>
      )}
    </div>
  );
}
