import React, { useState } from 'react';
import { Login } from './components/Login';

// Government Components
import { CommandHeader, GovtTab } from './components/government/CommandHeader';
import { MetricsOverview } from './components/government/MetricsOverview';
import { LiveSOSFeed } from './components/government/LiveSOSFeed';
import { IncidentList } from './components/government/IncidentList';
import { AnnouncementPublisher } from './components/government/AnnouncementPublisher';
import { ResourceShelters } from './components/government/ResourceShelters';
import { ResourceHospitals } from './components/government/ResourceHospitals';
import { ResourceRelief } from './components/government/ResourceRelief';

// Volunteer Components
import { VolunteerHeader, VolTab } from './components/volunteers/VolunteerHeader';
import { IncidentResponseBoard } from './components/volunteers/IncidentResponseBoard';
import { PrivateShelterManager } from './components/volunteers/PrivateShelterManager';
import { PrivateHospitalManager } from './components/volunteers/PrivateHospitalManager';
import { ReliefFundraisers } from './components/volunteers/ReliefFundraisers';
import { VolunteerProfile } from './components/volunteers/VolunteerProfile';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // Portal Mode State: 'GOVERNMENT' | 'VOLUNTEER' | 'VAJRA_AI'
  const [portalMode, setPortalMode] = useState<'GOVERNMENT' | 'VOLUNTEER' | 'VAJRA_AI'>('GOVERNMENT');

  // Sub-tab States
  const [govtTab, setGovtTab] = useState<GovtTab>('SOS');
  const [volTab, setVolTab] = useState<VolTab>('INCIDENTS');

  // AI Chat Input State
  const [aiQuery, setAiQuery] = useState<string>('');

  // 1. Unauthenticated View: Show Login Screen
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={(userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  // 2. Authenticated View: Full Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation & Switcher Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black tracking-wider text-blue-500 uppercase text-sm">VajraNet</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Disaster Management Platform</span>
        </div>

        {/* Portal Switcher Navigation */}
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
          <button
            onClick={() => setPortalMode('VAJRA_AI')}
            className={`px-3 py-1.5 rounded transition font-bold flex items-center gap-1.5 ${
              portalMode === 'VAJRA_AI'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <span>🤖 VajraAI</span>
            <span className="bg-purple-500/30 text-purple-200 text-[10px] px-1.5 py-0.2 rounded font-mono">LIVE</span>
          </button>
        </div>

        {/* Verified User Info & Sign Out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2.5 py-1 rounded border border-green-500/20 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Verified: {user?.name || 'Official'}
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-slate-400 hover:text-red-400 transition font-medium"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {portalMode === 'GOVERNMENT' && (
          <>
            <CommandHeader activeTab={govtTab} onTabChange={setGovtTab} />
            <MetricsOverview />

            {govtTab === 'SOS' && <LiveSOSFeed />}
            {govtTab === 'INCIDENTS' && <IncidentList />}
            {govtTab === 'ANNOUNCEMENTS' && <AnnouncementPublisher />}
            {govtTab === 'SHELTERS' && <ResourceShelters />}
            {govtTab === 'HOSPITALS' && <ResourceHospitals />}
            {govtTab === 'RELIEF' && <ResourceRelief />}
          </>
        )}

        {portalMode === 'VOLUNTEER' && (
          <>
            <VolunteerHeader activeTab={volTab} setActiveTab={(tab) => setVolTab(tab as VolTab)} />

            {volTab === 'INCIDENTS' && <IncidentResponseBoard />}
            {volTab === 'SHELTERS' && <PrivateShelterManager />}
            {volTab === 'HOSPITALS' && <PrivateHospitalManager />}
            {volTab === 'FUNDRAISERS' && <ReliefFundraisers />}
            {volTab === 'PROFILE' && <VolunteerProfile />}
          </>
        )}

        {portalMode === 'VAJRA_AI' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-[78vh] flex flex-col justify-between shadow-xl">
            {/* VajraAI Header */}
            <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🤖</span> VajraAI Emergency Intelligence
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Connected to real-time disaster response model. Performs automated triage summaries and resource allocation dispatch.
                </p>
              </div>
              <span className="bg-purple-900/40 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-mono">
                System Status: Operational
              </span>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 bg-slate-950/80 rounded-lg p-4 my-4 overflow-y-auto space-y-3 border border-slate-800/80">
              <div className="bg-purple-950/30 border border-purple-800/40 text-purple-200 p-3.5 rounded-lg text-xs leading-relaxed max-w-2xl">
                <span className="font-bold text-purple-300 block mb-1">🤖 VajraAI Engine:</span>
                Ready for queries. You can request live SOS signal priority rankings, shelter occupancy forecasts, or optimized evacuation routing vectors.
              </div>
            </div>

            {/* AI Query Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="Ask VajraAI for intelligence summaries or route dispatches..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <button 
                onClick={() => setAiQuery('')}
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-lg font-bold text-xs transition shadow-lg shadow-purple-600/20"
              >
                Send Query
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
