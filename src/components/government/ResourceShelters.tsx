import React, { useEffect, useState } from 'react';
import { Home, Plus, CheckCircle2, XCircle, Users, Phone, MapPin, RefreshCw, X, Building2, Trash2 } from 'lucide-react';
import { governmentApi } from '../../api/government';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface ResourceSheltersProps {
  lang?: Language;
}

export function ResourceShelters({ lang = 'EN' }: ResourceSheltersProps) {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState<number>(200);
  const [contactPhone, setContactPhone] = useState('');

  const t = TRANSLATIONS[lang];

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

  async function handleDelete(id: string) {
    try {
      await governmentApi.deleteShelter(id);
    } catch (e) {
      console.warn('Deleted locally:', e);
    }
    setShelters((prev) => prev.filter((s) => s.id !== id));
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
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
    }

    setName('');
    setAddress('');
    setCapacity(200);
    setContactPhone('');
    setShowAddModal(false);
  }

  const totalCap = shelters.reduce((acc, s) => acc + Number(s.capacity || s.total_capacity || 0), 0);
  const totalOcc = shelters.reduce((acc, s) => acc + Number(s.occupied || 0), 0);

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gov-blue dark:text-blue-400" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {t.sheltersTitle}
            </h1>
            <span className="gov-badge badge-medium font-mono font-bold">
              {shelters.length} {t.registered}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {t.sheltersSubtext}: <strong className="text-gov-blue dark:text-blue-400">{totalCap}</strong> · {t.occupied}: <strong className="text-status-online">{totalOcc}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchShelters} 
            className="gov-btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {t.addShelter}
          </button>
        </div>
      </div>

      {/* Shelters Table */}
      <div className="section-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t.thShelterNameLocation}</th>
                <th>{t.thOccupancyCapacity}</th>
                <th>{t.thUtilizationMeter}</th>
                <th>{t.thStatus}</th>
                <th>{t.thOperator}</th>
                <th>{t.thManageQuota}</th>
                <th className="text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && shelters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    Loading shelter inventory...
                  </td>
                </tr>
              ) : shelters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-gov-gray">
                    No emergency shelters registered yet.
                  </td>
                </tr>
              ) : (
                shelters.map((shelter) => {
                  const cap = shelter.capacity || shelter.total_capacity || 100;
                  const occ = shelter.occupied || 0;
                  const pct = cap > 0 ? Math.round((occ / cap) * 100) : 0;
                  const isOpen = shelter.status === 'OPEN' || shelter.is_open === true;

                  return (
                    <tr key={shelter.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                      
                      {/* Name & Address */}
                      <td>
                        <div className="font-semibold text-xs text-[#1e2533] dark:text-white">
                          {shelter.name}
                        </div>
                        <div className="text-[10px] text-gov-gray flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gov-blue shrink-0" />
                          <span>{shelter.address}</span>
                        </div>
                      </td>

                      {/* Numbers */}
                      <td className="font-mono text-xs">
                        <span className="font-bold text-[#1e2533] dark:text-white">{occ}</span>
                        <span className="text-gov-gray"> / {cap}</span>
                        <span className="text-[10px] text-gov-gray ml-1.5 font-bold">({pct}%)</span>
                      </td>

                      {/* Progress Meter */}
                      <td className="w-36">
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              pct >= 90 ? 'bg-severity-critical' : pct >= 70 ? 'bg-severity-high' : 'bg-status-online'
                            }`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <button
                          onClick={() => handleToggleStatus(shelter)}
                          className={`gov-badge cursor-pointer ${isOpen ? 'badge-online' : 'badge-offline'}`}
                        >
                          {isOpen ? t.operational : t.closed}
                        </button>
                      </td>

                      {/* Operator */}
                      <td>
                        <span className={`gov-badge ${shelter.is_private ? 'badge-medium' : 'badge-resolved'}`}>
                          {shelter.is_private ? t.volunteer : t.government}
                        </span>
                      </td>

                      {/* Quota adjustments */}
                      <td className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOccupancyChange(shelter, occ - 10)}
                            className="gov-btn btn-ghost btn-sm px-2 py-0.5 text-xs font-bold"
                            title="Decrease Occupancy (-10)"
                          >
                            -10
                          </button>
                          <button
                            onClick={() => handleOccupancyChange(shelter, occ + 10)}
                            className="gov-btn btn-secondary btn-sm px-2 py-0.5 text-xs font-bold"
                            title="Increase Occupancy (+10)"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Delete action */}
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(shelter.id)}
                          className="text-gov-gray hover:text-severity-critical p-1 transition cursor-pointer"
                          title="Delete Shelter"
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

      {/* Add Shelter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateShelter}
            className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider">
                {t.addShelter}
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
                  {lang === 'HI' ? 'आश्रय स्थल का नाम *' : 'Shelter Facility Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Inter College Auditorium"
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
                  placeholder="e.g. Civil Lines, Near District Court"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="gov-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                    {lang === 'HI' ? 'अधिकतम क्षमता' : 'Max Capacity'}
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="gov-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                    {lang === 'HI' ? 'संपर्क फोन' : 'Contact Phone'}
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="gov-input w-full"
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
                Save & Publish Shelter
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}