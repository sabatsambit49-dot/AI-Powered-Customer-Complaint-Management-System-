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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={() => dispatch(setExplainModalOpen(false))}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AI Risk & Severity Classification Explanation</h3>
            <p className="text-xs text-slate-500">Pharma QA Logic & Root Cause Rationale</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Classification Overview Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block text-[11px]">Assigned Severity</span>
              <span className="text-sm font-bold text-rose-600">{form.initial_severity || 'Major'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Priority Level</span>
              <span className="text-sm font-bold text-amber-600">{form.priority || 'Medium'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Completeness Score</span>
              <span className="text-sm font-bold text-emerald-600">{form.completeness_score || 0}%</span>
            </div>
          </div>

          {/* Justification Text */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <ShieldAlert className="w-4 h-4" />
              <span>QA Risk Justification</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {form.severity_justification || "Classification evaluated based on reported defect parameters and pharmaceutical cGMP severity threshold rules."}
            </p>
          </div>

          {/* Regulatory Escalation Flag */}
          {form.regulatory_reporting_flag && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1">
              <span className="font-bold text-amber-900 block">Regulatory Escalation Advisory</span>
              <p className="text-slate-700">{form.regulatory_reporting_flag}</p>
            </div>
          )}

          {/* Pharma Rules Reference */}
          <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl space-y-2">
            <span className="font-bold text-blue-900 block">cGMP Pharma Risk Decision Matrix:</span>
            <ul className="space-y-1.5 text-slate-700 list-disc pl-4 leading-relaxed">
              <li><strong className="text-rose-700">Critical:</strong> Direct patient safety impact, sterility breach, foreign particulate in injectables, batch contamination. Escalated for Field Alert Report (FAR).</li>
              <li><strong className="text-amber-700">Major:</strong> Out of Specification (OOS) potency, container closure failure, tablet crumbling/discoloration, cold chain excursion.</li>
              <li><strong className="text-emerald-700">Minor:</strong> Secondary packaging scuff, commercial delay, cosmetic carton damage without dose exposure.</li>
            </ul>
          </div>

        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => dispatch(setExplainModalOpen(false))}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs border border-slate-300 transition"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
}
