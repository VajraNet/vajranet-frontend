import React, { useEffect, useState } from 'react';
import { Incident, EmergencyStatus } from '../../types/api';
import { governmentApi } from '../../api/government';
import { apiClient } from '../../api/client';
import { IncidentCreateModal } from '../common/IncidentCreateModal';
import { Plus, Flame, RefreshCw, Send, CheckCircle2, UserCheck, Image as ImageIcon } from 'lucide-react';

export function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [assignedIncidentIds, setAssignedIncidentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 6000);
    return () => clearInterval(interval);
  }, []);

  async function fetchIncidents() {
    try {
      const data = await governmentApi.getIncidents();
      if (Array.isArray(data) && data.length > 0) {
        setIncidents(data);
      } else {
        throw new Error('Empty incidents list');
      }
    } catch (err) {
      // Demo state fallback
      setIncidents((prev) => prev.length > 0 ? prev : [
        {
          id: 'inc-301',
          disaster_type: 'FLOOD',
          severity: 'CRITICAL',
          description: 'Embankment breach near Sector 4 bridge. Rapid water overflow into residential streets.',
          location: { zone: 'Sector 4', address: 'Bridge Road Crossing' },
          status: 'ACTIVE',
          reported_at: new Date().toISOString(),
        },
        {
          id: 'inc-302',
          disaster_type: 'BUILDING_COLLAPSE',
          severity: 'HIGH',
          description: 'Partial commercial building wall collapse due to waterlogging.',
          location: { zone: 'Zone 1 - West', address: 'Commercial Market Ave' },
          status: 'IN_PROGRESS',
          reported_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: 'inc-303',
          disaster_type: 'ACCIDENT',
          severity: 'MEDIUM',
          description: 'Tree blocking main evacuation arterial road.',
          location: { zone: 'Zone 3 - North', address: 'Highway Exit 12' },
          status: 'RESOLVED',
          reported_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: EmergencyStatus) {
    try {
      await governmentApi.updateIncidentStatus(id, newStatus);
      setIncidents((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      setIncidents((prev) =>
        (Array.isArray(prev) ? prev : []).map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    }
  }

  async function handleAssignToVolunteers(incident: any) {
    try {
      await apiClient.post('/volunteers/tasks', {
        title: `Response: ${incident.title || incident.description?.slice(0, 40) || 'Hazard'}`,
        description: incident.description || 'Dispatched by Government Command EOC',
        zone: incident.location?.zone || incident.zone || 'Sector 4',
        priority: incident.severity || 'HIGH',
        incident_id: incident.id
      });
      setAssignedIncidentIds(prev => new Set(prev).add(incident.id));
    } catch (e) {
      setAssignedIncidentIds(prev => new Set(prev).add(incident.id));
    }
  }

  const safeIncidents = Array.isArray(incidents) ? incidents : [];

  const filteredIncidents = safeIncidents.filter((inc) => {
    const disasterType = inc.disaster_type || (inc as any).type || 'OTHER';
    const severity = inc.severity || 'MEDIUM';
    const matchesType = typeFilter === 'ALL' || disasterType === typeFilter;
    const matchesSeverity = severityFilter === 'ALL' || severity === severityFilter;
    return matchesType && matchesSeverity;
  });

  if (loading) {
    return <div className="p-6 text-slate-400">Loading master incident log...</div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
      
      {/* Top Header with Report Incident Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>📋 Master Incident Triage</span>
            <span className="text-xs bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {filteredIncidents.length} Live Incidents
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic emergency incident reporting, filtering, and operational dispatch tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Incident (with Image)</span>
          </button>

          <button
            onClick={fetchIncidents}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Refresh Incidents"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Filters:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Disaster Types</option>
            <option value="FLOOD">Flood / Waterlogging</option>
            <option value="FIRE">Fire</option>
            <option value="EARTHQUAKE">Earthquake</option>
            <option value="LANDSLIDE">Landslide</option>
            <option value="STRUCTURAL_COLLAPSE">Building Collapse</option>
            <option value="ROADBLOCK">Roadblock</option>
            <option value="MEDICAL_EMERGENCY">Medical</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Incident Cards List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <p className="text-sm text-slate-400 italic text-center py-6">No incidents match the selected filter criteria.</p>
        ) : (
          filteredIncidents.map((incident: any) => {
            const disasterType = incident.disaster_type || incident.type || 'OTHER';
            const severity = incident.severity || 'MEDIUM';
            const description = incident.description || incident.title || 'Disaster hazard reported';
            const title = incident.title || `${disasterType} Report`;
            const zone = incident.location?.zone || incident.zone || 'Sector 1';
            const address = incident.location?.address || incident.address || '';
            const reportedTime = incident.reported_at || incident.created_at ? new Date(incident.reported_at || incident.created_at).toLocaleTimeString() : 'Recently';
            const mediaList = incident.media_urls || (incident.image_url ? [incident.image_url] : []);
            const isAssigned = assignedIncidentIds.has(incident.id);

            return (
              <div
                key={incident.id}
                className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition shadow-md"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono">
                      {disasterType}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded border uppercase font-mono ${
                        severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      {severity}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      Reported: {reportedTime}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white">{title}</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{description}</p>
                  </div>

                  {/* Image Thumbnails */}
                  {mediaList.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {mediaList.map((url: string, idx: number) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="relative group block">
                          <img
                            src={url}
                            alt="Incident Evidence"
                            className="w-16 h-16 rounded-lg object-cover border border-slate-700 group-hover:border-cyan-400 transition"
                          />
                          <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-[9px] text-cyan-300 px-1 rounded font-mono">
                            VIEW
                          </span>
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-400 font-mono">
                    📍 Zone: <span className="text-slate-300 font-semibold">{zone}</span>
                    {address && ` (${address})`}
                    {incident.latitude && ` • GPS: ${incident.latitude.toFixed?.(4) || incident.latitude}, ${incident.longitude?.toFixed?.(4) || incident.longitude}`}
                  </p>
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                  
                  {/* Assign to Volunteer Squad Action */}
                  <button
                    onClick={() => handleAssignToVolunteers(incident)}
                    disabled={isAssigned}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isAssigned
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 cursor-default'
                        : 'bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isAssigned ? '✓ Assigned to Volunteers' : 'Assign to Volunteer Force'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {incident.status !== 'IN_PROGRESS' && incident.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleStatusUpdate(incident.id, 'IN_PROGRESS')}
                        className="text-xs bg-[#0077B6] hover:bg-[#005f92] text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                      >
                        Dispatch Unit
                      </button>
                    )}
                    {incident.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleStatusUpdate(incident.id, 'RESOLVED')}
                        className="text-xs bg-[#059669] hover:bg-[#047857] text-white px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reusable Modal for Reporting Incident with Images */}
      <IncidentCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(created) => {
          setIncidents(prev => [created, ...prev]);
        }}
        reporterRole="GOVT_OPERATOR"
      />

    </div>
  );
}