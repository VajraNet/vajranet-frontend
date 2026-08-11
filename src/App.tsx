import React, { useState } from 'react';
import { Login } from './components/Login';
import { DownloadAppPage } from './components/DownloadAppPage';

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
  Moon,
  ExternalLink,
  Lock
} from 'lucide-react';
import { apiClient } from './api/client';

export type GovtTab = 'OVERVIEW' | 'SOS' | 'INCIDENTS' | 'ANNOUNCEMENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF' | 'MAP';
export type VolTab = 'OVERVIEW' | 'SOS' | 'INCIDENTS' | 'TASKS' | 'SHELTERS' | 'HOSPITALS' | 'FUNDRAISERS' | 'OFFLINE_SYNC' | 'PROFILE';

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('vajranet_token'));
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState<{ name: string; role: string; vajra_id?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('vajranet_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Portal Mode State: Strictly based on authenticated role ('GOVERNMENT' or 'VOLUNTEER' + 'VAJRA_AI')
  const [portalMode, setPortalMode] = useState<'GOVERNMENT' | 'VOLUNTEER' | 'VAJRA_AI'>(() => {
    try {
      const saved = localStorage.getItem('vajranet_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role === 'VOLUNTEER' ? 'VOLUNTEER' : 'GOVERNMENT';
      }
      return 'GOVERNMENT';
    } catch {
      return 'GOVERNMENT';
    }
  });

  // Sub-tab States
  const [govtTab, setGovtTab] = useState<GovtTab>('OVERVIEW');
  const [volTab, setVolTab] = useState<VolTab>('OVERVIEW');

  // Download page showcase toggle
  const [bypassDownloadPage, setBypassDownloadPage] = useState<boolean>(false);
  const isDownloadPageActive = Boolean(
    import.meta.env.VITE_MAINTENANCE_MODE === 'true' || 
    import.meta.env.VITE_SHOW_DOWNLOAD_PAGE === 'true'
  );

  if (isDownloadPageActive && !bypassDownloadPage) {
    return <DownloadAppPage onProceedToWeb={() => setBypassDownloadPage(true)} />;
  }

  // 1. Unauthenticated View: Show Role-Segregated Login Screen
  if (!isAuthenticated || !user) {
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
  const isGovtUser = user.role === 'GOVERNMENT' || user.role === 'ADMIN';
  const isVolunteerUser = user.role === 'VOLUNTEER';

  const [liveCounts, setLiveCounts] = useState({
    sosCount: 0,
    incidentsCount: 0,
    tasksCount: 0,
    sheltersCount: 0
  });

  React.useEffect(() => {
    async function pollLiveCounts() {
      try {
        const [sosRes, incRes, taskRes, shelterRes] = await Promise.allSettled([
          apiClient.get('/sos'),
          apiClient.get('/incidents'),
          apiClient.get('/volunteers/tasks'),
          apiClient.get('/resources/shelters')
        ]);

        let sos = 0, inc = 0, tasks = 0, shelters = 0;

        if (sosRes.status === 'fulfilled') {
          const d = sosRes.value.data?.data || sosRes.value.data;
          if (Array.isArray(d)) sos = d.length;
        }
        if (incRes.status === 'fulfilled') {
          const d = incRes.value.data?.data || incRes.value.data;
          if (Array.isArray(d)) inc = d.length;
        }
        if (taskRes.status === 'fulfilled') {
          const d = taskRes.value.data?.data || taskRes.value.data;
          if (Array.isArray(d)) tasks = d.length;
        }
        if (shelterRes.status === 'fulfilled') {
          const d = shelterRes.value.data?.data || shelterRes.value.data;
          if (Array.isArray(d)) shelters = d.length;
        }

        setLiveCounts({
          sosCount: sos,
          incidentsCount: inc,
          tasksCount: tasks,
          sheltersCount: shelters
        });
      } catch (e) {}
    }

    pollLiveCounts();
    const interval = setInterval(pollLiveCounts, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vajranet_token');
    localStorage.removeItem('vajranet_user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Sidebar Menu Items for Government Command
  const govtNavItems: { id: GovtTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
    { id: 'SOS', label: 'Citizen SOS Alerts', icon: ShieldAlert, count: liveCounts.sosCount, badgeColor: 'bg-red-950 text-red-400 border-red-800' },
    { id: 'INCIDENTS', label: 'Incident Feed', icon: Flame, count: liveCounts.incidentsCount, badgeColor: 'bg-amber-950 text-amber-400 border-amber-800' },
    { id: 'ANNOUNCEMENTS', label: 'Announcements', icon: Radio },
    { id: 'SHELTERS', label: 'Shelters', icon: Home, count: liveCounts.sheltersCount || undefined, badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
    { id: 'HOSPITALS', label: 'Hospitals', icon: HeartPulse },
    { id: 'RELIEF', label: 'Relief Centers', icon: Package },
    { id: 'MAP', label: 'Tactical GIS Map', icon: MapIcon },
  ];

  // Sidebar Menu Items for Volunteer / Private Bodies (Now with Live Citizen SOS feed)
  const volNavItems: { id: VolTab; label: string; icon: any; count?: number; badgeColor?: string }[] = [
    { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
    { id: 'SOS', label: 'Live Citizen SOS Calls', icon: ShieldAlert, count: liveCounts.sosCount, badgeColor: 'bg-red-950 text-red-400 border-red-800' },
    { id: 'INCIDENTS', label: 'Available Incidents', icon: Flame, count: liveCounts.incidentsCount, badgeColor: 'bg-amber-950 text-amber-400 border-amber-800' },
    { id: 'TASKS', label: 'My Response Tasks', icon: CheckSquare, count: liveCounts.tasksCount, badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
    { id: 'SHELTERS', label: 'Private Shelters', icon: Home, count: liveCounts.sheltersCount || undefined, badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
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
          <div className="flex items-center gap-2.5">
            <img 
              src="/app-icon.jpg" 
              alt="VajraNet" 
              className="w-7 h-7 rounded-lg border border-cyan-400/50 object-cover shadow-sm" 
            />
            <span className={`font-black tracking-wider uppercase text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              VAJRANET
            </span>
            <span className="text-cyan-400 font-mono text-[10px] font-bold">
              {isGovtUser ? 'GOVT EOC' : 'VOLUNTEER FORCE'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 font-mono hidden md:inline text-[11px]">When Towers Fall, VajraNet Stands.</span>
          </div>
        </div>

        {/* Role-Specific Portal Badge & VajraAI Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Authenticated Mode Indicator (Strictly Segregated) */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold font-mono shadow-sm ${
            isGovtUser 
              ? 'bg-blue-950/80 text-blue-300 border-blue-600/50' 
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isGovtUser ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span>{isGovtUser ? '🏛️ Government Command Center' : '🤝 Volunteer Operations Center'}</span>
          </div>

          {/* Toggle between Main Portal Dashboard & VajraAI */}
          <button
            onClick={() => setPortalMode(prev => prev === 'VAJRA_AI' ? (isGovtUser ? 'GOVERNMENT' : 'VOLUNTEER') : 'VAJRA_AI')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border shadow-sm ${
              portalMode === 'VAJRA_AI'
                ? 'bg-[#7E22CE] text-white border-purple-400 shadow-purple-900/40'
                : 'bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border-purple-500/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>{portalMode === 'VAJRA_AI' ? '← Back to Operations' : '⚡ VajraAI Intelligence'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isDark 
                ? 'bg-[#07172C] text-amber-400 border-slate-700 hover:bg-slate-800' 
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Details & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
            <div className="hidden sm:block text-right">
              <span className={`font-bold block text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {user.vajra_id ? user.vajra_id.slice(-9) : user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 bg-rose-900/40 hover:bg-rose-900/80 text-rose-300 border border-rose-700/50 rounded-xl transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ===================== 2. MAIN WORKSPACE WITH SIDEBAR ===================== */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Fixed Navigation Sidebar (Only shown when not in full VajraAI view) */}
        {portalMode !== 'VAJRA_AI' && (
          <aside className={`w-full md:w-64 shrink-0 p-3 md:p-4 border-b md:border-b-0 md:border-r flex flex-col justify-between transition-colors ${
            isDark 
              ? 'bg-[#07172C]/90 border-[#D4AF37]/30 text-white' 
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="space-y-4">
              
              {/* Workspace Badge */}
              <div className="px-2 pt-1">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Active Section</span>
                <h2 className="text-sm font-black text-[#D4AF37] font-mono">
                  {isGovtUser ? 'GOVERNMENT EOC' : 'VOLUNTEER SQUAD'}
                </h2>
              </div>

              {/* Navigation Items List */}
              <nav className="space-y-1">
                {(isGovtUser ? govtNavItems : volNavItems).map((item) => {
                  const isActive = isGovtUser ? govtTab === item.id : volTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isGovtUser) setGovtTab(item.id as GovtTab);
                        else setVolTab(item.id as VolTab);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? (isGovtUser ? 'bg-[#0077B6] text-white shadow-md' : 'bg-[#059669] text-white shadow-md')
                          : (isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-700 hover:bg-slate-100')
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.count && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold border ${item.badgeColor}`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

            </div>

            {/* Sidebar Footer Link to VajraAI */}
            <div className="pt-3 border-t border-slate-800/80">
              <button
                onClick={() => setPortalMode('VAJRA_AI')}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/40 rounded-xl text-purple-200 text-xs font-mono font-bold flex items-center justify-between cursor-pointer transition shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span>Launch VajraAI</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </aside>
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
              {volTab === 'SOS' && <LiveSOSFeed />}
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
                        🟢 LIVE on vajranetai.vercel.app
                      </span>
                    </h2>
                    <p className="text-[#D4AF37] text-xs font-mono mt-0.5">
                      Connected Live Cloud AI Assistant for Automated Incident Triage & Evacuation Guidance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open('https://vajranetai.vercel.app', '_blank')}
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
                  src="https://vajranetai.vercel.app"
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
