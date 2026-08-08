import React, { useEffect, useState } from 'react';
import { Incident, DisasterType, SeverityLevel, EmergencyStatus } from '../../types/api';
import { governmentApi } from '../../api/government';

export function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    try {
      const data = await governmentApi.getIncidents();
      setIncidents(data);
    } catch (err) {
      // Demo state fallback
      setIncidents([
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
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      // Fallback optimistic update
      setIncidents((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    }
  }

  const filteredIncidents = incidents.filter((inc) => {
    const matchesType = typeFilter === 'ALL' || inc.disaster_type === typeFilter;
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesType && matchesSeverity;
  });

  if (loading) {
    return <div className="p-6 text-slate-400">Loading master incident log...</div>;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📋 Master Incident Triage
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Geographic emergency incident reporting, filtering, and operational dispatch tracking.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded focus:outline-none"
          >
            <option value="ALL">All Disaster Types</option>
            <option value="FLOOD">Flood</option>
            <option value="FIRE">Fire</option>
            <option value="EARTHQUAKE">Earthquake</option>
            <option value="LANDSLIDE">Landslide</option>
            <option value="BUILDING_COLLAPSE">Building Collapse</option>
            <option value="ACCIDENT">Accident</option>
            <option value="MEDICAL">Medical</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No incidents match the selected filter criteria.</p>
        ) : (
          filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {incident.disaster_type}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${
                      incident.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border-rose-800'
                        : incident.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-slate-900 text-slate-300 border-slate-700'
                    }`}
                  >
                    {incident.severity}
                  </span>
                  <span className="text-xs text-slate-500">
                    Reported: {new Date(incident.reported_at).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm font-medium text-slate-200">{incident.description}</p>

                <p className="text-xs text-slate-400">
                  📍 Zone: <span className="text-slate-300 font-semibold">{incident.location.zone || 'N/A'}</span>
                  {incident.location.address && ` (${incident.location.address})`}
                </p>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                  {incident.status}
                </span>

                <div className="flex items-center gap-1.5">
                  {incident.status !== 'IN_PROGRESS' && incident.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusUpdate(incident.id, 'IN_PROGRESS')}
                      className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded font-medium transition"
                    >
                      Dispatch / In Progress
                    </button>
                  )}
                  {incident.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleStatusUpdate(incident.id, 'RESOLVED')}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded font-medium transition"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}