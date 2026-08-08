import React, { useState } from 'react';

export function PrivateHospitalManager() {
  const [hospitals] = useState([
    {
      id: 'phosp-1',
      name: 'St. Jude Charitable Clinic',
      zone: 'Zone 1',
      availableBeds: 8,
      icuAvailable: 2,
      contact: '+91 98765 77777',
    },
  ]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        🏥 Private & Charity Clinics Network
      </h2>
      <p className="text-xs text-slate-400">
        Private hospital bed capacity allocated for emergency disaster relief intake.
      </p>

      <div className="space-y-3">
        {hospitals.map((h) => (
          <div key={h.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-bold text-slate-100">{h.name}</h3>
            <p className="text-xs text-slate-400">📍 {h.zone} • Helpline: {h.contact}</p>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="text-emerald-400">Beds: {h.availableBeds} Available</span>
              <span className="text-cyan-400">ICU: {h.icuAvailable} Available</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}