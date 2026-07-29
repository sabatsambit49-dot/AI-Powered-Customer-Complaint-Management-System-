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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Soft Gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative z-10 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white mb-2 shadow-md shadow-blue-600/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pharma QMS Portal</h1>
          <p className="text-xs text-slate-500">Authenticated Access for Complaint Intake & AI Risk Triage</p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-700 flex items-start gap-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
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
            <label className="text-xs font-semibold text-slate-700 block">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. qa_reviewer"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
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
        <div className="pt-4 border-t border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Demo Accounts:
            </span>
            <span className="text-slate-400">Click to log in</span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            
            {/* Account 1 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('qa_reviewer', 'pharma_demo_reviewer_123')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition text-left flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-slate-900 block group-hover:text-blue-600 transition">Elena Rostova</span>
                <span className="text-[10px] text-slate-500">QA Lead Reviewer (qa_reviewer)</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-200">
                1-Click Login
              </span>
            </button>

            {/* Account 2 */}
            <button
              type="button"
              onClick={() => handleQuickLogin('qa_manager', 'pharma_demo_manager_123')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition text-left flex items-center justify-between group"
            >
              <div>
                <span className="font-semibold text-slate-900 block group-hover:text-blue-600 transition">Marcus Vance</span>
                <span className="text-[10px] text-slate-500">QA Systems Manager (qa_manager)</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-semibold border border-indigo-200">
                1-Click Login
              </span>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
