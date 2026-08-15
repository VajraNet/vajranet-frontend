import React from 'react';

export type GovtTab = 'MAP' | 'SOS' | 'INCIDENTS' | 'ANNOUNCEMENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF';

interface CommandHeaderProps {
  activeTab: GovtTab;
  onTabChange: (tab: GovtTab) => void;
}

export function CommandHeader({ activeTab, onTabChange }: CommandHeaderProps) {
  const tabs: { id: GovtTab; label: string }[] = [
    { id: 'MAP', label: '🗺️ Tactical GIS Map' },
    { id: 'SOS', label: '🚨 Live SOS Signals' },
    { id: 'INCIDENTS', label: '📋 Incident Feed' },
    { id: 'ANNOUNCEMENTS', label: '📢 Public Announcements' },
    { id: 'SHELTERS', label: '🏠 Shelters' },
    { id: 'HOSPITALS', label: '🏥 Hospital Capacity' },
    { id: 'RELIEF', label: '📦 Relief Centers' },
  ];

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-xl p-4 mb-6 shadow-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-white border border-slate-700 p-1 flex items-center justify-center shrink-0">
            <img 
              src="/vajranet-icon.jpg" 
              alt="VajraNet" 
              className="w-full h-full object-contain rounded" 
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-50">
                Government Emergency Command Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                SYSTEM ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              VajraNet Disaster Platform • Authority Incident Command & Telemetry
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex flex-wrap gap-2 mt-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}