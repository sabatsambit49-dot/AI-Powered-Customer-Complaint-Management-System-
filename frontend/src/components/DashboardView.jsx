import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSavedComplaints, setSelectedComplaint } from '../store/complaintSlice';
import StatusPill from './StatusPill';
import { 
  Search, 
  Filter, 
  FileText, 
  Building2, 
  Package, 
  BrainCircuit, 
  X,
  Clock,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

export default function DashboardView() {
  const dispatch = useDispatch();
  const savedComplaints = useSelector((state) => state.complaint.savedComplaints);
  const selectedComplaint = useSelector((state) => state.complaint.selectedComplaint);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [severityFilter]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      let url = '/api/complaints';
      if (severityFilter !== 'ALL') {
        url += `?severity=${severityFilter}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        dispatch(setSavedComplaints(data));
      }
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = savedComplaints.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      (c.complaint_number && c.complaint_number.toLowerCase().includes(term)) ||
      (c.product_name && c.product_name.toLowerCase().includes(term)) ||
      (c.batch_lot_number && c.batch_lot_number.toLowerCase().includes(term)) ||
      (c.customer_name && c.customer_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, batch #, customer, or complaint ID..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Severity:
          </span>
          {['ALL', 'Critical', 'Major', 'Minor'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                severityFilter === sev
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

      </div>

      {/* Complaints Table / List */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Complaint #</th>
                <th className="py-3.5 px-4 font-semibold">Customer / Source</th>
                <th className="py-3.5 px-4 font-semibold">Product Name</th>
                <th className="py-3.5 px-4 font-semibold">Batch Lot</th>
                <th className="py-3.5 px-4 font-semibold">Defect Type</th>
                <th className="py-3.5 px-4 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No complaints found matching criteria. Log a new complaint from the intake form!
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition group">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                      {item.complaint_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">{item.customer_name || 'N/A'}</span>
                      <span className="text-[11px] text-slate-500">{item.complaint_source || 'Direct'}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {item.product_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {item.batch_lot_number || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {item.complaint_type || 'Unspecified'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill type="severity" value={item.initial_severity} />
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusPill type="status" value={item.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => dispatch(setSelectedComplaint(item))}
                        className="px-3 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 text-xs transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            
            <button
              onClick={() => dispatch(setSelectedComplaint(null))}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center justify-between pr-8 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{selectedComplaint.complaint_number}</span>
                <h3 className="text-lg font-bold text-white">{selectedComplaint.product_name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill type="severity" value={selectedComplaint.initial_severity} />
                <StatusPill type="status" value={selectedComplaint.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Column 1 */}
              <div className="space-y-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-sky-400">
                    <Building2 className="w-3.5 h-3.5" /> Customer Details
                  </span>
                  <div>Customer: <span className="text-slate-200 font-medium">{selectedComplaint.customer_name}</span></div>
                  <div>Email: <span className="text-slate-200 font-medium">{selectedComplaint.customer_email || 'N/A'}</span></div>
                  <div>Source: <span className="text-slate-200 font-medium">{selectedComplaint.complaint_source}</span></div>
                  <div>Date: <span className="text-slate-200 font-medium">{selectedComplaint.complaint_date}</span></div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-sky-400">
                    <Package className="w-3.5 h-3.5" /> Product & Batch
                  </span>
                  <div>Strength: <span className="text-slate-200 font-medium">{selectedComplaint.product_strength_grade}</span></div>
                  <div>Batch / Lot: <span className="font-mono text-sky-300 font-bold">{selectedComplaint.batch_lot_number}</span></div>
                  <div>Mfg / Exp: <span className="text-slate-200">{selectedComplaint.manufacturing_date} / {selectedComplaint.expiry_date}</span></div>
                  <div>Quantity: <span className="text-slate-200">{selectedComplaint.quantity_affected}</span></div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-sky-400">
                    <BrainCircuit className="w-3.5 h-3.5" /> AI Triage & Root Cause
                  </span>
                  <div>Root Cause: <span className="text-sky-300 font-medium">{selectedComplaint.root_cause_category}</span></div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mt-1">{selectedComplaint.root_cause_reasoning}</p>
                </div>

                {selectedComplaint.capa_recommendation && (
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-2">
                    <span className="text-slate-400 font-semibold block text-emerald-400">Recommended CAPA</span>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">{selectedComplaint.capa_recommendation}</p>
                  </div>
                )}
              </div>

            </div>

            {/* Description Box */}
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 space-y-1.5 text-xs">
              <span className="text-slate-400 font-semibold block">Full Defect Description</span>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">{selectedComplaint.detailed_description}</p>
            </div>

            {/* Summary */}
            {selectedComplaint.summary && (
              <div className="bg-sky-500/10 border border-sky-500/30 p-4 rounded-xl text-xs space-y-1">
                <span className="text-sky-300 font-bold block">Executive QA Summary</span>
                <p className="text-slate-200 leading-relaxed">{selectedComplaint.summary}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => dispatch(setSelectedComplaint(null))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
