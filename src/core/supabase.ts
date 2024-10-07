import { createClient } from '@supabase/supabase-js';
import { logError } from './error.ts';

const {
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY,
} = import.meta.env;

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

export default supabase;

export async function initSupabaseSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    if (session && session.user) {
      const parenthetical = session.user.is_anonymous ? '(anonymously)' : '';
      console.log(`already signed in ${parenthetical}...`, session.user);
    } else {
      const { data: anonymousUser, error } =
        await supabase.auth.signInAnonymously();

      if (error) throw error;

      console.log('signed in anonymously...', anonymousUser);
    }
  } catch (err) {
    logError(err);
  }
}
