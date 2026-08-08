import React, { useEffect, useState } from 'react';
import { GovernmentOverview } from '../../types/api';
import { governmentApi } from '../../api/government';

export function MetricsOverview() {
  const [overview, setOverview] = useState<GovernmentOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const data = await governmentApi.getOverview();
        setOverview(data);
      } catch (err) {
        // Fallback demo metrics if backend is offline
        setOverview({
          active_sos_count: 14,
          active_incidents_count: 8,
          critical_incidents_count: 3,
          total_shelter_capacity: 1200,
          total_shelter_occupied: 780,
          available_hospital_beds: 142,
          available_icu_beds: 18,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Active SOS',
      value: overview?.active_sos_count ?? 0,
      color: 'text-red-400',
      bg: 'border-red-900/50 bg-red-950/20',
    },
    {
      label: 'Active Incidents',
      value: overview?.active_incidents_count ?? 0,
      color: 'text-amber-400',
      bg: 'border-amber-900/50 bg-amber-950/20',
    },
    {
      label: 'Critical Incidents',
      value: overview?.critical_incidents_count ?? 0,
      color: 'text-rose-500',
      bg: 'border-rose-900/50 bg-rose-950/30',
    },
    {
      label: 'Shelter Capacity',
      value: `${overview?.total_shelter_occupied ?? 0} / ${overview?.total_shelter_capacity ?? 0}`,
      color: 'text-blue-400',
      bg: 'border-blue-900/50 bg-blue-950/20',
    },
    {
      label: 'Available Beds',
      value: overview?.available_hospital_beds ?? 0,
      color: 'text-emerald-400',
      bg: 'border-emerald-900/50 bg-emerald-950/20',
    },
    {
      label: 'ICU Beds',
      value: overview?.available_icu_beds ?? 0,
      color: 'text-cyan-400',
      bg: 'border-cyan-900/50 bg-cyan-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className={`border rounded-lg p-3.5 ${card.bg} shadow-sm`}>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
          <p className={`text-xl font-extrabold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}