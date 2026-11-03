import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { LogOut, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../services/supabase';

interface AuthState {
  session: Session;
  user: User;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthGate.');
  return value;
}

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'SIGNED_OUT') {
        // Never let one account's cached workspace bleed into the next session
        localStorage.removeItem('nexus_workspace_config');
      }
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice('Account created. Check your email to confirm the address, then sign in.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('nexus_workspace_config');
    setSession(null);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0C0E] p-4">
        <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#3A3B3E] p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A73E8] to-[#A855F7] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">Supabase Auth required</h1>
              <p className="text-xs text-slate-500 dark:text-[#888888]">Configure your project to unlock the workspace.</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-[#131314] border border-slate-200 dark:border-[#2D2E30] p-3 text-[11px] text-slate-600 dark:text-[#C4C7C5] font-mono space-y-1">
            <div>frontend/.env</div>
            <div>VITE_SUPABASE_URL=...</div>
            <div>VITE_SUPABASE_ANON_KEY=...</div>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#888888]">
            Add the values from Supabase → Project Settings → API, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0C0E]">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-[#888888]">
          <Sparkles className="w-4 h-4 animate-pulse text-blue-500" />
          Verifying session...
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0B0C0E] p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#3A3B3E] p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A855F7] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                {mode === 'signin' ? 'Sign in to Nexus' : 'Create your Nexus account'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#888888]">
                Every workspace is isolated to your Supabase user.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#131314]">
            {(['signin', 'signup'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setMode(option);
                  setError(null);
                  setNotice(null);
                }}
                className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mode === option
                    ? 'bg-white dark:bg-[#2A2B2D] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-[#888888]'
                }`}
              >
                {option === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="text-xs text-slate-500 dark:text-[#888888] mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                Work email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
              />
            </label>

            <label className="block">
              <span className="text-xs text-slate-500 dark:text-[#888888] mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                Password
              </span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-slate-50 dark:bg-[#131314] text-xs text-slate-900 dark:text-white p-3 rounded-xl border border-slate-200 dark:border-[#2D2E30] focus:outline-none focus:border-blue-500"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-transparent p-3 text-[11px] text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-transparent p-3 text-[11px] text-emerald-700 dark:text-emerald-300">
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1A73E8] via-[#4285F4] to-[#A855F7] text-xs font-bold text-white shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            {busy ? 'Please wait...' : mode === 'signin' ? 'Sign In Securely' : 'Create Account'}
          </button>

          <p className="text-[10px] text-slate-400 dark:text-[#666] text-center">
            Protected by Supabase Auth. Your password never reaches the Nexus backend.
          </p>
        </form>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ session, user: session.user, signOut }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-white/95 dark:bg-[#1E1F20]/95 backdrop-blur border border-slate-200 dark:border-[#3A3B3E] shadow-lg px-3 py-1.5 text-[10px] text-slate-600 dark:text-[#C4C7C5]">
        <span className="max-w-[180px] truncate">{session.user.email}</span>
        <button
          type="button"
          onClick={signOut}
          title="Sign out"
          className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#2A2B2D] text-slate-500 dark:text-[#888888]"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </AuthContext.Provider>
  );
};
