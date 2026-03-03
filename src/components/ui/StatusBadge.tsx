import type { MaterialStatus } from '@/types/material';
import { getStatusLabel } from '@/features/materials/utils/materialLabels';
import { cn } from '@/utils/cn';

interface StatusBadgeProps {
  status: MaterialStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
