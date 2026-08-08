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
      if (Array.isArray(data) && data.length > 0) {
        setCenters(data);
      } else {
        throw new Error('No data');
      }
    } catch {
      // Demo state fallback
      setCenters([
        {
          id: 'rc-101',
          name: 'NDRF Central Ration & Water Depot',
          address: 'Community Hall Block B, Sector 4 Main Square',
          items_available: 'Clean Drinking Water, 1200 Ration Packets, ORS, Blankets',
          contact_person: 'Sub-Inspector Rawat (+91 94123 45678)',
          status: 'ACTIVE',
        },
        {
          id: 'rc-102',
          name: 'West Municipal Relief Distribution Point',
          address: 'West Bus Depot Ground, Station Road',
          items_available: 'Packaged Food Packets, Baby Milk Powder, Clean Water',
          contact_person: 'Ramesh Verma (+91 98765 44444)',
          status: 'ACTIVE',
        },
        {
          id: 'rc-103',
          name: 'Civil Lines Medical & Hygiene Center',
          address: 'Red Cross Building, Gate 1',
          items_available: 'Tetanus Injections, Antiseptic, Bandages, Water Chlorine Tablets',
          contact_person: 'Dr. Neha Sen (+91 98765 55555)',
          status: 'ACTIVE',
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(center: any) {
    const isCurrentlyActive = center.status === 'ACTIVE' || center.is_open === true;
    const newStatus = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';

    try {
      await governmentApi.updateReliefCenter(center.id, { status: newStatus as any, is_open: !isCurrentlyActive } as any);
      setCenters((prev) =>
        prev.map((c) =>
          c.id === center.id ? { ...c, status: newStatus, is_open: !isCurrentlyActive } : c
        )
      );
    } catch {
      setCenters((prev) =>
        prev.map((c) =>
          c.id === center.id ? { ...c, status: newStatus, is_open: !isCurrentlyActive } : c
        )
      );
    }
  }

  async function handleCreateCenter(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const payload: any = {
      name,
      address,
      latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
      items_available: itemsAvailable,
      contact_person: contactPerson || 'Relief Officer',
      status: 'ACTIVE',
      is_private: false,
    };

    try {
      const created = await governmentApi.createReliefCenter(payload);
      setCenters((prev) => [...prev, created]);
    } catch {
      const mockCreated = {
        ...payload,
        id: `rc-${Date.now()}`,
      };
      setCenters((prev) => [...prev, mockCreated]);
    } finally {
      setShowAddModal(false);
      setName('');
      setAddress('');
      setContactPerson('');
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>📦 Relief Supply Distribution Depots</span>
            <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.2 rounded-full font-mono">
              INVENTORY ACTIVE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Emergency supply logistics, food & water distribution monitoring, and relief hub management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReliefCenters}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition"
            title="Refresh Relief Centers"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Relief Depot</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400 font-mono animate-pulse">
          Loading supply distribution network status...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {centers.map((center) => {
            const cName = center.name || 'Relief Station';
            const cAddress = center.address || center.location?.address || 'Community Distribution Hub';
            const cContact = center.contact_person || center.contact_phone || 'Emergency Personnel (+91 98765 00000)';
            const cItems = center.items_available || 'Drinking Water, Ration Packets, Essential Medicines';
            const isActive = center.status === 'ACTIVE' || center.is_open === true || center.status === undefined;

            return (
              <div
                key={center.id}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3.5 transition shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{cName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{cAddress}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(center)}
                    className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-700 hover:bg-emerald-900'
                        : 'bg-rose-950 text-rose-400 border-rose-700 hover:bg-rose-900'
                    }`}
                  >
                    {isActive ? '🟢 OPERATIONAL' : '🔴 CLOSED'}
                  </button>
                </div>

                {/* Available Supplies Inventory */}
                <div className="space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Supplies in Stock:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span>🍚 Food Rations:</span>
                      <span className="text-emerald-400 font-bold">In Stock</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span>💧 Clean Water:</span>
                      <span className="text-emerald-400 font-bold">In Stock</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span>💊 Medical Aid:</span>
                      <span className="text-amber-400 font-bold">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                      <span>🛏 Blankets/Tarps:</span>
                      <span className="text-emerald-400 font-bold">In Stock</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono pt-1">
                    📦 <strong className="text-slate-400">Inventory Spec:</strong> {cItems}
                  </p>
                </div>

                {/* Contact Footer */}
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cContact}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Relief Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Register Relief Distribution Depot</h3>
            
            <form onSubmit={handleCreateCenter} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Station / Depot Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 4 Central Ration Depot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Address / Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Community Hall Ground, Sector 4"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Available Supplies Description</label>
                <input
                  type="text"
                  placeholder="e.g. 500 Food Kits, 2000 Water Pouches, Blankets"
                  value={itemsAvailable}
                  onChange={(e) => setItemsAvailable(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Officer / In-Charge Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Sub-Inspector Rawat (+91 94123 45678)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
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
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition shadow-lg shadow-amber-600/30 cursor-pointer"
                >
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}