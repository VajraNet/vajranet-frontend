import React, { useState } from 'react';

export interface CommunityResource {
  id: string;
  name: string;
  resourceType: 'WATER_PUMP' | 'GENERATOR' | 'KITCHEN' | 'MEDICAL_KIT';
  zone: string;
  contactPerson: string;
  contactPhone: string;
  isAvailable: boolean;
  notes?: string;
}

export function ResourceMapping() {
  const [resources, setResources] = useState<CommunityResource[]>([
    {
      id: 'res-1',
      name: 'High-Capacity Diesel Generator (25 kVA)',
      resourceType: 'GENERATOR',
      zone: 'Zone 4 - Riverbank',
      contactPerson: 'Ramesh Kumar',
      contactPhone: '+91 98765 12345',
      isAvailable: true,
      notes: 'Available for medical equipment power backup.',
    },
    {
      id: 'res-2',
      name: 'Community Borewell Water Pump',
      resourceType: 'WATER_PUMP',
      zone: 'Zone 2 - Central',
      contactPerson: 'Suresh Verma',
      contactPhone: '+91 98765 67890',
      isAvailable: true,
      notes: 'Clean groundwater source; manually operated pump available.',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [resourceType, setResourceType] = useState<CommunityResource['resourceType']>('WATER_PUMP');
  const [zone, setZone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  function handleCreateResource(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !zone.trim()) return;

    const newResource: CommunityResource = {
      id: `res-${Date.now()}`,
      name,
      resourceType,
      zone,
      contactPerson,
      contactPhone,
      isAvailable: true,
      notes,
    };

    setResources((prev) => [newResource, ...prev]);
    setShowAddModal(false);
    setName('');
    setZone('');
    setContactPerson('');
    setContactPhone('');
    setNotes('');
  }

  function toggleAvailability(id: string) {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isAvailable: !r.isAvailable } : r))
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            🗺️ Community Resource Mapping
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Crowdsourced mapping of neighborhood relief assets, backup generators, clean water points, and medical kits.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded transition shadow-sm"
        >
          + Map Community Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((res) => (
          <div key={res.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700 uppercase">
                {res.resourceType.replace('_', ' ')}
              </span>
              <button
                onClick={() => toggleAvailability(res.id)}
                className={`text-xs font-bold px-2.5 py-1 rounded border transition ${
                  res.isAvailable
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border-rose-800'
                }`}
              >
                {res.isAvailable ? 'AVAILABLE' : 'IN USE / OFFLINE'}
              </button>
            </div>

            <h3 className="text-sm font-bold text-slate-100">{res.name}</h3>
            <p className="text-xs text-slate-300">📍 Zone: {res.zone}</p>
            {res.notes && <p className="text-xs text-slate-400 italic">"{res.notes}"</p>}

            <p className="text-xs text-slate-500 pt-2 border-t border-slate-900">
              Contact: <span className="text-slate-300 font-medium">{res.contactPerson}</span> ({res.contactPhone})
            </p>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-100">Map Community Asset</h3>
            <form onSubmit={handleCreateResource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10kW Backup Solar Inverter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="WATER_PUMP">Water Pump</option>
                    <option value="GENERATOR">Generator</option>
                    <option value="KITCHEN">Kitchen</option>
                    <option value="MEDICAL_KIT">Medical Kit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Zone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zone 4"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="Phone number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}