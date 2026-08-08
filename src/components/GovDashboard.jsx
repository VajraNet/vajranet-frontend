import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Users, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Send, 
  Radio, 
  Zap,
  Filter,
  Layers,
  Building,
  Check,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Custom Leaflet Emergency Markers
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 0 15px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

const redIcon = createCustomIcon('#ef4444');
const yellowIcon = createCustomIcon('#f59e0b');
const greenIcon = createCustomIcon('#10b981');

export default function GovDashboard({ incidents, onUpdateIncident, isOnline, shelters, hospitals }) {
  const [selectedIncident, setSelectedIncident] = useState(incidents[0] || null);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  const handleDispatch = (teamName) => {
    if (!selectedIncident) return;
    onUpdateIncident(selectedIncident.id, {
      status: 'DISPATCHED',
      assignedTeam: teamName
    });
    setSelectedIncident({
      ...selectedIncident,
      status: 'DISPATCHED',
      assignedTeam: teamName
    });
    setDispatchSuccess(true);
    setTimeout(() => setDispatchSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Telemetry & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-red-500/20 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Critical SOS Alerts</p>
            <h3 className="text-3xl font-extrabold text-red-400 font-heading mt-1">
              {incidents.filter(i => i.severity === 'CRITICAL').length}
            </h3>
            <p className="text-[11px] text-red-300/80 mt-0.5">High Priority Evac Required</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Mesh Hops Active</p>
            <h3 className="text-3xl font-extrabold text-amber-400 font-heading mt-1">
              {incidents.reduce((acc, curr) => acc + (curr.meshHops || 1), 0)} Hops
            </h3>
            <p className="text-[11px] text-amber-300/80 mt-0.5">Device-to-Device Mesh Relay</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-cyan-500/20 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Open Shelter Capacity</p>
            <h3 className="text-3xl font-extrabold text-cyan-400 font-heading mt-1">
              {shelters.reduce((acc, s) => acc + (s.capacity - s.occupancy), 0)} Beds
            </h3>
            <p className="text-[11px] text-cyan-300/80 mt-0.5">Across {shelters.length} Relief Centers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Gateway Status</p>
            <h3 className={`text-xl font-extrabold font-heading mt-1 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isOnline ? 'GATEWAY ONLINE' : 'P2P MESH ONLY'}
            </h3>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              {isOnline ? 'Direct Cloud Telemetry' : 'Opportunistic Buffer Active'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Map + Incident Stream + Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: GIS Radar Map */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-4 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <h2 className="font-bold text-lg text-white font-heading">
                  Real-Time Disaster Incident Map & Mesh Telemetry
                </h2>
              </div>

              {/* Severity filter */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-mono">Filter:</span>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical Only</option>
                  <option value="HIGH">High Only</option>
                  <option value="MEDIUM">Medium Only</option>
                </select>
              </div>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="h-[450px] w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
              <MapContainer
                center={[19.0760, 72.8777]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Flood Risk Heatmap Circle */}
                <Circle 
                  center={[19.0760, 72.8777]}
                  radius={1200}
                  pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.15 }}
                />

                {/* Incident Pins */}
                {filteredIncidents.map((inc) => (
                  <Marker
                    key={inc.id}
                    position={[inc.lat, inc.lng]}
                    icon={inc.severity === 'CRITICAL' ? redIcon : inc.severity === 'HIGH' ? yellowIcon : greenIcon}
                    eventHandlers={{
                      click: () => setSelectedIncident(inc),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1">
                        <span className="font-bold text-xs text-cyan-400 font-mono">{inc.id}</span>
                        <h4 className="font-bold text-sm text-white">{inc.type}</h4>
                        <p className="text-xs text-slate-300">{inc.locationName}</p>
                        <p className="text-xs text-red-400 font-bold">Victims: {inc.victimCount}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Incident Data Table */}
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <h3 className="font-bold text-base text-white font-heading flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Incoming Mesh SOS Stream ({filteredIncidents.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Emergency Type</th>
                    <th className="p-2.5">Severity</th>
                    <th className="p-2.5">Victims</th>
                    <th className="p-2.5">Mesh Hops</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredIncidents.map((inc) => (
                    <tr 
                      key={inc.id} 
                      onClick={() => setSelectedIncident(inc)}
                      className={`cursor-pointer transition-colors hover:bg-slate-800/50 ${
                        selectedIncident?.id === inc.id ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <td className="p-2.5 font-mono font-semibold text-cyan-400">{inc.id}</td>
                      <td className="p-2.5 font-medium text-white">{inc.type}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inc.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          inc.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {inc.severity}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-red-300">{inc.victimCount}</td>
                      <td className="p-2.5 font-mono text-slate-400">{inc.meshHops || 1} hops</td>
                      <td className="p-2.5 font-mono text-xs">
                        <span className={inc.status === 'DISPATCHED' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right">
                        <button className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[11px] font-semibold">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Dispatch & Incident Inspector Panel */}
        <div className="space-y-4">
          {selectedIncident ? (
            <div className="glass-panel p-5 rounded-2xl space-y-4 border border-cyan-500/30">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedIncident.id}
                  </span>
                  <h3 className="text-xl font-bold text-white font-heading mt-1">
                    {selectedIncident.type}
                  </h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                  selectedIncident.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {selectedIncident.severity}
                </span>
              </div>

              {/* Location & Mesh Details */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">{selectedIncident.locationName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Victim Count:</span>
                  <span className="text-red-400 font-bold">{selectedIncident.victimCount} People</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mesh Origin:</span>
                  <span className="text-cyan-400">{selectedIncident.relayedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Force:</span>
                  <span className="text-emerald-400 font-bold">{selectedIncident.assignedTeam}</span>
                </div>
              </div>

              {/* Incident Notes */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Field Situation Notes</label>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  {selectedIncident.notes}
                </div>
              </div>

              {/* Needs Pills */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Requested Resources</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedIncident.needs?.map((need, idx) => (
                    <span key={idx} className="bg-red-950/60 text-red-300 border border-red-800/40 text-[11px] px-2.5 py-1 rounded-lg font-mono">
                      🚨 {need}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dispatch Rescue Force Form */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase">
                  ⚡ Dispatch NDRF / Response Force
                </label>

                {dispatchSuccess && (
                  <div className="p-2.5 bg-emerald-950 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Dispatch command sent to field radios!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => handleDispatch('NDRF Alpha Squad 1')}
                    className="py-2.5 px-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl text-xs flex items-center justify-between shadow-lg shadow-red-600/20"
                  >
                    <span>Dispatch NDRF Alpha Squad 1</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDispatch('Medical Helicopter & Evac Unit')}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-between border border-slate-700"
                  >
                    <span>Dispatch Air Evac Unit</span>
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl text-center text-slate-400">
              Select an incident from the map or table to inspect telemetry and dispatch forces.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
