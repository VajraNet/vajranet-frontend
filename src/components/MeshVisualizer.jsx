import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Radio, 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Server, 
  Zap, 
  Send, 
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import { MOCK_MESH_NODES } from '../data/mockData';

export default function MeshVisualizer({ isOnline }) {
  const [nodes, setNodes] = useState(MOCK_MESH_NODES);
  const [simulatingHop, setSimulatingHop] = useState(false);
  const [packetLogs, setPacketLogs] = useState([
    { id: 1, time: '13:42:01', from: 'NODE-104', to: 'NODE-101', type: 'SOS Packet', status: 'Hoppe' },
    { id: 2, time: '13:42:03', from: 'NODE-101', to: 'GATEWAY-ALPHA', type: 'Telemetry Sync', status: 'Delivered' }
  ]);

  const triggerPacketSimulation = () => {
    setSimulatingHop(true);
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      from: 'NODE-104 (iPhone Citizen)',
      to: 'NODE-102 (Volunteer Walkie Relay)',
      type: 'Distress SOS Payload',
      status: 'In Transit'
    };
    setPacketLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      setPacketLogs(prev => [
        {
          id: Date.now() + 1,
          time: new Date().toLocaleTimeString(),
          from: 'NODE-102 (Volunteer Relay)',
          to: 'GATEWAY-ALPHA (Gov Satellite)',
          type: 'Distress SOS Payload',
          status: isOnline ? 'Synced to Cloud' : 'Buffered in Gateway'
        },
        ...prev
      ]);
      setSimulatingHop(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner explaining P2P Mesh */}
      <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shrink-0">
            <Network className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              VajraNet Peer-to-Peer (P2P) Mesh Topology
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              When cell towers are destroyed by floods or earthquakes, VajraNet forms an ad-hoc local mesh network using Bluetooth Low Energy (BLE) & Wi-Fi Direct. Packets hop from phone to phone until reaching an active Internet Gateway node.
            </p>
          </div>
        </div>

        <button
          onClick={triggerPacketSimulation}
          disabled={simulatingHop}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 shrink-0"
        >
          <Send className={`w-4 h-4 ${simulatingHop ? 'animate-spin' : ''}`} />
          <span>{simulatingHop ? 'Transmitting Packet...' : 'Simulate SOS Mesh Hop'}</span>
        </button>
      </div>

      {/* Main Grid: Interactive Canvas Mesh Diagram + Packet Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Animated Mesh Node Diagram */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[480px]">
          <div className="flex justify-between items-center z-10">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
              PHYSICAL MESH TOPOLOGY MAP
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-ping"></span>
              {nodes.length} Active Mesh Nodes Detected
            </span>
          </div>

          {/* SVG Canvas Mesh Connections */}
          <div className="relative w-full h-[380px] my-4 flex items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 bg-grid-pattern">
            
            {/* SVG Connecting Hop Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="50%" y1="20%" x2="25%" y2="50%" stroke="#0284c7" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
              <line x1="50%" y1="20%" x2="75%" y2="50%" stroke="#0284c7" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
              <line x1="25%" y1="50%" x2="35%" y2="80%" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="75%" y1="50%" x2="65%" y2="80%" stroke="#38bdf8" strokeWidth="1.5" />

              {/* Hop Wave line */}
              {simulatingHop && (
                <circle cx="50%" cy="20%" r="40" fill="none" stroke="#38bdf8" strokeWidth="2">
                  <animate attributeName="r" from="10" to="120" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              )}
            </svg>

            {/* Central Gateway Node */}
            <div className="absolute top-[15%] left-[50%] -translate-x-1/2 flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 border-2 border-amber-300">
                <Server className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-white font-mono mt-1">GATEWAY-ALPHA</span>
              <span className="text-[10px] text-emerald-400 font-mono">Satellite Uplink (0 Hops)</span>
            </div>

            {/* Relay Node Left */}
            <div className="absolute top-[45%] left-[20%] flex flex-col items-center group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-cyan-400">
                <Radio className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-200 font-mono mt-1">NODE-102</span>
              <span className="text-[10px] text-cyan-400 font-mono">Volunteer Relay (1 Hop)</span>
            </div>

            {/* Relay Node Right */}
            <div className="absolute top-[45%] left-[72%] flex flex-col items-center group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-lg shadow-cyan-600/30 border border-cyan-400">
                <Radio className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-200 font-mono mt-1">NODE-103</span>
              <span className="text-[10px] text-cyan-400 font-mono">Shelter Beacon (1 Hop)</span>
            </div>

            {/* Citizen Device Node Bottom Left */}
            <div className="absolute top-[75%] left-[30%] flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md border border-blue-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-300 font-mono mt-1">NODE-101 (Citizen)</span>
              <span className="text-[9px] text-slate-400 font-mono">2 Hops</span>
            </div>

            {/* Citizen Device Node Bottom Right (Dead cell area) */}
            <div className="absolute top-[75%] left-[62%] flex flex-col items-center group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-red-600/80 text-white flex items-center justify-center shadow-md border border-red-400 animate-bounce">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-red-300 font-mono mt-1">NODE-104 (SOS Origin)</span>
              <span className="text-[9px] text-red-400 font-mono">3 Hops (Cell Dead)</span>
            </div>

          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 font-mono border-t border-slate-800 pt-3">
            <span>BLE Radio Range: 150 meters</span>
            <span>AES-256 Encrypted Packets</span>
            <span>Frequency: 2.4 GHz / Wi-Fi Direct</span>
          </div>

        </div>

        {/* Right 1 Col: Live Packet Log & Node List */}
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl space-y-3">
            <h3 className="font-bold text-base text-white font-heading flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>P2P Packet Hop Logs</span>
            </h3>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {packetLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-bold">{log.type}</span>
                    <span className="text-[10px] text-slate-500">{log.time}</span>
                  </div>
                  <div className="text-slate-300 flex items-center space-x-1">
                    <span>{log.from}</span>
                    <span className="text-slate-500">➔</span>
                    <span>{log.to}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                    <span className="text-[10px] text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Node Health Matrix */}
          <div className="glass-panel p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">Active Mesh Node Health</h4>
            <div className="space-y-1.5 text-xs font-mono">
              {nodes.map(n => (
                <div key={n.id} className="flex justify-between items-center bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-200">{n.name}</span>
                  <span className="text-cyan-400">{n.battery}% Batt</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
