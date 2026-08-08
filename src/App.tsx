import React, { useState } from 'react';
import { Login } from './components/Login';

// Common / Shared Components
import { TacticalGISMap } from './components/common/TacticalGISMap';

// Government Components
import { GovtOverview } from './components/government/GovtOverview';
import { LiveSOSFeed } from './components/government/LiveSOSFeed';
import { IncidentList } from './components/government/IncidentList';
import { AnnouncementPublisher } from './components/government/AnnouncementPublisher';
import { ResourceShelters } from './components/government/ResourceShelters';
import { ResourceHospitals } from './components/government/ResourceHospitals';
import { ResourceRelief } from './components/government/ResourceRelief';

// Volunteer Components
import { VolunteerOverview } from './components/volunteers/VolunteerOverview';
import { IncidentResponseBoard } from './components/volunteers/IncidentResponseBoard';
import { FieldTasks } from './components/volunteers/FieldTasks';
import { PrivateShelterManager } from './components/volunteers/PrivateShelterManager';
import { PrivateHospitalManager } from './components/volunteers/PrivateHospitalManager';
import { ReliefFundraisers } from './components/volunteers/ReliefFundraisers';
import { ResourceMapping } from './components/volunteers/ResourceMapping';
import { OfflineMeshSync } from './components/volunteers/OfflineMeshSync';
import { VolunteerProfile } from './components/volunteers/VolunteerProfile';

// Icons & API Client
import { 
  ShieldAlert, 
  Flame, 
  Radio, 
  Home, 
  HeartPulse, 
  Package, 
  Compass, 
  Send, 
  Bot, 
  Sparkles, 
  AlertCircle, 
  LayoutDashboard, 
  CheckSquare, 
  DollarSign, 
  User, 
  LogOut, 
  ChevronRight,
  Layers,
  Map as MapIcon
} from 'lucide-react';
import { apiClient } from './api/client';

