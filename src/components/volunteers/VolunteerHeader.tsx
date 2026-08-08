import React, { useState } from 'react';

interface VolunteerHeaderProps {
  volunteerName?: string;
  assignedZone?: string;
  role?: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function VolunteerHeader({
  volunteerName = 'Volunteer Operator',
  assignedZone = 'Zone 4 - Riverbank',
  role = 'First Responder / Logistics',
  activeTab,
  setActiveTab,
}: VolunteerHeaderProps) {
  const [isOnDuty, setIsOnDuty] = useState(true);

  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 lg:p-6 text-slate-100">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Profile & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-700 flex items-center gap-0 justify-center text-emerald-400 font-bold text-base">
            🤝
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
            <p className="text-xs text-slate-400 mt-0.5">
              Role: <span className="text-slate-300 font-medium">{role}</span> • Sector:{' '}
              <span className="text-slate-300 font-medium">{assignedZone}</span>
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`text-xs font-semibold px-3 py-1.5 rounded border transition ${
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
      <nav className="flex items-center gap-2 mt-6 overflow-x-auto border-b border-slate-800/60 pb-1 text-xs font-medium">
        <button
          onClick={() => setActiveTab('TASKS')}
          className={`px-3 py-2 rounded-t border-b-2 transition whitespace-nowrap ${
            activeTab === 'TASKS'
              ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📋 Assigned Field Tasks
        </button>
        <button
          onClick={() => setActiveTab('RESOURCE_MAPPING')}
          className={`px-3 py-2 rounded-t border-b-2 transition whitespace-nowrap ${
            activeTab === 'RESOURCE_MAPPING'
              ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🗺️ Community Resource Mapping
        </button>
        <button
          onClick={() => setActiveTab('OFFLINE_SYNC')}
          className={`px-3 py-2 rounded-t border-b-2 transition whitespace-nowrap ${
            activeTab === 'OFFLINE_SYNC'
              ? 'border-emerald-500 text-emerald-400 font-bold bg-slate-800/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          📡 Mesh & Offline Sync Status
        </button>
      </nav>
    </header>
  );
}