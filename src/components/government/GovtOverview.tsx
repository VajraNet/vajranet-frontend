import React, { useEffect, useState, useCallback } from 'react';
import { 
  Flame, 
  Users, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Radio
} from 'lucide-react';
import { TacticalGISMap } from '../common/TacticalGISMap';
import { TrustedDeviceManager } from './TrustedDeviceManager';
import { governmentApi } from '../../api/government';
import { apiClient } from '../../api/client';
import { GovernmentOverview } from '../../types/api';

interface GovtOverviewProps {
  onNavigateTab: (tab: 'SOS' | 'INCIDENTS' | 'ANNOUNCEMENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF') => void;
}

export function GovtOverview({ onNavigateTab }: GovtOverviewProps) {
  const [overview, setOverview] = useState<GovernmentOverview>({
    active_sos_count: 0,
    active_incidents_count: 0,
    critical_incidents_count: 0,
    volunteers_responding_count: 0,
    total_shelter_capacity: 0,
    total_shelter_occupied: 0,
    available_hospital_beds: 0,
    available_icu_beds: 0,
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOverviewData = useCallback(async () => {
    try {
      const [overviewRes, sosRes, incRes, shelterRes, hospRes, volRes] = await Promise.allSettled([
        governmentApi.getOverview(),
        apiClient.get('/sos?limit=2000'),
        apiClient.get('/incidents?limit=2000'),
        apiClient.get('/shelters'),
        apiClient.get('/hospitals'),
        apiClient.get('/volunteers/tasks')
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
          activeList.slice(0, 3).forEach((s: any) => {
            combinedEvents.push({
              id: s.id || s.message_id,
              title: s.message || 'Citizen distress beacon triggered',
              severity: s.severity || 'CRITICAL',
              time: s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
              type: 'SOS',
              nav: 'SOS' as const
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
          activeIncList.slice(0, 3).forEach((inc: any) => {
            combinedEvents.push({
              id: inc.id || inc.message_id,
              title: inc.title || inc.description || 'Hazard reported',
              severity: inc.severity || 'HIGH',
              time: inc.created_at ? new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
              type: 'INCIDENT',
              nav: 'INCIDENTS' as const
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

      // Merge with overview endpoint if available
      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        const d = overviewRes.value;
        setOverview({
          active_sos_count: activeSos || d.active_sos_count || 0,
          active_incidents_count: activeInc || d.active_incidents_count || 0,
          critical_incidents_count: criticalInc || d.critical_incidents_count || 0,
          volunteers_responding_count: volunteersCount || d.volunteers_responding_count || 0,
          total_shelter_capacity: totalCapacity || d.total_shelter_capacity || 0,
          total_shelter_occupied: totalOccupied || d.total_shelter_occupied || 0,
          available_hospital_beds: availBeds || d.available_hospital_beds || 0,
          available_icu_beds: availIcu || d.available_icu_beds || 0,
        });
      } else {
        setOverview({
          active_sos_count: activeSos,
          active_incidents_count: activeInc,
          critical_incidents_count: criticalInc,
          volunteers_responding_count: volunteersCount,
          total_shelter_capacity: totalCapacity,
          total_shelter_occupied: totalOccupied,
          available_hospital_beds: availBeds,
          available_icu_beds: availIcu,
        });
      }

      setRecentEvents(combinedEvents.slice(0, 5));
    } catch (err: any) {
      console.warn('Overview fetch warning:', err);
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

  return (
    <div className="space-y-6">
      
      {/* Executive Government EOC Command Banner */}
      <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white border border-slate-700 p-1 flex items-center justify-center shrink-0">
              <img 
                src="/vajranet-icon.jpg" 
                alt="VajraNet Emblem" 
                className="w-full h-full object-contain rounded" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide uppercase">
                  National Disaster Emergency Operations Center
                </h1>
                <span className="text-[10px] bg-blue-600 text-white px-2.5 py-0.5 rounded-full font-mono font-bold">
                  LEVEL 1 EOC
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono font-medium mt-0.5 flex items-center gap-2">
                <span>VAJRANET DISASTER COMMUNICATION PLATFORM</span>
                <span className="text-slate-400 font-normal hidden sm:inline">• Authority Incident Command</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto font-mono text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-[#07111E] border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-[11px] font-bold">P2P MESH UPLINK ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Primary EOC KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Active SOS */}
        <div 
          onClick={() => onNavigateTab('SOS')}
          className="bg-[#0F1E36] border border-red-900/60 hover:border-red-600 rounded-2xl p-5 shadow-lg cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider font-mono">Active SOS Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{overview.active_sos_count}</span>
            <span className="text-xs text-red-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              Manage SOS →
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Requires immediate triage & dispatch</p>
        </div>

        {/* KPI 2: Active Incidents */}
        <div 
          onClick={() => onNavigateTab('INCIDENTS')}
          className="bg-[#0F1E36] border border-amber-900/60 hover:border-amber-600 rounded-2xl p-5 shadow-lg cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Disaster Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{overview.active_incidents_count}</span>
            <span className="text-xs text-amber-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              View Feed →
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">{overview.critical_incidents_count} critical hazards flagged</p>
        </div>

        {/* KPI 3: Responding Volunteers */}
        <div className="bg-[#0F1E36] border border-emerald-900/60 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">Field Responders</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{overview.volunteers_responding_count}</span>
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              REGISTERED
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Volunteer responders & rescue teams</p>
        </div>

      </div>

      {/* Secondary Resource Telemetry Strip */}
      <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-3.5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#07111E] p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Shelter Occupancy</span>
          <span className="text-blue-400 font-bold text-sm">
            {overview.total_shelter_occupied} / {overview.total_shelter_capacity}
          </span>
        </div>
        <div className="bg-[#07111E] p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Available Hospital Beds</span>
          <span className="text-emerald-400 font-bold text-sm">
            {overview.available_hospital_beds} Beds Live
          </span>
        </div>
        <div className="bg-[#07111E] p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Available ICU Units</span>
          <span className="text-cyan-400 font-bold text-sm">
            {overview.available_icu_beds} Live ICU
          </span>
        </div>
        <div className="bg-[#07111E] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">P2P Mesh Gateway</span>
            <span className="text-emerald-400 font-bold text-sm">Uplink Synced</span>
          </div>
          <Radio className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Main EOC Canvas: Active Incident Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span>🗺️ Active Incident & Beacon Spatial Grid</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Live database telemetry</span>
        </div>
        <TacticalGISMap height="520px" />
      </div>

      {/* Recent Critical Events Activity Feed */}
      {recentEvents.length > 0 && (
        <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Recent Critical Operations Log</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Live Dispatch Feed</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentEvents.map((evt) => (
              <div 
                key={evt.id}
                onClick={() => onNavigateTab(evt.nav)}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-800/40 px-2 rounded-xl cursor-pointer transition group"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                    evt.severity === 'CRITICAL' 
                      ? 'bg-red-950 text-red-400 border border-red-800' 
                      : evt.severity === 'HIGH'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    {evt.severity}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition">{evt.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{evt.time}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trusted SMS Relay Devices Management Section */}
      <TrustedDeviceManager />

    </div>
  );
}
