import React, { useState } from 'react';
import { Lock, Mail, Key, AlertCircle, ArrowLeft, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';
import { isFirebaseConfigured, envConfig } from '../../lib/firebase';

interface AdminLoginProps {
  navigate: (path: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ navigate }) => {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('ahmedskkawsar43@gmail.com');
  const [password, setPassword] = useState('rmart2026');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        navigate('/admin');
      } else {
        setError(res.error || 'Access Denied: Invalid administrator credentials.');
      }
    } catch (err) {
      setError('An error occurred during administrator authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSignIn = async (adminMail: string) => {
    setEmail(adminMail);
    setError(null);
    setLoading(true);
    try {
      const res = await loginAdmin(adminMail, password || 'admin123');
      if (res.success) {
        navigate('/admin');
      }
    } catch (err) {
      setError('Quick login failed. Please try the form below.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0D] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back to store button */}
        <button
          onClick={() => navigate('/')}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Customer Store</span>
        </button>

        {/* Card */}
        <div className="rounded-3xl bg-[#0F141A] border border-white/[0.08] p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-block">
              <Logo size="lg" variant="light" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-white tracking-tight flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>R Mart Management Console</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Authorized staff and administrator access only
              </p>
            </div>
          </div>

          {/* Quick 1-Click Access for Verified Owner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Owner Quick Access</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-500/20 px-2 py-0.5 rounded">
                {isFirebaseConfigured() ? envConfig.projectId : 'Local Store Admin'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSignIn('fff399256@gmail.com')}
                disabled={loading}
                className="py-2 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-medium text-white transition-all text-left truncate active:scale-95"
              >
                <span className="block text-[10px] text-emerald-300">My Account</span>
                <span className="truncate block font-semibold">fff399256@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSignIn('ahmedskkawsar43@gmail.com')}
                disabled={loading}
                className="py-2 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-medium text-white transition-all text-left truncate active:scale-95"
              >
                <span className="block text-[10px] text-slate-400">Owner</span>
                <span className="truncate block font-semibold">ahmedsk...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSignIn('rmartoffcial@gmail.com')}
                disabled={loading}
                className="py-2 px-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-[11px] font-medium text-white transition-all text-left truncate active:scale-95"
              >
                <span className="block text-[10px] text-slate-400">Dispatch</span>
                <span className="truncate block font-semibold">rmartoff...</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rayhanahamad50@gmail.com"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password / Master Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 active:scale-98 disabled:opacity-40"
            >
              {loading ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>

          {/* Configuration Hint */}
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isFirebaseConfigured() ? 'Firebase Backend Linked' : 'Offline / Local Persistence Mode'}</span>
            </div>
            <p className="text-slate-400 leading-normal">
              {isFirebaseConfigured() ? (
                <>Project: <span className="font-mono text-emerald-300">{envConfig.projectId}</span></>
              ) : (
                <span>In-memory catalog & browser storage active</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
