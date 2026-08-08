import React, { useState } from 'react';

export function PrivateShelterManager() {
  const [shelters, setShelters] = useState([
    {
      id: 'psh-1',
      name: 'Rotary Club Community Center',
      zone: 'Zone 4',
      capacity: 120,
      occupied: 85,
      contact: '+91 98765 88888',
      isOpen: true,
    },
  ]);

  const [name, setName] = useState('');
  const [zone, setZone] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [contact, setContact] = useState('');

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !zone) return;

    setShelters((prev) => [
      ...prev,
      {
        id: `psh-${Date.now()}`,
        name,
        zone,
        capacity: Number(capacity),
        occupied: 0,
        contact,
        isOpen: true,
      },
    ]);
    setName('');
    setZone('');
    setContact('');
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        🏠 Private & NGO Relief Shelters
      </h2>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shelters.map((s) => (
          <div key={s.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-bold text-slate-100">{s.name}</h3>
            <p className="text-xs text-slate-400">📍 {s.zone} • Contact: {s.contact}</p>
            <p className="text-xs text-emerald-400 font-semibold">
              Occupancy: {s.occupied} / {s.capacity} beds filled
            </p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <form onSubmit={handleCreate} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase">Register Private Shelter</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            required
            placeholder="Shelter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="text"
            required
            placeholder="Zone / Sector"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Contact Phone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded transition"
        >
          List Private Shelter
        </button>
      </form>
    </div>
  );
}