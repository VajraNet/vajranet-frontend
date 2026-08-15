import React, { useEffect, useState } from 'react';
import { SOSPayload, EmergencyStatus } from '../../types/api';
import { governmentApi } from '../../api/government';
import { apiClient } from '../../api/client';
import { MapPin, Phone, RefreshCw, ShieldAlert, CheckCircle2, Plus, Search, Filter, AlertTriangle, X } from 'lucide-react';

export function LiveSOSFeed() {
  const [sosList, setSosList] = useState<SOSPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<number>(0);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Report SOS Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportForm, setReportForm] = useState({
    message: '',
    severity: 'CRITICAL',
    latitude: 26.8467,
    longitude: 80.9462,
    user_name: '',
    user_phone: '',
    notes: '',
  });
  const [submittingSos, setSubmittingSos] = useState<boolean>(false);

  useEffect(() => {
    fetchSOS();
    const interval = setInterval(fetchSOS, 3000);

    const handleUpdate = () => {
      fetchSOS();
    };

    window.addEventListener('vajranet_data_updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('vajranet_data_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSinceUpdate(Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  async function fetchSOS() {
    try {
      const res = await apiClient.get('/sos');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        let sosCache: Record<string, string> = {};
        try {
          sosCache = JSON.parse(localStorage.getItem('vajranet_sos_status_cache') || '{}');
        } catch {}
        const merged = data.map((item: any) => ({
          ...item,
          status: sosCache[item.id] || item.status || 'ACTIVE'
        }));
        setSosList(merged);
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
      const sosCache = JSON.parse(localStorage.getItem('vajranet_sos_status_cache') || '{}');
      sosCache[id] = newStatus;
      localStorage.setItem('vajranet_sos_status_cache', JSON.stringify(sosCache));
    } catch {}

    setSosList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));

    try {
      await Promise.any([
        apiClient.patch(`/government/sos/${id}`, { status: newStatus }),
        apiClient.patch(`/sos/${id}`, { status: newStatus })
      ]);
    } catch (err) {
      console.warn('SOS status triage synced locally', err);
    }
  }

  async function handleCreateSOS(e: React.FormEvent) {
    e.preventDefault();
    if (!reportForm.message.trim()) return;

    setSubmittingSos(true);
    try {
      const payload = {
        message: reportForm.message.trim(),
        severity: reportForm.severity,
        latitude: Number(reportForm.latitude) || 26.8467,
        longitude: Number(reportForm.longitude) || 80.9462,
        user_name: reportForm.user_name.trim() || 'Citizen Distress Call',
        user_phone: reportForm.user_phone.trim() || '+91 98765 00000',
        origin_device_id: 'WEB-EOC-DIRECT'
      };

      await apiClient.post('/sos', payload);
      setIsReportModalOpen(false);
      setReportForm({
        message: '',
        severity: 'CRITICAL',
        latitude: 26.8467,
        longitude: 80.9462,
        user_name: '',
        user_phone: '',
        notes: '',
      });
      fetchSOS();
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch (err) {
      console.warn('Failed to submit direct SOS', err);
    } finally {
      setSubmittingSos(false);
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
  const totalCount = safeSosList.length;
  const activeCount = safeSosList.filter(s => s.status !== 'RESOLVED' && s.status !== 'CANCELLED').length;

  const filteredList = safeSosList.filter(sos => {
    if (statusFilter === 'ACTIVE') {
      if (sos.status === 'RESOLVED' || sos.status === 'CANCELLED') return false;
    } else if (statusFilter !== 'ALL') {
      if (sos.status !== statusFilter) return false;
    }

    if (severityFilter !== 'ALL' && (sos.severity || 'CRITICAL') !== severityFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchMsg = (sos.message || '').toLowerCase().includes(q);
      const matchId = (sos.id || sos.message_id || '').toLowerCase().includes(q);
      const matchUser = (sos.user_name || '').toLowerCase().includes(q);
      const matchPhone = (sos.user_phone || '').toLowerCase().includes(q);
      if (!matchMsg && !matchId && !matchUser && !matchPhone) return false;
    }

    return true;
  });

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Live Citizen SOS Distress Feed</span>
            <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {activeCount} ACTIVE / {totalCount} TOTAL SIGNALS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            High-priority emergency distress broadcasts requiring immediate operator triage and tactical response.
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Auto-polling live database stream • Last checked {timeSinceUpdate}s ago
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={fetchSOS}
            className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh SOS Signals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Report / Trigger SOS</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#07111E] p-3 rounded-xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search distress beacon, ID, citizen..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0F1E36] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition cursor-pointer shrink-0 border ${
                statusFilter === st
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-[#0F1E36] text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {st} {st === 'ALL' ? `(${totalCount})` : st === 'ACTIVE' ? `(${activeCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* SOS Distress Cards */}
      {filteredList.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
          ✓ No SOS distress signals matching current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map((sos) => (
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
                  <span>GPS: {Number(sos.latitude || 0).toFixed(5)}, {Number(sos.longitude || 0).toFixed(5)}</span>
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
                    onClick={() => handleStatusChange(sos.id, 'ACTIVE')}
                    className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg font-bold cursor-pointer"
                  >
                    Active
                  </button>
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

                <a
                  href={`https://maps.google.com/?q=${sos.latitude},${sos.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#0F1E36] hover:bg-slate-800 text-cyan-300 border border-cyan-800/60 rounded-lg font-bold flex items-center gap-1 transition"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Google Map</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report SOS Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>Trigger Emergency SOS Distress Beacon</span>
              </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSOS} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Distress Situation / Description *</label>
                <textarea
                  required
                  rows={3}
                  value={reportForm.message}
                  onChange={(e) => setReportForm({ ...reportForm, message: e.target.value })}
                  placeholder="e.g. Flash flood trapped 4 people on rooftop without drinking water..."
                  className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Urgency Level</label>
                  <select
                    value={reportForm.severity}
                    onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                    className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="CRITICAL">🔴 CRITICAL (Life Threatening)</option>
                    <option value="HIGH">🟠 HIGH (Immediate Danger)</option>
                    <option value="MEDIUM">🟡 MEDIUM (Urgent Need)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Citizen Name</label>
                  <input
                    type="text"
                    value={reportForm.user_name}
                    onChange={(e) => setReportForm({ ...reportForm, user_name: e.target.value })}
                    placeholder="Citizen Name"
                    className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={reportForm.latitude}
                    onChange={(e) => setReportForm({ ...reportForm, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={reportForm.longitude}
                    onChange={(e) => setReportForm({ ...reportForm, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    value={reportForm.user_phone}
                    onChange={(e) => setReportForm({ ...reportForm, user_phone: e.target.value })}
                    placeholder="+91 98765 00000"
                    className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSos}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{submittingSos ? 'Broadcasting SOS...' : 'Broadcast Distress Beacon'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}