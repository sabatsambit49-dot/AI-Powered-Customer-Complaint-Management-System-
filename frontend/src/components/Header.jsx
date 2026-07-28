import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setActiveTab } from '../store/complaintSlice';
import { logout } from '../store/authSlice';
import { ShieldCheck, FileText, LayoutDashboard, Activity, UserCheck, LogOut } from 'lucide-react';
import { API_BASE } from '../config';

export default function Header() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.complaint.activeTab);
  const savedCount = useSelector((state) => state.complaint.savedComplaints.length);
  const user = useSelector((state) => state.auth.user);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'healthy') setApiStatus('online');
        else setApiStatus('offline');
      })
      .catch(() => setApiStatus('offline'));
  }, []);

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">PharmaQMS</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                API & FDF QA
              </span>
            </div>
            <p className="text-xs text-slate-400">AI-Powered Customer Complaint Intake & Risk Triage System</p>
          </div>
        </div>

        {/* Navigation, User & Status */}
        <div className="flex items-center gap-4 flex-wrap justify-end">
          
          {/* Navigation Bar */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => dispatch(setActiveTab('intake'))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'intake'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <FileText className="w-4 h-4" />
              Complaint Intake
            </button>

            <button
              onClick={() => dispatch(setActiveTab('dashboard'))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Complaints Dashboard
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900 text-sky-400 border border-sky-500/30">
                  {savedCount}
                </span>
              )}
            </button>
          </div>

          {/* User Profile & Log Out */}
          {user && (
            <div className="flex items-center gap-2 bg-slate-800/80 pl-3 pr-1.5 py-1.5 rounded-xl border border-slate-700/60 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <div className="leading-tight hidden sm:block">
                <span className="font-semibold text-slate-200 block">{user.full_name}</span>
                <span className="text-[10px] text-slate-400 block">{user.role}</span>
              </div>
              <button
                onClick={() => dispatch(logout())}
                title="Log Out of Portal"
                className="ml-1.5 px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 font-medium transition flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Log Out</span>
              </button>
            </div>
          )}

          {/* Backend Connection Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/40 text-xs">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">API Status:</span>
            {apiStatus === 'online' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
            ) : apiStatus === 'checking' ? (
              <span className="text-amber-400">Connecting...</span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Offline (Local Dev)
              </span>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
