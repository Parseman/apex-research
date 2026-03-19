import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session, ProfileData } from '../types/auth.ts';
import { supabase } from '../lib/supabase.ts';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<'confirm_email'>;
  logout: () => Promise<void>;
  completeOnboarding: (data: ProfileData) => Promise<void>;
  getUsers: () => Promise<User[]>;
  addUser: (email: string, password: string, role: 'admin' | 'user') => Promise<void>;
  updateUserPassword: (userId: string, newPassword: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface ProfileRow {
  role: 'admin' | 'user';
  onboarding_done: boolean;
  display_name: string | null;
  risk_level: number;
  horizon: string;
  capital: string;
  status: string;
}

async function fetchProfile(userId: string): Promise<ProfileRow> {
  const { data } = await supabase
    .from('profiles')
    .select('role, onboarding_done, display_name, risk_level, horizon, capital, status')
    .eq('id', userId)
    .single();
  return {
    role: (data?.role as 'admin' | 'user') ?? 'user',
    onboarding_done: data?.onboarding_done ?? false,
    display_name: data?.display_name ?? null,
    risk_level: (data?.risk_level as number) ?? 0,
    horizon: (data?.horizon as string) ?? '',
    capital: (data?.capital as string) ?? '',
    status: (data?.status as string) ?? '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      clearTimeout(timeout);
      if (!s?.user) {
        setSession(null);
        setLoading(false);
        return;
      }

      const userId = s.user.id;
      const email = s.user.email ?? '';

      fetchProfile(userId)
        .then(p => setSession({
          userId,
          email,
          role: p.role,
          onboardingDone: p.onboarding_done,
          displayName: p.display_name,
          riskLevel: p.risk_level,
          horizon: p.horizon,
          capital: p.capital,
          status: p.status,
        }))
        .catch(() => setSession({
          userId, email, role: 'user',
          onboardingDone: false, displayName: null,
          riskLevel: 0, horizon: '', capital: '', status: '',
        }))
        .finally(() => setLoading(false));
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Votre email n\'est pas encore confirmé. Vérifiez votre boîte mail.');
      }
      throw new Error('Email ou mot de passe incorrect.');
    }
  }, []);

  const register = useCallback(async (email: string, password: string): Promise<'confirm_email'> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        throw new Error('Cet email est déjà utilisé.');
      }
      throw new Error(error.message);
    }
    return 'confirm_email';
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
  }, []);

  const completeOnboarding = useCallback(async (data: ProfileData): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié.');

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: data.displayName,
        status: data.status,
        capital: data.capital,
        risk_level: data.riskLevel,
        horizon: data.horizon,
        onboarding_done: true,
      })
      .eq('id', user.id);

    if (error) throw new Error(error.message);

    // Mettre à jour la session locale sans recharger
    setSession(prev => prev ? {
      ...prev,
      onboardingDone: true,
      displayName: data.displayName,
      riskLevel: data.riskLevel,
      horizon: data.horizon,
      capital: data.capital,
      status: data.status,
    } : prev);
  }, []);

  const getUsers = useCallback(async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_by, created_at')
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(r => ({
      id: r.id as string,
      email: r.email as string,
      role: r.role as 'admin' | 'user',
      createdAt: r.created_at as string,
      createdBy: r.created_by as string,
    }));
  }, []);

  const addUser = useCallback(async (email: string, password: string, role: 'admin' | 'user'): Promise<void> => {
    const { error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'create_user', email, password, role, createdBy: session?.email ?? 'admin' },
    });
    if (error) throw new Error(error.message);
  }, [session]);

  const updateUserPassword = useCallback(async (userId: string, newPassword: string): Promise<void> => {
    const { error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'update_password', userId, password: newPassword },
    });
    if (error) throw new Error(error.message);
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: 'admin' | 'user'): Promise<void> => {
    const { error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'update_role', userId, role },
    });
    if (error) throw new Error(error.message);
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    const { error } = await supabase.functions.invoke('manage-users', {
      body: { action: 'delete_user', userId },
    });
    if (error) throw new Error(error.message);
  }, []);

  return (
    <AuthContext.Provider value={{
      session, loading,
      login, register, logout, completeOnboarding,
      getUsers, addUser, updateUserPassword, updateUserRole, deleteUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
