import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeading } from '@/components/ui/PageHeading';
import { SurfaceCard } from '@/components/ui/SurfaceCard';
import { useAuth } from '@/app/providers/useAuth';

export function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, isConfigured, error, clearError, signInWithMagicLink, signOut } =
    useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    setPending(true);
    await signInWithMagicLink(email);
    setSubmitted(true);
    setPending(false);
  };

  const onSignOut = async () => {
    await signOut();
    navigate('/materials');
  };

  if (loading) {
    return (
      <SurfaceCard>
        <p className="text-sm text-[var(--muted)]">Kontrollerar session...</p>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Inloggning"
        description="Använd magic link för att få skrivbehörighet för material (skapa, redigera, ta bort)."
      />

      {!isConfigured ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-red-700">Supabase är inte konfigurerat.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Lägg in `VITE_SUPABASE_URL` och `VITE_SUPABASE_ANON_KEY` i `.env.local`.
          </p>
        </SurfaceCard>
      ) : null}

      {isConfigured && user ? (
        <SurfaceCard className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">Du är inloggad</p>
            <p className="text-sm text-[var(--muted)]">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--surface-soft)]"
          >
            Logga ut
          </button>
        </SurfaceCard>
      ) : null}

      {isConfigured && !user ? (
        <SurfaceCard>
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="space-y-1 text-sm">
              <span className="font-semibold text-[var(--ink)]">E-post</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none ring-[var(--accent)] transition focus:ring-2"
                placeholder="namn@foretag.se"
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? 'Skickar...' : 'Skicka magic link'}
            </button>
          </form>

          {submitted ? (
            <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--muted)]">
              Länk skickad. Kontrollera din e-post och öppna länken på samma enhet.
            </p>
          ) : null}
        </SurfaceCard>
      ) : null}

      {error ? (
        <SurfaceCard>
          <p className="text-sm font-semibold text-red-700">Inloggning misslyckades.</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{error}</p>
        </SurfaceCard>
      ) : null}
    </div>
  );
}
