import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setAuthError, setAuthLoading } from '../store/authSlice';
import { API_BASE } from '../config';
import { ShieldCheck, Lock, User, KeyRound, AlertTriangle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export default function Login() {
  const dispatch = useDispatch();
  const authError = useSelector((state) => state.auth.error);
  const isLoading = useSelector((state) => state.auth.isLoading);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e, customUser, customPass) => {
    if (e) e.preventDefault();
    
    const loginUser = customUser || username;
    const loginPass = customPass || password;

    if (!loginUser || !loginPass) {
      dispatch(setAuthError("Please enter both username and password."));
      return;
    }

    dispatch(setAuthLoading(true));
    dispatch(setAuthError(null));

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass }),
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      dispatch(setCredentials({
        token: data.access_token,
        user: {
          username: data.username,
          full_name: data.full_name,
          role: data.role
        }
      }));
    } catch (err) {
      dispatch(setAuthError(err.message || "Invalid username or password"));
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const handleQuickLogin = (usr, pwd) => {
    setUsername(usr);
    setPassword(pwd);
    handleSubmit(null, usr, pwd);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 mb-2 shadow-lg shadow-sky-500/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Pharma QMS Portal</h1>
          <p className="text-xs text-slate-400">Authenticated Access for Complaint Intake & AI Risk Triage</p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5 animate-fade-in shadow-lg">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Authentication Failure</span>
              <span>{authError}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. qa_reviewer"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating Employee...</span>
              </>
            ) : (
              <>
                <span>Sign In to QMS Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Panel */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Demo Accounts:
            </span>
            <span className="text-slate-500">Click to log in</span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            
            {/* Account 1 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('qa_reviewer', 'pharma_demo_reviewer_123')}
              className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition text-left flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-slate-200 block group-hover:text-sky-300 transition">Elena Rostova</span>
                <span className="text-[10px] text-slate-400">QA Lead Reviewer (qa_reviewer)</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-[10px] font-mono border border-sky-500/20">
                1-Click Login
              </span>
            </button>

            {/* Account 2 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('qa_manager', 'pharma_demo_manager_123')}
              className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition text-left flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-slate-200 block group-hover:text-sky-300 transition">Marcus Vance</span>
                <span className="text-[10px] text-slate-400">QA Systems Manager (qa_manager)</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                1-Click Login
              </span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
