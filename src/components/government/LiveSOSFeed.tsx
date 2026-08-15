import React, { useEffect, useState } from 'react';
import { SOSPayload, EmergencyStatus } from '../../types/api';
import { governmentApi } from '../../api/government';
import { MapPin, Phone, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function LiveSOSFeed() {
  const [sosList, setSosList] = useState<SOSPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<number>(0);

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 5000);
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
        setSosList([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch SOS signals');
      setSosList([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: EmergencyStatus) {
    try {
      await governmentApi.updateSOSStatus(id, newStatus);
      setSosList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch (err) {
      setSosList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    }
  }

  const getStatusBadge = (status?: string) => {
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
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const safeSosList = Array.isArray(sosList) ? sosList : [];
  const activeCount = safeSosList.filter(s => s.status !== 'RESOLVED' && s.status !== 'CANCELLED').length;

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Live Citizen SOS Distress Feed</span>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.2 rounded-full font-mono font-bold">
              {activeCount} ACTIVE SIGNALS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Incoming high-priority emergency distress broadcasts requiring immediate operator dispatch.
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Auto-polling live stream • Last checked {timeSinceUpdate}s ago
          </p>
        </div>

        <button
          onClick={fetchSOS}
          className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer self-start md:self-auto"
          title="Refresh SOS Signals"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {safeSosList.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
          ✓ No active SOS distress signals reported. All sectors normal.
        </div>
      ) : (
        <div className="space-y-3">
          {safeSosList.map((sos) => (
            <div
              key={sos.id}
              className="bg-[#07111E] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white font-mono">{sos.id || sos.message_id}</span>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                    {sos.severity || 'CRITICAL'}
                  </span>
                  <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getStatusBadge(sos.status)}`}>
                    {sos.status}
                  </span>
                </div>

                <span className="text-[10px] text-slate-500 font-mono">
                  {sos.created_at ? new Date(sos.created_at).toLocaleString() : 'Live'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">{sos.message || 'Distress signal received'}</h4>
                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>GPS: {sos.latitude?.toFixed(4)}, {sos.longitude?.toFixed(4)}</span>
                </p>
                {(sos.user_name || sos.user_phone) && (
                  <p className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-2">
                    <span>Citizen: {sos.user_name || 'Citizen'}</span>
                    {sos.user_phone && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Phone className="w-3 h-3" /> {sos.user_phone}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 text-[11px]">Triage Dispatch:</span>
                  <button
                    onClick={() => handleStatusChange(sos.id, 'ACKNOWLEDGED')}
                    className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg font-bold cursor-pointer"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleStatusChange(sos.id, 'IN_PROGRESS')}
                    className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded-lg font-bold cursor-pointer"
                  >
                    Dispatch Team
                  </button>
                  <button
                    onClick={() => handleStatusChange(sos.id, 'RESOLVED')}
                    className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg font-bold cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}