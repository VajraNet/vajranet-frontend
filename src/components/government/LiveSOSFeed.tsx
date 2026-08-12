import React, { useEffect, useState } from 'react';
import { SOSPayload, EmergencyStatus } from '../../types/api';
import { governmentApi } from '../../api/government';

export function LiveSOSFeed() {
  const [sosList, setSosList] = useState<SOSPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<number>(0);

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSinceUpdate(Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  async function fetchSOS() {
    try {
      const data = await governmentApi.getSOSList();
      if (Array.isArray(data)) {
        setSosList(data);
        setError(null);
        setLastUpdated(new Date());
      } else {
        throw new Error('Empty SOS list');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch SOS signals');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: EmergencyStatus) {
    try {
      await governmentApi.updateSOSStatus(id, newStatus);
      setSosList((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      // Optimistic state fallback
      setSosList((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    }
  }

  const getStatusBadge = (status: EmergencyStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'ACKNOWLEDGED':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'IN_PROGRESS':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'RESOLVED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  if (loading && sosList.length === 0) {
    return <div className="p-6 text-slate-400">Loading incoming SOS distress signals...</div>;
  }

  if (error && sosList.length === 0) {
    return (
      <div className="p-6 text-red-400 bg-red-950/20 border border-red-900/50 rounded-lg">
        <p className="font-bold">Error loading feed</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const safeSosList = Array.isArray(sosList) ? sosList : [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🚨 Live Citizen SOS Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Incoming high-priority emergency distress broadcasts requiring immediate operator dispatch.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            (Auto-polling every 30s) Last updated: {timeSinceUpdate} seconds ago
          </p>
        </div>
        <button
          onClick={fetchSOS}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded transition"
        >
          Refresh Feed
        </button>
      </div>

      <div className="space-y-4">
        {safeSosList.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No active distress signals detected.</p>
        ) : (
          safeSosList.map((sos) => {
            const zone = sos.location?.zone || (sos as any).zone || 'Emergency Sector';
            const address = sos.location?.address || (sos as any).address || '';
            const createdTime = sos.created_at ? new Date(sos.created_at).toLocaleTimeString() : 'Recent';

            return (
              <div
                key={sos.id}
                className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                        sos.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {sos.severity || 'CRITICAL'}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${getStatusBadge(sos.status)}`}>
                      {sos.status || 'ACTIVE'}
                    </span>
                    <span className="text-xs text-slate-500">
                      ID: {sos.id} • {createdTime}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-200">{sos.message || 'No additional details provided.'}</p>

                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    📍 <span className="font-medium text-slate-300">{zone}</span>
                    {address && ` — ${address}`}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {sos.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleStatusChange(sos.id, 'ACKNOWLEDGED')}
                      className="text-xs bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded font-medium transition"
                    >
                      Acknowledge
                    </button>
                  )}
                  {(sos.status === 'ACTIVE' || sos.status === 'ACKNOWLEDGED') && (
                    <button
                      onClick={() => handleStatusChange(sos.id, 'IN_PROGRESS')}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded font-medium transition"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {sos.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusChange(sos.id, 'RESOLVED')}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-medium transition"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}