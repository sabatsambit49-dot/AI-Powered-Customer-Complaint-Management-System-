import React from 'react';
import { useSelector } from 'react-redux';
import Header from './components/Header';
import ComplaintForm from './components/ComplaintForm';
import AssistantWidget from './components/AssistantWidget';
import DashboardView from './components/DashboardView';
import ExplainModal from './components/ExplainModal';

function MainContent() {
  const activeTab = useSelector((state) => state.complaint.activeTab);

  if (activeTab === 'dashboard') {
    return (
      <main className="max-w-7xl mx-auto px-6 py-6">
        <DashboardView />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT PANEL: Log Customer Complaint Form (7 cols) */}
      <div className="lg:col-span-7">
        <ComplaintForm />
      </div>

      {/* RIGHT PANEL: AI Complaint Intake Assistant & Chat (5 cols) */}
      <div className="lg:col-span-5 h-full">
        <AssistantWidget />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      <Header />
      <div className="flex-1">
        <MainContent />
      </div>
      <ExplainModal />
    </div>
  );
}
