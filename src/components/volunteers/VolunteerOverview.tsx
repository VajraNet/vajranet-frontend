import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Home, 
  HeartPulse, 
  DollarSign, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  Activity, 
  MapPin,
  Play,
  Users
} from 'lucide-react';
import { TacticalGISMap } from '../common/TacticalGISMap';
import { VolTab } from './VolunteerHeader';

interface VolunteerOverviewProps {
  onNavigateTab: (tab: VolTab) => void;
}

export function VolunteerOverview({ onNavigateTab }: VolunteerOverviewProps) {
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTaskStatus, setActiveTaskStatus] = useState<'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');

  return (
    <div className="space-y-6">
      
      {/* Welcome & Duty Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700/80 flex items-center justify-center text-2xl">
            👋
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Welcome, First Response Team</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isOnDuty ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {isOnDuty ? '🟢 ON DUTY' : '⚫ OFF DUTY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sector: <strong className="text-slate-300">Zone 4 (Riverbank / Civil Lines)</strong> • Unit: <strong className="text-slate-300">NDRF Support 4</strong>
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

      {/* Top 2 Primary Volunteer KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* KPI 1: Available Incidents */}
        <div
          onClick={() => onNavigateTab('INCIDENTS')}
          className="bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 border border-amber-800/80 hover:border-amber-500 rounded-2xl p-5 shadow-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">Available Incidents</span>
            <div className="w-8 h-8 rounded-xl bg-amber-900/60 border border-amber-500/50 flex items-center justify-center text-amber-300 group-hover:scale-110 transition">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">7</span>
            <span className="text-xs text-amber-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              Claim Tasks →
            </span>
          </div>
          <p className="text-[11px] text-amber-200/70 mt-1 font-mono">Verified disaster tasks requiring volunteer rescue & aid</p>
        </div>

        {/* KPI 2: My Active Tasks */}
        <div
          onClick={() => onNavigateTab('TASKS')}
          className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-800/80 hover:border-emerald-500 rounded-2xl p-5 shadow-xl cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">My Assigned Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-white">2</span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold group-hover:translate-x-1 transition">
              Update Progress →
            </span>
          </div>
          <p className="text-[11px] text-emerald-200/70 mt-1 font-mono">Active rescue assignments in your sector</p>
        </div>

      </div>

      {/* Main Grid: Active Task Spotlight + Resources Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left 2 Cols: Active Response Spotlight */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Primary Active Response Mission
              </h3>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {activeTaskStatus === 'IN_PROGRESS' ? '🟡 IN PROGRESS' : '🟢 COMPLETED'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🌊 Flood Rescue & Water Delivery</span>
                  <span className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    CRITICAL
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  12 citizens trapped on terrace near Sector 4 Water Tank. Water level 3.5 ft. Team deploying swiftwater raft.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[10px]">Location</span>
                <span className="text-slate-200 font-bold">Sector 4 (3.2 km)</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Team Size</span>
                <span className="text-emerald-400 font-bold">4 Responders</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Equipment</span>
                <span className="text-blue-400 font-bold">Raft + Medical Kit</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setActiveTaskStatus(activeTaskStatus === 'IN_PROGRESS' ? 'COMPLETED' : 'IN_PROGRESS')}
                className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{activeTaskStatus === 'IN_PROGRESS' ? 'Mark Mission Completed' : 'Reopen Task'}</span>
              </button>
              <button
                onClick={() => onNavigateTab('TASKS')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
              >
                All Tasks →
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Contributed Community Resources Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>Private & NGO Resources</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Resources managed by your organization</p>
          </div>

          <div className="space-y-2.5">
            <div 
              onClick={() => onNavigateTab('SHELTERS')}
              className="p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400 transition">2 Private Shelters</span>
                  <span className="text-[10px] text-slate-500 font-mono">180 / 300 Beds Occupied</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </div>

            <div 
              onClick={() => onNavigateTab('HOSPITALS')}
              className="p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <HeartPulse className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block group-hover:text-cyan-400 transition">1 Private Hospital</span>
                  <span className="text-[10px] text-slate-500 font-mono">14 Beds • 4 ICU Available</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
            </div>

            <div 
              onClick={() => onNavigateTab('FUNDRAISERS')}
              className="p-3 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-slate-200 block group-hover:text-amber-400 transition">3 Relief Fundraisers</span>
                  <span className="text-[10px] text-slate-500 font-mono">₹1.8L / ₹2.5L Raised</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

      </div>

      {/* Tactical Field Map Canvas */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <span>🗺️ Local Sector Operations Map</span>
        </h3>
        <TacticalGISMap height="460px" />
      </div>

    </div>
  );
}
