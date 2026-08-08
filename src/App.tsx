import React, { useState } from 'react';

// Government Components
import { CommandHeader, GovtTab } from './components/government/CommandHeader';
import { MetricsOverview } from './components/government/MetricsOverview';
import { LiveSOSFeed } from './components/government/LiveSOSFeed';
import { IncidentList } from './components/government/IncidentList';
import { AnnouncementPublisher } from './components/government/AnnouncementPublisher';
import { ResourceShelters } from './components/government/ResourceShelters';
import { ResourceHospitals } from './components/government/ResourceHospitals';
import { ResourceRelief } from './components/government/ResourceRelief';

// Volunteer Components (Import VolTab here)
import { VolunteerHeader, VolTab } from './components/volunteers/VolunteerHeader';
import { IncidentResponseBoard } from './components/volunteers/IncidentResponseBoard';
import { PrivateShelterManager } from './components/volunteers/PrivateShelterManager';
import { PrivateHospitalManager } from './components/volunteers/PrivateHospitalManager';
import { ReliefFundraisers } from './components/volunteers/ReliefFundraisers';
import { VolunteerProfile } from './components/volunteers/VolunteerProfile';

export default function App() {
  // Main Portal Toggle State: 'GOVERNMENT' | 'VOLUNTEER'
  const [portalMode, setPortalMode] = useState<'GOVERNMENT' | 'VOLUNTEER'>('GOVERNMENT');

  // Sub-tab States (Explicitly typed)
  const [govtTab, setGovtTab] = useState<GovtTab>('SOS');
  const [volTab, setVolTab] = useState<VolTab>('INCIDENTS');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Portal Switcher Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black tracking-wider text-blue-500 uppercase text-sm">VajraNet</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Disaster Management Platform</span>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded border border-slate-800 gap-1">
          <button
            onClick={() => setPortalMode('GOVERNMENT')}
            className={`px-3 py-1.5 rounded transition font-bold ${
              portalMode === 'GOVERNMENT'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏛️ Government Command Center
          </button>
          <button
            onClick={() => setPortalMode('VOLUNTEER')}
            className={`px-3 py-1.5 rounded transition font-bold ${
              portalMode === 'VOLUNTEER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🤝 Volunteer & Private Relief
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {portalMode === 'GOVERNMENT' ? (
          <>
            <CommandHeader activeTab={govtTab} onTabChange={setGovtTab} />

            {/* Always display overall metrics at the top of Command Center */}
            <MetricsOverview />

            {govtTab === 'SOS' && <LiveSOSFeed />}
            {govtTab === 'INCIDENTS' && <IncidentList />}
            {govtTab === 'ANNOUNCEMENTS' && <AnnouncementPublisher />}
            {govtTab === 'SHELTERS' && <ResourceShelters />}
            {govtTab === 'HOSPITALS' && <ResourceHospitals />}
            {govtTab === 'RELIEF' && <ResourceRelief />}
          </>
        ) : (
          <>
            <VolunteerHeader activeTab={volTab} setActiveTab={(tab) => setVolTab(tab as VolTab)} />

            {volTab === 'INCIDENTS' && <IncidentResponseBoard />}
            {volTab === 'SHELTERS' && <PrivateShelterManager />}
            {volTab === 'HOSPITALS' && <PrivateHospitalManager />}
            {volTab === 'FUNDRAISERS' && <ReliefFundraisers />}
            {volTab === 'PROFILE' && <VolunteerProfile />}
          </>
        )}
      </main>
    </div>
  );
}