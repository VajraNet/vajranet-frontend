import React, { useEffect, useState } from 'react';
import { Package, Plus, CheckCircle2, XCircle, RefreshCw, MapPin, Phone } from 'lucide-react';
import { governmentApi } from '../../api/government';

export function ResourceRelief() {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [itemsAvailable, setItemsAvailable] = useState('Clean Water Packets, Ration Kits, Medical First Aid, Blankets');

  useEffect(() => {
    fetchReliefCenters();
  }, []);

  async function fetchReliefCenters() {
    setLoading(true);
    try {
      const data = await governmentApi.getReliefCenters();
      if (Array.isArray(data)) {
        setCenters(data);
      } else {
        setCenters([]);
      }
    } catch {
      setCenters([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateReliefCenter(e: React.FormEvent) {
    e.preventDefault();
    const itemsList = itemsAvailable.split(',').map(s => s.trim()).filter(Boolean);
    const payload: any = {
      name,
      address,
      latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
      items_available: itemsList.length > 0 ? itemsList : ['Ration Kits', 'Clean Water', 'First Aid'],
      status: 'OPEN',
      contact_person: contactPerson || 'Relief Officer Incharge',
    };

    try {
      const created = await governmentApi.createReliefCenter(payload);
      setCenters((prev) => [...prev, created]);
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch {
      const fallbackCreated = {
        ...payload,
        id: `rc-${Date.now()}`,
      };
      setCenters((prev) => [...prev, fallbackCreated]);
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } finally {
      setShowAddModal(false);
      setName('');
      setAddress('');
      setContactPerson('');
    }
  }

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>📦 Disaster Relief Supplies & Ration Distribution Hubs</span>
            <span className="text-[10px] bg-purple-950 text-purple-400 border border-purple-800 px-2 py-0.2 rounded-full font-mono">
              LIVE NETWORK ({centers.length})
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Ration packet stockpiles, clean drinking water supply, and medical kit distribution depots.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReliefCenters}
            className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh Relief Centers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Establish Depot</span>
          </button>
        </div>
      </div>

      {/* Grid of Relief Hubs */}
      {centers.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs">
          No registered relief supply depots in database. Click "Establish Depot" to register one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((c) => (
            <div
              key={c.id}
              className="bg-[#07111E] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded border bg-purple-950 text-purple-400 border-purple-800">
                    DEPOT ACTIVE
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">SUPPLY HUB</span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2.5">{c.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{c.address}</span>
                </p>
                {c.contact_person && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{c.contact_person}</span>
                  </p>
                )}

                {/* Items Summary */}
                <div className="mt-4 bg-[#0F1E36] p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Supplies Stocked:</span>
                  <p className="text-xs text-slate-200 font-mono">
                    {typeof c.items_available === 'string' ? c.items_available : JSON.stringify(c.items_available || 'Ration & Water')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Relief Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-700 rounded-2xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-bold">Establish Disaster Relief Depot</h3>
            <form onSubmit={handleCreateReliefCenter} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Relief Depot Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Central Ration & Water Depot"
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
                  placeholder="e.g. Community Hall Block B"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Items & Supplies Available</label>
                <input
                  type="text"
                  value={itemsAvailable}
                  onChange={(e) => setItemsAvailable(e.target.value)}
                  placeholder="e.g. Clean Water, Ration Kits, First Aid, Blankets"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Incharge Contact</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Inspector Rawat (+91 94123 45678)"
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
                  Establish Depot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}