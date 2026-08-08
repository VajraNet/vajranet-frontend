import React, { useState } from 'react';
import { 
  HeartPulse, 
  Home, 
  Plus, 
  Activity, 
  AlertCircle, 
  Phone, 
  Radio, 
  Bed, 
  Check, 
  Building
} from 'lucide-react';
import { MOCK_HOSPITALS, MOCK_SHELTERS } from '../data/mockData';

export default function HospitalShelterPortal({ hospitals, shelters }) {
  const [hospList, setHospList] = useState(hospitals);
  const [shelterList, setShelterList] = useState(shelters);
  const [broadcastMsg, setBroadcastMsg] = useState(null);

  const handleUpdateBeds = (hospId, change) => {
    setHospList(prev => prev.map(h => {
      if (h.id === hospId) {
        const updated = Math.max(0, h.icuBedsAvailable + change);
        return { ...h, icuBedsAvailable: updated };
      }
      return h;
    }));
    setBroadcastMsg(`Updated ICU beds and broadcasted payload over local mesh!`);
    setTimeout(() => setBroadcastMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-red-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Hospital & Relief Shelter Management Portal
            </h2>
            <p className="text-xs text-slate-300">
              Broadcast ICU bed capacity, medical oxygen levels, and shelter occupancy over VajraNet P2P mesh.
            </p>
          </div>
        </div>

        {broadcastMsg && (
          <div className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-2 rounded-xl flex items-center space-x-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{broadcastMsg}</span>
          </div>
        )}
      </div>

      {/* Grid: Emergency Hospitals Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white font-heading flex items-center space-x-2">
          <HeartPulse className="w-5 h-5 text-red-400" />
          <span>Emergency Hospital Bed & Supply Dashboard</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospList.map((h) => (
            <div key={h.id} className="glass-card p-5 rounded-2xl space-y-4 border border-slate-800">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {h.id}
                  </span>
                  <h4 className="font-bold text-white text-lg mt-1">{h.name}</h4>
                  <p className="text-xs text-slate-400">{h.address}</p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {h.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">ICU Beds Open</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-cyan-400 font-heading">
                      {h.icuBedsAvailable} / {h.icuBedsTotal}
                    </span>
                    <div className="flex space-x-1">
                      <button onClick={() => handleUpdateBeds(h.id, -1)} className="px-2 py-1 bg-slate-800 text-white rounded font-bold hover:bg-slate-700">-</button>
                      <button onClick={() => handleUpdateBeds(h.id, 1)} className="px-2 py-1 bg-cyan-600 text-white rounded font-bold hover:bg-cyan-500">+</button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-1">Oxygen Supply</span>
                  <span className={`text-sm font-extrabold ${h.oxygenLevel.includes('CRITICAL') ? 'text-red-400' : 'text-emerald-400'}`}>
                    {h.oxygenLevel}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
                <span>Helpline: <strong className="text-white">{h.emergencyHelpline}</strong></span>
                <span className="text-cyan-400 cursor-pointer hover:underline">Sync Telemetry ➔</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Relief Shelters Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-white font-heading flex items-center space-x-2">
          <Building className="w-5 h-5 text-cyan-400" />
          <span>Relief Shelter Occupancy & Supplies</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shelterList.map((s) => (
            <div key={s.id} className="glass-card p-5 rounded-2xl space-y-3 border border-slate-800">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-base">{s.name}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
                  {s.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">{s.address}</p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Occupancy:</span>
                  <span className="text-white font-bold">{s.occupancy} / {s.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Water Supply:</span>
                  <span className="text-emerald-400">{s.supplies.water}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ration Supplies:</span>
                  <span className="text-amber-400">{s.supplies.food}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
