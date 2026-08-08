import React, { useState } from 'react';
import { HeartPulse, Building2, Check } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

export default function ResourcePortal({ hospitals, shelters }) {
  const [hospList, setHospList] = useState(hospitals);
  const [shelterList, setShelterList] = useState(shelters);
  const [updateMsg, setUpdateMsg] = useState(null);

  const handleUpdateBeds = (hospId, delta) => {
    setHospList(prev => prev.map(h => {
      if (h.id === hospId) {
        return { ...h, icuBedsAvailable: Math.max(0, h.icuBedsAvailable + delta) };
      }
      return h;
    }));
    setUpdateMsg('Broadcasted ICU bed telemetry over mesh!');
    setTimeout(() => setUpdateMsg(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      <div className="op-card p-4 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white font-mono uppercase">Hospital & Shelter Resource Telemetry</h2>
          <p className="text-xs text-slate-400">Broadcast ICU bed availability, oxygen levels, and shelter occupancy over VajraNet mesh</p>
        </div>
        {updateMsg && <Badge variant="success">{updateMsg}</Badge>}
      </div>

      {/* Hospitals */}
      <div className="space-y-3">
        <h3 className="text-sm font-mono font-bold text-slate-300 uppercase flex items-center space-x-2">
          <HeartPulse className="w-4 h-4 text-rose-400" />
          <span>Emergency Hospitals</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospList.map(h => (
            <Card key={h.id} title={h.name} subtitle={h.address}>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded border border-slate-800 font-mono">
                  <div>
                    <span className="text-slate-400 block">Open ICU Beds</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xl font-bold text-cyan-400">{h.icuBedsAvailable} / {h.icuBedsTotal}</span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="secondary" onClick={() => handleUpdateBeds(h.id, -1)}>-</Button>
                        <Button size="sm" variant="primary" onClick={() => handleUpdateBeds(h.id, 1)}>+</Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Oxygen Supply</span>
                    <span className="text-sm font-bold text-emerald-400 mt-1 block">{h.oxygenLevel}</span>
                  </div>
                </div>
                <div className="text-slate-400 font-mono text-[11px]">Emergency Helpline: <span className="text-white">{h.emergencyHelpline}</span></div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Shelters */}
      <div className="space-y-3 pt-4 border-t border-slate-800">
        <h3 className="text-sm font-mono font-bold text-slate-300 uppercase flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          <span>Relief Shelters</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shelterList.map(s => (
            <Card key={s.id} title={s.name} subtitle={s.address}>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Occupancy:</span>
                  <span className="text-white font-bold">{s.occupancy} / {s.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Water Supply:</span>
                  <span className="text-emerald-400">{s.supplies.water}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Food Ration:</span>
                  <span className="text-amber-400">{s.supplies.food}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}
