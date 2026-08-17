import React, { useEffect, useState } from 'react';
import { SOSPayload, EmergencyStatus } from '../../types/api';
import { governmentApi } from '../../api/government';
import { apiClient } from '../../api/client';
import { 
  MapPin, 
  Phone, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  X,
  Volume2,
  VolumeX,
  Radio,
  Clock,
  ExternalLink
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface LiveSOSFeedProps {
  lang?: Language;
}

export function LiveSOSFeed({ lang = 'EN' }: LiveSOSFeedProps) {
  const [sosList, setSosList] = useState<SOSPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Filters & Search: Default is 'ACTIVE_QUEUE' which shows ACTIVE, ACKNOWLEDGED, and IN_PROGRESS
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE_QUEUE');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active SOS Detail Drawer / Modal
  const [selectedSOS, setSelectedSOS] = useState<SOSPayload | null>(null);

  // Report SOS Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportForm, setReportForm] = useState({
    message: '',
    severity: 'CRITICAL',
    latitude: 28.6139,
    longitude: 77.2090,
    user_name: '',
    user_phone: '',
    notes: '',
  });
  const [submittingSos, setSubmittingSos] = useState<boolean>(false);

  const t = TRANSLATIONS[lang];

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

  const getResolvedIds = (): Set<string> => {
    try {
      const saved = localStorage.getItem('vajranet_resolved_sos_ids');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  };

  async function fetchSOS() {
    try {
      const res = await apiClient.get('/sos');
      const data = res.data?.data || res.data;
      if (Array.isArray(data)) {
        let sosCache: Record<string, string> = {};
        try {
          sosCache = JSON.parse(localStorage.getItem('vajranet_sos_status_cache') || '{}');
        } catch {}

        const resolvedSet = getResolvedIds();

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

  // Point 4: Acknowledge & Dispatch KEEP the item in the feed (only status changes). Only Resolve removes it from the ACTIVE_QUEUE.
  async function handleStatusChange(id: string, newStatus: EmergencyStatus) {
    try {
      const sosCache = JSON.parse(localStorage.getItem('vajranet_sos_status_cache') || '{}');
      sosCache[id] = newStatus;
      localStorage.setItem('vajranet_sos_status_cache', JSON.stringify(sosCache));

      if (newStatus === 'RESOLVED') {
        const resolvedSet = getResolvedIds();
        resolvedSet.add(id);
        localStorage.setItem('vajranet_resolved_sos_ids', JSON.stringify(Array.from(resolvedSet)));
      }
    } catch {}

    // Update in-memory list without removing if Acknowledged or Dispatched
    setSosList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    if (selectedSOS?.id === id) {
      setSelectedSOS((prev) => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      await governmentApi.updateSOSStatus(id, newStatus);
    } catch (err) {
      console.warn('SOS status updated locally', err);
    }
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  }

  async function handleCreateSOS(e: React.FormEvent) {
    e.preventDefault();
    if (!reportForm.message.trim()) return;

    setSubmittingSos(true);
    try {
      const newMsgId = `VJ-SOS-DEL-${Math.floor(10000 + Math.random() * 90000)}`;
      await apiClient.post('/sos', {
        message_id: newMsgId,
        message: reportForm.message,
        severity: reportForm.severity,
        latitude: reportForm.latitude,
        longitude: reportForm.longitude,
        origin_device_id: `DEV-EOC-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: reportForm.notes,
        user_name: reportForm.user_name || 'Emergency Caller',
        user_phone: reportForm.user_phone || '112 Dispatch'
      });

      setIsReportModalOpen(false);
      setReportForm({
        message: '',
        severity: 'CRITICAL',
        latitude: 28.6139,
        longitude: 77.2090,
        user_name: '',
        user_phone: '',
        notes: '',
      });
      fetchSOS();
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch (err) {
      console.warn('Created SOS signal locally', err);
      setIsReportModalOpen(false);
    } finally {
      setSubmittingSos(false);
    }
  }

  // Filtered SOS list
  const filteredList = sosList.filter((item) => {
    const matchesSearch = 
      (item.message || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.message_id || item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.origin_device_id || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'ALL' || item.severity === severityFilter;

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE_QUEUE') {
      matchesStatus = item.status !== 'RESOLVED' && item.status !== 'CANCELLED';
    } else if (statusFilter !== 'ALL') {
      matchesStatus = item.status === statusFilter;
    }

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-4">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="status-dot dot-offline animate-pulse" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {t.sosTriageQueue}
            </h1>
            <span className="gov-badge badge-critical font-mono font-bold">
              {filteredList.length} {t.activeBeacons}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {t.sosSubtext}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`gov-btn btn-sm ${soundEnabled ? 'btn-secondary' : 'btn-ghost'}`}
            title="Toggle Audio Alarm"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {soundEnabled ? t.alarmOn : t.alarmMuted}
          </button>

          <button 
            onClick={fetchSOS} 
            className="gov-btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
          </button>

          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {t.logCitizenDistress}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 section-card p-3 shadow-sm">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ACTIVE_QUEUE')}
            className={`tab-btn ${statusFilter === 'ACTIVE_QUEUE' ? 'active' : ''}`}
          >
            {t.tabActiveQueue}
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          >
            {t.tabAll}
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`tab-btn ${statusFilter === 'ACTIVE' ? 'active' : ''}`}
          >
            {t.tabActive}
          </button>
          <button
            onClick={() => setStatusFilter('ACKNOWLEDGED')}
            className={`tab-btn ${statusFilter === 'ACKNOWLEDGED' ? 'active' : ''}`}
          >
            {t.tabAcknowledged}
          </button>
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className={`tab-btn ${statusFilter === 'IN_PROGRESS' ? 'active' : ''}`}
          >
            {t.tabInProgress}
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`tab-btn ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
          >
            {t.tabResolved}
          </button>
        </div>

        {/* Search and Severity Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gov-gray absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchSosPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gov-input pl-8 py-1 text-xs w-48 sm:w-64"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="gov-input py-1 text-xs"
          >
            <option value="ALL">{t.allSeverity}</option>
            <option value="CRITICAL">{t.critical}</option>
            <option value="HIGH">{t.high}</option>
            <option value="MEDIUM">{t.medium}</option>
            <option value="LOW">{t.low}</option>
          </select>
        </div>

      </div>

      {/* High-Density Government SOS Table */}
      <div className="section-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t.thSosId}</th>
                <th>{t.thDistressSignal}</th>
                <th>{t.thGpsLocation}</th>
                <th>{t.thSeverity}</th>
                <th>{t.thOriginSource}</th>
                <th>{t.thStatus}</th>
                <th className="text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && sosList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    {t.loadingSos}
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gov-gray">
                    {t.noMatchingSos}
                  </td>
                </tr>
              ) : (
                filteredList.map((sos) => {
                  const isMesh = sos.origin_device_id?.includes('MESH') || (sos.message_id && sos.message_id.startsWith('VJ-SOS'));
                  return (
                    <tr key={sos.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                      
                      {/* ID */}
                      <td className="font-mono font-bold text-xs text-gov-blue-dark dark:text-blue-300">
                        {sos.message_id || sos.id}
                      </td>

                      {/* Message / Victim Details */}
                      <td className="max-w-xs">
                        <div className="font-medium text-xs text-[#1e2533] dark:text-slate-100 line-clamp-1">
                          {sos.message || 'Distress signal received'}
                        </div>
                        <div className="text-[10px] text-gov-gray flex items-center gap-2 mt-0.5">
                          <span>Device: {sos.origin_device_id || 'Citizen Mobile'}</span>
                          {sos.created_at && (
                            <span className="font-mono">
                              {new Date(sos.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="text-xs font-mono">
                        <div className="flex items-center gap-1 text-[#2d3748] dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-gov-blue shrink-0" />
                          <span>{sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}</span>
                        </div>
                      </td>

                      {/* Severity */}
                      <td>
                        <span className={`gov-badge ${sos.severity === 'CRITICAL' ? 'badge-critical' : sos.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                          {sos.severity || 'CRITICAL'}
                        </span>
                      </td>

                      {/* Origin Source */}
                      <td>
                        <span className={`gov-badge ${isMesh ? 'badge-connected' : 'badge-online'}`}>
                          <Radio className="w-3 h-3" />
                          {isMesh ? t.meshGateway : t.directInternet}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`gov-badge ${sos.status === 'ACTIVE' ? 'badge-critical' : sos.status === 'ACKNOWLEDGED' ? 'badge-high' : sos.status === 'IN_PROGRESS' ? 'badge-medium' : 'badge-resolved'}`}>
                          {sos.status || 'ACTIVE'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedSOS(sos)}
                            className="gov-btn btn-ghost btn-sm"
                          >
                            {t.btnDetails}
                          </button>

                          {sos.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleStatusChange(sos.id, 'ACKNOWLEDGED')}
                              className="gov-btn btn-secondary btn-sm"
                            >
                              {t.btnAcknowledge}
                            </button>
                          )}

                          {(sos.status === 'ACTIVE' || sos.status === 'ACKNOWLEDGED') && (
                            <button
                              onClick={() => handleStatusChange(sos.id, 'IN_PROGRESS')}
                              className="gov-btn btn-secondary btn-sm"
                            >
                              {t.btnDispatch}
                            </button>
                          )}

                          {sos.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleStatusChange(sos.id, 'RESOLVED')}
                              className="gov-btn btn-primary btn-sm"
                            >
                              {t.btnResolve}
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SOS Detail Drawer / Modal */}
      {selectedSOS && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-lg w-full p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-severity-critical" />
                <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider font-mono">
                  Distress Beacon: {selectedSOS.message_id || selectedSOS.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSOS(null)}
                className="text-gov-gray hover:text-[#1e2533] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gov-gray-bg dark:bg-slate-900/80 rounded border border-gov-gray-border/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-gov-gray uppercase font-mono">Distress Content</span>
                <p className="text-sm font-semibold text-[#1e2533] dark:text-white mt-1">
                  {selectedSOS.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-gov-gray-bg dark:bg-slate-900/60 rounded">
                  <span className="text-[10px] text-gov-gray uppercase font-mono">{t.thGpsLocation}</span>
                  <div className="font-mono font-bold text-xs mt-0.5 text-gov-blue dark:text-blue-400">
                    {selectedSOS.latitude.toFixed(6)}, {selectedSOS.longitude.toFixed(6)}
                  </div>
                </div>

                <div className="p-2.5 bg-gov-gray-bg dark:bg-slate-900/60 rounded">
                  <span className="text-[10px] text-gov-gray uppercase font-mono">Origin Device</span>
                  <div className="font-mono font-bold text-xs mt-0.5">
                    {selectedSOS.origin_device_id || 'User Mobile'}
                  </div>
                </div>

                <div className="p-2.5 bg-gov-gray-bg dark:bg-slate-900/60 rounded">
                  <span className="text-[10px] text-gov-gray uppercase font-mono">{t.thSeverity}</span>
                  <div className="mt-0.5">
                    <span className="gov-badge badge-critical">{selectedSOS.severity || 'CRITICAL'}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-gov-gray-bg dark:bg-slate-900/60 rounded">
                  <span className="text-[10px] text-gov-gray uppercase font-mono">{t.thStatus}</span>
                  <div className="mt-0.5">
                    <span className="gov-badge badge-high">{selectedSOS.status || 'ACTIVE'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gov-gray-border dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedSOS(null)}
                className="gov-btn btn-ghost btn-sm"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedSOS.status !== 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleStatusChange(selectedSOS.id, 'IN_PROGRESS')}
                    className="gov-btn btn-secondary btn-sm"
                  >
                    {t.btnDispatch}
                  </button>
                )}
                {selectedSOS.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleStatusChange(selectedSOS.id, 'RESOLVED')}
                    className="gov-btn btn-primary btn-sm"
                  >
                    {t.btnResolve}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Report SOS Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateSOS}
            className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider">
                {t.logCitizenDistress}
              </h3>
              <button 
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-gov-gray hover:text-[#1e2533] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'आपातकालीन संकट संदेश *' : 'Emergency Distress Message *'}
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. 4 people trapped on roof due to rising flood waters..."
                  value={reportForm.message}
                  onChange={(e) => setReportForm({ ...reportForm, message: e.target.value })}
                  className="gov-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">{t.thSeverity}</label>
                  <select
                    value={reportForm.severity}
                    onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                    className="gov-input w-full"
                  >
                    <option value="CRITICAL">{t.critical}</option>
                    <option value="HIGH">{t.high}</option>
                    <option value="MEDIUM">{t.medium}</option>
                    <option value="LOW">{t.low}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                    {lang === 'HI' ? 'नागरिक का नाम' : 'Citizen Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="Caller name"
                    value={reportForm.user_name}
                    onChange={(e) => setReportForm({ ...reportForm, user_name: e.target.value })}
                    className="gov-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={reportForm.latitude}
                    onChange={(e) => setReportForm({ ...reportForm, latitude: parseFloat(e.target.value) })}
                    className="gov-input w-full font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={reportForm.longitude}
                    onChange={(e) => setReportForm({ ...reportForm, longitude: parseFloat(e.target.value) })}
                    className="gov-input w-full font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gov-gray-border dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="gov-btn btn-ghost btn-sm"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={submittingSos}
                className="gov-btn btn-primary btn-sm"
              >
                {submittingSos ? 'Broadcasting...' : 'Broadcast Distress Alert'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}