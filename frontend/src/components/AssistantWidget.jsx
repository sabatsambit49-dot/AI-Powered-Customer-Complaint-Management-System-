import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setExtracting, 
  setProgress, 
  populateExtractedData, 
  addChatMessage 
} from '../store/complaintSlice';
import { API_BASE } from '../config';
import { 
  UploadCloud, 
  FileText, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  FileCheck
} from 'lucide-react';

export default function AssistantWidget() {
  const dispatch = useDispatch();
  const form = useSelector((state) => state.complaint.currentForm);
  const isExtracting = useSelector((state) => state.complaint.isExtracting);
  const progressStep = useSelector((state) => state.complaint.progressStep);
  const progressPct = useSelector((state) => state.complaint.progressPct);
  const chatMessages = useSelector((state) => state.complaint.chatMessages);

  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const loadSample = async (sampleName) => {
    try {
      let content = "";
      if (sampleName === "foreign_particulate") {
        content = `From: Dr. Aris Thorne <a.thorne@stjude-hospital.org>\nTo: QA Complaints <qa@apexpharma.com>\nSubject: URGENT: Black Particulate Matter Observed in Sterile Ceftriaxone Injection Vials (Batch #CFT-9082)\nDate: Mon, 27 Jul 2026\n\nDear QA Team,\nDuring routine reconstitution in ICU at St. Jude Hospital, pharmacy staff noticed black thread-like particulate matter floating inside two 1g vials of Ceftriaxone Sodium (Batch CFT-9082, Exp 11/2027, Mfg 05/2026). Vials quarantined. Immediately provide return authorization.`;
      } else if (sampleName === "mislabeled_strength") {
        content = `Origin: Community Pharmacy Network (MediCare Retail)\nCustomer: MediCare Pharmacy #402 (Sarah Jenkins)\nEmail: s.jenkins@medicare-pharm.com\nProduct: Metoprolol Succinate ER Tablets\nIssue: Carton label specifies 50mg strength, but internal aluminum blister backing is printed as 100mg strength!\nBatch: MTP-4412\nMfg: 2026-01-15 | Exp: 2028-01-14\nQty: 4 boxes (40 blister packs). One patient dizziness reported.`;
      } else if (sampleName === "cold_chain") {
        content = `From: Logistics QA <logistics-qa@biologix.com>\nSubject: Cold Chain Temperature Excursion Notification - Insul-Fine Biologic (Batch #INS-7701)\nCustomer: BioLogix Regional Distribution Hub\nProduct: Insul-Fine (Recombinant Human Insulin) 100 IU/mL\nBatch: INS-7701 | Mfg: 2026-03-10 | Exp: 2027-09-09\nData logger recorded +18°C excursion for 14 hours during refrigerated transit (limit +2 to +8°C). 500 vials held in quarantine.`;
      }
      setPastedText(content);
    } catch (err) {
      console.error(err);
    }
  };

  const runExtraction = async () => {
    if (!pastedText && !selectedFile) {
      alert("Please paste complaint text or select a document file first.");
      return;
    }

    dispatch(setExtracting(true));
    dispatch(setProgress({ step: 'Initializing LangGraph Agent pipeline...', percentage: 5 }));

    const formData = new FormData();
    if (selectedFile) formData.append('file', selectedFile);
    if (pastedText) formData.append('raw_text', pastedText);

    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/complaints/extract`,
        {
          method: 'POST',
          body: formData,
        },
        token,
        () => dispatch(logout())
      );

      if (!response.ok) throw new Error("Backend extraction failed");

      const data = await response.json();
      dispatch(setProgress({ step: 'Pipeline completed!', percentage: 100 }));
      dispatch(populateExtractedData(data));
    } catch (err) {
      alert("Error running extraction: " + err.message);
    } finally {
      dispatch(setExtracting(false));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg = {
      sender: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };
    dispatch(addChatMessage(userMsg));
    const currentInput = chatInput;
    setChatInput('');
    setIsChatSending(true);

    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/complaints/chat-draft`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_req: { message: currentInput },
            complaint_draft: form
          })
        },
        token,
        () => dispatch(logout())
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(addChatMessage({
          sender: 'assistant',
          content: data.reply,
          timestamp: data.timestamp
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 flex flex-col h-full">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-sky-400" />
            AI Intake Assistant & Document Ingestion
          </h2>
          <p className="text-xs text-slate-400">Powered by Groq LLM & LangGraph Workflow</p>
        </div>
      </div>

      {/* Upload & Paste Container */}
      <div className="space-y-3 text-xs">
        
        {/* Drag & Drop File Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
          className="border-2 border-dashed border-slate-700/80 hover:border-sky-500/60 bg-slate-800/40 rounded-xl p-4 text-center transition cursor-pointer group"
        >
          <input
            type="file"
            id="fileUpload"
            onChange={handleFileSelect}
            accept=".pdf,.docx,.doc,.txt,.eml"
            className="hidden"
          />
          <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center gap-2">
            <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-sky-400 transition" />
            <div>
              <span className="text-slate-300 font-medium block">
                {selectedFile ? selectedFile.name : "Drag & drop document or click to browse"}
              </span>
              <span className="text-[11px] text-slate-500">Supports PDF, DOCX, TXT, and EML files</span>
            </div>
          </label>
        </div>

        {/* Text Area */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-slate-400 font-medium">Or Paste Complaint Text / Email</label>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Sample Data:</span>
              <button
                type="button"
                onClick={() => loadSample("foreign_particulate")}
                className="text-[11px] text-sky-400 hover:text-sky-300 transition underline"
              >
                Injectable Particulate
              </button>
              <button
                type="button"
                onClick={() => loadSample("mislabeled_strength")}
                className="text-[11px] text-sky-400 hover:text-sky-300 transition underline"
              >
                Mislabeling
              </button>
              <button
                type="button"
                onClick={() => loadSample("cold_chain")}
                className="text-[11px] text-sky-400 hover:text-sky-300 transition underline"
              >
                Cold Chain
              </button>
            </div>
          </div>
          <textarea
            rows={4}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste raw email or complaint description here..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition leading-relaxed resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={runExtraction}
          disabled={isExtracting}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-md shadow-sky-600/20 disabled:opacity-50"
        >
          {isExtracting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running LangGraph Agent Nodes...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run AI Extraction & Triage Pipeline
            </>
          )}
        </button>

      </div>

      {/* Progress Bar */}
      {isExtracting && (
        <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
              {progressStep}
            </span>
            <span className="font-mono text-sky-400 font-bold">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <hr className="border-slate-800" />

      {/* Conversational Assistant RAG Chat Widget */}
      <div className="flex-1 flex flex-col space-y-3 min-h-[250px]">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Bot className="w-4 h-4 text-sky-400" />
          Conversational QA Assistant
        </span>

        {/* Messages Log */}
        <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 overflow-y-auto space-y-3 max-h-[260px]">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 text-xs ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask me anything about this complaint or regulatory impact..."
            className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />
          <button
            type="submit"
            disabled={isChatSending || !chatInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-50 flex items-center justify-center"
          >
            {isChatSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

      </div>

    </div>
  );
}
