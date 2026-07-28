import { createSlice } from '@reduxjs/toolkit';

const initialForm = {
  complaint_source: '',
  customer_name: '',
  customer_email: '',
  complaint_date: new Date().toISOString().split('T')[0],
  product_name: '',
  product_strength_grade: '',
  batch_lot_number: '',
  manufacturing_date: '',
  expiry_date: '',
  quantity_affected: '',
  complaint_type: '',
  detailed_description: '',
  raw_text: '',
  file_name: '',
  initial_severity: 'Pending Triage',
  priority: 'Medium',
  status: 'Pending Triage',
  completeness_score: 0,
  missing_fields: [],
  clarifying_questions: [],
  duplicate_flag: false,
  duplicate_matches: [],
  root_cause_category: '',
  root_cause_reasoning: '',
  capa_recommendation: '',
  summary: '',
  regulatory_reporting_flag: '',
  sentiment_urgency: '',
  detected_language: 'English',
  severity_justification: '',
};

const initialState = {
  currentForm: initialForm,
  isExtracting: false,
  progressStep: 'Ready for document upload or text paste',
  progressPct: 0,
  chatMessages: [
    {
      sender: 'assistant',
      content: 'Hello! I am your AI Quality Intake Assistant. Paste a customer complaint email or drag-and-drop a document (PDF, DOCX, TXT, EML) to extract structured fields and run risk triage.',
      timestamp: new Date().toISOString(),
    }
  ],
  savedComplaints: [],
  activeTab: 'intake',
  selectedComplaint: null,
  explainModalOpen: false,
};

export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  reducers: {
    updateFormField: (state, action) => {
      const { field, value } = action.payload;
      state.currentForm[field] = value;
    },
    resetForm: (state) => {
      state.currentForm = { ...initialForm };
      state.progressStep = 'Ready for document upload or text paste';
      state.progressPct = 0;
      state.chatMessages = [
        {
          sender: 'assistant',
          content: 'Form reset. Ready for next complaint intake.',
          timestamp: new Date().toISOString(),
        }
      ];
    },
    setExtracting: (state, action) => {
      state.isExtracting = action.payload;
    },
    setProgress: (state, action) => {
      const { step, percentage } = action.payload;
      state.progressStep = step;
      state.progressPct = percentage;
    },
    populateExtractedData: (state, action) => {
      const data = action.payload;
      state.currentForm = {
        ...state.currentForm,
        ...data,
        status: data.initial_severity ? 'In Review' : 'Pending Triage',
      };
      
      if (data.clarifying_questions && data.clarifying_questions.length > 0) {
        state.chatMessages.push({
          sender: 'assistant',
          content: `⚠️ Completeness Alert (${data.completeness_score}% complete):\n` + data.clarifying_questions.join('\n'),
          timestamp: new Date().toISOString(),
        });
      } else {
        state.chatMessages.push({
          sender: 'assistant',
          content: `✅ Extraction & Risk Triage completed successfully!\nSeverity: ${data.initial_severity || 'Major'} | Priority: ${data.priority || 'Medium'}\n${data.summary ? 'Summary: ' + data.summary : ''}`,
          timestamp: new Date().toISOString(),
        });
      }
    },
    addChatMessage: (state, action) => {
      state.chatMessages.push(action.payload);
    },
    setSavedComplaints: (state, action) => {
      state.savedComplaints = action.payload;
    },
    addSavedComplaint: (state, action) => {
      state.savedComplaints.unshift(action.payload);
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
    setExplainModalOpen: (state, action) => {
      state.explainModalOpen = action.payload;
    }
  },
});

export const {
  updateFormField,
  resetForm,
  setExtracting,
  setProgress,
  populateExtractedData,
  addChatMessage,
  setSavedComplaints,
  addSavedComplaint,
  setActiveTab,
  setSelectedComplaint,
  setExplainModalOpen,
} = complaintSlice.actions;

export default complaintSlice.reducer;
