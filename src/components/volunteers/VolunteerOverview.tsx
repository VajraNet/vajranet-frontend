import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Home, 
  HeartPulse, 
  DollarSign, 
  ArrowRight, 
  MapPin
} from 'lucide-react';
import { TacticalGISMap } from '../common/TacticalGISMap';
import { VolTab } from './VolunteerHeader';
import { apiClient } from '../../api/client';

interface VolunteerOverviewProps {
  onNavigateTab: (tab: VolTab) => void;
}

export function VolunteerOverview({ onNavigateTab }: VolunteerOverviewProps) {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [availableIncidentsCount, setAvailableIncidentsCount] = useState<number>(0);
  const [myTasksCount, setMyTasksCount] = useState<number>(0);
  const [activeSosCount, setActiveSosCount] = useState<number>(0);
  const [sheltersCount, setSheltersCount] = useState<number>(0);
  const [hospitalsCount, setHospitalsCount] = useState<number>(0);

  const fetchCounts = useCallback(async () => {
    try {
      const [incRes, taskRes, sosRes, shelterRes, hospRes] = await Promise.allSettled([
        apiClient.get('/incidents'),
        apiClient.get('/volunteers/tasks'),
        apiClient.get('/sos'),
        apiClient.get('/shelters'),
        apiClient.get('/hospitals')
      ]);

      if (incRes.status === 'fulfilled') {
        const data = incRes.value.data?.data || incRes.value.data;
        if (Array.isArray(data)) {
          setAvailableIncidentsCount(data.filter((i: any) => i.status !== 'RESOLVED').length);
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
          setActiveSosCount(data.filter((s: any) => s.status !== 'RESOLVED' && s.status !== 'CANCELLED').length);
        }
      }

      if (shelterRes.status === 'fulfilled') {
        const data = shelterRes.value.data?.data || shelterRes.value.data;
        if (Array.isArray(data)) {
          setSheltersCount(data.length);
        }
      }

      if (hospRes.status === 'fulfilled') {
        const data = hospRes.value.data?.data || hospRes.value.data;
        if (Array.isArray(data)) {
          setHospitalsCount(data.length);
        }
      }
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

  return (
    <div className="space-y-6">
      
      {/* Welcome & Duty Header */}
      <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white border border-slate-700 p-1 flex items-center justify-center shrink-0">
            <img 
              src="/vajranet-icon.jpg" 
              alt="VajraNet Volunteer Force" 
              className="w-full h-full object-contain rounded" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Volunteer & Private Response Force</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isOnDuty ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isOnDuty ? '🟢 ON DUTY' : '⚫ OFF DUTY'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">
              VajraNet Disaster Platform • Sector: <strong className="text-white">Zone 4 (Civil Lines)</strong> • Unit: <strong className="text-white">Volunteer Force</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnDuty(!isOnDuty)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              isOnDuty 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
            }`}
          >
            {isOnDuty ? 'Go Off Duty' : 'Check In On Duty'}
          </button>
        </div>
      </div>

      {/* Top 3 Primary Volunteer KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Available Incidents */}
        <div
          onClick={() => onNavigateTab('INCIDENTS')}
          className="bg-[#0F1E36] border border-amber-900/60 hover:border-amber-600 rounded-2xl p-5 shadow-lg cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Available Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{availableIncidentsCount}</span>
            <span className="text-xs text-amber-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              Claim Tasks →
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Verified disaster incidents in your area</p>
        </div>

        {/* KPI 2: My Active Tasks */}
        <div
          onClick={() => onNavigateTab('TASKS')}
          className="bg-[#0F1E36] border border-emerald-900/60 hover:border-emerald-600 rounded-2xl p-5 shadow-lg cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">My Assigned Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{myTasksCount}</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              Update Progress →
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Active response assignments</p>
        </div>

        {/* KPI 3: Live Citizen SOS Calls */}
        <div
          onClick={() => onNavigateTab('SOS')}
          className="bg-[#0F1E36] border border-red-900/60 hover:border-red-600 rounded-2xl p-5 shadow-lg cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-300 uppercase tracking-wider font-mono">Citizen SOS Beacons</span>
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white">{activeSosCount}</span>
            <span className="text-xs text-red-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              View SOS Feed →
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Distress signals needing aid</p>
        </div>

      </div>

      {/* Resource Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div 
          onClick={() => onNavigateTab('SHELTERS')}
          className="bg-[#0F1E36] border border-slate-800 hover:border-slate-700 p-3 rounded-xl cursor-pointer transition"
        >
          <span className="text-slate-400 block text-[10px] uppercase">Registered Shelters</span>
          <span className="text-emerald-400 font-bold text-base">{sheltersCount} Active</span>
        </div>
        <div 
          onClick={() => onNavigateTab('HOSPITALS')}
          className="bg-[#0F1E36] border border-slate-800 hover:border-slate-700 p-3 rounded-xl cursor-pointer transition"
        >
          <span className="text-slate-400 block text-[10px] uppercase">Medical Centers</span>
          <span className="text-cyan-400 font-bold text-base">{hospitalsCount} Facilities</span>
        </div>
        <div 
          onClick={() => onNavigateTab('FUNDRAISERS')}
          className="bg-[#0F1E36] border border-slate-800 hover:border-slate-700 p-3 rounded-xl cursor-pointer transition col-span-2 sm:col-span-1"
        >
          <span className="text-slate-400 block text-[10px] uppercase">Relief Campaigns</span>
          <span className="text-amber-400 font-bold text-base">Verified Active</span>
        </div>
      </div>

      {/* Main Grid: Tactical Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <span>🗺️ Sector Incident & Facility Map</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Live database telemetry</span>
        </div>
        <TacticalGISMap height="480px" />
      </div>

    </div>
  );
}
