import React, { useEffect, useState } from 'react';
import { Home, Plus, X, MapPin, Phone, Users, CheckCircle2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../api/client';

export function PrivateShelterManager() {
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
      console.warn('Failed to register private shelter:', err);
      // Optimistic local add
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
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-400" />
            <span>Community & NGO Private Shelters</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.2 rounded-full font-mono">
              {shelters.length} REGISTERED
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Register private halls, schools, religious centers, and NGO camps into the live emergency network.
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
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Shelter</span>
          </button>
        </div>
      </div>

      {/* Grid of Shelters */}
      {shelters.length === 0 && !loading ? (
        <div className="p-8 text-center bg-[#07111E] border border-slate-800 rounded-xl text-slate-400 text-xs font-mono">
          No private shelters registered yet. Click "Register Shelter" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelters.map((s) => (
            <div
              key={s.id}
              className="bg-[#07111E] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded border bg-emerald-950 text-emerald-400 border-emerald-800">
                    {s.status || 'OPEN'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">COMMUNITY FACILITY</span>
                </div>

                <h3 className="text-sm font-bold text-white mt-2.5">{s.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{s.address}</span>
                </p>
                {(s.contact || s.contact_phone) && (
                  <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{s.contact || s.contact_phone}</span>
                  </p>
                )}

                <div className="mt-4 bg-[#0F1E36] p-3 rounded-lg border border-slate-800 text-xs font-mono flex items-center justify-between">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="text-emerald-400 font-bold">
                    {s.capacity || s.total_capacity || 100} Beds Total
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-700 rounded-2xl p-6 max-w-md w-full text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold">Register Community / Private Shelter</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Facility Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rotary Club Relief Camp"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Community Hall Sector 4"
                  required
                  className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Capacity (Persons)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    required
                    className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    className="w-full bg-[#07111E] border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer"
                >
                  {submitting ? 'Registering...' : 'Register Shelter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}