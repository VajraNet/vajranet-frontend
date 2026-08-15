import React, { useState } from 'react';

export type VolTab = 
  | 'OVERVIEW'
  | 'SOS'
  | 'TASKS' 
  | 'INCIDENTS' 
  | 'SHELTERS' 
  | 'HOSPITALS' 
  | 'FUNDRAISERS' 
  | 'PROFILE';

interface VolunteerHeaderProps {
  volunteerName?: string;
  assignedZone?: string;
  role?: string;
  activeTab: string;
  setActiveTab: (tab: VolTab) => void;
}

export function VolunteerHeader({
  volunteerName = 'Volunteer Operator',
  assignedZone = 'Zone 4 - Riverbank',
  role = 'First Responder / Logistics',
  activeTab,
  setActiveTab,
}: VolunteerHeaderProps) {
  const [isOnDuty, setIsOnDuty] = useState(true);

  const tabs: { id: VolTab; label: string }[] = [
    { id: 'OVERVIEW', label: '📊 Overview' },
    { id: 'SOS', label: '🚨 Live Citizen SOS Calls' },
    { id: 'INCIDENTS', label: '⚠️ Field Incidents' },
    { id: 'TASKS', label: '📋 Assigned Tasks' },
    { id: 'SHELTERS', label: '🏠 Private Shelters' },
    { id: 'HOSPITALS', label: '🏥 Private Hospitals' },
    { id: 'FUNDRAISERS', label: '💰 Relief Campaigns' },
    { id: 'PROFILE', label: '👤 Volunteer Profile' },
  ];

  return (
    <header className="bg-[#0F1E36] border border-slate-800 rounded-xl p-4 lg:p-6 text-slate-100 shadow-md mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Profile & Status */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-white border border-slate-700 p-1 flex items-center justify-center shrink-0">
            <img 
              src="/vajranet-icon.jpg" 
              alt="VajraNet Volunteer" 
              className="w-full h-full object-contain rounded" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100">{volunteerName}</h1>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  isOnDuty
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              VajraNet Force • Role: <span className="text-slate-300 font-medium">{role}</span> • Sector:{' '}
              <span className="text-slate-300 font-medium">{assignedZone}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
              isOnDuty
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
            }`}
          >
            {isOnDuty ? 'Go Off Duty' : 'Check In On Duty'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-2 mt-6 overflow-x-auto border-b border-slate-800 pb-1 text-xs font-medium">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-t-lg border-b-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}