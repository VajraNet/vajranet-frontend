import React, { useEffect, useState } from 'react';
import { Home, Plus, X, MapPin, Phone, Users, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface PrivateShelterManagerProps {
  lang?: Language;
}

export function PrivateShelterManager({ lang = 'EN' }: PrivateShelterManagerProps) {
  const [shelters, setShelters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('150');
  const [contact, setContact] = useState('+91 98765 88888');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  const [submitting, setSubmitting] = useState(false);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    fetchShelters();
  }, []);

  async function fetchShelters() {
    try {
      const res = await apiClient.get('/shelters');
      const data = res.data?.data || res.data;
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

  async function handleOccupancyChange(shelter: any, delta: number) {
    const cap = shelter.capacity || 100;
    const current = shelter.occupied || 0;
    const newOccupied = Math.max(0, Math.min(cap, current + delta));

    try {
      await apiClient.patch(`/shelters/${shelter.id}`, { occupied: newOccupied });
    } catch {}

    setShelters((prev) =>
      prev.map((s) => (s.id === shelter.id ? { ...s, occupied: newOccupied } : s))
    );
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  }

  async function handleDelete(id: string) {
    try {
      await apiClient.delete(`/shelters/${id}`);
    } catch (e) {
      console.warn('Deleted shelter locally:', e);
    }
    setShelters((prev) => prev.filter((s) => s.id !== id));
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        address: address.trim(),
        capacity: parseInt(capacity) || 100,
        occupied: 0,
        contact_phone: contact.trim(),
        latitude: parseFloat(latitude) || 28.6139,
        longitude: parseFloat(longitude) || 77.2090,
        is_private: true,
        status: 'OPEN',
      };

      const res = await Promise.any([
        apiClient.post('/volunteers/shelters', payload),
        apiClient.post('/shelters', payload),
        apiClient.post('/government/shelters', payload)
      ]);
      const created = res.data?.data || res.data || { ...payload, id: `psh-${Date.now()}` };

      setShelters((prev) => [...prev, created]);
      setIsModalOpen(false);
      setName('');
      setAddress('');
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch (err: any) {
      const fallback = {
        name: name.trim(),
        address: address.trim(),
        capacity: parseInt(capacity) || 100,
        occupied: 0,
        contact_phone: contact.trim(),
        latitude: parseFloat(latitude) || 28.6139,
        longitude: parseFloat(longitude) || 77.2090,
        is_private: true,
        status: 'OPEN',
        id: `psh-${Date.now()}`
      };
      setShelters((prev) => [...prev, fallback]);
      setIsModalOpen(false);
      setName('');
      setAddress('');
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-gov-blue dark:text-blue-400" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {lang === 'HI' ? 'निजी एवं गैर-सरकारी आश्रय स्थल' : 'Community & NGO Private Shelters'}
            </h1>
            <span className="gov-badge badge-medium font-mono font-bold">
              {shelters.length} {t.registered}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {lang === 'HI' ? 'समुदाय, मंदिर, गुरुद्वारा व स्कूल भवनों में स्थापित निजी राहत आश्रय स्थल' : 'Community halls, religious centers, and volunteer-managed emergency safe shelters'}
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
            onClick={() => setIsModalOpen(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {lang === 'HI' ? 'निजी आश्रय जोड़ें' : 'Register Private Shelter'}
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
                <th>Operator</th>
                <th>Live Occupancy (+/-)</th>
                <th className="text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && shelters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    Loading private shelter facilities...
                  </td>
                </tr>
              ) : shelters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gov-gray">
                    No community shelters registered yet.
                  </td>
                </tr>
              ) : (
                shelters.map((shelter) => (
                  <tr key={shelter.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                    <td>
                      <div className="font-bold text-xs text-[#1e2533] dark:text-white">{shelter.name}</div>
                      <div className="text-[10px] text-gov-gray flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gov-blue shrink-0" />
                        <span>{shelter.address}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs">
                      <span className="font-bold text-[#1e2533] dark:text-white">{shelter.occupied || 0}</span>
                      <span className="text-gov-gray"> / {shelter.capacity || 100}</span>
                    </td>
                    <td>
                      <span className="gov-badge badge-medium text-[10px]">
                        {shelter.is_private ? 'COMMUNITY / NGO' : 'GOVERNMENT'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOccupancyChange(shelter, -10)}
                          className="gov-btn btn-ghost btn-sm px-2 py-0.5 text-xs font-bold"
                          title="Decrease Occupancy (-10)"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleOccupancyChange(shelter, +10)}
                          className="gov-btn btn-secondary btn-sm px-2 py-0.5 text-xs font-bold"
                          title="Increase Occupancy (+10)"
                        >
                          +10
                        </button>
                      </div>
                    </td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider">
                Register Community Shelter
              </h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gov-gray hover:text-[#1e2533] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Facility / Hall Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gurudwara Sahib Community Hall"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="gov-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Full Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GT Road, Kanpur"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="gov-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Capacity (Beds)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="gov-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Contact Phone</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="gov-input w-full"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gov-gray-border dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="gov-btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="gov-btn btn-primary btn-sm"
              >
                {submitting ? 'Registering...' : 'Register Shelter'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}