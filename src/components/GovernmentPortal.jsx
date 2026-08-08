import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Radio, 
  Send, 
  Check, 
  Activity, 
  Building, 
  Zap, 
  FileText 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { dispatchForce } from '../api/incidents';
import { publishAnnouncement } from '../api/government';

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 0 15px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

const redIcon = createCustomIcon('#ff2a5f');
const yellowIcon = createCustomIcon('#ffb703');
const greenIcon = createCustomIcon('#00e676');

export default function GovernmentPortal({ incidents, onUpdateIncident, isOnline, shelters, announcements, onPublishAnnouncement }) {
  const [selectedIncident, setSelectedIncident] = useState(incidents[0] || null);
  const [newDirective, setNewDirective] = useState('');
  const [newSeverity, setNewSeverity] = useState('CRITICAL');
  const [dispatchMsg, setDispatchMsg] = useState(null);

  const handleDispatch = async (teamName) => {
    if (!selectedIncident) return;
    await dispatchForce(selectedIncident.id, teamName);
    onUpdateIncident(selectedIncident.id, {
      status: 'DISPATCHED',
      assignedTeam: teamName
    });
    setSelectedIncident({
      ...selectedIncident,
      status: 'DISPATCHED',
      assignedTeam: teamName
    });
    setDispatchMsg(`Dispatched ${teamName}!`);
    setTimeout(() => setDispatchMsg(null), 3000);
  };

  const handlePublishDirective = async (e) => {
    e.preventDefault();
    if (!newDirective) return;
    const res = await publishAnnouncement({
      title: newDirective,
      severity: newSeverity,
      issuedBy: 'Government Disaster Cell',
      content: newDirective
    });
    onPublishAnnouncement(res.announcement || {
      id: `ANN-${Date.now()}`,
      title: newDirective,
      severity: newSeverity,
      issuedBy: 'Government Disaster Cell',
      issuedAt: 'Just now',
      content: newDirective
    });
    setNewDirective('');
    alert('Directive published across all Citizen & Volunteer portals!');
  };

  return (
    <div className="space-y-6">
      
      {/* Top High-Tech KPI Stat Tickers */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="v-glass-rose p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Critical SOS Alerts</p>
            <h3 className="text-3xl font-extrabold text-rose-400 font-heading mt-1">
              {incidents.filter(i => i.severity === 'CRITICAL').length} Active
            </h3>
            <p className="text-[11px] text-rose-300/80 mt-0.5">High Priority Evac Required</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="v-glass p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Mesh Telemetry Hops</p>
            <h3 className="text-3xl font-extrabold text-amber-400 font-heading mt-1">
              {incidents.reduce((acc, c) => acc + (c.meshHops || 1), 0)} Hops
            </h3>
            <p className="text-[11px] text-amber-300/80 mt-0.5">Device P2P BLE Hops</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Radio className="w-6 h-6" />
          </div>
        </div>

        <div className="v-glass-cyan p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Shelter Open Beds</p>
            <h3 className="text-3xl font-extrabold text-cyan-400 font-heading mt-1">
              {shelters.reduce((acc, s) => acc + (s.capacity - s.occupancy), 0)} Beds
            </h3>
            <p className="text-[11px] text-cyan-300/80 mt-0.5">Across {shelters.length} Centers</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="v-glass p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Gateway Status</p>
            <h3 className={`text-xl font-extrabold font-heading mt-1 ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isOnline ? 'ONLINE' : 'P2P MESH'}
            </h3>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              {isOnline ? 'Cloud Uplink Sync' : 'Local Buffer Active'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Operational Split: GIS Radar Map + Incident Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: GIS Radar Map & Incident Data Stream */}
        <div className="lg:col-span-2 space-y-5">
          
          <Card title="Real-Time Disaster Incident Map & Mesh Telemetry" subtitle="Interactive radar pins relayed over VajraNet peer-to-peer mesh">
            <div className="h-[440px] w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
              <MapContainer
                center={[19.0760, 72.8777]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Circle center={[19.0760, 72.8777]} radius={1200} pathOptions={{ color: 'red', fillOpacity: 0.15 }} />
                {incidents.map(inc => (
                  <Marker
                    key={inc.id}
                    position={[inc.lat, inc.lng]}
                    icon={inc.severity === 'CRITICAL' ? redIcon : inc.severity === 'HIGH' ? yellowIcon : greenIcon}
                    eventHandlers={{ click: () => setSelectedIncident(inc) }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1 text-xs">
                        <div className="font-mono font-bold text-cyan-400">{inc.id}</div>
                        <div className="font-bold text-white">{inc.type}</div>
                        <div>{inc.locationName}</div>
                        <div className="text-rose-400 font-bold">Victims: {inc.victimCount}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Card>

          {/* Incident Table */}
          <Card title="Mesh SOS Incident Data Stream">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3">Incident ID</th>
                    <th className="p-3">Emergency Type</th>
                    <th className="p-3">Severity</th>
                    <th className="p-3">Victims</th>
                    <th className="p-3">Mesh Origin</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {incidents.map(inc => (
                    <tr 
                      key={inc.id} 
                      onClick={() => setSelectedIncident(inc)}
                      className={`cursor-pointer transition-colors hover:bg-slate-800/50 ${
                        selectedIncident?.id === inc.id ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <td className="p-3 font-mono font-bold text-cyan-400">{inc.id}</td>
                      <td className="p-3 font-medium text-white">{inc.type}</td>
                      <td className="p-3">
                        <Badge variant={inc.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                          {inc.severity}
                        </Badge>
                      </td>
                      <td className="p-3 text-rose-300 font-bold">{inc.victimCount}</td>
                      <td className="p-3 font-mono text-slate-400">{inc.meshHops || 1} hops</td>
                      <td className="p-3 font-mono">
                        <span className={inc.status === 'DISPATCHED' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          {inc.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button size="sm" variant="outline">Inspect</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Dispatch Inspector & Directive Publisher */}
        <div className="space-y-5">
          
          {/* Dispatch Inspector Card */}
          <Card variant="cyan" title="Incident Force Dispatcher" subtitle={selectedIncident ? selectedIncident.id : 'Select incident'}>
            {selectedIncident ? (
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-lg font-heading">{selectedIncident.type}</h4>
                  <Badge variant={selectedIncident.severity === 'CRITICAL' ? 'critical' : 'warning'}>
                    {selectedIncident.severity}
                  </Badge>
                </div>

                <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5 font-mono">
                  <div className="flex justify-between"><span className="text-slate-400">Location:</span> <span className="text-white">{selectedIncident.locationName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Victims Trapped:</span> <span className="text-rose-400 font-bold">{selectedIncident.victimCount} People</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Mesh Node:</span> <span className="text-cyan-400">{selectedIncident.relayedBy}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Assigned Team:</span> <span className="text-emerald-400 font-bold">{selectedIncident.assignedTeam}</span></div>
                </div>

                <p className="text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  {selectedIncident.notes}
                </p>

                {dispatchMsg && (
                  <div className="p-2.5 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{dispatchMsg}</span>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <Button variant="danger" className="w-full py-2.5" onClick={() => handleDispatch('NDRF Squad Alpha-1')}>
                    Dispatch NDRF Rescue Squad Alpha
                  </Button>
                  <Button variant="primary" className="w-full py-2.5" onClick={() => handleDispatch('Air Evac Rescue Helicopter')}>
                    Dispatch Helicopter Air Evac
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select an incident from the radar map to inspect telemetry and dispatch forces.</p>
            )}
          </Card>

          {/* Publish Government Directive Card */}
          <Card title="Publish Government Directive" subtitle="Reflects live on Citizen and Volunteer portals">
            <form onSubmit={handlePublishDirective} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-mono uppercase mb-1">Advisory Content</label>
                <textarea
                  rows="3"
                  value={newDirective}
                  onChange={e => setNewDirective(e.target.value)}
                  placeholder="e.g. Mandatory Evacuation issued for Dharavi Sector 4 due to rising flood waters..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>
              <div>
                <label className="block text-slate-400 font-mono uppercase mb-1">Severity Level</label>
                <select
                  value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="CRITICAL">CRITICAL EVACUATION</option>
                  <option value="HIGH">HIGH ADVISORY</option>
                  <option value="INFO">GENERAL INFORMATION</option>
                </select>
              </div>
              <Button type="submit" variant="primary" className="w-full py-2.5">
                Broadcast Directive
              </Button>
            </form>
          </Card>

        </div>

      </div>
    </div>
  );
}
