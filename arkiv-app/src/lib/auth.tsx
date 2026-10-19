import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import { isConfigured, supabase } from './supabase';
import type { Profile } from './types';

type Auth = {
  ready: boolean;
  session: Session | null;
  userId: string | null;
  profile: Profile | null;
  sendCode: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  reloadProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(!isConfigured);

  const loadProfile = useCallback(async (uid: string | undefined) => {
    if (!uid) { setProfile(null); return; }
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadProfile(data.session?.user.id);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        loadProfile(s?.user.id);
        if (event === 'SIGNED_OUT') qc.clear();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile, qc]);

  const value: Auth = {
    ready,
    session,
    userId: session?.user.id ?? null,
    profile,
    sendCode: async (email) => {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
      if (error) throw error;
    },
    verifyCode: async (email, code) => {
      const { data, error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
      if (error) throw error;
      setSession(data.session);
      await loadProfile(data.session?.user.id);
    },
    signInWithPassword: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) throw error;
      setSession(data.session);
      await loadProfile(data.session?.user.id);
    },
    reloadProfile: () => loadProfile(session?.user.id),
    signOut: async () => { await supabase.auth.signOut(); setProfile(null); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth måste användas inom AuthProvider');
  return v;
}

/** För skärmar som bara visas när man är inloggad med profil. */
export function useMe() {
  const { profile, userId } = useAuth();
  return { me: profile!, uid: userId! };
}
