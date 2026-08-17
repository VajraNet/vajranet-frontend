import React, { useEffect, useState } from 'react';
import { HeartPulse, Plus, CheckCircle2, XCircle, RefreshCw, MapPin, Phone, X, Trash2 } from 'lucide-react';
import { ResourceHospital } from '../../types/api';
import { governmentApi } from '../../api/government';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface ResourceHospitalsProps {
  lang?: Language;
}

export function ResourceHospitals({ lang = 'EN' }: ResourceHospitalsProps) {
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

  const t = TRANSLATIONS[lang];

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

  async function handleDelete(id: string) {
    try {
      await governmentApi.deleteHospital(id);
    } catch (e) {
      console.warn('Deleted locally:', e);
    }
    setHospitals((prev) => prev.filter((h) => h.id !== id));
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  }

  async function handleToggleEmergency(hospital: ResourceHospital) {
    const updatedStatus = !(hospital.is_emergency_open ?? hospital.emergency_available ?? true);
    try {
      await governmentApi.updateHospital(hospital.id, { is_emergency_open: updatedStatus, emergency_available: updatedStatus } as any);
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, is_emergency_open: updatedStatus, emergency_available: updatedStatus } : h))
      );
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch (err) {
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, is_emergency_open: updatedStatus, emergency_available: updatedStatus } : h))
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

  async function handleIcuChange(hospital: ResourceHospital, delta: number) {
    const total = hospital.icu_total ?? (hospital as any).icu_beds_total ?? 10;
    const current = hospital.icu_available ?? (hospital as any).icu_beds_available ?? 0;
    const newAvail = Math.max(0, Math.min(total, current + delta));

    try {
      await governmentApi.updateHospital(hospital.id, { icu_available: newAvail } as any);
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, icu_available: newAvail } : h))
      );
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch {
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, icu_available: newAvail } : h))
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
    }

    setName('');
    setAddress('');
    setTotalBeds(100);
    setAvailableBeds(20);
    setTotalIcuBeds(15);
    setAvailableIcuBeds(3);
    setContactPhone('');
    setShowAddModal(false);
  }

  const totalAvail = hospitals.reduce((acc, h) => acc + Number(h.available_beds || 0), 0);
  const totalIcu = hospitals.reduce((acc, h) => acc + Number(h.icu_available ?? (h as any).icu_beds_available ?? 0), 0);

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-status-online" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {t.hospitalsTitle}
            </h1>
            <span className="gov-badge badge-online font-mono font-bold">
              {totalAvail} {t.bedsAvailable}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {t.hospitalsSubtext}: <strong className="text-severity-high font-mono">{totalIcu}</strong> across {hospitals.length} facilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchHospitals} 
            className="gov-btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {t.addHospital}
          </button>
        </div>
      </div>

      {/* Hospitals Table */}
      <div className="section-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t.thHospitalFacility}</th>
                <th>{t.thAvailableBeds}</th>
                <th>{t.thIcuCapacity}</th>
                <th>{t.thEmergencyTraumaUnit}</th>
                <th>General Bed Adjustment</th>
                <th>ICU Bed Adjustment</th>
                <th className="text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && hospitals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    Loading medical facility telemetry...
                  </td>
                </tr>
              ) : hospitals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gov-gray">
                    No hospital facilities registered yet.
                  </td>
                </tr>
              ) : (
                hospitals.map((hospital) => {
                  const isEmergOpen = hospital.is_emergency_open ?? hospital.emergency_available ?? true;
                  const icuAvail = hospital.icu_available ?? (hospital as any).icu_beds_available ?? 0;
                  const icuTot = hospital.icu_total ?? (hospital as any).icu_beds_total ?? 10;

                  return (
                    <tr key={hospital.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                      
                      {/* Name & Address */}
                      <td>
                        <div className="font-semibold text-xs text-[#1e2533] dark:text-white">
                          {hospital.name}
                        </div>
                        <div className="text-[10px] text-gov-gray flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gov-blue shrink-0" />
                          <span>{hospital.address}</span>
                        </div>
                      </td>

                      {/* Available Beds */}
                      <td className="font-mono text-xs">
                        <span className="font-bold text-status-online text-sm">
                          {hospital.available_beds || 0}
                        </span>
                        <span className="text-gov-gray"> / {hospital.total_beds || 100}</span>
                      </td>

                      {/* ICU Capacity */}
                      <td className="font-mono text-xs">
                        <span className={`font-bold ${icuAvail > 0 ? 'text-severity-high' : 'text-severity-critical'}`}>
                          {icuAvail}
                        </span>
                        <span className="text-gov-gray"> / {icuTot}</span>
                      </td>

                      {/* Emergency Intake */}
                      <td>
                        <button
                          onClick={() => handleToggleEmergency(hospital)}
                          className={`gov-badge cursor-pointer ${isEmergOpen ? 'badge-online' : 'badge-offline'}`}
                        >
                          {isEmergOpen ? t.intakeActive : t.divertFull}
                        </button>
                      </td>

                      {/* General Bed adjustments (-1 / +1) */}
                      <td className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleBedsChange(hospital, -1)}
                            className="gov-btn btn-ghost btn-sm px-2 py-0.5 text-xs font-bold"
                            title="Decrease General Bed (-1)"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleBedsChange(hospital, +1)}
                            className="gov-btn btn-secondary btn-sm px-2 py-0.5 text-xs font-bold"
                            title="Increase General Bed (+1)"
                          >
                            +1
                          </button>
                        </div>
                      </td>

                      {/* ICU Bed adjustments (-1 / +1) */}
                      <td className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleIcuChange(hospital, -1)}
                            className="gov-btn btn-ghost btn-sm px-2 py-0.5 text-xs font-bold text-severity-high"
                            title="Decrease ICU Bed (-1)"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleIcuChange(hospital, +1)}
                            className="gov-btn btn-secondary btn-sm px-2 py-0.5 text-xs font-bold text-severity-high"
                            title="Increase ICU Bed (+1)"
                          >
                            +1
                          </button>
                        </div>
                      </td>

                      {/* Delete Action */}
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(hospital.id)}
                          className="text-gov-gray hover:text-severity-critical p-1 transition cursor-pointer"
                          title="Delete Hospital Facility"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateHospital}
            className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider">
                {t.addHospital}
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-gov-gray hover:text-[#1e2533] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'अस्पताल का नाम *' : 'Hospital Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GSVM Medical College & Hospital"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="gov-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'स्थान व पता *' : 'Address / Location *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swaroop Nagar, Kanpur"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="gov-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                    {lang === 'HI' ? 'कुल सामान्य बेड' : 'Total General Beds'}
                  </label>
                  <input
                    type="number"
                    value={totalBeds}
                    onChange={(e) => setTotalBeds(Number(e.target.value))}
                    className="gov-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                    {lang === 'HI' ? 'उपलब्ध सामान्य बेड' : 'Available Beds'}
                  </label>
                  <input
                    type="number"
                    value={availableBeds}
                    onChange={(e) => setAvailableBeds(Number(e.target.value))}
                    className="gov-input w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                    {lang === 'HI' ? 'कुल आईसीयू बेड' : 'Total ICU Beds'}
                  </label>
                  <input
                    type="number"
                    value={totalIcuBeds}
                    onChange={(e) => setTotalIcuBeds(Number(e.target.value))}
                    className="gov-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                    {lang === 'HI' ? 'उपलब्ध आईसीयू बेड' : 'Available ICU Beds'}
                  </label>
                  <input
                    type="number"
                    value={availableIcuBeds}
                    onChange={(e) => setAvailableIcuBeds(Number(e.target.value))}
                    className="gov-input w-full font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gov-gray-border dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="gov-btn btn-ghost btn-sm"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="gov-btn btn-primary btn-sm"
              >
                Register Facility
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}