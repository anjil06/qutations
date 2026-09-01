'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

// In-memory module cache for instant synchronous access across page transitions
let cachedSession = null;
let initialCheckDone = false;

export function AuthProvider({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(cachedSession);
  const [user, setUser] = useState(cachedSession?.user || null);
  const [loading, setLoading] = useState(!initialCheckDone);

  useEffect(() => {
    // 1. Initial fast session check
    if (!initialCheckDone) {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        cachedSession = currentSession;
        initialCheckDone = true;
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);
      }).catch((err) => {
        console.error('Session retrieval error:', err);
        initialCheckDone = true;
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    // 2. Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      cachedSession = newSession;
      setSession(newSession);
      setUser(newSession?.user || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      cachedSession = null;
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      router.push('/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

