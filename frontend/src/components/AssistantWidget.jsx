import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setExtracting, 
  setProgress, 
  populateExtractedData, 
  addChatMessage 
} from '../store/complaintSlice';
import { logout } from '../store/authSlice';
import { API_BASE, fetchWithAuth } from '../config';
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
  const token = useSelector((state) => state.auth.token);

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
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 flex flex-col h-full">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            AI Complaint Intake Assistant
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
              BETA
            </span>
          </h2>
          <p className="text-xs text-slate-500">Upload document or paste email text to extract structured QA fields</p>
        </div>
        <Bot className="w-5 h-5 text-blue-600" />
      </div>

      {/* Drag & Drop File Upload Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 rounded-xl p-4 text-center transition cursor-pointer relative"
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt,.eml"
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-1.5 pointer-events-none">
          {selectedFile ? (
            <>
              <FileCheck className="w-7 h-7 text-blue-600" />
              <span className="text-xs font-semibold text-slate-800">{selectedFile.name}</span>
              <span className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB — Ready to extract</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-7 h-7 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">Drag & drop document (PDF, DOCX, TXT, EML)</span>
              <span className="text-[11px] text-slate-400">or click to browse from local computer</span>
            </>
          )}
        </div>
      </div>

      {/* Text Paste Fallback */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700 block">Or Paste Complaint Text / Email</label>
        <textarea
          rows={3}
          value={pastedText}
          onChange={(e) => setPastedText(e.target.value)}
          placeholder="Paste raw customer email or complaint text here..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none transition leading-relaxed"
        />
      </div>

      {/* Run Extraction Button */}
      <button
        type="button"
        onClick={runExtraction}
        disabled={isExtracting}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isExtracting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Running Extraction & Triage...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Run AI Extraction & Triage Pipeline</span>
          </>
        )}
      </button>

      {/* Progress Bar */}
      {isExtracting && (
        <div className="space-y-1.5 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
          <div className="flex justify-between text-xs font-medium text-blue-900">
            <span>{progressStep}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Assistant Chat Stream */}
      <div className="flex-1 flex flex-col space-y-3 pt-2">
        <span className="text-xs font-semibold text-slate-700 block">QA Assistant Interaction</span>
        
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3 max-h-64 overflow-y-auto">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[85%] text-xs p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-blue-50 border border-blue-100 text-slate-800 rounded-bl-none shadow-xs'
                }`}
              >
                {msg.content}
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
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
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition"
          />
          <button
            type="submit"
            disabled={isChatSending || !chatInput.trim()}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 flex items-center justify-center shadow-sm"
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
