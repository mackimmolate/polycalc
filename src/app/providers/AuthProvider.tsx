import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext, type AuthContextValue } from '@/app/providers/auth-context';
import { getSupabaseClientOrThrow, hasSupabaseConfig } from '@/lib/supabase/client';

function getHashAuthParams(): URLSearchParams | null {
  const rawHash = window.location.hash.replace(/^#/, '');
  if (!rawHash) {
    return null;
  }

  const candidates = new Set<string>();
  candidates.add(rawHash);

  const fragmentParts = rawHash.split('#');
  if (fragmentParts.length > 1) {
    candidates.add(fragmentParts[fragmentParts.length - 1]);
  }

  const questionIndex = rawHash.indexOf('?');
  if (questionIndex >= 0 && questionIndex + 1 < rawHash.length) {
    candidates.add(rawHash.slice(questionIndex + 1));
  }

  for (const candidate of candidates) {
    const normalized = candidate.startsWith('/') ? candidate.slice(1) : candidate;
    const params = new URLSearchParams(normalized);
    if (
      params.has('access_token') ||
      params.has('refresh_token') ||
      params.has('error') ||
      params.has('error_description') ||
      params.has('error_code')
    ) {
      return params;
    }
  }

  return null;
}

function normalizeAuthError(value: string | null) {
  if (!value) {
    return null;
  }

  return decodeURIComponent(value.replace(/\+/g, ' '));
}

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      if (!isMounted) {
        return;
      }

      setSession(updatedSession);
      setLoading(false);
    });

    const bootstrapSession = async () => {
      const callbackParams = getHashAuthParams();

      if (callbackParams) {
        const accessToken = callbackParams.get('access_token');
        const refreshToken = callbackParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            if (isMounted) {
              setError('Inloggning misslyckades vid bekräftelse av länken.');
              setLoading(false);
            }
            window.location.hash = '/auth';
            return;
          }

          window.location.hash = '/materials';
        } else {
          const callbackError = normalizeAuthError(
            callbackParams.get('error_description') ?? callbackParams.get('error'),
          );
          if (callbackError && isMounted) {
            setError(callbackError);
          }
          window.location.hash = '/auth';
        }
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError('Det gick inte att läsa sessionen.');
      } else {
        setSession(data.session);
      }

      setLoading(false);
    };

    void bootstrapSession();

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
