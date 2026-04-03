import { useCallback, useState } from 'react';

import { supabase } from '../services/supabase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 9;

function normalizeAuthError(message: string, isLogin: boolean) {
  const normalized = message.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }

  if (normalized.includes('user already registered')) {
    return 'An account with this email already exists.';
  }

  if (normalized.includes('password')) {
    return `Password must be more than 8 characters.`;
  }

  if (normalized.includes('email')) {
    return 'Please enter a valid email address.';
  }

  return isLogin
    ? 'Unable to log in right now. Please try again.'
    : 'Unable to create your account right now. Please try again.';
}

export function useAuthViewModel() {
  const [name, setNameState] = useState('');
  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  const setName = useCallback((value: string) => {
    setError(null);
    setNameState(value);
  }, []);

  const setEmail = useCallback((value: string) => {
    setError(null);
    setEmailState(value);
  }, []);

  const setPassword = useCallback((value: string) => {
    setError(null);
    setPasswordState(value);
  }, []);

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setError(null);
  }, []);

  const validate = useCallback(() => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!isLogin && !trimmedName) {
      return 'Please enter your name.';
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return 'Please enter a valid email address.';
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return 'Password must be more than 8 characters.';
    }

    return null;
  }, [email, isLogin, name, password]);

  const login = useCallback(async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      console.log('Login response:', response);
      
      if (response.error) {
        setError(normalizeAuthError(response.error.message, true));
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? normalizeAuthError(e.message, true)
          : 'Unable to log in right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [email, password, validate]);

  const signup = useCallback(async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const response = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });
      console.log('Signup response:', response);
      
      if (response.error) {
        setError(normalizeAuthError(response.error.message, false));
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? normalizeAuthError(e.message, false)
          : 'Unable to create your account right now. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [email, name, password, validate]);

  const submit = useCallback(() => {
    if (isLogin) {
      return login();
    } else {
      return signup();
    }
  }, [isLogin, login, signup]);

  return {
    name,
    email,
    password,
    loading,
    error,
    isLogin,
    setName,
    setEmail,
    setPassword,
    toggleMode,
    login,
    signup,
    submit,
  };
}
