import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Home, 
  HeartPulse, 
  DollarSign, 
  ArrowRight, 
  MapPin,
  CheckSquare,
  Users,
  Flame,
  ShieldAlert,
  Clock,
  Plus
} from 'lucide-react';
import { TacticalGISMap } from '../common/TacticalGISMap';
import { apiClient } from '../../api/client';

export type VolTab = 'OVERVIEW' | 'SOS' | 'INCIDENTS' | 'TASKS' | 'SHELTERS' | 'HOSPITALS' | 'FUNDRAISERS' | 'PROFILE';

interface VolunteerOverviewProps {
  onNavigateTab: (tab: VolTab) => void;
}

export function VolunteerOverview({ onNavigateTab }: VolunteerOverviewProps) {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [availableIncidentsCount, setAvailableIncidentsCount] = useState<number>(0);
  const [myTasksCount, setMyTasksCount] = useState<number>(0);
  const [activeSosCount, setActiveSosCount] = useState<number>(0);
  const [sheltersCount, setSheltersCount] = useState<number>(0);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);

  const fetchCounts = useCallback(async () => {
    try {
      const [incRes, taskRes, sosRes, shelterRes] = await Promise.allSettled([
        apiClient.get('/incidents'),
        apiClient.get('/volunteers/tasks'),
        apiClient.get('/sos'),
        apiClient.get('/shelters')
      ]);

      const combinedEvents: any[] = [];

      if (incRes.status === 'fulfilled') {
        const data = incRes.value.data?.data || incRes.value.data;
        if (Array.isArray(data)) {
          const activeIncList = data.filter((i: any) => i.status !== 'RESOLVED');
          setAvailableIncidentsCount(activeIncList.length);
          activeIncList.slice(0, 4).forEach((inc: any) => {
            combinedEvents.push({
              id: inc.message_id || inc.id,
              title: inc.title || inc.description || 'Hazard reported on ground',
              severity: inc.severity || 'HIGH',
              time: inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
              type: 'INCIDENT',
              nav: 'INCIDENTS' as const,
              latitude: inc.latitude,
              longitude: inc.longitude,
              address: inc.address,
              message: inc.description
            });
          });
        }
      }

      if (taskRes.status === 'fulfilled') {
        const data = taskRes.value.data?.data || taskRes.value.data;
        if (Array.isArray(data)) {
          setMyTasksCount(data.filter((t: any) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED').length);
        }
      }

      if (sosRes.status === 'fulfilled') {
        const data = sosRes.value.data?.data || sosRes.value.data;
        if (Array.isArray(data)) {
          const activeList = data.filter((s: any) => s.status !== 'RESOLVED' && s.status !== 'CANCELLED');
          setActiveSosCount(activeList.length);
          activeList.slice(0, 6).forEach((s: any) => {
            combinedEvents.unshift({
              id: s.message_id || s.id,
              title: s.message || `Citizen in distress! Assistance required at (${s.latitude?.toFixed(4)}, ${s.longitude?.toFixed(4)}).`,
              severity: s.severity || 'CRITICAL',
              time: s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
              type: 'SOS',
              nav: 'SOS' as const,
              latitude: s.latitude,
              longitude: s.longitude,
              address: s.address,
              message: s.message
            });
          });
        }
      }

      if (shelterRes.status === 'fulfilled') {
        const data = shelterRes.value.data?.data || shelterRes.value.data;
        if (Array.isArray(data)) {
          setSheltersCount(data.length);
        }
      }

      setRecentEvents(combinedEvents);
    } catch (e) {
      console.warn('Volunteer counts fetch note:', e);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 4000);

    const handleUpdate = () => {
      fetchCounts();
    };

    window.addEventListener('vajranet_data_updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('vajranet_data_updated', handleUpdate);
    };
  }, [fetchCounts]);

  const handleEventClick = (ev: any) => {
    if (ev.latitude && ev.longitude) {
      window.dispatchEvent(new CustomEvent('vajranet_focus_map_location', {
        detail: {
          latitude: Number(ev.latitude),
          longitude: Number(ev.longitude),
          id: ev.id,
          type: ev.type,
          title: ev.title,
          message: ev.title,
          address: ev.address || `GPS: (${Number(ev.latitude).toFixed(4)}, ${Number(ev.longitude).toFixed(4)})`
        }
      }));
    } else {
      onNavigateTab(ev.nav);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome & Duty Header */}
      <div className="section-card p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gov-blue-faint dark:bg-slate-800 border border-gov-blue-pale dark:border-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-gov-blue dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
                Volunteer Field Responder Squad
              </h1>
              <span className={`gov-badge ${isOnDuty ? 'badge-online' : 'badge-resolved'}`}>
                {isOnDuty ? 'ON ACTIVE DUTY' : 'OFF DUTY'}
              </span>
            </div>
            <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
              Coordinated Disaster Rescue & Relief Taskforce · Connected via VajraNet Mesh
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOnDuty(!isOnDuty)}
          className={`gov-btn btn-sm self-start md:self-auto cursor-pointer ${isOnDuty ? 'btn-secondary' : 'btn-ghost'}`}
        >
          <span className={`status-dot ${isOnDuty ? 'dot-online' : 'dot-idle'}`} />
          <span>{isOnDuty ? 'Active Deployment' : 'Mark Available'}</span>
        </button>
      </div>

      {/* 4 Primary Volunteer KPI HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Tasks */}
        <div 
          onClick={() => onNavigateTab('TASKS')}
          className="section-card p-4 hover:border-gov-blue cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gov-gray dark:text-slate-400 uppercase tracking-wider font-mono">My Assigned Tasks</span>
            <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-status-online">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-status-online font-mono">{myTasksCount}</span>
            <span className="text-xs text-gov-blue dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
              Tasks →
            </span>
          </div>
          <p className="text-[11px] text-gov-gray dark:text-slate-400 mt-1">Field tasks claimed & active</p>
        </div>

        {/* KPI 2: Available Hazards */}
        <div 
          onClick={() => onNavigateTab('INCIDENTS')}
          className="section-card p-4 hover:border-gov-blue cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gov-gray dark:text-slate-400 uppercase tracking-wider font-mono">Available Hazards</span>
            <div className="w-7 h-7 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-severity-high">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#1e2533] dark:text-white font-mono">{availableIncidentsCount}</span>
            <span className="text-xs text-gov-blue dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
              Claim →
            </span>
          </div>
          <p className="text-[11px] text-gov-gray dark:text-slate-400 mt-1">Incidents awaiting field squads</p>
        </div>

        {/* KPI 3: Live SOS */}
        <div 
          onClick={() => onNavigateTab('SOS')}
          className="section-card p-4 hover:border-gov-blue cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gov-gray dark:text-slate-400 uppercase tracking-wider font-mono">Nearby Distress Signals</span>
            <div className="w-7 h-7 rounded bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center text-severity-critical">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-severity-critical font-mono">{activeSosCount}</span>
            <span className="text-xs text-gov-blue dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
              View SOS →
            </span>
          </div>
          <p className="text-[11px] text-gov-gray dark:text-slate-400 mt-1">Active citizen SOS alerts</p>
        </div>

        {/* KPI 4: Private Shelters */}
        <div 
          onClick={() => onNavigateTab('SHELTERS')}
          className="section-card p-4 hover:border-gov-blue cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gov-gray dark:text-slate-400 uppercase tracking-wider font-mono">Private Facilities</span>
            <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-gov-blue dark:text-blue-400">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#1e2533] dark:text-white font-mono">{sheltersCount}</span>
            <span className="text-xs text-gov-blue dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
              Manage →
            </span>
          </div>
          <p className="text-[11px] text-gov-gray dark:text-slate-400 mt-1">Shelters & community halls</p>
        </div>

      </div>

      {/* Split Tactical Grid: GIS Map (Left 7 cols) + Priority Alert Feeds (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Tactical GIS Map */}
        <div className="lg:col-span-7 flex flex-col h-[480px]">
          <TacticalGISMap />
        </div>

        {/* Right Column: Priority Alerts Feed & Quick Volunteer Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Priority Alerts Feed */}
          <div className="section-card flex-1 flex flex-col shadow-sm">
            <div className="px-4 py-2.5 border-b border-gov-gray-border dark:border-slate-800 flex items-center justify-between bg-gov-gray-bg dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="status-dot dot-offline animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gov-gray-dark dark:text-slate-200">
                  Priority Alerts Feed
                </h2>
              </div>
              <span className="text-[10px] font-mono text-gov-gray">Real-Time Field Ticker</span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto divide-y divide-gov-gray-border/50 dark:divide-slate-800/80 space-y-2 max-h-[260px]">
              {recentEvents.length === 0 ? (
                <div className="p-6 text-center text-xs text-gov-gray">
                  No active emergency alerts in your area.
                </div>
              ) : (
                recentEvents.map((ev, i) => (
                  <div 
                    key={ev.id + i} 
                    onClick={() => handleEventClick(ev)}
                    className="pt-2 first:pt-0 cursor-pointer hover:bg-gov-blue-faint dark:hover:bg-slate-800/60 p-2 rounded transition group"
                    title="Click to locate on Map"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`gov-badge ${ev.severity === 'CRITICAL' ? 'badge-critical' : ev.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                          {ev.type}
                        </span>
                        <span className="font-mono text-xs font-bold text-gov-blue-dark dark:text-blue-300">{ev.id}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gov-gray flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {ev.time}
                      </span>
                    </div>
                    <p className="text-xs text-[#1e2533] dark:text-slate-200 font-medium mt-1 line-clamp-1 group-hover:text-gov-blue dark:group-hover:text-blue-300">
                      {ev.title}
                    </p>
                    {ev.latitude && ev.longitude && (
                      <span className="text-[10px] text-gov-gray font-mono flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-severity-critical" />
                        <span>({ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}) · Click to Pan Map</span>
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-gov-gray-border dark:border-slate-800 bg-gov-gray-bg dark:bg-slate-900/60 flex items-center justify-between">
              <button 
                onClick={() => onNavigateTab('SOS')}
                className="gov-btn btn-ghost btn-sm w-full justify-center cursor-pointer"
              >
                View Full SOS Triage Stream →
              </button>
            </div>
          </div>

          {/* Volunteer Quick Actions */}
          <div className="section-card p-3.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-gray-dark dark:text-slate-200 mb-2.5">
              Field Responder Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onNavigateTab('TASKS')}
                className="gov-btn btn-secondary text-xs justify-center py-2 cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5 text-status-online" /> Claim Missions
              </button>
              <button 
                onClick={() => onNavigateTab('INCIDENTS')}
                className="gov-btn btn-secondary text-xs justify-center py-2 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-severity-high" /> Hazard Report
              </button>
              <button 
                onClick={() => onNavigateTab('SHELTERS')}
                className="gov-btn btn-ghost text-xs justify-center py-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" /> Add Shelter
              </button>
              <button 
                onClick={() => onNavigateTab('FUNDRAISERS')}
                className="gov-btn btn-ghost text-xs justify-center py-2 cursor-pointer"
              >
                <DollarSign className="w-3.5 h-3.5 text-status-online" /> Fundraisers
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
