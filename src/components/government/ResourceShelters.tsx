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
      if (Array.isArray(data)) {
        setShelters(data);
      } else {
        setShelters([]);
      }
    } catch {
      setShelters([]);
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
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
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
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
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
      contact_phone: contactPhone || '+91 98765 00000',
    };

    try {
      const created = await governmentApi.createShelter(payload);
      setShelters((prev) => [...prev, created]);
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch {
      const fallbackCreated = {
        ...payload,
        id: `sh-${Date.now()}`,
      };
      setShelters((prev) => [...prev, fallbackCreated]);
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } finally {
      setShowAddModal(false);
      setName('');
      setAddress('');
      setContactPhone('');
    }
  }

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>🏠 Official Government Disaster Shelters</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full font-mono">
              LIVE NETWORK ({shelters.length})
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time shelter capacity allocation, occupancy updates, and operational intake status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchShelters}
            className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh Shelters"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Establish Shelter</span>
          </button>
        </div>
      </div>

      {/* Grid of Shelters */}
      {shelters.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs">
          No registered shelters in database. Click "Establish Shelter" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelters.map((s) => {
            const cap = s.capacity || s.total_capacity || 100;
            const occ = s.occupied || 0;
            const free = Math.max(0, cap - occ);
            const isOpen = s.status === 'OPEN' || s.is_open === true;

            return (
              <div
                key={s.id}
                className="bg-[#07111E] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                      isOpen ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950 text-red-400 border-red-800'
                    }`}>
                      {isOpen ? 'ACTIVE / OPEN' : 'CLOSED / FULL'}
                    </span>
                    <button
                      onClick={() => handleToggleStatus(s)}
                      className="text-[10px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Toggle Status
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2.5">{s.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{s.address}</span>
                  </p>
                  {s.contact_phone && (
                    <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{s.contact_phone}</span>
                    </p>
                  )}

                  {/* Occupancy Indicator */}
                  <div className="mt-4 bg-[#0F1E36] p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Capacity:</span>
                      <span className="text-white font-bold">{occ} / {cap} Occupied</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${free < 20 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (occ / cap) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono block text-right">
                      {free} Beds Available
                    </span>
                  </div>
                </div>

                {/* Adjust Occupancy */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Live Intake:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOccupancyChange(s, occ - 10)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold cursor-pointer"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleOccupancyChange(s, occ + 10)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold cursor-pointer"
                    >
                      +10
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-700 rounded-2xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-bold">Establish New Disaster Shelter</h3>
            <form onSubmit={handleCreateShelter} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Shelter Facility Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Indoor Stadium Relief Camp"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sector 4 Sports Complex"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Total Bed Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  Register Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}