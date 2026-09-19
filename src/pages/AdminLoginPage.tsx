import React, { useState } from 'react';
import { ShieldAlert, Lock, Mail, ArrowRight, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AdminLoginPageProps {
  navigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate }) => {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(email.trim(), password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-stone-300 rounded-3xl p-8 space-y-6 shadow-md relative">
        {/* Top security tag */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-amber-900 bg-amber-50 border border-amber-300 rounded-full py-1 px-3.5 w-fit mx-auto">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> CARDVAULT VAULT SECURE OPS
        </div>

        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif tracking-tight">Admin Portal</h1>
          <p className="text-xs text-stone-500">
            Authorized administrator access only. All sessions, order updates and catalog mutations are cryptographically signed and logged.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 shadow-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="admin@cardvault.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Master Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Authenticate Vault Access'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-stone-500 hover:text-stone-900 cursor-pointer"
          >
            Return to Regular Customer Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
