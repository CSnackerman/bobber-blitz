import { AuthError } from '@supabase/supabase-js';

export function logError(err: unknown) {
  if (err instanceof AuthError) {
    console.error(
      `[auth-error] status ${err.status} (${err.code}) -> ${err.name} - ${err.message}`
    );
  } else if (err instanceof Error) {
    console.error(`[error] ${err.name}: ${err.message}`);
  } else if (typeof err === 'object') {
    console.error(`[obj-error] ${JSON.stringify(err)}`);
  } else {
    console.error(`[???-error] ${err}`);
  }
}

export function getErrorDisplayMessage(err: unknown) {
  const isAuthError = err instanceof AuthError;
  const isStandardError = err instanceof Error;
  const isObjectError = typeof err === 'object';

  if (isAuthError) {
    if (err.code === 'validation_failed') {
      // invalid email
      if (err.message === 'Unable to validate email address: invalid format') {
        return 'Invalid email format';
      }

      // missing password
      if (err.message === 'Signup requires a valid password') {
        return 'Please enter a password';
      }
    }

    // user already exists (register)
    if (err.code === 'user_already_exists') {
      return 'That email is already being used';
    }

    // weak password
    if (err.code === 'weak_password') {
      return 'Password required length 6+';
    }

    // blank fields
    if (err.code === 'empty email') return 'Email cannot be blank';
    if (err.code === 'empty password') return 'Password cannot be blank';
    if (err.code === 'empty email password')
      return 'Email and password cannot be blank';

    // invalid login credentials
    if (err.message === 'Invalid login credentials') {
      return err.message;
    }
  }

  if (isStandardError) {
    return 'An error occurred';
  }

  if (isObjectError) {
    return 'An object error occurred';
  }

  return 'Unknown error occurred';
}
