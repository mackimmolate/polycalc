import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';

interface AuthRequiredStateProps {
  title?: string;
  description?: string;
}

export function AuthRequiredState({
  title = 'Inloggning krävs',
  description = 'Du behöver logga in för att skapa, redigera eller ta bort material.',
}: AuthRequiredStateProps) {
  return (
    <SurfaceCard className="max-w-xl">
      <p className="text-lg font-semibold text-[var(--ink)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
      <Link
        to="/auth"
        className="mt-4 inline-flex rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
      >
        Gå till inloggning
      </Link>
    </SurfaceCard>
  );
}
