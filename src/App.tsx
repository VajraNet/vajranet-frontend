import React, { useState } from 'react';
import { CommandHeader } from './components/government/CommandHeader';
import { MetricsOverview } from './components/government/MetricsOverview';
import { LiveSOSFeed } from './components/government/LiveSOSFeed';
import { IncidentList } from './components/government/IncidentList';
import { AnnouncementPublisher } from './components/government/AnnouncementPublisher';
import { ResourceShelters } from './components/government/ResourceShelters';
import { ResourceHospitals } from './components/government/ResourceHospitals';
import { ResourceRelief } from './components/government/ResourceRelief';

import { VolunteerHeader } from './components/volunteers/VolunteerHeader';
import { IncidentResponseBoard } from './components/volunteers/IncidentResponseBoard';
import { PrivateShelterManager } from './components/volunteers/PrivateShelterManager';
import { PrivateHospitalManager } from './components/volunteers/PrivateHospitalManager';
import { ReliefFundraisers } from './components/volunteers/ReliefFundraisers';
import { VolunteerProfile } from './components/volunteers/VolunteerProfile';

export function App() {
  const [currentRole, setCurrentRole] = useState<'GOVERNMENT' | 'VOLUNTEER'>('GOVERNMENT');
  const [govtTab, setGovtTab] = useState<'SOS' | 'INCIDENTS' | 'ANNOUNCEMENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF'>('SOS');
  const [volunteerTab, setVolunteerTab] = useState<'TASKS' | 'SHELTERS' | 'HOSPITALS' | 'FUNDRAISERS' | 'PROFILE'>('TASKS');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Dev Switcher Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-red-500 uppercase">VAJRANET WEB</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Emergency Operations Platform</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Active View:</span>
          <button
            onClick={() => setCurrentRole('GOVERNMENT')}
            className={`px-3 py-1 rounded font-medium transition ${
              currentRole === 'GOVERNMENT'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Government Command Center
          </button>
          <button
            onClick={() => setCurrentRole('VOLUNTEER')}
            className={`px-3 py-1 rounded font-medium transition ${
              currentRole === 'VOLUNTEER'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Volunteer Portal
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {currentRole === 'GOVERNMENT' ? (
          <div>
            <CommandHeader activeTab={govtTab} onTabChange={setGovtTab} />
            <MetricsOverview />
            <div className="mt-6">
              {govtTab === 'SOS' && <LiveSOSFeed />}
              {govtTab === 'INCIDENTS' && <IncidentList />}
              {govtTab === 'ANNOUNCEMENTS' && <AnnouncementPublisher />}
              {govtTab === 'SHELTERS' && <ResourceShelters />}
              {govtTab === 'HOSPITALS' && <ResourceHospitals />}
              {govtTab === 'RELIEF' && <ResourceRelief />}
            </div>
          </div>
        ) : (
          <div>
            <VolunteerHeader activeTab={volunteerTab} onTabChange={setVolunteerTab} />
            <div className="mt-6">
              {volunteerTab === 'TASKS' && <IncidentResponseBoard />}
              {volunteerTab === 'SHELTERS' && <PrivateShelterManager />}
              {volunteerTab === 'HOSPITALS' && <PrivateHospitalManager />}
              {volunteerTab === 'FUNDRAISERS' && <ReliefFundraisers />}
              {volunteerTab === 'PROFILE' && <VolunteerProfile />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;