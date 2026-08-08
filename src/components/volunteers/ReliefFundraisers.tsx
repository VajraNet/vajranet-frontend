import React, { useState } from 'react';

export function ReliefFundraisers() {
  const [campaigns] = useState([
    {
      id: 'fund-1',
      title: 'Sector 4 Clean Water Purification Units',
      organizer: 'Kanpur Citizen Welfare Trust',
      targetAmount: 50000,
      raisedAmount: 34500,
      description: 'Funding 10 portable water purification units for flooded residential sectors.',
    },
  ]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        💰 Verified Relief Crowdfunding Campaigns
      </h2>

      <div className="space-y-4">
        {campaigns.map((c) => {
          const pct = Math.round((c.raisedAmount / c.targetAmount) * 100);
          return (
            <div key={c.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100">{c.title}</h3>
                <span className="text-xs text-emerald-400 font-bold">{pct}% Raised</span>
              </div>
              <p className="text-xs text-slate-300">{c.description}</p>
              <p className="text-xs text-slate-500">Organizer: {c.organizer}</p>

              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}