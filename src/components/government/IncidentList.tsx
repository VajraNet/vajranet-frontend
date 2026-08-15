import React, { useEffect, useState } from 'react';
import { Incident, EmergencyStatus } from '../../types/api';
import { governmentApi } from '../../api/government';
import { apiClient } from '../../api/client';
import { IncidentCreateModal } from '../common/IncidentCreateModal';
import { Plus, Flame, RefreshCw, CheckCircle2, UserCheck, MapPin } from 'lucide-react';

export function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [assignedIncidentIds, setAssignedIncidentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchIncidents() {
    try {
      const data = await governmentApi.getIncidents();
      if (Array.isArray(data)) {
        setIncidents(data);
      } else {
        setIncidents([]);
      }
    } catch (err) {
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: EmergencyStatus) {
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

  async function handleAssignVolunteers(incidentId: string) {
    try {
      const inc = incidents.find((i) => i.id === incidentId);
      await apiClient.post('/volunteers/tasks', {
        title: `Priority Dispatch: ${inc?.title || inc?.description?.slice(0, 30)}`,
        description: inc?.description || 'Government EOC Priority Task',
        zone: inc?.location?.zone || inc?.zone || 'Zone 1',
        incident_id: incidentId,
        priority: inc?.severity || 'HIGH',
      });
      setAssignedIncidentIds((prev) => new Set(prev).add(incidentId));
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch {
      setAssignedIncidentIds((prev) => new Set(prev).add(incidentId));
    }
  }

  const filteredIncidents = incidents.filter((inc) => {
    const disasterType = inc.disaster_type || inc.type || 'OTHER';
    if (typeFilter !== 'ALL' && disasterType !== typeFilter) return false;
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-400 border-red-800';
      case 'HIGH':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'MEDIUM':
        return 'bg-cyan-950 text-cyan-400 border-cyan-800';
      default:
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'REPORTED':
      case 'PENDING':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'IN_PROGRESS':
        return 'bg-blue-950 text-blue-400 border-blue-800';
      case 'RESOLVED':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Disaster Hazards & Verified Incidents</span>
            <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.2 rounded-full font-mono font-bold">
              {filteredIncidents.length} INCIDENTS
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Ground hazard monitoring, severity escalation, and direct responder task assignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchIncidents}
            className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh Incident Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#07111E] p-3 rounded-xl border border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0F1E36] border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="FLOOD">Flood</option>
            <option value="FIRE">Fire</option>
            <option value="LANDSLIDE">Landslide</option>
            <option value="BUILDING_COLLAPSE">Building Collapse</option>
            <option value="MEDICAL">Medical Emergency</option>
            <option value="OTHER">Other Hazards</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0F1E36] border border-slate-700 rounded-lg px-2.5 py-1 text-white focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Incident Cards */}
      {filteredIncidents.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
          No matching disaster incidents found in database.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIncidents.map((inc) => {
            const disasterType = inc.disaster_type || inc.type || 'HAZARD';
            const isAssigned = assignedIncidentIds.has(inc.id);

            return (
              <div
                key={inc.id}
                className="bg-[#07111E] border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white font-mono">{inc.id}</span>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {disasterType}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getStatusBadge(inc.status)}`}>
                      {inc.status}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono">
                    {inc.created_at || inc.reported_at ? new Date(inc.created_at || inc.reported_at!).toLocaleString() : 'Live'}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{inc.title || inc.description}</h4>
                  {inc.title && inc.description && (
                    <p className="text-xs text-slate-300 mt-1">{inc.description}</p>
                  )}
                  <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{inc.address || inc.location?.address || `Lat: ${inc.latitude}, Lon: ${inc.longitude}`}</span>
                  </p>
                </div>

                {/* Media Attachment */}
                {Array.isArray(inc.media_urls) && inc.media_urls.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pt-1">
                    {inc.media_urls.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img src={url} alt="Evidence" className="h-16 w-24 object-cover rounded-lg border border-slate-700" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400 text-[11px]">Update Status:</span>
                    <button
                      onClick={() => handleStatusUpdate(inc.id, 'REPORTED')}
                      className="px-2.5 py-1 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 rounded-lg font-bold cursor-pointer"
                    >
                      Reported
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(inc.id, 'IN_PROGRESS')}
                      className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded-lg font-bold cursor-pointer"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(inc.id, 'RESOLVED')}
                      className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg font-bold cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>

                  <button
                    onClick={() => handleAssignVolunteers(inc.id)}
                    disabled={isAssigned}
                    className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                      isAssigned
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                    }`}
                  >
                    {isAssigned ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Dispatched</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dispatch Responders</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Report Incident Modal */}
      <IncidentCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(created) => {
          setIncidents((prev) => [created, ...prev]);
          window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
        }}
        reporterRole="GOVT_EOC"
      />

    </div>
  );
}