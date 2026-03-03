import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext, type AuthContextValue } from '@/app/providers/auth-context';
import { getSupabaseClientOrThrow, hasSupabaseConfig } from '@/lib/supabase/client';

export function AuthProvider({ children }: PropsWithChildren) {
  const isConfigured = hasSupabaseConfig();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const supabase = getSupabaseClientOrThrow();
    let isMounted = true;

    void supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted) {
          return;
        }

        if (sessionError) {
          setError('Det gick inte att läsa sessionen.');
        } else {
          setSession(data.session);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    if (window.location.hash.includes('access_token=')) {
      const cleanHash = '#/materials';
      window.history.replaceState({}, document.title, `${window.location.pathname}${cleanHash}`);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signInWithMagicLink = useCallback(
    async (email: string) => {
      if (!isConfigured) {
        setError('Supabase är inte konfigurerat.');
        return;
      }

      const supabase = getSupabaseClientOrThrow();
      setError(null);

      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      if (signInError) {
        setError(signInError.message);
      }
    },
    [isConfigured],
  );

  const signOut = useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    const supabase = getSupabaseClientOrThrow();
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
  }, [isConfigured]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      error,
      isConfigured,
      signInWithMagicLink,
      signOut,
      clearError,
    }),
    [session, loading, error, isConfigured, signInWithMagicLink, signOut, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
