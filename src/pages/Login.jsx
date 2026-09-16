import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useCrmStore } from '../store/useCrmStore';

export default function Login() {
  const [email, setEmail] = useState('admin@lensflow.studio');
  const [password, setPassword] = useState('password123');
  const navigate = useNavigate();
  const location = useLocation();
  const login = useCrmStore((state) => state.login);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSignIn = (e) => {
    if (e) e.preventDefault();
    login();
    navigate(from, { replace: true });
  };

  const handleQuickDemo = () => {
    login();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 shadow-md mb-4">
            <Camera className="w-7 h-7" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">LensFlow</h1>
          <p className="text-sm text-slate-500 mt-1">Photography Business CRM</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Welcome back</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter your credentials to access your studio dashboard.</p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@lensflow.studio"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2 group"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>

          {/* Quick Demo Access Divider & Button */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 px-4 bg-[#FDF3E7] hover:bg-[#faebd7] text-amber-800 font-medium text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Quick Demo Access (One Click)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Frontend-only demo &bull; State persisted in localStorage
        </p>
      </div>
    </div>
  );
}
