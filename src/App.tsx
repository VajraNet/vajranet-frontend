import React, { useState, useEffect, useCallback } from 'react';
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
  Bot, 
  Sparkles, 
  LayoutDashboard, 
  CheckSquare, 
  DollarSign, 
  User, 
  LogOut, 
  ChevronRight,
  Map as MapIcon,
  Sun,
  Moon,
  ExternalLink
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
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('vajranet_token');
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<{ name: string; role: string; email?: string; vajra_id?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('vajranet_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Portal Mode State
  const [portalMode, setPortalMode] = useState<'GOVERNMENT' | 'VOLUNTEER' | 'VAJRA_AI'>('GOVERNMENT');

  // Sub-tab States
  const [govtTab, setGovtTab] = useState<GovtTab>('OVERVIEW');
  const [volTab, setVolTab] = useState<VolTab>('OVERVIEW');

  // Update portalMode whenever user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'VOLUNTEER') {
        setPortalMode('VOLUNTEER');
      } else {
        setPortalMode('GOVERNMENT');
      }
    }
  }, [user]);

  // Dynamic Live Counts for Sidebar Badges
  const [liveCounts, setLiveCounts] = useState({
    sosCount: 0,
    incidentsCount: 0,
    tasksCount: 0,
    sheltersCount: 0
  });

  const pollLiveCounts = useCallback(async () => {
    try {
      const [sosRes, incRes, taskRes, shelterRes] = await Promise.allSettled([
        apiClient.get('/sos'),
        apiClient.get('/incidents'),
        apiClient.get('/volunteers/tasks'),
        apiClient.get('/shelters')
      ]);

      let sos = 0, inc = 0, tasks = 0, shelters = 0;

      if (sosRes.status === 'fulfilled') {
        const d = sosRes.value.data?.data || sosRes.value.data;
        if (Array.isArray(d)) {
          sos = d.filter((item: any) => item.status !== 'RESOLVED' && item.status !== 'CANCELLED').length;
        }
      }
      if (incRes.status === 'fulfilled') {
        const d = incRes.value.data?.data || incRes.value.data;
        if (Array.isArray(d)) {
          inc = d.filter((item: any) => item.status !== 'RESOLVED').length;
        }
      }
      if (taskRes.status === 'fulfilled') {
        const d = taskRes.value.data?.data || taskRes.value.data;
        if (Array.isArray(d)) {
          tasks = d.filter((item: any) => item.status !== 'COMPLETED' && item.status !== 'CANCELLED').length;
        }
      }
      if (shelterRes.status === 'fulfilled') {
        const d = shelterRes.value.data?.data || shelterRes.value.data;
        if (Array.isArray(d)) {
          shelters = d.length;
        }
      }

      setLiveCounts({
        sosCount: sos,
        incidentsCount: inc,
        tasksCount: tasks,
        sheltersCount: shelters
      });
    } catch (e) {
      console.warn('Live count poll error:', e);
    }
  }, []);

  // Poll counts periodically & listen to cross-component update events
  useEffect(() => {
    if (!token) return;

    pollLiveCounts();
    const interval = setInterval(pollLiveCounts, 4000);

    const handleDataUpdate = () => {
      pollLiveCounts();
    };

    window.addEventListener('vajranet_data_updated', handleDataUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('vajranet_data_updated', handleDataUpdate);
    };
  }, [token, pollLiveCounts]);

  // Download page showcase toggle
  const [bypassDownloadPage, setBypassDownloadPage] = useState<boolean>(false);
  const isDownloadPageActive = Boolean(
    (import.meta as any).env?.VITE_MAINTENANCE_MODE === 'true' || 
    (import.meta as any).env?.VITE_SHOW_DOWNLOAD_PAGE === 'true'
  );

  if (isDownloadPageActive && !bypassDownloadPage) {
    return <DownloadAppPage onProceedToWeb={() => setBypassDownloadPage(true)} />;
  }

  // Handle seamless Login
  const handleLogin = (userData: { name: string; role: string; token: string; email?: string; vajra_id?: string }) => {
    try {
      localStorage.setItem('vajranet_token', userData.token);
      localStorage.setItem('vajranet_user', JSON.stringify(userData));
    } catch (e) {}

    setToken(userData.token);
    setUser(userData);

    if (userData.role === 'VOLUNTEER') {
      setPortalMode('VOLUNTEER');
      setVolTab('OVERVIEW');
    } else {
      setPortalMode('GOVERNMENT');
      setGovtTab('OVERVIEW');
    }
  };

  // Handle seamless Logout (No page reload required)
  const handleLogout = () => {
    try {
      localStorage.removeItem('vajranet_token');
      localStorage.removeItem('vajranet_user');
    } catch (e) {}

    setToken(null);
    setUser(null);
    setPortalMode('GOVERNMENT');
    setGovtTab('OVERVIEW');
    setVolTab('OVERVIEW');
  };

  // 1. Unauthenticated View: Show Login Screen
  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const isDark = theme === 'dark';
  const isGovtUser = user.role === 'GOVERNMENT' || user.role === 'ADMIN';

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

  // Sidebar Menu Items for Volunteer / Private Bodies
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
        ? 'bg-[#0B192C] text-slate-100' 
        : 'bg-[#F8FAFC] text-slate-900'
    } font-sans flex flex-col transition-colors duration-200`}>
      
      {/* ===================== 1. TOP GLOBAL NAVBAR ===================== */}
      <header className={`px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50 transition-colors border-b ${
        isDark 
          ? 'bg-[#0F1E36] border-slate-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img 
              src="/vajranet-icon.jpg" 
              alt="VajraNet Logo" 
              className="w-8 h-8 rounded-lg object-contain border border-slate-700" 
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`font-black tracking-wider uppercase text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  VAJRANET
                </span>
                <span className="text-cyan-400 font-mono text-[10px] font-bold">
                  {isGovtUser ? 'GOVT EOC' : 'VOLUNTEER FORCE'}
                </span>
              </div>
              <span className="text-slate-400 font-mono hidden md:inline text-[10px] -mt-0.5">
                DISASTER COMMUNICATION PLATFORM
              </span>
            </div>
          </div>
        </div>

        {/* Role-Specific Portal Badge & VajraAI Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Authenticated Mode Indicator */}
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-bold font-mono ${
            isGovtUser 
              ? 'bg-blue-950/80 text-blue-300 border-blue-800' 
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isGovtUser ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
            <span>{isGovtUser ? '🏛️ Government Command Center' : '🤝 Volunteer Operations Center'}</span>
          </div>

          {/* Toggle between Main Portal Dashboard & VajraAI */}
          <button
            onClick={() => setPortalMode(prev => prev === 'VAJRA_AI' ? (isGovtUser ? 'GOVERNMENT' : 'VOLUNTEER') : 'VAJRA_AI')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
              portalMode === 'VAJRA_AI'
                ? 'bg-purple-800 text-white border-purple-600'
                : 'bg-purple-950/80 hover:bg-purple-900 text-purple-200 border-purple-800'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span>{portalMode === 'VAJRA_AI' ? '← Back to Operations' : 'VajraAI Intelligence'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              isDark 
                ? 'bg-[#0B192C] text-amber-400 border-slate-700 hover:bg-slate-800' 
                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Details & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden sm:block text-right">
              <span className={`font-bold block text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</span>
              <span className="text-[10px] text-slate-400 font-mono block">
                {user.vajra_id ? user.vajra_id.slice(-9) : user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* ===================== 2. MAIN WORKSPACE WITH SIDEBAR ===================== */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        {portalMode !== 'VAJRA_AI' && (
          <aside className={`w-full md:w-64 shrink-0 p-3 md:p-4 border-b md:border-b-0 md:border-r flex flex-col justify-between transition-colors ${
            isDark 
              ? 'bg-[#0F1E36] border-slate-800 text-white' 
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}>
            <div className="space-y-4">
              
              {/* Workspace Badge */}
              <div className="px-2 pt-1 pb-2 border-b border-slate-800 flex items-center gap-2.5">
                <img 
                  src="/vajranet-icon.jpg" 
                  alt="VajraNet Emblem" 
                  className="w-7 h-7 rounded-md object-contain border border-slate-700" 
                />
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Active Section</span>
                  <h2 className="text-xs font-bold text-white font-mono">
                    {isGovtUser ? 'GOVERNMENT EOC' : 'VOLUNTEER SQUAD'}
                  </h2>
                </div>
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? (isGovtUser ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white')
                          : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100')
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {typeof item.count === 'number' && item.count > 0 && (
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
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => setPortalMode('VAJRA_AI')}
                className="w-full py-2.5 px-3 bg-purple-950/60 hover:bg-purple-900 border border-purple-800 rounded-lg text-purple-200 text-xs font-mono font-bold flex items-center justify-between cursor-pointer transition"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Launch VajraAI</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </aside>
        )}

        {/* Main Content Canvas */}
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
            <div className="bg-white text-slate-900 border border-slate-800 rounded-2xl h-[85vh] flex flex-col justify-between shadow-xl overflow-hidden">
              
              {/* VajraAI Top Control Bar */}
              <div className="bg-[#0F1E36] text-white px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>VajraAI Emergency Intelligence Engine</span>
                      <span className="text-[10px] bg-purple-900 text-purple-200 border border-purple-700 px-2 py-0.2 rounded-full font-mono font-bold">
                        🟢 LIVE
                      </span>
                    </h2>
                    <p className="text-slate-400 text-xs font-mono mt-0.5">
                      Connected Live Cloud AI Assistant for Automated Incident Triage & Evacuation Guidance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open('https://vajranetai.vercel.app', '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
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
