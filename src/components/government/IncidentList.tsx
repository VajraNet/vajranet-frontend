import React, { useEffect, useState } from 'react';
import { Incident, SeverityLevel, IncidentStatus } from '../../types/api';
import { governmentApi } from '../../api/government';
import { 
  Flame, 
  MapPin, 
  Plus, 
  RefreshCw, 
  Search, 
  Filter, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Clock
} from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface IncidentListProps {
  lang?: Language;
}

export function IncidentList({ lang = 'EN' }: IncidentListProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Add Incident Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'FLOOD',
    severity: 'HIGH' as SeverityLevel,
    latitude: 28.6139,
    longitude: 77.2090,
    area: '',
  });

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    setLoading(true);
    try {
      const data = await governmentApi.getIncidents();
      if (Array.isArray(data)) {
        setIncidents(data);
      } else {
        setIncidents([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incidents');
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: IncidentStatus) {
    try {
      await governmentApi.updateIncidentStatus(id, newStatus);
      setIncidents((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch (err) {
      setIncidents((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    }
  }

  async function handleCreateIncident(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        severity: formData.severity,
        latitude: formData.latitude,
        longitude: formData.longitude,
        area: formData.area || 'Central District',
        status: 'VERIFIED',
      };
      const created = await governmentApi.createIncident(payload);
      setIncidents((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setFormData({
        title: '',
        description: '',
        type: 'FLOOD',
        severity: 'HIGH',
        latitude: 28.6139,
        longitude: 77.2090,
        area: '',
      });
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch (err) {
      const fallbackCreated: any = {
        ...formData,
        id: `inc-${Date.now()}`,
        status: 'VERIFIED',
        created_at: new Date().toISOString(),
      };
      setIncidents((prev) => [fallbackCreated, ...prev]);
      setIsAddModalOpen(false);
    }
  }

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      (inc.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.area || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || inc.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-severity-high" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {t.incidentsSitRepTitle}
            </h1>
            <span className="gov-badge badge-high font-mono font-bold">
              {filteredIncidents.length} {lang === 'HI' ? 'सक्रिय घटनाएं' : 'ACTIVE SIT-REPS'}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {t.incidentsSitRepSubtext}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchIncidents} 
            className="gov-btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {t.logDisasterIncident}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 section-card p-3 shadow-sm">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          >
            {t.tabAll}
          </button>
          <button
            onClick={() => setStatusFilter('REPORTED')}
            className={`tab-btn ${statusFilter === 'REPORTED' ? 'active' : ''}`}
          >
            {lang === 'HI' ? 'प्राप्त' : 'REPORTED'}
          </button>
          <button
            onClick={() => setStatusFilter('VERIFIED')}
            className={`tab-btn ${statusFilter === 'VERIFIED' ? 'active' : ''}`}
          >
            {lang === 'HI' ? 'सत्यापित' : 'VERIFIED'}
          </button>
          <button
            onClick={() => setStatusFilter('RESPONDING')}
            className={`tab-btn ${statusFilter === 'RESPONDING' ? 'active' : ''}`}
          >
            {lang === 'HI' ? 'प्रतिक्रिया जारी' : 'RESPONDING'}
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`tab-btn ${statusFilter === 'RESOLVED' ? 'active' : ''}`}
          >
            {t.tabResolved}
          </button>
        </div>

        {/* Search and Type Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gov-gray absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchIncidentPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gov-input pl-8 py-1 text-xs w-48 sm:w-64"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="gov-input py-1 text-xs"
          >
            <option value="ALL">{t.allIncidentTypes}</option>
            <option value="FLOOD">Flood / Inundation</option>
            <option value="FIRE">Fire Hazard</option>
            <option value="EARTHQUAKE">Earthquake / Structural</option>
            <option value="LANDSLIDE">Landslide</option>
            <option value="CYCLONE">Cyclone / Storm</option>
          </select>
        </div>

      </div>

      {/* Incidents Table */}
      <div className="section-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t.thIncidentId}</th>
                <th>{t.thTypeTitle}</th>
                <th>{t.thDescription}</th>
                <th>{t.thIncidentLocation}</th>
                <th>{t.thSeverity}</th>
                <th>{t.thStatus}</th>
                <th className="text-right">{t.thResponseActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    {t.loadingIncidents}
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gov-gray">
                    {t.noMatchingIncidents}
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                    
                    {/* ID */}
                    <td className="font-mono font-bold text-xs text-gov-blue-dark dark:text-blue-300">
                      {inc.id}
                    </td>

                    {/* Type & Title */}
                    <td>
                      <div className="font-bold text-xs text-[#1e2533] dark:text-white">
                        {inc.title}
                      </div>
                      <span className="gov-badge badge-medium text-[10px] mt-0.5 inline-block">
                        {inc.type}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="max-w-xs text-xs text-gov-gray-dark dark:text-slate-300">
                      <p className="line-clamp-2">{inc.description || 'Hazard sit-rep'}</p>
                    </td>

                    {/* Location */}
                    <td className="text-xs font-mono">
                      <div className="flex items-center gap-1 text-[#2d3748] dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-gov-blue shrink-0" />
                        <span>{inc.area || `${inc.latitude.toFixed(3)}, ${inc.longitude.toFixed(3)}`}</span>
                      </div>
                    </td>

                    {/* Severity */}
                    <td>
                      <span className={`gov-badge ${inc.severity === 'CRITICAL' ? 'badge-critical' : inc.severity === 'HIGH' ? 'badge-high' : 'badge-medium'}`}>
                        {inc.severity || 'HIGH'}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`gov-badge ${inc.status === 'VERIFIED' ? 'badge-high' : inc.status === 'RESPONDING' ? 'badge-medium' : inc.status === 'RESOLVED' ? 'badge-resolved' : 'badge-low'}`}>
                        {inc.status || 'REPORTED'}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {inc.status !== 'RESPONDING' && inc.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleStatusUpdate(inc.id, 'RESPONDING')}
                            className="gov-btn btn-secondary btn-sm"
                          >
                            {t.dispatched}
                          </button>
                        )}
                        {inc.status !== 'RESOLVED' && (
                          <button
                            onClick={() => handleStatusUpdate(inc.id, 'RESOLVED')}
                            className="gov-btn btn-primary btn-sm"
                          >
                            {t.btnResolve}
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Incident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateIncident}
            className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider">
                {t.logDisasterIncident}
              </h3>
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-gov-gray hover:text-[#1e2533] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'घटना का शीर्षक *' : 'Incident Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flood Inundation — Sector 4"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="gov-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Hazard Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="gov-input w-full"
                  >
                    <option value="FLOOD">Flood</option>
                    <option value="FIRE">Fire</option>
                    <option value="EARTHQUAKE">Earthquake</option>
                    <option value="LANDSLIDE">Landslide</option>
                    <option value="CYCLONE">Cyclone</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">{t.thSeverity}</label>
                  <select
                    value={formData.severity}
                    onChange={(e: any) => setFormData({ ...formData, severity: e.target.value })}
                    className="gov-input w-full"
                  >
                    <option value="CRITICAL">{t.critical}</option>
                    <option value="HIGH">{t.high}</option>
                    <option value="MEDIUM">{t.medium}</option>
                    <option value="LOW">{t.low}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'लक्षित क्षेत्र / मोहल्ला' : 'Area / Neighborhood'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kalyanpur Riverbank"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="gov-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'विवरण' : 'Field Sit-Rep Description'}
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of water levels, trapped residents, emergency resources needed..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="gov-input w-full"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gov-gray-border dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="gov-btn btn-ghost btn-sm"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="gov-btn btn-primary btn-sm"
              >
                Record Incident
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}