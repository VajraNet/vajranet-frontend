import React, { useEffect, useState } from 'react';
import { ResourceShelter } from '../../types/api';
import { governmentApi } from '../../api/government';

export function ResourceShelters() {
  const [shelters, setShelters] = useState<ResourceShelter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [zone, setZone] = useState('');
  const [address, setAddress] = useState('');
  const [totalCapacity, setTotalCapacity] = useState<number>(200);
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    fetchShelters();
  }, []);

  async function fetchShelters() {
    try {
      const data = await governmentApi.getShelters();
      setShelters(data);
    } catch (err) {
      // Demo state fallback
      setShelters([
        {
          id: 'sh-1',
          name: 'District Stadium Relief Shelter',
          operator_type: 'GOVERNMENT',
          location: { zone: 'Zone 4', address: 'Stadium Road, Gate 2' },
          total_capacity: 500,
          occupied: 320,
          available: 180,
          is_open: true,
          contact_phone: '+91 98765 43210',
        },
        {
          id: 'sh-2',
          name: 'Central High School Hall',
          operator_type: 'GOVERNMENT',
          location: { zone: 'Zone 2', address: 'Main Civil Lines' },
          total_capacity: 250,
          occupied: 210,
          available: 40,
          is_open: true,
          contact_phone: '+91 98765 43211',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(shelter: ResourceShelter) {
    const updatedStatus = !shelter.is_open;
    try {
      await governmentApi.updateShelter(shelter.id, { is_open: updatedStatus });
      setShelters((prev) =>
        prev.map((s) => (s.id === shelter.id ? { ...s, is_open: updatedStatus } : s))
      );
    } catch (err) {
      setShelters((prev) =>
        prev.map((s) => (s.id === shelter.id ? { ...s, is_open: updatedStatus } : s))
      );
    }
  }

  async function handleOccupancyChange(shelter: ResourceShelter, newOccupied: number) {
    const validOccupied = Math.max(0, Math.min(newOccupied, shelter.total_capacity));
    const newAvailable = shelter.total_capacity - validOccupied;

    try {
      await governmentApi.updateShelter(shelter.id, {
        occupied: validOccupied,
        available: newAvailable,
      });
      setShelters((prev) =>
        prev.map((s) =>
          s.id === shelter.id
            ? { ...s, occupied: validOccupied, available: newAvailable }
            : s
        )
      );
    } catch (err) {
      setShelters((prev) =>
        prev.map((s) =>
          s.id === shelter.id
            ? { ...s, occupied: validOccupied, available: newAvailable }
            : s
        )
      );
    }
  }

  async function handleCreateShelter(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !zone.trim()) return;

    const payload = {
      name,
      operator_type: 'GOVERNMENT' as const,
      location: { zone, address },
      total_capacity: Number(totalCapacity),
      occupied: 0,
      is_open: true,
      contact_phone: contactPhone,
    };

    try {
      const created = await governmentApi.createShelter(payload);
      setShelters((prev) => [...prev, created]);
    } catch (err) {
      const mockCreated: ResourceShelter = {
        ...payload,
        id: `sh-${Date.now()}`,
        available: Number(totalCapacity),
      };
      setShelters((prev) => [...prev, mockCreated]);
    } finally {
      setShowAddModal(false);
      setName('');
      setZone('');
      setAddress('');
      setContactPhone('');
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🏠 Official Government Shelters
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time shelter capacity allocation, occupancy updates, and operational status control.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded transition shadow-sm"
        >
          + Add Official Shelter
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading shelter network status...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((shelter) => {
            const occupancyPct = Math.round((shelter.occupied / shelter.total_capacity) * 100);

            return (
              <div
                key={shelter.id}
                className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{shelter.name}</h3>
                    <p className="text-xs text-slate-400">
                      📍 {shelter.location.zone} — {shelter.location.address || 'Location on map'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(shelter)}
                    className={`text-xs font-bold px-2.5 py-1 rounded border transition ${
                      shelter.is_open
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                        : 'bg-rose-950 text-rose-400 border-rose-800 hover:bg-rose-900'
                    }`}
                  >
                    {shelter.is_open ? 'OPEN' : 'CLOSED'}
                  </button>
                </div>

                {/* Capacity Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                    <span>Occupancy: {occupancyPct}%</span>
                    <span>
                      {shelter.occupied} occupied / {shelter.available} available ({shelter.total_capacity} total)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        occupancyPct > 90 ? 'bg-rose-500' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Quick Occupancy Adjuster */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <span className="text-slate-400">Update Occupied Count:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOccupancyChange(shelter, shelter.occupied - 10)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-xs"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => handleOccupancyChange(shelter, shelter.occupied + 10)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-0.5 rounded text-xs"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-100">Register Official Shelter</h3>
            <form onSubmit={handleCreateShelter} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Municipal Sports Complex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Zone / Sector</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zone 3"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Capacity</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={totalCapacity}
                    onChange={(e) => setTotalCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  placeholder="Street address or nearest landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="Emergency helpline number"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}