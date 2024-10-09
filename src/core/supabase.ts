import { createClient } from '@supabase/supabase-js';
import { logError } from './error.ts';

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

export default supabase;

export async function initSupabaseSession() {
  try {
    const session = await getSession();

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

export const Status_LoggedIn = 'logged-in';
export const Status_Anonymous = 'anonymous';
export async function getUserLoginStatus() {
  try {
    const user = await getUser();

    if (!user) return null;

    if (user.is_anonymous) return Status_Anonymous;

    return Status_LoggedIn;
  } catch (err) {
    logError(err);
  }

  return null;
}

async function getSession() {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    if (session) return session;
  } catch (err) {
    logError(err);
  }

  return null;
}

async function getUser() {
  try {
    const session = await getSession();

    if (!session) return null;

    if (session.user) return session.user;
  } catch (err) {
    logError(err);
  }

  return null;
}

export async function getUserAvatar() {
  try {
    const user = await getUser();

    if (!user) return null;

    return user.user_metadata?.avatar_url as string;
  } catch (err) {
    logError(err);
  }

  return null;
}
