import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { supabase } from '../services/supabase';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    console.log('[useSession] Hook mounted, fetching initial session...');
    // Fetch the current session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;

        console.log('[useSession] Initial session fetched:', session ? 'Exists' : 'Null');
        setSession(session);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.warn('[useSession] Failed to fetch initial session', error);
        setSession(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    // Subscribe to auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      console.log('[useSession] Auth state changed! Event:', event, 'Session:', session ? 'Exists' : 'Null');
      setSession(session);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      console.log('[useSession] Unsubscribing from auth changes');
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
