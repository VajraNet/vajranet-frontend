import React, { useState, useEffect, useCallback } from 'react';
import { Login } from './components/Login';
import { DownloadAppPage } from './components/DownloadAppPage';

// Common / Shared Components
import { TacticalGISMap } from './components/common/TacticalGISMap';
import { VajraAICommandHub } from './components/common/VajraAICommandHub';

// Government Components
import { GovtOverview } from './components/government/GovtOverview';
import { LiveSOSFeed } from './components/government/LiveSOSFeed';
import { IncidentList } from './components/government/IncidentList';
import { AnnouncementPublisher } from './components/government/AnnouncementPublisher';
import { ResourceShelters } from './components/government/ResourceShelters';
import { ResourceHospitals } from './components/government/ResourceHospitals';
import { ResourceRelief } from './components/government/ResourceRelief';
import { TrustedDeviceManager } from './components/government/TrustedDeviceManager';

// Volunteer Components
import { VolunteerOverview } from './components/volunteers/VolunteerOverview';
import { IncidentResponseBoard } from './components/volunteers/IncidentResponseBoard';
import { FieldTasks } from './components/volunteers/FieldTasks';
import { PrivateShelterManager } from './components/volunteers/PrivateShelterManager';
import { PrivateHospitalManager } from './components/volunteers/PrivateHospitalManager';
import { ReliefFundraisers } from './components/volunteers/ReliefFundraisers';
import { VolunteerProfile } from './components/volunteers/VolunteerProfile';

// Icons & Utilities
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
  Bell,
  Clock,
  Download,
  Building2,
  Users,
  ShieldCheck,
  X
} from 'lucide-react';
import { apiClient } from './api/client';
import { getOrCreateRoleVajraId } from './utils/vajraId';
import { TRANSLATIONS, Language } from './utils/translations';

export type GovtTab = 'OVERVIEW' | 'SOS' | 'INCIDENTS' | 'ANNOUNCEMENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF' | 'TRUSTED_DEVICES' | 'MAP' | 'DOWNLOAD';
export type VolTab = 'OVERVIEW' | 'SOS' | 'INCIDENTS' | 'TASKS' | 'SHELTERS' | 'HOSPITALS' | 'FUNDRAISERS' | 'PROFILE' | 'DOWNLOAD';

