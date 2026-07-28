import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function StatusPill({ type = 'severity', value = 'Pending Triage' }) {
  const getSeverityStyle = (val) => {
    switch (val?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'major':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'minor':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <Info className="w-3.5 h-3.5 text-emerald-400" />
        };
      default:
        return {
          bg: 'bg-slate-700/40 border-slate-600/40 text-slate-400',
          icon: <Info className="w-3.5 h-3.5 text-slate-400" />
        };
    }
  };

  const getStatusStyle = (val) => {
    switch (val?.toLowerCase()) {
      case 'triaged':
      case 'closed':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'in review':
        return 'bg-sky-500/10 border-sky-500/30 text-sky-400';
      default:
        return 'bg-slate-700/40 border-slate-600 text-slate-400';
    }
  };

  if (type === 'severity') {
    const style = getSeverityStyle(value);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg}`}>
        {style.icon}
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(value)}`}>
      <CheckCircle2 className="w-3.5 h-3.5" />
      {value}
    </span>
  );
}
