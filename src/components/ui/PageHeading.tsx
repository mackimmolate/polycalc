import type { ReactNode } from 'react';

interface PageHeadingProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export function PageHeading({ title, description, actions }: PageHeadingProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[var(--ink)]">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
