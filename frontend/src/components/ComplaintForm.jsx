import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateFormField, resetForm, addSavedComplaint, setExplainModalOpen } from '../store/complaintSlice';
import { logout } from '../store/authSlice';
import StatusPill from './StatusPill';
import { API_BASE, fetchWithAuth } from '../config';
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
  const token = useSelector((state) => state.auth.token);

  const handleChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormField({ field: name, value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/complaints`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        },
        token,
        () => dispatch(logout())
      );
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
    <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Log Customer Complaint
            {isExtracting && (
              <span className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-normal animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Auto-populating fields...
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500">Form auto-populates from AI Assistant document analysis</p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(setExplainModalOpen(true))}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Explain Severity Logic
        </button>
      </div>

      {/* SECTION 1: Origin & Customer Details */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          1. Origin & Customer Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Complaint Source</label>
            <select
              name="complaint_source"
              value={form.complaint_source || ''}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            >
              <option value="">-- Select Source Channel --</option>
              <option value="Hospital Pharmacy">Hospital Pharmacy</option>
              <option value="Retail Pharmacy">Retail Pharmacy</option>
              <option value="Distributor">Distributor / Wholesaler</option>
              <option value="Patient">Patient Direct</option>
              <option value="Customer QA Audit">Customer QA Audit</option>
              <option value="Regulatory Authority">Regulatory Authority (FDA/EMA)</option>
              <option value="Internal Audit">Internal Quality Audit</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Customer / Reporter Name</label>
            <input
              type="text"
              name="customer_name"
              value={form.customer_name || ''}
              onChange={handleChange}
              placeholder="e.g. Svenska Pharma AB"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Customer Email</label>
            <input
              type="email"
              name="customer_email"
              value={form.customer_email || ''}
              onChange={handleChange}
              placeholder="qa@customer.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Complaint Date</label>
            <input
              type="date"
              name="complaint_date"
              value={form.complaint_date || ''}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

        </div>
      </div>

      {/* SECTION 2: Product & Batch Identification */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-600" />
          2. Product & Batch Identification
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-700 block mb-1">Product Name (Drug / API)</label>
            <input
              type="text"
              name="product_name"
              value={form.product_name || ''}
              onChange={handleChange}
              placeholder="e.g. Metformin Hydrochloride API"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Strength / Grade</label>
            <input
              type="text"
              name="product_strength_grade"
              value={form.product_strength_grade || ''}
              onChange={handleChange}
              placeholder="e.g. EP/USP Grade"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Batch / Lot Number</label>
            <input
              type="text"
              name="batch_lot_number"
              value={form.batch_lot_number || ''}
              onChange={handleChange}
              placeholder="e.g. MHC-2507-018"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold text-blue-600 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Manufacturing Date</label>
            <input
              type="text"
              name="manufacturing_date"
              value={form.manufacturing_date || ''}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Expiry Date</label>
            <input
              type="text"
              name="expiry_date"
              value={form.expiry_date || ''}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
            />
          </div>

        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Quantity Affected</label>
          <input
            type="text"
            name="quantity_affected"
            value={form.quantity_affected || ''}
            onChange={handleChange}
            placeholder="e.g. 250 kg (10 drums)"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition"
          />
        </div>
      </div>

      {/* SECTION 3: Complaint Details */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-blue-600" />
          3. Complaint Details
        </h3>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Complaint / Defect Type</label>
          <input
            type="text"
            name="complaint_type"
            value={form.complaint_type || ''}
            onChange={handleChange}
            placeholder="e.g. Out of Specification / OOS Assay"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition font-medium"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1">Detailed Defect Description</label>
          <textarea
            name="detailed_description"
            rows={4}
            value={form.detailed_description || ''}
            onChange={handleChange}
            placeholder="Detailed description of defect, physical observations, analytical test results..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition leading-relaxed"
          />
        </div>
      </div>

      {/* SECTION 4: Initial Assessment & Priority */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-blue-600" />
          4. Initial Assessment & AI Triage Output
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Initial Severity</label>
            <div className="flex items-center gap-2">
              <StatusPill type="severity" value={form.initial_severity} />
              <select
                name="initial_severity"
                value={form.initial_severity || 'Minor'}
                onChange={handleChange}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="Major">Major</option>
                <option value="Minor">Minor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Priority Level</label>
            <select
              name="priority"
              value={form.priority || 'Medium'}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">Form Completeness</label>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    (form.completeness_score || 0) >= 80 ? 'bg-emerald-500' : (form.completeness_score || 0) >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${form.completeness_score || 0}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-700">{form.completeness_score || 0}%</span>
            </div>
          </div>

        </div>

        {/* AI Root Cause & CAPA */}
        {form.root_cause_category && (
          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3.5 space-y-2 text-xs">
            <span className="font-semibold text-blue-900 block">AI Recommended Root Cause Category:</span>
            <span className="font-medium text-blue-700 block">{form.root_cause_category}</span>
            <p className="text-slate-600 text-[11px] leading-relaxed">{form.root_cause_reasoning}</p>
          </div>
        )}

        {form.capa_recommendation && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 space-y-2 text-xs">
            <span className="font-semibold text-emerald-900 block">Recommended 3-Step CAPA:</span>
            <p className="text-slate-700 text-[11px] whitespace-pre-line leading-relaxed">{form.capa_recommendation}</p>
          </div>
        )}

      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={() => dispatch(resetForm())}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-medium text-xs transition flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Form
        </button>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Complaint to Database
        </button>
      </div>

    </form>
  );
}
