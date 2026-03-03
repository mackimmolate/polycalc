import { NavLink, Outlet } from 'react-router-dom';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { cn } from '@/utils/cn';

const navigationItems = [
  { to: '/materials', label: 'Materials', end: true },
  { to: '/materials/new', label: 'Add Material' },
];

export function AppShell() {
  const { canInstall, installApp } = usePwaInstall();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <NavLink
            to="/materials"
            className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 shadow-sm transition hover:border-[var(--accent)]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] font-display text-sm font-bold text-white">
              PF
            </span>
            <span>
              <span className="block font-display text-lg font-bold leading-none text-[var(--ink)]">
                PolyFlow
              </span>
              <span className="block text-xs text-[var(--muted)]">Material library</span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-[var(--accent)] text-white shadow-sm'
                      : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {canInstall ? (
            <button
              type="button"
              onClick={installApp}
              className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Install App
            </button>
          ) : (
            <p className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--muted)]">
              PWA foundation enabled
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
