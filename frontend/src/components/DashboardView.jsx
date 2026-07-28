import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setSavedComplaints, 
  setSelectedComplaint, 
  updateComplaintStatus, 
  deleteSavedComplaint 
} from '../store/complaintSlice';
import { logout } from '../store/authSlice';
import StatusPill from './StatusPill';
import { API_BASE, fetchWithAuth } from '../config';
import { 
  Search, 
  Filter, 
  FileText, 
  Building2, 
  Package, 
  BrainCircuit, 
  X,
  CheckCircle2,
  Trash2,
  Eye,
  AlertTriangle
} from 'lucide-react';

export default function DashboardView() {
  const dispatch = useDispatch();
  const savedComplaints = useSelector((state) => state.complaint.savedComplaints);
  const selectedComplaint = useSelector((state) => state.complaint.selectedComplaint);
  const token = useSelector((state) => state.auth.token);

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Delete confirmation state
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResolvingId, setIsResolvingId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [severityFilter, statusFilter]);

  const showToast = (msg, isError = false) => {
    setToastMessage({ text: msg, isError });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      let url = `${API_BASE}/api/complaints`;
      const params = new URLSearchParams();
      if (severityFilter !== 'ALL') params.append('severity', severityFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetchWithAuth(
        url,
        {},
        token,
        () => dispatch(logout())
      );
      if (res.ok) {
        const data = await res.json();
        dispatch(setSavedComplaints(data));
      } else {
        showToast('Failed to load complaints from backend.', true);
      }
    } catch (err) {
      showToast('Error connecting to backend API: ' + err.message, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (item) => {
    setIsResolvingId(item.id);
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/complaints/${item.id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Resolved' })
        },
        token,
        () => dispatch(logout())
      );

      if (response.ok) {
        dispatch(updateComplaintStatus({ id: item.id, status: 'Resolved' }));
        showToast(`Complaint ${item.complaint_number} marked as Resolved.`);
      } else {
        showToast(`Failed to update status for ${item.complaint_number}.`, true);
      }
    } catch (err) {
      showToast('Network error while resolving complaint: ' + err.message, true);
    } finally {
      setIsResolvingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/complaints/${deleteCandidate.id}`,
        {
          method: 'DELETE'
        },
        token,
        () => dispatch(logout())
      );

      if (response.ok) {
        dispatch(deleteSavedComplaint(deleteCandidate.id));
        showToast(`Complaint ${deleteCandidate.complaint_number} deleted.`);
        setDeleteCandidate(null);
      } else {
        showToast(`Failed to delete ${deleteCandidate.complaint_number}.`, true);
      }
    } catch (err) {
      showToast('Network error deleting complaint: ' + err.message, true);
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = savedComplaints.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
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
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border text-xs font-medium shadow-xl flex items-center gap-2 animate-fade-in ${
          toastMessage.isError
            ? 'bg-rose-900/90 border-rose-500 text-rose-200'
            : 'bg-emerald-900/90 border-emerald-500 text-emerald-200'
        }`}>
          {toastMessage.isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toastMessage.text}
        </div>
      )}

      {/* Search & Filter Header */}
      <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg">
        
        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product, batch #, customer..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4 text-xs w-full lg:w-auto justify-end">
          
          {/* Severity Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Severity:
            </span>
            {['ALL', 'Critical', 'Major', 'Minor'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  severityFilter === sev
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            {['ALL', 'Pending Triage', 'In Review', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === st
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

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
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* View Details */}
                        <button
                          onClick={() => dispatch(setSelectedComplaint(item))}
                          title="View Details"
                          className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/40 text-sky-400 border border-sky-500/30 text-xs font-medium transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </button>

                        {/* Resolve Action */}
                        <button
                          onClick={() => handleResolve(item)}
                          disabled={item.status === 'Resolved' || isResolvingId === item.id}
                          title={item.status === 'Resolved' ? 'Already Resolved' : 'Mark as Resolved'}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                            item.status === 'Resolved'
                              ? 'bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/20 cursor-default'
                              : 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">
                            {item.status === 'Resolved' ? 'Resolved' : 'Resolve'}
                          </span>
                        </button>

                        {/* Delete Action */}
                        <button
                          onClick={() => setDeleteCandidate(item)}
                          title="Delete Complaint"
                          className="p-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Complaint</h3>
                <p className="text-xs text-slate-400">Confirmation Required</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Delete complaint <span className="font-mono font-bold text-rose-400">{deleteCandidate.complaint_number}</span> ({deleteCandidate.product_name || 'Record'})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
