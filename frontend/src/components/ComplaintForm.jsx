import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField, resetForm, addSavedComplaint, setExplainModalOpen } from '../store/complaintSlice';
import StatusPill from './StatusPill';
import { API_BASE } from '../config';
import { 
  Building2, 
  Package, 
  FileWarning, 
  BrainCircuit, 
  RotateCcw, 
  Save, 
  HelpCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.complaint.currentForm);
  const isExtracting = useSelector((state) => state.complaint.isExtracting);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormField({ field: name, value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (response.ok) {
        const savedData = await response.json();
        dispatch(addSavedComplaint(savedData));
        alert(`Complaint ${savedData.complaint_number} saved successfully!`);
      } else {
        alert('Failed to save complaint to database.');
      }
    } catch (err) {
      alert('Error saving complaint: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSave} className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Log Customer Complaint
            {isExtracting && (
              <span className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-normal animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Awaiting AI extraction...
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">Structured Quality Assurance Intake Form</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill type="status" value={form.status || 'Pending Triage'} />
        </div>
      </div>

      {/* SECTION 1: Origin & Customer Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>1. Origin & Customer Details</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Complaint Source</label>
            <input
              type="text"
              name="complaint_source"
              value={form.complaint_source || ''}
              onChange={handleChange}
              placeholder="e.g. Hospital Pharmacy, Distributor, Clinical Trial"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Customer Name</label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name || ''}
              onChange={handleChange}
              placeholder="e.g. St. Jude Regional Hospital"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Customer Email / Contact</label>
            <input
              type="email"
              name="customer_email"
              value={form.customer_email || ''}
              onChange={handleChange}
              placeholder="e.g. qa@hospital.org"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Complaint Date</label>
            <input
              type="date"
              name="complaint_date"
              value={form.complaint_date || ''}
              onChange={handleChange}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* SECTION 2: Product & Batch Identification */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
          <Package className="w-4 h-4 text-sky-400" />
          <span>2. Product & Batch Identification</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block text-slate-400 mb-1">Product Name</label>
            <input
              type="text"
              name="product_name"
              value={form.product_name || ''}
              onChange={handleChange}
              placeholder="e.g. Ceftriaxone Sodium for Injection"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Strength / Grade</label>
            <input
              type="text"
              name="product_strength_grade"
              value={form.product_strength_grade || ''}
              onChange={handleChange}
              placeholder="e.g. 1g / Sterile Grade"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Batch / Lot Number</label>
            <input
              type="text"
              name="batch_lot_number"
              value={form.batch_lot_number || ''}
              onChange={handleChange}
              placeholder="e.g. CFT-9082"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Mfg Date</label>
            <input
              type="text"
              name="manufacturing_date"
              value={form.manufacturing_date || ''}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Expiry Date</label>
            <input
              type="text"
              name="expiry_date"
              value={form.expiry_date || ''}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-slate-400 mb-1">Quantity Affected</label>
            <input
              type="text"
              name="quantity_affected"
              value={form.quantity_affected || ''}
              onChange={handleChange}
              placeholder="e.g. 2 vials, 40 blister packs, 2,000 kg"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* SECTION 3: Complaint Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
          <FileWarning className="w-4 h-4 text-sky-400" />
          <span>3. Complaint Details</span>
        </div>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Complaint Type / Classification</label>
            <input
              type="text"
              name="complaint_type"
              value={form.complaint_type || ''}
              onChange={handleChange}
              placeholder="e.g. Foreign Particulate, Mislabeling, Discoloration, Sub-potency"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Detailed Defect Description</label>
            <textarea
              rows={4}
              name="detailed_description"
              value={form.detailed_description || ''}
              onChange={handleChange}
              placeholder="Describe the complaint observation in full detail..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition leading-relaxed resize-none"
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* SECTION 4: Initial Assessment & Priority */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <BrainCircuit className="w-4 h-4 text-sky-400" />
            <span>4. Initial Assessment & AI Priority Triage</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(setExplainModalOpen(true))}
            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition underline underline-offset-2"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Explain Severity Logic
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Initial Severity</label>
            <div className="flex items-center gap-3">
              <StatusPill type="severity" value={form.initial_severity || 'Major'} />
              <select
                name="initial_severity"
                value={form.initial_severity || 'Major'}
                onChange={handleChange}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500 transition"
              >
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority || 'Medium'}
              onChange={handleChange}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500 transition"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* AI Recommendations Box */}
        {(form.root_cause_category || form.capa_recommendation) && (
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60 space-y-3 text-xs">
            {form.root_cause_category && (
              <div>
                <span className="text-slate-400 font-semibold block mb-0.5">Root Cause Recommendation</span>
                <span className="text-sky-300 font-medium">{form.root_cause_category}</span>
                {form.root_cause_reasoning && (
                  <p className="text-slate-400 text-[11px] mt-1">{form.root_cause_reasoning}</p>
                )}
              </div>
            )}
            {form.capa_recommendation && (
              <div className="pt-2 border-t border-slate-700/40">
                <span className="text-slate-400 font-semibold block mb-0.5">Draft CAPA Action</span>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">{form.capa_recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
        <button
          type="button"
          onClick={() => dispatch(resetForm())}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700/80 hover:bg-slate-800 text-slate-300 font-medium text-xs transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Form
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-600/20 transition"
        >
          <Save className="w-4 h-4" />
          Save Complaint to DB
        </button>
      </div>

    </form>
  );
}
