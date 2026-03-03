import { Link } from 'react-router-dom';
import { SurfaceCard } from '@/components/ui/SurfaceCard';

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <SurfaceCard className="max-w-lg text-center">
        <p className="font-display text-4xl font-bold text-[var(--ink)]">404</p>
        <p className="mt-2 text-lg font-semibold text-[var(--ink)]">Page not found</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          This route does not exist. Use navigation to get back to the materials workspace.
        </p>
        <Link
          to="/materials"
          className="mt-5 inline-flex rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          Go to materials
        </Link>
      </SurfaceCard>
    </div>
  );
}
