import React from 'react';
import { 
  Zap, 
  ShieldAlert, 
  Smartphone, 
  Network, 
  Users, 
  Building2, 
  BrainCircuit, 
  Wifi, 
  WifiOff 
} from 'lucide-react';

export default function Navbar({ activeView, setActiveView, isOnline, setIsOnline, criticalCount }) {
  const views = [
    { id: 'citizen', label: 'Citizen App', icon: Smartphone, badge: null },
    { id: 'gov', label: 'Gov Command Center', icon: ShieldAlert, badge: criticalCount ? `${criticalCount} Critical` : null },
    { id: 'mesh', label: 'P2P Mesh Topology', icon: Network, badge: 'BLE' },
    { id: 'volunteer', label: 'Volunteer Hub', icon: Users, badge: null },
    { id: 'hospital', label: 'Shelters & Hospitals', icon: Building2, badge: null },
    { id: 'ai', label: 'AI Intelligence Suite', icon: BrainCircuit, badge: 'AI' },
  ];

  return (
    <header className="bg-[#081324] border-b border-slate-800 sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveView('gov')}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider text-white font-heading">VAJRANET</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono font-semibold">
                SIH 2026
              </span>
            </div>
          </div>

          {/* Connection Toggle Simulator for Mobile Header */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className="md:hidden flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isOnline ? 'Online' : 'Mesh'}</span>
          </button>
        </div>

        {/* View Selection Tabs (Clean mobile dropdown select for mobile / horizontal list for desktop) */}
        <div className="w-full md:w-auto">
          {/* Mobile Select dropdown */}
          <div className="md:hidden w-full">
            <select
              value={activeView}
              onChange={(e) => setActiveView(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
            >
              {views.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} {v.badge ? `(${v.badge})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tab Buttons */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
            {views.map((v) => {
              const Icon = v.icon;
              const isActive = activeView === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveView(v.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Connection Toggle Simulator for Desktop */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Gateway:</span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
              isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isOnline ? 'Gateway Online' : 'P2P Mesh Only'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
