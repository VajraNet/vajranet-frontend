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
  Shield,
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
  Map as MapIcon,
  Sun,
  Moon
} from 'lucide-react';
import { apiClient } from './api/client';

export type GovtTab = 'OVERVIEW' | 'SOS' | 'INCIDENTS' | 'ANNOUNCEMENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF' | 'MAP';
export type VolTab = 'OVERVIEW' | 'INCIDENTS' | 'TASKS' | 'SHELTERS' | 'HOSPITALS' | 'FUNDRAISERS' | 'OFFLINE_SYNC' | 'PROFILE';

export default function App() {
  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('vajranet_frontend_theme') as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('vajranet_frontend_theme', next);
    } catch (e) {
      console.warn('Failed to save frontend theme', e);
    }
  };

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

  const isDark = theme === 'dark';

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
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-gradient-to-b from-[#07172C] via-[#0E294B] to-[#07172C] text-slate-100' 
        : 'bg-gradient-to-b from-[#F1F5F9] via-[#E2E8F0] to-[#F1F5F9] text-slate-900'
    } font-sans flex flex-col transition-colors duration-300`}>
      
      {/* ===================== 1. TOP GLOBAL NAVBAR ===================== */}
      <header className={`px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md transition-colors ${
        isDark 
          ? 'bg-[#0B2545]/95 backdrop-blur-md border-b border-[#D4AF37]/40 text-white' 
          : 'bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#07172C] border border-[#D4AF37] flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span className={`font-black tracking-wider uppercase text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              VAJRANET
            </span>
            <span className="text-[#D4AF37] font-mono text-[10px] font-bold">EOC</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono hidden md:inline">Emergency Operations Command</span>
          </div>
        </div>

        {/* Portal Switcher Navigation */}
        <div className={`flex items-center p-1 rounded-xl border gap-1 shadow-sm ${
          isDark ? 'bg-[#07172C] border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          <button
            onClick={() => setPortalMode('GOVERNMENT')}
            className={`px-3 py-1.5 rounded-lg transition font-bold text-xs cursor-pointer ${
              portalMode === 'GOVERNMENT'
                ? 'bg-[#0077B6] text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            🏛️ Government Command
          </button>
          <button
            onClick={() => setPortalMode('VOLUNTEER')}
            className={`px-3 py-1.5 rounded-lg transition font-bold text-xs cursor-pointer ${
              portalMode === 'VOLUNTEER'
                ? 'bg-[#059669] text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            🤝 Volunteer Operations
          </button>
          <button
            onClick={() => setPortalMode('VAJRA_AI')}
            className={`px-3 py-1.5 rounded-lg transition font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
              portalMode === 'VAJRA_AI'
                ? 'bg-[#7E22CE] text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-purple-300' : 'text-slate-600 hover:text-purple-700')
            }`}
          >
            <span>🤖 VajraAI</span>
            <span className="bg-purple-500/30 text-purple-200 text-[10px] px-1.5 py-0.2 rounded font-mono">LIVE</span>
          </button>
        </div>

        {/* Verified User Info, Theme Toggle & Sign Out */}
        <div className="flex items-center gap-3">
          
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95 border ${
              isDark 
                ? 'bg-[#07172C] hover:bg-[#0E294B] border-[#D4AF37]/60 text-[#D4AF37]' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
            }`}
            title="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[10px]">Dark</span>
              </>
            )}
          </button>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-medium ${
            isDark 
              ? 'bg-[#059669]/10 text-emerald-300 border-emerald-500/30' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse"></span>
            <span className="hidden sm:inline">Verified:</span> {user?.name || 'Official'}
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            className={`${isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'} transition font-medium flex items-center gap-1 cursor-pointer`}
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
          <aside className={`w-56 lg:w-64 p-3 flex flex-col justify-between hidden md:flex shrink-0 border-r transition-colors ${
            isDark 
              ? 'bg-[#07172C]/95 border-[#D4AF37]/30' 
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="space-y-4">
              
              {/* Sidebar Header Badge */}
              <div className="px-2 py-1.5">
                <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${isDark ? 'text-[#D4AF37]' : 'text-slate-500'}`}>
                  {portalMode === 'GOVERNMENT' ? 'COMMAND CONSOLE' : 'RESPONDER CONSOLE'}
                </span>
                <h3 className={`text-xs font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {portalMode === 'GOVERNMENT' ? 'Master Operations Authority' : 'Field NGO & Volunteers'}
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
                          ? 'bg-[#0077B6] text-white shadow-md'
                          : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-850' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-500')}`} />
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
                          ? 'bg-[#059669] text-white shadow-md'
                          : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-850' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-500')}`} />
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
            <div className={`border rounded-xl p-3 text-[10px] font-mono space-y-1 ${
              isDark ? 'bg-[#050F1D] border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">P2P Mesh Link:</span>
                <span className="text-[#059669] font-bold">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Local Gateway:</span>
                <span className="text-[#0077B6] font-bold">ACTIVE</span>
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Navigation Strip */}
        {portalMode !== 'VAJRA_AI' && (
          <div className={`md:hidden p-2 overflow-x-auto flex gap-1 sticky top-12 z-40 border-b ${
            isDark ? 'bg-[#07172C] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            {portalMode === 'GOVERNMENT' && govtNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setGovtTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  govtTab === item.id ? 'bg-[#0077B6] text-white' : 'text-slate-400'
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
                  volTab === item.id ? 'bg-[#059669] text-white' : 'text-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Scrollable Content Canvas */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto w-full">
          
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
            <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl h-[85vh] flex flex-col justify-between shadow-2xl overflow-hidden animate-fadeIn">
              
              {/* VajraAI Top Control Bar */}
              <div className="bg-[#0B2545] text-white px-5 py-3.5 border-b border-[#D4AF37]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-400 flex items-center justify-center text-purple-300">
                    <Bot className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>VajraAI Emergency Intelligence Engine</span>
                      <span className="text-[10px] bg-purple-900/80 text-purple-200 border border-purple-400 px-2 py-0.2 rounded-full font-mono font-bold">
                        🟢 LIVE on vajraai-steel.vercel.app
                      </span>
                    </h2>
                    <p className="text-[#D4AF37] text-xs font-mono mt-0.5">
                      Connected Live Cloud AI Assistant for Automated Incident Triage & Evacuation Guidance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open('https://vajraai-steel.vercel.app', '_blank')}
                    className="bg-[#0077B6] hover:bg-[#005f92] text-white px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>Open Fullscreen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Embedded Live VajraAI App */}
              <div className="flex-1 w-full bg-slate-900 relative">
                <iframe
                  src="https://vajraai-steel.vercel.app"
                  title="VajraAI Emergency Intelligence"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
