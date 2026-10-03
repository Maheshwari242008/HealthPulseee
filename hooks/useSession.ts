import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { getSession, onAuthChange } from '@/services/authService';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getSession()
      .then((s) => {
        if (active) setSession(s);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    const unsubscribe = onAuthChange((s) => setSession(s));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { session, loading };
}