export default function App() {
  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('vajranet_frontend_theme') as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  // Font Scaling Accessibility: 'A-' (13px), 'A' (14px), 'A+' (15px)
  const [fontScale, setFontScale] = useState<'small' | 'normal' | 'large'>('normal');

  // Language state: 'EN' | 'HI'
  const [lang, setLang] = useState<Language>('EN');

  // Notification Drawer State
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [recentSOSList, setRecentSOSList] = useState<any[]>([]);

  const t = TRANSLATIONS[lang];

  // Apply Theme to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('vajranet_frontend_theme', theme);
    } catch (e) {}
  }, [theme]);

  // Apply Font Scaling
  useEffect(() => {
    const sizeMap = { small: '13px', normal: '14px', large: '15px' };
    document.documentElement.style.fontSize = sizeMap[fontScale];
  }, [fontScale]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
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

  // Portal Mode State: strictly derived from user role (No manual switching)
  const [portalMode, setPortalMode] = useState<'GOVERNMENT' | 'VOLUNTEER' | 'VAJRA_AI'>('GOVERNMENT');

  // Sub-tab States
  const [govtTab, setGovtTab] = useState<GovtTab>('OVERVIEW');
  const [volTab, setVolTab] = useState<VolTab>('OVERVIEW');

  // Update portalMode strictly from user role
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
    sheltersCount: 0,
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
          const active = d.filter((item: any) => item.status !== 'RESOLVED' && item.status !== 'CANCELLED');
          sos = active.length;
          setRecentSOSList(active.slice(0, 5));
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
      console.warn('Live count poll note:', e);
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

  // Handle seamless Logout
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

  // Unauthenticated View: Show Government Login
  if (!token || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const isGovtUser = user.role === 'GOVERNMENT' || user.role === 'ADMIN';
  const currentVajraId = user.vajra_id || getOrCreateRoleVajraId(isGovtUser ? 'GOVERNMENT' : 'VOLUNTEER');

  // Sidebar Menu Items for Government Command
  const govtNavGroups = [
    {
      group: '',
      items: [
        { id: 'OVERVIEW' as GovtTab, label: t.overview, icon: LayoutDashboard },
      ]
    },
    {
      group: t.emergencyOps,
      items: [
        { id: 'SOS' as GovtTab, label: t.sosAlerts, icon: ShieldAlert, count: liveCounts.sosCount, badgeColor: 'bg-red-50 text-severity-critical border-red-200' },
        { id: 'INCIDENTS' as GovtTab, label: t.incidentsFeed, icon: Flame, count: liveCounts.incidentsCount, badgeColor: 'bg-amber-50 text-severity-high border-amber-200' },
      ]
    },
    {
      group: t.resourceInventory,
      items: [
        { id: 'SHELTERS' as GovtTab, label: t.sheltersCamps, icon: Building2, count: liveCounts.sheltersCount || undefined, badgeColor: 'bg-blue-50 text-gov-blue border-blue-200' },
        { id: 'HOSPITALS' as GovtTab, label: t.hospitalsBeds, icon: HeartPulse },
        { id: 'RELIEF' as GovtTab, label: t.reliefDepots, icon: Package },
      ]
    },
    {
      group: t.fieldCoord,
      items: [
        { id: 'ANNOUNCEMENTS' as GovtTab, label: t.announcements, icon: Radio },
        { id: 'TRUSTED_DEVICES' as GovtTab, label: t.trustedDevices, icon: ShieldCheck },
      ]
    },
    {
      group: t.systemTools,
      items: [
        { id: 'MAP' as GovtTab, label: t.gisMap, icon: MapIcon },
        { id: 'DOWNLOAD' as GovtTab, label: t.downloadApp, icon: Download },
      ]
    }
  ];

  // Sidebar Menu Items for Volunteer Portal
  const volNavGroups = [
    {
      group: '',
      items: [
        { id: 'OVERVIEW' as VolTab, label: t.overview, icon: LayoutDashboard },
      ]
    },
    {
      group: t.emergencyTasks,
      items: [
        { id: 'SOS' as VolTab, label: t.sosAlerts, icon: ShieldAlert, count: liveCounts.sosCount, badgeColor: 'bg-red-50 text-severity-critical border-red-200' },
        { id: 'INCIDENTS' as VolTab, label: t.availableHazards, icon: Flame, count: liveCounts.incidentsCount, badgeColor: 'bg-amber-50 text-severity-high border-amber-200' },
        { id: 'TASKS' as VolTab, label: t.myResponseTasks, icon: CheckSquare, count: liveCounts.tasksCount, badgeColor: 'bg-emerald-50 text-status-online border-emerald-200' },
      ]
    },
    {
      group: t.facilityRelief,
      items: [
        { id: 'SHELTERS' as VolTab, label: t.privateShelters, icon: Home, count: liveCounts.sheltersCount || undefined, badgeColor: 'bg-blue-50 text-gov-blue border-blue-200' },
        { id: 'HOSPITALS' as VolTab, label: t.privateClinics, icon: HeartPulse },
        { id: 'FUNDRAISERS' as VolTab, label: t.reliefCampaigns, icon: DollarSign },
      ]
    },
    {
      group: t.volunteerAccount,
      items: [
        { id: 'PROFILE' as VolTab, label: t.squadProfile, icon: User },
        { id: 'DOWNLOAD' as VolTab, label: t.downloadApp, icon: Download },
      ]
    }
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === 'HI' ? 'hi-IN' : 'en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString(lang === 'HI' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#0d1522] text-[#1e2533] dark:text-[#f1f5f9] flex flex-col font-sans transition-colors duration-150">
      
      {/* ===================== 1. OFFICIAL TOP HEADER (#1a4480) ===================== */}
      <header style={{ background: '#1a4480', borderBottom: '1px solid #112e5a' }} className="flex items-stretch shrink-0 z-50">
        
        {/* Brand block */}
        <div style={{ width: 232, borderRight: '1px solid rgba(255,255,255,0.12)', flexShrink: 0 }} className="flex flex-col justify-center px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div style={{ width: 28, height: 28, background: '#e8f0fa', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img 
                src="/vajranet-icon.jpg" 
                alt="Emblem" 
                className="w-5 h-5 object-contain rounded-xs"
              />
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.2 }}>VAJRANET</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, letterSpacing: '0.04em' }}>
                {portalMode === 'GOVERNMENT' ? t.portalTitleGovt : t.portalTitleVol}
              </div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, marginTop: 2 }}>
            {t.subTitle}
          </div>
        </div>

        {/* Center label: Active Operations Centre */}
        <div className="flex-1 flex items-center px-4 hidden md:flex">
          <div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {t.activeOperationsCommand}
            </div>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {portalMode === 'GOVERNMENT' ? t.activeCommandGovt : t.activeCommandVol}
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 px-3 ml-auto">
          
          {/* Status pill */}
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '4px 8px', marginRight: 4 }} className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="status-dot dot-online" />
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>{t.systemOperational}</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9 }}>16 Aug 2026 · {timeStr}</div>
          </div>

          {/* Accessibility scaling */}
          <div className="flex items-center gap-0.5" style={{ borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: 6, marginRight: 4 }}>
            <button 
              onClick={() => setFontScale('small')}
              className="gov-btn" 
              style={{ background: fontScale === 'small' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '3px 6px', fontSize: 10 }}
              title="Decrease Font Size"
            >
              A−
            </button>
            <button 
              onClick={() => setFontScale('normal')}
              className="gov-btn" 
              style={{ background: fontScale === 'normal' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '3px 6px', fontSize: 11, fontWeight: 700 }}
              title="Normal Font Size"
            >
              A
            </button>
            <button 
              onClick={() => setFontScale('large')}
              className="gov-btn" 
              style={{ background: fontScale === 'large' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '3px 6px', fontSize: 12 }}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Point 7: Bilingual Language Switcher */}
          <div className="flex items-center gap-0.5" style={{ borderRight: '1px solid rgba(255,255,255,0.15)', paddingRight: 6, marginRight: 4 }}>
            <button 
              onClick={() => setLang('EN')}
              className="gov-btn" 
              style={{ background: lang === 'EN' ? '#fff' : 'rgba(255,255,255,0.1)', color: lang === 'EN' ? '#1a4480' : '#fff', border: 'none', padding: '2px 6px', fontSize: 10, fontWeight: 700 }}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('HI')}
              className="gov-btn" 
              style={{ background: lang === 'HI' ? '#fff' : 'rgba(255,255,255,0.1)', color: lang === 'HI' ? '#1a4480' : '#fff', border: 'none', padding: '2px 6px', fontSize: 10, fontFamily: 'Noto Sans Devanagari, sans-serif' }}
            >
              हिंदी
            </button>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '5px 7px', cursor: 'pointer', color: '#fff' }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="flex items-center justify-center hover:bg-white/20 transition"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)} 
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 4, padding: '5px 7px', cursor: 'pointer', color: '#fff', position: 'relative' }}
              className="flex items-center justify-center hover:bg-white/20 transition"
              title="Live Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {liveCounts.sosCount > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -3, background: '#c0392b', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {liveCounts.sosCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popup */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded shadow-xl p-3 z-50 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-1.5">
                  <span className="font-bold text-gov-gray-dark dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    {t.liveNotifications} ({recentSOSList.length})
                  </span>
                  <button onClick={() => setIsNotifOpen(false)} className="text-gov-gray hover:text-gov-blue">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {recentSOSList.length === 0 ? (
                    <p className="text-gov-gray text-center py-3">{t.noActiveNotifications}</p>
                  ) : (
                    recentSOSList.map((s, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          setGovtTab('SOS');
                          setIsNotifOpen(false);
                        }}
                        className="p-1.5 rounded bg-gov-gray-bg dark:bg-slate-900/60 hover:bg-gov-blue-faint cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[10px] text-gov-blue dark:text-blue-300">{s.message_id || s.id}</span>
                          <span className="gov-badge badge-critical text-[9px]">{s.severity || 'CRITICAL'}</span>
                        </div>
                        <p className="text-[11px] text-[#1e2533] dark:text-slate-200 line-clamp-1 mt-0.5">{s.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Sign Out (No manual portal toggle button) */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/15">
            <div className="hidden lg:block text-right">
              <div style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{user.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9 }} className="font-mono">
                {currentVajraId}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              style={{ background: 'rgba(192,57,43,0.85)', color: '#fff', border: 'none' }}
              className="gov-btn btn-sm p-1.5 rounded hover:bg-red-700 transition"
              title={t.signOut}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </header>

      {/* ===================== 2. TOP OPERATIONAL STATUS STRIP (Clean, No Gateway/Mesh clutter) ===================== */}
      <div style={{ background: '#1a4480', borderTop: '1px solid rgba(255,255,255,0.1)' }} className="px-4 py-1.5 flex gap-6 sm:gap-8 flex-wrap items-center text-xs shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="status-dot dot-online" style={{ width: 6, height: 6 }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.status}:</span>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>OPERATIONAL</span>
        </div>

        <div className="flex items-center gap-1.5 hidden sm:flex">
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.lastSynchronized}:</span>
          <span style={{ fontSize: 11, color: '#fff', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{timeStr}</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-white/50" />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>{dateStr}</span>
        </div>
      </div>

      {/* ===================== 3. MAIN WORKSPACE WITH 232px SIDEBAR ===================== */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Navigation Sidebar (232px) */}
        {portalMode !== 'VAJRA_AI' && (
          <aside style={{ width: 232, background: theme === 'dark' ? '#151e2e' : '#fff', borderRight: `1px solid ${theme === 'dark' ? '#2a374a' : '#d0d7e0'}` }} className="flex flex-col shrink-0 overflow-y-auto">
            
            <nav className="p-2 flex-1 space-y-1">
              {(portalMode === 'GOVERNMENT' ? govtNavGroups : volNavGroups).map((section, sIdx) => (
                <div key={sIdx} className="space-y-0.5">
                  {section.group && (
                    <div className="sidebar-group-label">{section.group}</div>
                  )}
                  {section.items.map((item) => {
                    const isActive = portalMode === 'GOVERNMENT' ? govtTab === item.id : volTab === item.id;
                    const IconComponent = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (portalMode === 'GOVERNMENT') setGovtTab(item.id as GovtTab);
                          else setVolTab(item.id as VolTab);
                        }}
                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                      >
                        <IconComponent className="w-4 h-4 shrink-0 opacity-80" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {typeof (item as any).count === 'number' && (item as any).count > 0 && (
                          <span className={`gov-badge ${(item as any).badgeColor} text-[10px] px-1.5 py-0 font-mono font-bold`}>
                            {(item as any).count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* VajraAI Command Hub Launcher in Sidebar */}
            <div className="p-2.5 border-t border-gov-gray-border dark:border-slate-800">
              <button
                onClick={() => setPortalMode('VAJRA_AI')}
                className="w-full py-2 px-3 bg-gov-blue-faint dark:bg-slate-900 hover:bg-gov-blue-pale text-gov-blue dark:text-blue-300 border border-gov-blue-pale dark:border-slate-700 rounded text-xs font-bold flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.vajraAiAssistant}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sidebar Footer Info (Clean, No Gateway clutter) */}
            <div style={{ background: theme === 'dark' ? '#0f172a' : '#f5f6f8', borderTop: `1px solid ${theme === 'dark' ? '#1e293b' : '#d0d7e0'}` }} className="p-2.5 text-[10px] text-gov-gray leading-relaxed">
              <div>{t.lastSync}: <strong className="text-gov-gray-dark dark:text-slate-300 font-mono">{timeStr}</strong></div>
              <div>{t.engine}: <span className="font-mono">VAJRANET v2.4.1</span></div>
            </div>

          </aside>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto w-full">
          
          {/* ===================== GOVERNMENT COMMAND MODE ===================== */}
          {portalMode === 'GOVERNMENT' && (
            <div className="space-y-6">
              {govtTab === 'OVERVIEW' && <GovtOverview onNavigateTab={(tab) => setGovtTab(tab as GovtTab)} lang={lang} />}
              {govtTab === 'SOS' && <LiveSOSFeed lang={lang} />}
              {govtTab === 'INCIDENTS' && <IncidentList lang={lang} />}
              {govtTab === 'ANNOUNCEMENTS' && <AnnouncementPublisher lang={lang} />}
              {govtTab === 'SHELTERS' && <ResourceShelters lang={lang} />}
              {govtTab === 'HOSPITALS' && <ResourceHospitals lang={lang} />}
              {govtTab === 'RELIEF' && <ResourceRelief lang={lang} />}
              {govtTab === 'TRUSTED_DEVICES' && <TrustedDeviceManager lang={lang} />}
              {govtTab === 'MAP' && <TacticalGISMap height="640px" />}
              {govtTab === 'DOWNLOAD' && <DownloadAppPage onProceedToWeb={() => setGovtTab('OVERVIEW')} />}
            </div>
          )}

          {/* ===================== VOLUNTEER FIELD OPERATIONS ===================== */}
          {portalMode === 'VOLUNTEER' && (
            <div className="space-y-6">
              {volTab === 'OVERVIEW' && <VolunteerOverview onNavigateTab={(tab) => setVolTab(tab as VolTab)} />}
              {volTab === 'SOS' && <LiveSOSFeed lang={lang} />}
              {volTab === 'INCIDENTS' && <IncidentResponseBoard lang={lang} />}
              {volTab === 'TASKS' && <FieldTasks lang={lang} />}
              {volTab === 'SHELTERS' && <PrivateShelterManager lang={lang} />}
              {volTab === 'HOSPITALS' && <PrivateHospitalManager lang={lang} />}
              {volTab === 'FUNDRAISERS' && <ReliefFundraisers lang={lang} />}
              {volTab === 'PROFILE' && <VolunteerProfile lang={lang} />}
              {volTab === 'DOWNLOAD' && <DownloadAppPage onProceedToWeb={() => setVolTab('OVERVIEW')} />}
            </div>
          )}

          {/* ===================== VAJRA AI INTELLIGENCE ===================== */}
          {portalMode === 'VAJRA_AI' && (
            <VajraAICommandHub 
              role={user.role} 
              onNavigateToTab={(tab) => {
                if (isGovtUser) {
                  setPortalMode('GOVERNMENT');
                  setGovtTab(tab as GovtTab);
                } else {
                  setPortalMode('VOLUNTEER');
                  setVolTab(tab as VolTab);
                }
              }} 
            />
          )}

        </main>
      </div>

    </div>
  );
}