export type GovtTab = 'OVERVIEW' | 'SOS' | 'INCIDENTS' | 'ANNOUNCEMENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF' | 'MAP';
export type VolTab = 'OVERVIEW' | 'INCIDENTS' | 'TASKS' | 'SHELTERS' | 'HOSPITALS' | 'FUNDRAISERS' | 'OFFLINE_SYNC' | 'PROFILE';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  // Portal Mode State: 'GOVERNMENT' | 'VOLUNTEER' | 'VAJRA_AI'
  const [portalMode, setPortalMode] = useState<'GOVERNMENT' | 'VOLUNTEER' | 'VAJRA_AI'>('GOVERNMENT');

  // Sub-tab States (Defaults to OVERVIEW for clean landing experience)
  const [govtTab, setGovtTab] = useState<GovtTab>('OVERVIEW');
  const [volTab, setVolTab] = useState<VolTab>('OVERVIEW');

  // AI Intelligence Chat State
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiChatLog, setAiChatLog] = useState<Array<{ sender: 'ai' | 'user'; text: string; advisory?: string; suggestions?: string[] }>>([
    {
      sender: 'ai',
      text: 'Namaste Command. I am VajraAI Emergency Intelligence Engine. Ask me for automated situation triage summaries, shelter bottleneck predictions, or optimized field rescue routes.',
      suggestions: [
        'Generate Situation Triage Summary',
        'Check Shelter Capacity Bottlenecks',
        'Recommend Flood Evacuation Corridors',
        'Summarize Critical SOS Signals'
      ]
    }
  ]);

  const handleSendAiQuery = async (queryText?: string) => {
    const textToSend = queryText || aiQuery;
    if (!textToSend.trim() || aiLoading) return;

    setAiChatLog(prev => [...prev, { sender: 'user', text: textToSend }]);
    setAiQuery('');
    setAiLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: textToSend,
        latitude: 28.6139,
        longitude: 77.2090
      });
      const data = res.data;
      setAiChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'Analysis complete: Emergency response parameters within acceptable thresholds.',
          advisory: data.safety_advisory,
          suggestions: data.suggested_actions || []
        }
      ]);
    } catch {
      let fallbackText = 'VajraAI Advisory: Maintain continuous monitoring on low-lying riverbanks. Dispatch swiftwater teams to Sector 4 and prepare secondary shelter capacities.';
      if (textToSend.toLowerCase().includes('shelter')) {
        fallbackText = 'Shelter Intelligence: Sector 4 Indoor Stadium is at 57% capacity. High School Shelter is at 95% capacity. Redirect incoming evacuees to Sector 4.';
      }
      setAiChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: fallbackText,
          suggestions: ['Inspect Sector 4 Shelter', 'View Live SOS Signals', 'Publish Evacuation Broadcast']
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // 1. Unauthenticated View: Show Login Screen
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={(userData) => {
          setUser(userData);
          setIsAuthenticated(true);
          if (userData.role === 'VOLUNTEER') {
            setPortalMode('VOLUNTEER');
          } else {
            setPortalMode('GOVERNMENT');
          }
        }}
      />
    );
  }

  // Sidebar Menu Items for Government Command
  const govtNavItems: { id: GovtTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
    { id: 'SOS', label: 'SOS Alerts', icon: ShieldAlert, count: 24, badgeColor: 'bg-red-950 text-red-400 border-red-800' },
    { id: 'INCIDENTS', label: 'Incident Feed', icon: Flame, count: 17, badgeColor: 'bg-amber-950 text-amber-400 border-amber-800' },
    { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: Radio },
    { id: 'SHELTERS', label: 'Shelters', icon: Home },
    { id: 'HOSPITALS', label: 'Hospitals', icon: HeartPulse },
    { id: 'RELIEF', label: 'Relief Centers', icon: Package },
    { id: 'MAP', label: 'Tactical GIS Map', icon: MapIcon },
  ];

  // Sidebar Menu Items for Volunteer / Private Bodies
  const volNavItems: { id: VolTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
    { id: 'INCIDENTS', label: 'Available Incidents', icon: Flame, count: 7, badgeColor: 'bg-amber-950 text-amber-400 border-amber-800' },
    { id: 'TASKS', label: 'My Response Tasks', icon: CheckSquare, count: 2, badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
    { id: 'SHELTERS', label: 'Private Shelters', icon: Home },
    { id: 'HOSPITALS', label: 'Private Hospitals', icon: HeartPulse },
    { id: 'FUNDRAISERS', label: 'Relief Campaigns', icon: DollarSign },
    { id: 'OFFLINE_SYNC', label: 'Mesh & Offline Sync', icon: Radio },
    { id: 'PROFILE', label: 'Volunteer Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* ===================== 1. TOP GLOBAL NAVBAR ===================== */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-wider text-blue-400 uppercase text-sm">VAJRANET</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono hidden md:inline">Emergency Operations Command</span>
          </div>
        </div>

        {/* Portal Switcher Navigation */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setPortalMode('GOVERNMENT')}
            className={`px-3 py-1.5 rounded-lg transition font-bold text-xs ${
              portalMode === 'GOVERNMENT'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏛️ Government Command
          </button>
          <button
            onClick={() => setPortalMode('VOLUNTEER')}
            className={`px-3 py-1.5 rounded-lg transition font-bold text-xs ${
              portalMode === 'VOLUNTEER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🤝 Volunteer Operations
          </button>
          <button
            onClick={() => setPortalMode('VAJRA_AI')}
            className={`px-3 py-1.5 rounded-lg transition font-bold text-xs flex items-center gap-1.5 ${
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
          <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2.5 py-1 rounded-lg border border-green-500/20 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            <span className="hidden sm:inline">Verified:</span> {user?.name || 'Official'}
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-slate-400 hover:text-red-400 transition font-medium flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ===================== 2. MAIN EOC LAYOUT (SIDEBAR + CONTENT) ===================== */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left EOC Sidebar (Visible in Govt & Volunteer modes) */}
        {portalMode !== 'VAJRA_AI' && (
          <aside className="w-56 lg:w-64 bg-slate-900/90 border-r border-slate-800 p-3 flex flex-col justify-between hidden md:flex shrink-0">
            <div className="space-y-4">
              
              {/* Sidebar Header Badge */}
              <div className="px-2 py-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block font-bold">
                  {portalMode === 'GOVERNMENT' ? 'COMMAND CONSOLE' : 'RESPONDER CONSOLE'}
                </span>
                <h3 className="text-xs font-bold text-white mt-0.5">
                  {portalMode === 'GOVERNMENT' ? 'NDRF Master Authority' : 'Field NGO & Volunteers'}
                </h3>
              </div>

              {/* Navigation Menu Links */}
              <nav className="space-y-1">
                {portalMode === 'GOVERNMENT' && govtNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = govtTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setGovtTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                          isActive ? 'bg-white/20 text-white border-white/30' : (item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700')
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}

                {portalMode === 'VOLUNTEER' && volNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = volTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setVolTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                          isActive ? 'bg-white/20 text-white border-white/30' : (item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700')
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Sidebar Bottom Telemetry Pill */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">P2P Mesh Link:</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Local Gateway:</span>
                <span className="text-blue-400 font-bold">ACTIVE</span>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Navigation Strip (Visible only on small screens) */}
        {portalMode !== 'VAJRA_AI' && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 p-2 overflow-x-auto flex gap-1 sticky top-12 z-40">
            {portalMode === 'GOVERNMENT' && govtNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setGovtTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  govtTab === item.id ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
            {portalMode === 'VOLUNTEER' && volNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setVolTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  volTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Scrollable Content Canvas */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-7xl">
          
          {/* ===================== GOVERNMENT COMMAND MODE ===================== */}
          {portalMode === 'GOVERNMENT' && (
            <div className="space-y-6">
              {govtTab === 'OVERVIEW' && <GovtOverview onNavigateTab={(tab) => setGovtTab(tab as GovtTab)} />}
              {govtTab === 'SOS' && <LiveSOSFeed />}
              {govtTab === 'INCIDENTS' && <IncidentList />}
              {govtTab === 'ANNOUNCEMENTS' && <AnnouncementPublisher />}
              {govtTab === 'SHELTERS' && <ResourceShelters />}
              {govtTab === 'HOSPITALS' && <ResourceHospitals />}
              {govtTab === 'RELIEF' && <ResourceRelief />}
              {govtTab === 'MAP' && <TacticalGISMap height="640px" />}
            </div>
          )}

          {/* ===================== VOLUNTEER FIELD OPERATIONS ===================== */}
          {portalMode === 'VOLUNTEER' && (
            <div className="space-y-6">
              {volTab === 'OVERVIEW' && <VolunteerOverview onNavigateTab={(tab) => setVolTab(tab as VolTab)} />}
              {volTab === 'INCIDENTS' && <IncidentResponseBoard />}
              {volTab === 'TASKS' && <FieldTasks />}
              {volTab === 'SHELTERS' && <PrivateShelterManager />}
              {volTab === 'HOSPITALS' && <PrivateHospitalManager />}
              {volTab === 'FUNDRAISERS' && <ReliefFundraisers />}
              {volTab === 'OFFLINE_SYNC' && <OfflineMeshSync />}
              {volTab === 'PROFILE' && <VolunteerProfile />}
            </div>
          )}

          {/* ===================== VAJRA AI INTELLIGENCE ===================== */}
          {portalMode === 'VAJRA_AI' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[82vh] flex flex-col justify-between shadow-2xl space-y-4">
              
              {/* VajraAI Header */}
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-700/80 flex items-center justify-center text-purple-400">
                    <Bot className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>VajraAI Emergency Intelligence Engine</span>
                      <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.2 rounded-full font-mono">
                        v1.0 ONLINE
                      </span>
                    </h2>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Live situation triage synthesis, resource allocation forecasting, and safety protocol advisor.
                    </p>
                  </div>
                </div>
                <span className="bg-purple-900/30 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-mono hidden sm:inline">
                  AI Gateway: Connected
                </span>
              </div>

              {/* Chat Messages Feed */}
              <div className="flex-1 bg-slate-950/80 rounded-xl p-4 overflow-y-auto space-y-3.5 border border-slate-800/80">
                {aiChatLog.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 space-y-2'
                      }`}
                    >
                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px] mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>VajraAI Intelligence Synthesis:</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {msg.advisory && (
                        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-400 flex items-start gap-1.5 mt-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{msg.advisory}</span>
                        </div>
                      )}

                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {msg.suggestions.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendAiQuery(sug)}
                              className="bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/80 rounded-lg px-2.5 py-1 text-[10px] transition cursor-pointer font-mono"
                            >
                              + {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-purple-300 font-mono flex items-center gap-2">
                      <span className="inline-block w-3.5 h-3.5 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></span>
                      <span>Synthesizing live disaster telemetry...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Query Input Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendAiQuery();
                  }}
                  placeholder="Ask VajraAI for live triage summaries, shelter forecasts, or evacuation corridors..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
                />
                <button 
                  onClick={() => handleSendAiQuery()}
                  disabled={aiLoading}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-bold text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
