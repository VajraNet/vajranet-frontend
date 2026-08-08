import React, { useState } from 'react';

export interface MeshNode {
  id: string;
  deviceName: string;
  distanceMeter: number;
  batteryPct: number;
  isRelayActive: boolean;
  lastPingSecAgo: number;
}

export function OfflineMeshSync() {
  const [meshNodes] = useState<MeshNode[]>([
    {
      id: 'node-alpha',
      deviceName: 'Vajra-Node-A4 (Zone 4 Relay)',
      distanceMeter: 45,
      batteryPct: 88,
      isRelayActive: true,
      lastPingSecAgo: 3,
    },
    {
      id: 'node-beta',
      deviceName: 'Vajra-Node-B1 (Vol-Mobile)',
      distanceMeter: 120,
      batteryPct: 62,
      isRelayActive: true,
      lastPingSecAgo: 12,
    },
    {
      id: 'node-gamma',
      deviceName: 'Vajra-Node-C9 (Shelter Gateway)',
      distanceMeter: 310,
      batteryPct: 94,
      isRelayActive: false,
      lastPingSecAgo: 45,
    },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [queuedCount, setQueuedCount] = useState(4);

  function triggerMeshSync() {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setQueuedCount(0);
    }, 2000);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            📡 Peer-to-Peer Mesh Telemetry & Offline Sync
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bluetooth LE & Wi-Fi Direct ad-hoc radio mesh status for offline disaster operations.
          </p>
        </div>
        <button
          onClick={triggerMeshSync}
          disabled={isSyncing || queuedCount === 0}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded transition shadow-sm disabled:opacity-50"
        >
          {isSyncing ? 'Syncing Packets...' : `Sync Queued Packets (${queuedCount})`}
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h3 className="text-sm font-bold text-slate-100">Mesh Network Active</h3>
            <p className="text-xs text-slate-400">Connected to 3 nearby peer nodes via Bluetooth LE / Wi-Fi Direct</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Outbound Queue</span>
          <span className="text-sm font-extrabold text-amber-400">{queuedCount} messages pending gateway sync</span>
        </div>
      </div>

      {/* Connected Nodes List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Discovered Mesh Nodes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {meshNodes.map((node) => (
            <div key={node.id} className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">{node.deviceName}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    node.isRelayActive
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {node.isRelayActive ? 'RELAY' : 'STANDBY'}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <p>📍 Distance: <span className="text-slate-200 font-medium">{node.distanceMeter}m</span></p>
                <p>🔋 Node Battery: <span className="text-slate-200 font-medium">{node.batteryPct}%</span></p>
                <p>⏱️ Last Ping: <span className="text-slate-200 font-medium">{node.lastPingSecAgo}s ago</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}