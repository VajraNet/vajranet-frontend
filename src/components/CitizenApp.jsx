import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  Home, 
  HeartPulse, 
  Bot, 
  Radio, 
  MapPin, 
  CheckCircle2, 
  X, 
  Send, 
  Phone, 
  ShieldCheck, 
  Share2,
  Camera,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CitizenApp({ 
  incidents, 
  onTriggerSOS, 
  shelters, 
  hospitals, 
  isOnline,
  onOpenChatbot 
}) {
  const [activeModal, setActiveModal] = useState(null); // 'sos_success', 'report_incident', 'shelters', 'hospitals', 'mesh_status'
  const [sosSending, setSosSending] = useState(false);
  const [sosStep, setSosStep] = useState('');
  const [incidentForm, setIncidentForm] = useState({
    type: 'Medical Emergency',
    victims: '1-3 people',
    notes: '',
    photo: null
  });

  const handleSosClick = () => {
    setSosSending(true);
    setSosStep('Scanning local Bluetooth & Wi-Fi Direct mesh...');

    setTimeout(() => {
      setSosStep('Found 3 nearby VajraNet relay nodes...');
    }, 800);

    setTimeout(() => {
      setSosStep('Relaying encrypted packet via Node-Beta-7...');
    }, 1600);

    setTimeout(() => {
      setSosSending(false);
      // Trigger canvas confetti alert
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // fallback
      }

      onTriggerSOS({
        id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'Citizen Emergency SOS',
        severity: 'CRITICAL',
        lat: 19.0760 + (Math.random() - 0.5) * 0.02,
        lng: 72.8777 + (Math.random() - 0.5) * 0.02,
        locationName: 'Dharavi Sector 4 (Current GPS Location)',
        victimCount: 1,
        reportedAt: 'Just now',
        meshHops: 2,
        relayedBy: 'Mesh Relay Node-Beta-7',
        status: 'PENDING',
        assignedTeam: 'Broadcasting to NDRF',
        notes: 'User pressed red panic SOS button on citizen mobile app.',
        needs: ['Immediate Evac', 'Medical Triage']
      });

      setActiveModal('sos_success');
    }, 2400);
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    onTriggerSOS({
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      type: incidentForm.type,
      severity: 'HIGH',
      lat: 19.0800 + (Math.random() - 0.5) * 0.02,
      lng: 72.8800 + (Math.random() - 0.5) * 0.02,
      locationName: 'User Reported Location (Kurla West)',
      victimCount: incidentForm.victims === '1-3 people' ? 2 : 6,
      reportedAt: 'Just now',
      meshHops: 1,
      relayedBy: 'Mesh Hop via Citizen App',
      status: 'PENDING',
      assignedTeam: 'Queue for Triage',
      notes: incidentForm.notes || 'Incident reported via Citizen App form.',
      needs: ['Rescue Team']
    });
    setActiveModal(null);
    alert('Incident reported and broadcasted across VajraNet local mesh!');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] p-4">
      {/* Visual Header Note */}
      <div className="mb-4 text-center max-w-md">
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/50">
          📱 CITIZEN MOBILE INTERFACE SIMULATION
        </span>
      </div>

      {/* iPhone frame container */}
      <div className="mobile-frame flex flex-col justify-between p-6 shadow-2xl relative">
        
        {/* Top Phone Status bar */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-2">
          <span>22:55</span>
          <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto"></div>
          <div className="flex items-center space-x-1">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>5G / P2P</span>
          </div>
        </div>

        {/* Header matching exact user screenshot */}
        <div className="flex flex-col items-center mt-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-7 h-7 text-amber-400 fill-amber-400" />
            <h1 className="text-2xl font-black tracking-wider text-white font-heading">
              VAJRANET
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`}></span>
            <span className="text-sm font-semibold text-emerald-400">
              {isOnline ? 'Connected (Cloud Gateway)' : 'Mesh Active (Offline)'}
            </span>
          </div>

          <div className="mt-1 text-[11px] text-slate-400 font-mono bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-slate-800">
            3 Mesh Peers Nearby · Hop Distance: 1
          </div>
        </div>

        {/* Center Giant Red SOS Button matching exact user screenshot */}
        <div className="flex flex-col items-center justify-center my-6">
          <button
            onClick={handleSosClick}
            disabled={sosSending}
            className="w-44 h-44 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-extrabold text-3xl tracking-wider shadow-2xl flex items-center justify-center border-4 border-red-400/40 sos-button-pulse active:scale-95 transition-transform cursor-pointer relative group"
          >
            {sosSending ? (
              <div className="flex flex-col items-center p-2 text-center">
                <Radio className="w-8 h-8 text-white animate-spin mb-1" />
                <span className="text-xs font-mono">SENDING...</span>
              </div>
            ) : (
              <span className="font-heading font-black text-4xl group-hover:scale-105 transition-transform">
                SOS
              </span>
            )}
          </button>
          
          <p className="text-xs text-slate-400 mt-4 text-center font-mono">
            {sosSending ? sosStep : 'Press & hold in emergency. Operates 100% offline.'}
          </p>
        </div>

        {/* 3 Main Action Pill Buttons matching exact user screenshot */}
        <div className="flex flex-col space-y-3 mb-4">
          <button
            onClick={() => setActiveModal('report_incident')}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-between"
          >
            <span className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-blue-200" />
              <span>Report Incident</span>
            </span>
            <ChevronRight className="w-5 h-5 text-blue-200" />
          </button>

          <button
            onClick={() => setActiveModal('shelters')}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-between"
          >
            <span className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-blue-200" />
              <span>Nearby Shelters</span>
            </span>
            <ChevronRight className="w-5 h-5 text-blue-200" />
          </button>

          <button
            onClick={() => setActiveModal('hospitals')}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-base shadow-lg shadow-blue-600/30 transition-all flex items-center justify-between"
          >
            <span className="flex items-center space-x-2">
              <HeartPulse className="w-5 h-5 text-blue-200" />
              <span>Nearby Hospitals</span>
            </span>
            <ChevronRight className="w-5 h-5 text-blue-200" />
          </button>
        </div>

        {/* Bottom AI Chatbot & Quick Tools Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={onOpenChatbot}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-3 py-2 rounded-xl shadow-md font-medium hover:brightness-110 transition-all"
          >
            <Bot className="w-4 h-4 text-purple-200" />
            <span>AI Offline Survival Bot</span>
          </button>

          <button
            onClick={() => setActiveModal('mesh_status')}
            className="flex items-center space-x-1.5 bg-slate-800 text-cyan-400 text-xs px-3 py-2 rounded-xl font-mono hover:bg-slate-700 transition-all"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Mesh Mesh (3)</span>
          </button>
        </div>

      </div>

      {/* --- MODALS --- */}
      {/* 1. SOS Broadcasted Success Modal */}
      {activeModal === 'sos_success' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white text-center font-heading">
              SOS Broadcasted via VajraNet Mesh!
            </h3>
            
            <p className="text-sm text-slate-300 text-center mt-2">
              Your distress packet has been encrypted and relayed across 3 peer nodes to the NDRF Disaster Command Center.
            </p>

            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Packet ID:</span>
                <span className="text-cyan-400">SOS-PACKET-9941</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Relay Path:</span>
                <span className="text-emerald-400">Device → Node-Beta → Command</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">GPS Coords:</span>
                <span className="text-white">19.0760° N, 72.8777° E</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all"
            >
              Return to App Home
            </button>
          </div>
        </div>
      )}

      {/* 2. Report Incident Modal */}
      {activeModal === 'report_incident' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <h3 className="text-lg font-bold text-white font-heading">Report Disaster Incident</h3>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Emergency Type</label>
                <select
                  value={incidentForm.type}
                  onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option>Medical Emergency / Injury</option>
                  <option>Flash Flood / Trapped</option>
                  <option>Building Wall / Structural Fracture</option>
                  <option>Electric Spark / Live Wire Cut</option>
                  <option>Food & Clean Water Shortage</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Trapped / Affected People</label>
                <select
                  value={incidentForm.victims}
                  onChange={(e) => setIncidentForm({ ...incidentForm, victims: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option>1-3 people</option>
                  <option>4-10 people</option>
                  <option>10+ people (Mass Emergency)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description / landmark</label>
                <textarea
                  rows="3"
                  value={incidentForm.notes}
                  onChange={(e) => setIncidentForm({ ...incidentForm, notes: e.target.value })}
                  placeholder="e.g. Water level rising fast near Kurla bus depot..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span>Attach Disaster Photo (AI Damage Analysis)</span>
                </span>
                <span className="text-cyan-400 font-semibold cursor-pointer">Select</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Broadcast to Mesh Network
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Nearby Shelters Modal */}
      {activeModal === 'shelters' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <Home className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-white font-heading">Nearby Relief Shelters</h3>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1">
              {shelters.map((s) => (
                <div key={s.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base">{s.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                        {s.address} ({s.distance})
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-mono font-bold ${
                      s.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs pt-2 border-t border-slate-800 font-mono">
                    <span className="text-slate-400">Capacity: <strong className="text-white">{s.occupancy} / {s.capacity}</strong></span>
                    <span className="text-cyan-400 font-semibold">{s.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Nearby Hospitals Modal */}
      {activeModal === 'hospitals' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <HeartPulse className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-bold text-white font-heading">Emergency Hospitals</h3>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1">
              {hospitals.map((h) => (
                <div key={h.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base">{h.name}</h4>
                      <p className="text-xs text-slate-400 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-red-400 mr-1" />
                        {h.address} ({h.distance})
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                      ICU: {h.icuBedsAvailable} beds open
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 font-mono text-slate-300">
                    <div>Oxygen: <strong className={h.oxygenLevel.includes('CRITICAL') ? 'text-red-400' : 'text-emerald-400'}>{h.oxygenLevel}</strong></div>
                    <div>General Beds: <strong className="text-white">{h.generalBedsAvailable}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Mesh Diagnostics Modal */}
      {activeModal === 'mesh_status' && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
              <h3 className="text-lg font-bold text-white font-heading">VajraNet Mesh Protocol</h3>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Your mobile phone is acting as an offline P2P node using Bluetooth Low Energy (BLE) & Wi-Fi Direct.
            </p>

            <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Node Status:</span>
                <span className="text-emerald-400">Relay Enabled (Battery: 84%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Active Peers:</span>
                <span className="text-cyan-400">3 Devices within 150m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Opportunistic Sync:</span>
                <span className="text-amber-400">{isOnline ? 'Connected to Gateway' : 'Queued (4 Packets Local)'}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
