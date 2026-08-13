import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  Users, 
  Activity, 
  Home, 
  HeartPulse, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Radio,
  ExternalLink
} from 'lucide-react';
import { TacticalGISMap } from '../common/TacticalGISMap';
import { TrustedDeviceManager } from './TrustedDeviceManager';
import { governmentApi } from '../../api/government';
import { GovernmentOverview } from '../../types/api';

interface GovtOverviewProps {
  onNavigateTab: (tab: 'SOS' | 'INCIDENTS' | 'ANNOUNCEMENTS' | 'SHELTERS' | 'HOSPITALS' | 'RELIEF') => void;
}

export function GovtOverview({ onNavigateTab }: GovtOverviewProps) {
  const [overview, setOverview] = useState<GovernmentOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        let sosCount = 0;
        let incCount = 0;
        try {
          const sosList = await governmentApi.getSOSList();
          if (Array.isArray(sosList)) sosCount = sosList.length;
        } catch (e) {}

        try {
          const incList = await governmentApi.getIncidents();
          if (Array.isArray(incList)) incCount = incList.length;
        } catch (e) {}

        const data = await governmentApi.getOverview();
        setOverview({
          ...data,
          active_sos_count: Math.max(data.active_sos_count || 0, sosCount),
          active_incidents_count: Math.max(data.active_incidents_count || 0, incCount)
        });
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load government overview');
        setOverview({
          active_sos_count: 0,
          active_incidents_count: 0,
          critical_incidents_count: 0,
          total_shelter_capacity: 0,
          total_shelter_occupied: 0,
          available_hospital_beds: 0,
          available_icu_beds: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
    const interval = setInterval(fetchOverview, 5000);
    return () => clearInterval(interval);
  }, []);

  const recentCriticalEvents = [
    {
      id: 'EV-1',
      title: 'Building collapse reported near Sector 3 Water Tank',
      severity: 'CRITICAL',
      time: '2 min ago',
      type: 'SOS',
      nav: 'SOS' as const
    },
    {
      id: 'EV-2',
      title: 'Yamuna River Embankment Breach warning published',
      severity: 'HIGH',
      time: '5 min ago',
      type: 'BROADCAST',
      nav: 'ANNOUNCEMENTS' as const
    },
    {
      id: 'EV-3',
      title: 'Transformer explosion & fire reported near Metro Pillar 42',
      severity: 'HIGH',
      time: '8 min ago',
      type: 'INCIDENT',
      nav: 'INCIDENTS' as const
    },
    {
      id: 'EV-4',
      title: 'Sector 4 Indoor Stadium Shelter reached 58% capacity',
      severity: 'NORMAL',
      time: '14 min ago',
      type: 'SHELTER',
      nav: 'SHELTERS' as const
    }
  ];

  if (loading && !overview) {
    return <div className="p-6 text-slate-400">Loading overview data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-400 bg-red-950/20 border border-red-900/50 rounded-lg">
        <p className="font-bold">Error loading overview</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top 3 High-Impact EOC KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Active SOS */}
        <div 
          onClick={() => onNavigateTab('SOS')}
          className="bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-900 border border-red-800/80 hover:border-red-500 rounded-2xl p-5 shadow-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider font-mono">Active SOS Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-red-900/60 border border-red-500/50 flex items-center justify-center text-red-300 group-hover:scale-110 transition">
              <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{overview?.active_sos_count ?? 24}</span>
            <span className="text-xs text-red-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              Manage SOS →
            </span>
          </div>
          <p className="text-[11px] text-red-200/70 mt-1 font-mono">Requires immediate triage & dispatch</p>
        </div>

        {/* KPI 2: Active Incidents */}
        <div 
          onClick={() => onNavigateTab('INCIDENTS')}
          className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 border border-amber-800/80 hover:border-amber-500 rounded-2xl p-5 shadow-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Disaster Incidents</span>
            <div className="w-8 h-8 rounded-xl bg-amber-900/60 border border-amber-500/50 flex items-center justify-center text-amber-300 group-hover:scale-110 transition">
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">{overview?.active_incidents_count ?? 17}</span>
            <span className="text-xs text-amber-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              View Feed →
            </span>
          </div>
          <p className="text-[11px] text-amber-200/70 mt-1 font-mono">{overview?.critical_incidents_count ?? 5} critical hazards flagged</p>
        </div>

        {/* KPI 3: Responding Volunteers */}
        <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">Field Responders</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-300">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">42</span>
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              ON DUTY
            </span>
          </div>
          <p className="text-[11px] text-emerald-200/70 mt-1 font-mono">14 NDRF units + 28 Volunteer teams</p>
        </div>

      </div>

      {/* Secondary Resource Telemetry Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Shelter Occupancy</span>
          <span className="text-blue-400 font-bold text-sm">
            {overview?.total_shelter_occupied ?? 780} / {overview?.total_shelter_capacity ?? 1200}
          </span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Available Hospital Beds</span>
          <span className="text-emerald-400 font-bold text-sm">
            {overview?.available_hospital_beds ?? 142} Beds Live
          </span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block text-[10px] uppercase">Available ICU Units</span>
          <span className="text-cyan-400 font-bold text-sm">
            {overview?.available_icu_beds ?? 18} Live ICU
          </span>
        </div>
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">P2P Mesh Gateway</span>
            <span className="text-emerald-400 font-bold text-sm">Uplink Synced</span>
          </div>
          <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Main EOC Canvas: Active Incident Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span>🗺️ Active Incident & Beacon Spatial Grid</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Auto-refreshes live telemetry</span>
        </div>
        <TacticalGISMap height="520px" />
      </div>

      {/* Recent Critical Events Activity Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Recent Critical Operations Log</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">Live Dispatch Feed</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentCriticalEvents.map((evt) => (
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
                  <span className="text-[10px] text-slate-500 font-mono">{evt.time}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Trusted SMS Relay Devices Management Section */}
      <TrustedDeviceManager />

    </div>
  );
}
