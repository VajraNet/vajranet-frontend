import React, { useEffect, useState } from 'react';
import { HeartPulse, Plus, CheckCircle2, XCircle, RefreshCw, MapPin, Phone } from 'lucide-react';
import { ResourceHospital } from '../../types/api';
import { governmentApi } from '../../api/government';

export function ResourceHospitals() {
  const [hospitals, setHospitals] = useState<ResourceHospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [totalBeds, setTotalBeds] = useState<number>(100);
  const [availableBeds, setAvailableBeds] = useState<number>(20);
  const [totalIcuBeds, setTotalIcuBeds] = useState<number>(15);
  const [availableIcuBeds, setAvailableIcuBeds] = useState<number>(3);
  const [contactPhone, setContactPhone] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    setLoading(true);
    try {
      const data = await governmentApi.getHospitals();
      if (Array.isArray(data)) {
        setHospitals(data);
      } else {
        setHospitals([]);
      }
    } catch (err) {
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleEmergency(hospital: ResourceHospital) {
    const updatedStatus = !hospital.is_emergency_open;
    try {
      await governmentApi.updateHospital(hospital.id, { is_emergency_open: updatedStatus });
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, is_emergency_open: updatedStatus } : h))
      );
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch (err) {
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, is_emergency_open: updatedStatus } : h))
      );
    }
  }

  async function handleBedsChange(hospital: ResourceHospital, delta: number) {
    const total = hospital.total_beds || 100;
    const current = hospital.available_beds || 0;
    const newAvail = Math.max(0, Math.min(total, current + delta));

    try {
      await governmentApi.updateHospital(hospital.id, { available_beds: newAvail });
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, available_beds: newAvail } : h))
      );
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch {
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, available_beds: newAvail } : h))
      );
    }
  }

  async function handleCreateHospital(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    const payload: any = {
      name,
      address,
      latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
      total_beds: Number(totalBeds),
      available_beds: Number(availableBeds),
      icu_total: Number(totalIcuBeds),
      icu_available: Number(availableIcuBeds),
      emergency_available: true,
      oxygen_available: true,
      phone: contactPhone || '+91 11 2345 6789',
    };

    try {
      const created = await governmentApi.createHospital(payload);
      setHospitals((prev) => [...prev, created]);
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch {
      const fallbackCreated = {
        ...payload,
        id: `hosp-${Date.now()}`,
      };
      setHospitals((prev) => [...prev, fallbackCreated]);
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
            <span>🏥 Hospital Emergency Intake & ICU Network</span>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.2 rounded-full font-mono">
              LIVE NETWORK ({hospitals.length})
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time trauma intake triage, general bed availability, and ICU ventilator monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHospitals}
            className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh Hospitals"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medical Facility</span>
          </button>
        </div>
      </div>

      {/* Grid of Hospitals */}
      {hospitals.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs">
          No registered hospital facilities in database. Click "Add Medical Facility" to register one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map((h: any) => {
            const isEmgOpen = h.is_emergency_open ?? h.emergency_available ?? true;
            const availBeds = h.available_beds ?? h.availableBeds ?? 0;
            const totBeds = h.total_beds ?? h.totalBeds ?? 100;
            const availIcu = h.available_icu_beds ?? h.icu_available ?? h.icuAvailable ?? 0;
            const totIcu = h.total_icu_beds ?? h.icu_total ?? 10;

            return (
              <div
                key={h.id}
                className="bg-[#07111E] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                      isEmgOpen ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950 text-red-400 border-red-800'
                    }`}>
                      {isEmgOpen ? 'TRAUMA INTAKE OPEN' : 'EMERGENCY INTAKE FULL'}
                    </span>
                    <button
                      onClick={() => handleToggleEmergency(h)}
                      className="text-[10px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Toggle Intake
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2.5">{h.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{h.address || h.location?.address}</span>
                  </p>
                  {(h.phone || h.contact_phone) && (
                    <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{h.phone || h.contact_phone}</span>
                    </p>
                  )}

                  {/* Bed Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-[#0F1E36] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">General Beds:</span>
                      <span className="text-emerald-400 font-bold">{availBeds} / {totBeds} Free</span>
                    </div>
                    <div className="bg-[#0F1E36] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">ICU / Vent:</span>
                      <span className="text-cyan-400 font-bold">{availIcu} / {totIcu} Free</span>
                    </div>
                  </div>
                </div>

                {/* Adjust Beds Live */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                  <span className="text-slate-400">Update Beds:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleBedsChange(h, -5)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold cursor-pointer"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleBedsChange(h, 5)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-bold cursor-pointer"
                    >
                      +5
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-700 rounded-2xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <h3 className="text-base font-bold">Register Hospital / Trauma Facility</h3>
            <form onSubmit={handleCreateHospital} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Hospital Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Super Specialty Hospital"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ring Road, Sector 7"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Total Beds</label>
                  <input
                    type="number"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(Number(e.target.value))}
                    required
                    className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Available Beds</label>
                  <input
                    type="number"
                    value={availableBeds}
                    onChange={(e) => setAvailableBeds(Number(e.target.value))}
                    required
                    className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Total ICU Beds</label>
                  <input
                    type="number"
                    value={totalIcuBeds}
                    onChange={(e) => setTotalIcuBeds(Number(e.target.value))}
                    required
                    className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Available ICU</label>
                  <input
                    type="number"
                    value={availableIcuBeds}
                    onChange={(e) => setAvailableIcuBeds(Number(e.target.value))}
                    required
                    className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Emergency Desk Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 11 2345 6789"
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