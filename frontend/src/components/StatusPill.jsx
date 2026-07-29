import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function StatusPill({ type = 'severity', value = 'Pending Triage' }) {
  const getSeverityStyle = (val) => {
    switch (val?.toLowerCase()) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        };
      case 'major':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        };
      case 'minor':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
          icon: <Info className="w-3.5 h-3.5 text-emerald-600" />
        };
      default:
        return {
          bg: 'bg-slate-100 border-slate-200 text-slate-600',
          icon: <Info className="w-3.5 h-3.5 text-slate-500" />
        };
    }
  };

  const getStatusStyle = (val) => {
    switch (val?.toLowerCase()) {
      case 'resolved':
      case 'triaged':
      case 'closed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'in review':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-amber-50 border-amber-200 text-amber-800';
    }
  };

  if (type === 'severity') {
    const style = getSeverityStyle(value);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.bg}`}>
        {style.icon}
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(value)}`}>
      <CheckCircle2 className="w-3.5 h-3.5" />
      {value}
    </span>
  );
}
