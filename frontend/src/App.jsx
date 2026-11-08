import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AIAssistantDrawer from './components/AIAssistantDrawer';
import CitizenView from './pages/CitizenView';
import CollectorView from './pages/CollectorView';
import FacilityView from './pages/FacilityView';
import CommandCenterView from './pages/CommandCenterView';
import { api } from './lib/api';
import { IconBot, IconSparkles, IconShield } from './components/Icons';

export default function App() {
  const [activeRole, setActiveRole] = useState('super_admin'); // 'citizen', 'collector', 'facility_manager', 'super_admin'
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      await api.getHealth();
      setBackendOnline(true);
    } catch (e) {
      setBackendOnline(false);
    }
  };

  const handleRoleChange = async (role) => {
    setActiveRole(role);
    try {
      await api.switchRole(role);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-forest-50 text-carbon-900 font-sans selection:bg-forest-100 selection:text-forest-900">
      
      {/* Primary Navigation Bar */}
      <Navbar
        activeRole={activeRole}
        onSelectRole={handleRoleChange}
        backendOnline={backendOnline}
      />

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeRole === 'citizen' && <CitizenView />}
        {activeRole === 'collector' && <CollectorView />}
        {activeRole === 'facility_manager' && <FacilityView />}
        {activeRole === 'super_admin' && <CommandCenterView />}
      </main>

      {/* Floating AI Assistant Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-forest-900 hover:bg-forest-950 text-white rounded-2xl shadow-2xl border border-forest-700 transition transform hover:scale-105 active:scale-95"
        >
          <div className="w-8 h-8 rounded-xl bg-forest-700 flex items-center justify-center text-forest-200 shadow-inner group-hover:rotate-6 transition">
            <IconBot className="w-5 h-5 text-forest-300" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold block leading-tight flex items-center gap-1">
              WasteWise AI
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <span className="text-[10px] text-forest-300 leading-tight">Asisten Operasional</span>
          </div>
        </button>
      </div>

      {/* Sliding AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-carbon-200 mt-12 py-6 text-carbon-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-forest-900 font-semibold">
            <span>♻️ WasteWise Platform</span>
            <span className="text-carbon-300">|</span>
            <span className="text-carbon-600 font-normal">Circular Economy & Smart Waste Operating System</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-carbon-400">
            <span>Kota Surabaya DLH</span>
            <span>•</span>
            <span>FastAPI + Vite React</span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">9 Kelas AI YOLOv8</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
