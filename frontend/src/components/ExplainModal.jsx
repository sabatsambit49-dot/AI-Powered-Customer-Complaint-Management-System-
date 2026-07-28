import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setExplainModalOpen } from '../store/complaintSlice';
import { X, ShieldAlert, FileSearch, Sparkles, CheckCircle } from 'lucide-react';

export default function ExplainModal() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.complaint.currentForm);
  const isOpen = useSelector((state) => state.complaint.explainModalOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={() => dispatch(setExplainModalOpen(false))}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Risk & Severity Classification Explanation</h3>
            <p className="text-xs text-slate-400">Pharma QA Logic & Root Cause Rationale</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Classification Overview Card */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <div>
              <span className="text-slate-400 block text-[11px]">Assigned Severity</span>
              <span className="text-sm font-bold text-rose-400">{form.initial_severity || 'Major'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Priority Level</span>
              <span className="text-sm font-bold text-amber-400">{form.priority || 'Medium'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Completeness Score</span>
              <span className="text-sm font-bold text-emerald-400">{form.completeness_score || 0}%</span>
            </div>
          </div>

          {/* Justification Text */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
            <div className="flex items-center gap-2 text-sky-400 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>QA Risk Justification</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {form.severity_justification || 
                "Assigned based on pharmaceutical defect criteria: injectable particulate, mislabeled strengths, or patient adverse events trigger Critical severity. Physical defects or assay deviations trigger Major severity."}
            </p>
          </div>

          {/* Regulatory Escation Flag */}
          {form.regulatory_reporting_flag && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-semibold text-amber-300 block">Regulatory Compliance Advisory</span>
                <span className="text-slate-300">{form.regulatory_reporting_flag}</span>
              </div>
            </div>
          )}

          {/* Duplicate Matches */}
          {form.duplicate_matches && form.duplicate_matches.length > 0 && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <FileSearch className="w-4 h-4" />
                <span>Historical Duplicate Matches Detected ({form.duplicate_matches.length})</span>
              </div>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {form.duplicate_matches.map((match, idx) => (
                  <div key={idx} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 text-slate-300 flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-sky-400">{match.complaint_number}</span> - {match.product_name} (Batch: {match.batch_lot_number})
                      <span className="block text-[10px] text-slate-400">{match.reason}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      {match.initial_severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => dispatch(setExplainModalOpen(false))}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition"
          >
            <CheckCircle className="w-4 h-4" />
            Understood
          </button>
        </div>

      </div>
    </div>
  );
}
