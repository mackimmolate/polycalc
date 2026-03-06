import { getSupabaseClientOrThrow } from '@/lib/supabase/client';

export function asSupabaseErrorMessage(error: { message?: string; details?: string | null }) {
  const details = error.details?.trim();
  if (details) {
    return `${error.message} (${details})`;
  }

  return error.message ?? 'Okänt databasfel';
}

export async function requireAuthenticatedSession(entityLabel: string) {
  const supabase = getSupabaseClientOrThrow();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error('Det gick inte att kontrollera inloggning.');
  }

  if (!data.session) {
    throw new Error(`Du måste vara inloggad för att ändra ${entityLabel}.`);
  }
}
