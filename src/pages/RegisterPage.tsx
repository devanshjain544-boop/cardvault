import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Mail, Lock, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { user, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, mobile.trim());
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-stone-200 rounded-3xl p-8 space-y-6 shadow-xs">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <User className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-stone-950 font-serif tracking-tight">Create Collector Account</h1>
          <p className="text-xs text-stone-500">
            Join CardVault to save addresses, track shipments, and access collector releases.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Rohan Mehra"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="rohan@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Mobile Number (optional)</label>
            <div className="relative">
              <input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

        <div className="pt-4 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-amber-700 font-semibold hover:underline cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
