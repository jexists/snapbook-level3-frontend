import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/time';
import type { ShootType } from '@/types/api';

interface ShootTypePickerProps {
  shootTypes: ShootType[];
  selectedId: number | null;
  /** 이미 다가오는 예약이 있는 촬영 종류 */
  bookedIds?: number[];
  onSelect: (shootType: ShootType) => void;
}

export function ShootTypePicker({ shootTypes, selectedId, bookedIds = [], onSelect }: ShootTypePickerProps) {
  return (
    <div role="radiogroup" aria-label="촬영 종류" className="flex flex-col gap-3">
      {shootTypes.map((shootType) => {
        const selected = shootType.id === selectedId;
        return (
          <button
            key={shootType.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(shootType)}
            className={cn(
              'flex min-h-20 items-center justify-between gap-4 rounded-panel border-2 p-5 text-left transition-colors',
              selected ? 'border-accent bg-accent-soft' : 'border-line hover:border-ink-faint',
            )}
          >
            <span className="flex flex-col gap-1">
              <span className="text-lead font-semibold">
                {shootType.name}
                <span className="ml-2 text-small font-normal text-ink-faint">{shootType.durationMin}분</span>
                {bookedIds.includes(shootType.id) && (
                  <span className="ml-2 align-middle">
                    <Badge tone="accent">예약 있음</Badge>
                  </span>
                )}
              </span>
              <span className="text-small text-ink-soft">{shootType.description}</span>
            </span>
            <span className="shrink-0 text-lead font-semibold tabular-nums">{formatPrice(shootType.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
