import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { LogOut, Lock, Mail, ShieldCheck, Sparkles, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../services/supabase';

export type AuthMode = 'signin' | 'signup';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authOpen: boolean;
  authMode: AuthMode;
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
  setAuthMode: (mode: AuthMode) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}

const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.09A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.26a12 12 0 0 0 0 10.76l4.01-3.09Z" />
    <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.23 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
  </svg>
);

const AuthModal: React.FC = () => {
  const { authMode, setAuthMode, closeAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAuth();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeAuth]);

  if (!isSupabaseConfigured) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4" onClick={closeAuth}>
        <div
          className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#3A3B3E] p-6 shadow-2xl space-y-4"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A73E8] to-[#A855F7] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">Supabase Auth required</h1>
                <p className="text-xs text-slate-500 dark:text-[#888888]">Configure your project to unlock the workspace.</p>
              </div>
            </div>
            <button type="button" onClick={closeAuth} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2B2D]">
              <X className="w-4 h-4" />
            </button>
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (authMode === 'signup') {
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

  const handleGoogle = async () => {
    if (!supabase) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={closeAuth}>
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E1F20] border border-slate-200 dark:border-[#3A3B3E] p-6 shadow-2xl space-y-5 my-8"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1A73E8] via-[#4285F4] to-[#A855F7] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                {authMode === 'signin' ? 'Sign in to Nexus' : 'Create your Nexus account'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#888888]">
                Every workspace is isolated to your Supabase user.
              </p>
            </div>
          </div>
          <button type="button" onClick={closeAuth} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-[#2A2B2D]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#131314]">
          {(['signin', 'signup'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setAuthMode(option);
                setError(null);
                setNotice(null);
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                authMode === option
                  ? 'bg-white dark:bg-[#2A2B2D] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-[#888888]'
              }`}
            >
              {option === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-white dark:bg-[#131314] border border-slate-300 dark:border-[#3A3B3E] text-xs font-semibold text-slate-700 dark:text-[#E3E3E3] hover:bg-slate-50 dark:hover:bg-[#2A2B2D] disabled:opacity-50 transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200 dark:bg-[#2D2E30]" />
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-[#888888]">or continue with email</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-[#2D2E30]" />
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
          {busy ? 'Please wait...' : authMode === 'signin' ? 'Sign In Securely' : 'Create Account'}
        </button>

        <p className="text-[10px] text-slate-400 dark:text-[#666] text-center">
          Protected by Supabase Auth. Your password never reaches the Nexus backend.
        </p>
      </form>
    </div>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

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
      if (nextSession) {
        setAuthOpen(false);
      }
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const openAuth = useCallback((mode: AuthMode = 'signin') => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('nexus_workspace_config');
    setSession(null);
    setAuthOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        authOpen,
        authMode,
        openAuth,
        closeAuth,
        setAuthMode,
        signOut,
      }}
    >
      {children}
      {authOpen && <AuthModal />}
      {session?.user && !authOpen && (
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
      )}
    </AuthContext.Provider>
  );
};
