import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SurfaceCardProps {
  children: ReactNode;
  className?: string;
}

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.45)]',
        className,
      )}
    >
      {children}
    </section>
  );
}
