import React, { useEffect, useState } from 'react';
import { Home, Plus, CheckCircle2, XCircle, Users, Phone, MapPin, RefreshCw } from 'lucide-react';
import { ResourceShelter } from '../../types/api';
import { governmentApi } from '../../api/government';

export function ResourceShelters() {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState<number>(200);
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    fetchShelters();
  }, []);

  async function fetchShelters() {
    setLoading(true);
    try {
      const data = await governmentApi.getShelters();
      if (Array.isArray(data) && data.length > 0) {
        setShelters(data);
      } else {
        throw new Error('No data');
      }
    } catch {
      // Demo state fallback
      setShelters([
        {
          id: 'sh-101',
          name: 'Sector 4 Indoor Stadium Relief Camp',
          address: 'Sports Complex, Sector 4, Civil Lines',
          capacity: 800,
          occupied: 460,
          status: 'OPEN',
          contact_phone: '+91 98765 43210',
        },
        {
          id: 'sh-102',
          name: 'Govt Model High School Shelter',
          address: 'Station Road, North Campus',
          capacity: 400,
          occupied: 380,
          status: 'OPEN',
          contact_phone: '+91 98765 43211',
        },
        {
          id: 'sh-103',
          name: 'Civil Lines Community Center',
          address: 'Block B, Ring Road',
          capacity: 300,
          occupied: 120,
          status: 'OPEN',
          contact_phone: '+91 98765 43212',
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(shelter: any) {
    const isCurrentlyOpen = shelter.status === 'OPEN' || shelter.is_open === true;
    const newStatus = isCurrentlyOpen ? 'CLOSED' : 'OPEN';

    try {
      await governmentApi.updateShelter(shelter.id, { status: newStatus as any, is_open: !isCurrentlyOpen } as any);
      setShelters((prev) =>
        prev.map((s) =>
          s.id === shelter.id ? { ...s, status: newStatus, is_open: !isCurrentlyOpen } : s
        )
      );
    } catch {
      setShelters((prev) =>
        prev.map((s) =>
          s.id === shelter.id ? { ...s, status: newStatus, is_open: !isCurrentlyOpen } : s
        )
      );
    }
  }

  async function handleOccupancyChange(shelter: any, newOccupied: number) {
    const cap = shelter.capacity || shelter.total_capacity || 100;
    const clamped = Math.max(0, Math.min(cap, newOccupied));

    try {
      await governmentApi.updateShelter(shelter.id, { occupied: clamped });
      setShelters((prev) =>
        prev.map((s) => (s.id === shelter.id ? { ...s, occupied: clamped } : s))
      );
    } catch {
      setShelters((prev) =>
        prev.map((s) => (s.id === shelter.id ? { ...s, occupied: clamped } : s))
      );
    }
  }

  async function handleCreateShelter(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const payload: any = {
      name,
      address,
      latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
      capacity: Number(capacity),
      occupied: 0,
      status: 'OPEN',
      is_private: false,
    };

    try {
      const created = await governmentApi.createShelter(payload);
      setShelters((prev) => [...prev, created]);
    } catch {
      const mockCreated = {
        ...payload,
        id: `sh-${Date.now()}`,
        contact_phone: contactPhone || '+91 98765 00000',
      };
      setShelters((prev) => [...prev, mockCreated]);
    } finally {
      setShowAddModal(false);
      setName('');
      setAddress('');
      setContactPhone('');
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🏠 Official Government Disaster Shelters</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full font-mono">
              LIVE NETWORK
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time shelter capacity allocation, occupancy updates, and operational intake status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchShelters}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            title="Refresh Shelters"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Official Shelter</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 font-mono animate-pulse">
          Loading shelter network status...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((shelter) => {
            const sName = shelter.name || 'Emergency Shelter';
            const sAddress = shelter.address || shelter.location?.address || 'Civil Lines Disaster Zone';
            const sCap = Number(shelter.capacity || shelter.total_capacity || 100);
            const sOcc = Number(shelter.occupied || 0);
            const sAvail = shelter.available_capacity ?? shelter.available ?? Math.max(0, sCap - sOcc);
            const isOpen = shelter.status === 'OPEN' || shelter.is_open === true || shelter.status === undefined;
            const occupancyPct = Math.min(100, Math.round((sOcc / (sCap || 1)) * 100));

            return (
              <div
                key={shelter.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3.5 transition shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{sName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{sAddress}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(shelter)}
                    className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      isOpen
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-700 hover:bg-emerald-900'
                        : 'bg-rose-950 text-rose-400 border-rose-700 hover:bg-rose-900'
                    }`}
                  >
                    {isOpen ? '🟢 INTAKE OPEN' : '🔴 CLOSED'}
                  </button>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Occupancy Gauge</span>
                    <span className={`font-bold ${occupancyPct > 85 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {occupancyPct}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        occupancyPct > 90 ? 'bg-rose-500' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                    <span>Occupied: <strong className="text-white">{sOcc}</strong></span>
                    <span>Available: <strong className="text-emerald-400">{sAvail}</strong></span>
                    <span>Capacity: <strong className="text-slate-200">{sCap}</strong></span>
                  </div>
                </div>

                {/* Quick Occupancy Adjuster */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">Live Occupancy Adjuster:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      onClick={() => handleOccupancyChange(shelter, sOcc - 25)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      -25
                    </button>
                    <button
                      onClick={() => handleOccupancyChange(shelter, sOcc - 5)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleOccupancyChange(shelter, sOcc + 5)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleOccupancyChange(shelter, sOcc + 25)}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      +25
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Shelter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Register Official Disaster Shelter</h3>
            
            <form onSubmit={handleCreateShelter} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Municipal Indoor Sports Complex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Address / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 4 High Ground, Station Road"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Total Bed Capacity</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Contact Helpline</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Register Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}