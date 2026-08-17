import React, { useEffect, useState, useCallback } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Building2, 
  HeartPulse, 
  Radio, 
  Clock, 
  MapPin, 
  Users, 
  RefreshCw,
  Plus,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { TacticalGISMap } from '../common/TacticalGISMap';
import { governmentApi } from '../../api/government';
import { apiClient } from '../../api/client';
import { GovernmentOverview, Announcement } from '../../types/api';
import { TRANSLATIONS, Language } from '../../utils/translations';

export type GovtTab = 'OVERVIEW' | 'SOS' | 'INCIDENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF' | 'ANNOUNCEMENTS' | 'TRUSTED_DEVICES' | 'MAP';

interface GovtOverviewProps {
  onNavigateTab: (tab: GovtTab) => void;
  lang?: Language;
}

export function GovtOverview({ onNavigateTab, lang = 'EN' }: GovtOverviewProps) {
  const [overview, setOverview] = useState<GovernmentOverview>({
    active_sos_count: 0,
    active_incidents_count: 0,
    critical_incidents_count: 0,
    total_shelter_capacity: 0,
    total_shelter_occupied: 0,
    available_hospital_beds: 0,
    available_icu_beds: 0,
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const t = TRANSLATIONS[lang];

  const fetchOverviewData = useCallback(async () => {
    try {
      const [overviewRes, sosRes, incRes, shelterRes, hospRes, volRes, annRes] = await Promise.allSettled([
        governmentApi.getOverview(),
        apiClient.get('/sos'),
        apiClient.get('/incidents'),
        apiClient.get('/shelters'),
        apiClient.get('/hospitals'),
        apiClient.get('/volunteers'),
        apiClient.get('/announcements'),
      ]);

      let activeSos = 0;
      let activeInc = 0;
      let criticalInc = 0;
      let totalCapacity = 0;
      let totalOccupied = 0;
      let availBeds = 0;
      let availIcu = 0;
      let volunteersCount = 0;
      const combinedEvents: any[] = [];

      // 1. Process SOS list
      if (sosRes.status === 'fulfilled') {
        const list = sosRes.value.data?.data || sosRes.value.data;
        if (Array.isArray(list)) {
          const activeList = list.filter((s: any) => s.status !== 'RESOLVED' && s.status !== 'CANCELLED');
          activeSos = activeList.length;
          activeList.slice(0, 6).forEach((s: any) => {
            combinedEvents.push({
              id: s.message_id || s.id,
              title: s.message || `Citizen in distress! Immediate assistance required at (${s.latitude?.toFixed(4)}, ${s.longitude?.toFixed(4)}).`,
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

      // 2. Process Incidents
      if (incRes.status === 'fulfilled') {
        const list = incRes.value.data?.data || incRes.value.data;
        if (Array.isArray(list)) {
          const activeIncList = list.filter((i: any) => i.status !== 'RESOLVED');
          activeInc = activeIncList.length;
          criticalInc = activeIncList.filter((i: any) => i.severity === 'CRITICAL').length;
          activeIncList.slice(0, 4).forEach((inc: any) => {
            combinedEvents.push({
              id: inc.message_id || inc.id,
              title: inc.title || inc.description || 'Hazard reported',
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

      // 3. Process Shelters
      if (shelterRes.status === 'fulfilled') {
        const list = shelterRes.value.data?.data || shelterRes.value.data;
        if (Array.isArray(list)) {
          list.forEach((sh: any) => {
            totalCapacity += Number(sh.capacity || 0);
            totalOccupied += Number(sh.occupied || 0);
          });
        }
      }

      // 4. Process Hospitals
      if (hospRes.status === 'fulfilled') {
        const list = hospRes.value.data?.data || hospRes.value.data;
        if (Array.isArray(list)) {
          list.forEach((h: any) => {
            availBeds += Number(h.available_beds ?? h.availableBeds ?? 0);
            availIcu += Number(h.icu_available ?? h.icuAvailable ?? h.available_icu_beds ?? 0);
          });
        }
      }

      // 5. Process Volunteers
      if (volRes.status === 'fulfilled') {
        const list = volRes.value.data?.data || volRes.value.data;
        if (Array.isArray(list)) {
          volunteersCount = list.length;
        }
      }

      // 6. Process Announcements
      if (annRes.status === 'fulfilled') {
        const list = annRes.value.data?.data || annRes.value.data;
        if (Array.isArray(list)) {
          setAnnouncements(list.slice(0, 4));
        }
      }

      // Set Overview Counts
      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        const d = overviewRes.value;
        setOverview({
          active_sos_count: activeSos || d.active_sos_count || 0,
          active_incidents_count: activeInc || d.active_incidents_count || 0,
          critical_incidents_count: criticalInc || d.critical_incidents_count || 0,
          total_shelter_capacity: totalCapacity || d.total_shelter_capacity || 0,
          total_shelter_occupied: totalOccupied || d.total_shelter_occupied || 0,
          available_hospital_beds: availBeds || d.available_hospital_beds || 0,
          available_icu_beds: availIcu || d.available_icu_beds || 0,
        });
      }

      setRecentEvents(combinedEvents);
    } catch (err) {
      console.warn('Overview load note:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
    const interval = setInterval(fetchOverviewData, 4000);

    const handleUpdate = () => {
      fetchOverviewData();
    };

    window.addEventListener('vajranet_data_updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('vajranet_data_updated', handleUpdate);
    };
  }, [fetchOverviewData]);

  const shelterPercent = overview.total_shelter_capacity > 0 
    ? Math.round((overview.total_shelter_occupied / overview.total_shelter_capacity) * 100) 
    : 0;

  // Handle Event Click: Pan map directly to coordinates!
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
      
      {/* 4 Primary Government KPI HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active SOS */}
        <div 
          onClick={() => onNavigateTab('SOS')}
          className="section-card p-4 hover:border-gov-blue cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gov-gray dark:text-slate-400 uppercase tracking-wider font-mono">{t.activeSosDistress}</span>
            <div className="w-7 h-7 rounded bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center justify-center text-severity-critical">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-severity-critical font-mono">{overview.active_sos_count}</span>
            <span className="text-xs text-gov-blue dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
              {t.triage} →
            </span>
          </div>
          <p className="text-[11px] text-gov-gray dark:text-slate-400 mt-1">{t.requiresImmediateDispatch}</p>
        </div>

        {/* KPI 2: Active Incidents */}
        <div 
          onClick={() => onNavigateTab('INCIDENTS')}
          className="section-card p-4 hover:border-gov-blue cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gov-gray dark:text-slate-400 uppercase tracking-wider font-mono">{t.disasterIncidents}</span>
            <div className="w-7 h-7 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-severity-high">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#1e2533] dark:text-white font-mono">{overview.active_incidents_count}</span>
            <span className="text-xs text-gov-blue dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
              {t.sitRep} →
            </span>
          </div>
          <p className="text-[11px] text-gov-gray dark:text-slate-400 mt-1">{overview.critical_incidents_count} {t.markedCritical}</p>
        </div>

        {/* KPI 3: Shelter Occupancy */}
        <div 
          onClick={() => onNavigateTab('SHELTERS')}
          className="section-card p-4 hover:border-gov-blue cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gov-gray dark:text-slate-400 uppercase tracking-wider font-mono">{t.shelterCapacity}</span>
            <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-gov-blue dark:text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-[#1e2533] dark:text-white font-mono">{overview.total_shelter_occupied} <span className="text-xs text-gov-gray font-normal font-sans">/ {overview.total_shelter_capacity}</span></span>
            <span className="text-xs font-bold text-status-online font-mono">{shelterPercent}% {t.occupied}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-gov-blue h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(shelterPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Hospital & ICU Beds */}
        <div 
          onClick={() => onNavigateTab('HOSPITALS')}
          className="section-card p-4 hover:border-gov-blue cursor-pointer transition shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gov-gray dark:text-slate-400 uppercase tracking-wider font-mono">{t.availableBedsIcu}</span>
            <div className="w-7 h-7 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-status-online">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-bold text-status-online font-mono">{overview.available_hospital_beds}</span>
            <span className="text-xs text-severity-high font-bold font-mono">{overview.available_icu_beds} ICU</span>
          </div>
          <p className="text-[11px] text-gov-gray dark:text-slate-400 mt-1">{t.readyForMassCasualty}</p>
        </div>

      </div>

      {/* Split Tactical Grid: GIS Situation Map (Left 7 cols) + Live Priority Feeds (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Tactical GIS Situation Map (Clean Full Container with Fixed Header) */}
        <div className="lg:col-span-7 flex flex-col h-[480px]">
          <TacticalGISMap />
        </div>

        {/* Right Column: Live Priority Feed & Quick Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          {/* Live Alerts Queue with Direct Map Focusing on Click */}
          <div className="section-card flex-1 flex flex-col shadow-sm">
            <div className="px-4 py-2.5 border-b border-gov-gray-border dark:border-slate-800 flex items-center justify-between bg-gov-gray-bg dark:bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="status-dot dot-offline animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-gov-gray-dark dark:text-slate-200">
                  {t.priorityAlertsFeed}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-gov-gray">{t.realTime}</span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto divide-y divide-gov-gray-border/50 dark:divide-slate-800/80 space-y-2 max-h-[260px]">
              {recentEvents.length === 0 ? (
                <div className="p-6 text-center text-xs text-gov-gray">
                  {t.noActiveAlerts}
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
                className="gov-btn btn-ghost btn-sm w-full justify-center"
              >
                {t.viewFullSosStream} →
              </button>
            </div>
          </div>

          {/* Quick Action Commands */}
          <div className="section-card p-3.5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-gray-dark dark:text-slate-200 mb-2.5">
              {t.eocQuickActions}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onNavigateTab('ANNOUNCEMENTS')}
                className="gov-btn btn-secondary text-xs justify-center py-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> {t.broadcastAlert}
              </button>
              <button 
                onClick={() => onNavigateTab('INCIDENTS')}
                className="gov-btn btn-secondary text-xs justify-center py-2 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-severity-high" /> {t.reportIncident}
              </button>
              <button 
                onClick={() => onNavigateTab('SHELTERS')}
                className="gov-btn btn-ghost text-xs justify-center py-2 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" /> {t.manageShelters}
              </button>
              <button 
                onClick={() => onNavigateTab('TRUSTED_DEVICES')}
                className="gov-btn btn-ghost text-xs justify-center py-2 cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-gov-blue" /> {t.trustedDevices}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Official Directives & Evacuation Broadcast Feed */}
      <div className="section-card p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-gov-gray-border dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-gov-blue dark:text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gov-gray-dark dark:text-slate-200">
              {t.officialAnnouncements}
            </h3>
          </div>
          <button 
            onClick={() => onNavigateTab('ANNOUNCEMENTS')}
            className="text-xs font-semibold text-gov-blue dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            {t.manage} →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {announcements.length === 0 ? (
            <div className="col-span-2 text-center py-4 text-xs text-gov-gray">
              {t.noBroadcasts || 'No active announcements published.'}
            </div>
          ) : (
            announcements.map((ann) => {
              const severity = (ann.severity || 'HIGH').toUpperCase();
              const badgeClass = severity === 'CRITICAL' 
                ? 'badge-critical' 
                : severity === 'HIGH' 
                ? 'badge-high' 
                : 'badge-medium';

              return (
                <div 
                  key={ann.id} 
                  className="p-3 rounded bg-gov-gray-bg dark:bg-slate-900 border border-gov-gray-border/60 dark:border-slate-800/80 space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#1e2533] dark:text-white truncate">
                      {ann.title}
                    </span>
                    <span className={`gov-badge ${badgeClass} text-[9px] font-bold font-mono px-2 py-0.5 shrink-0`}>
                      {severity}
                    </span>
                  </div>
                  <p className="text-xs text-gov-gray-dark dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gov-gray pt-1 border-t border-gov-gray-border/30 dark:border-slate-800/50">
                    <span>{t.area || 'Target Zone'}: <strong className="text-gov-gray-dark dark:text-slate-200">{ann.target_zone || 'All Sectors'}</strong></span>
                    <span>{t.published || 'Published'}: <strong className="text-gov-gray-dark dark:text-slate-200">{ann.issued_at ? new Date(ann.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</strong></span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
