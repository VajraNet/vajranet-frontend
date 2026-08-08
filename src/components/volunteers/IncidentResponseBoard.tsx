import React, { useState } from 'react';

export interface FieldIncident {
  id: string;
  type: string;
  location: string;
  description: string;
  reportedAt: string;
  status: 'OPEN' | 'RESPONDING' | 'RESOLVED';
  respondersCount: number;
}

export function IncidentResponseBoard() {
  const [incidents, setIncidents] = useState<FieldIncident[]>([
    {
      id: 'inc-v1',
      type: 'Waterlogging & Blocked Access',
      location: 'Sector 4, Main Market Road',
      description: 'Tree branch fallen on main lane, blocking ambulance route.',
      reportedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      status: 'OPEN',
      respondersCount: 1,
    },
    {
      id: 'inc-v2',
      type: 'Medical Assistance Required',
      location: 'Zone 2, Civil Lines Block B',
      description: 'Insulin required for elderly resident trapped on upper floor.',
      reportedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: 'RESPONDING',
      respondersCount: 3,
    },
  ]);

  function handleRespond(id: string) {
    setIncidents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: 'RESPONDING', respondersCount: item.respondersCount + 1 }
          : item
      )
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        🚨 Incident Response Board
      </h2>
      <p className="text-xs text-slate-400">
        Community distress reports requiring localized volunteer team response.
      </p>

      <div className="space-y-3">
        {incidents.map((inc) => (
          <div key={inc.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                {inc.type}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(inc.reportedAt).toLocaleTimeString()}
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-200">📍 {inc.location}</h3>
            <p className="text-xs text-slate-300">{inc.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
              <span className="text-slate-400">
                Responders en route: <strong className="text-slate-200">{inc.respondersCount}</strong>
              </span>
              <button
                onClick={() => handleRespond(inc.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1 rounded transition"
              >
                Join Response Team
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}