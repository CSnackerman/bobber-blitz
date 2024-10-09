import { AuthError } from '@supabase/supabase-js';

export function logError(err: unknown) {
  if (err instanceof Error) {
    console.error(`[error] ${err.name}: ${err.message}`);
  } else if (err instanceof AuthError) {
    console.error(
      `[auth-error] (${err.code}) (${err.status}) ${err.name}: ${err.message}`
    );
  } else if (typeof err === 'object') {
    console.error(`[obj-error] ${JSON.stringify(err)}`);
  } else {
    console.error(`[???-error] ${err}`);
  }
}
