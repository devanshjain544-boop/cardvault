import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Loader2, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface LoginPageProps {
  navigate: (path: string) => void;
  redirectPath?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in, redirect directly to home page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      // Immediately navigate user to Home Page
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillCollector = () => {
    setEmail('collector@cardvault.in');
    setPassword('Collector123!');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-6 shadow-xs">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif tracking-tight">Collector Login</h1>
          <p className="text-xs text-stone-500">
            Sign in to track orders, manage vault delivery addresses and wishlist.
          </p>
        </div>

        {/* Quick Demo Fill */}
        <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
          <div className="text-stone-600">
            <p className="font-bold text-stone-800 text-[11px]">Demo Collector</p>
            <p className="text-[10px] text-stone-500 font-mono">collector@cardvault.in</p>
          </div>
          <button
            type="button"
            onClick={handleQuickFillCollector}
            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] rounded-lg border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <UserCheck className="w-3 h-3" /> Auto-Fill
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="collector@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In to CardVault'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 text-center space-y-3">
          <p className="text-xs text-stone-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-amber-700 font-semibold hover:underline cursor-pointer"
            >
              Create Account
            </button>
          </p>

          <p className="text-[11px] text-stone-500">
            CardVault Store Administrator?{' '}
            <button
              onClick={() => navigate('/admin/login')}
              className="text-stone-600 hover:text-amber-800 underline font-medium cursor-pointer"
            >
              Admin Portal
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
