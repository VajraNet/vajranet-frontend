import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, Trash2, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, X, Search, Phone, MapPin } from 'lucide-react';
import { governmentApi } from '../../api/government';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface TrustedDeviceManagerProps {
  lang?: Language;
}

export const TrustedDeviceManager: React.FC<TrustedDeviceManagerProps> = ({ lang = 'EN' }) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'GOVERNMENT',
    latitude: 28.6139,
    longitude: 77.2090
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    loadTrustedDevices();
  }, []);

  const loadTrustedDevices = async () => {
    setLoading(true);
    try {
      const data = await governmentApi.getTrustedDevices();
      setDevices(data);
    } catch (err) {
      console.error('Failed to load trusted devices', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitting(true);
    setStatusMsg(null);
    try {
      await governmentApi.registerTrustedDevice(formData);
      setStatusMsg(lang === 'HI' ? '✅ विश्वसनीय रिले नंबर सफलतापूर्वक पंजीकृत किया गया!' : '✅ Trusted Relay Device registered successfully!');
      setFormData({ name: '', phone: '', role: 'GOVERNMENT', latitude: 28.6139, longitude: 77.2090 });
      setShowAddForm(false);
      loadTrustedDevices();
    } catch (err: any) {
      const serverErr = err.response?.data?.detail || err.message || 'Verify permissions.';
      setStatusMsg(`❌ Failed: ${serverErr}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await governmentApi.deleteTrustedDevice(id);
      loadTrustedDevices();
    } catch (err) {
      console.error('Failed to delete trusted device', err);
    }
  };

  const filteredDevices = devices.filter((d) =>
    (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.role || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-status-online" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {t.trustedDevicesTitle}
            </h1>
            <span className="gov-badge badge-online font-mono font-bold">
              {devices.length} {t.registered}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {t.trustedDevicesSubtext}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadTrustedDevices} 
            className="gov-btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {t.addTrustedNumber}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded text-xs font-medium ${statusMsg.includes('✅') ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
          {statusMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="section-card p-3 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-gov-gray absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search responder station, phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="gov-input pl-8 py-1 text-xs w-full"
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="section-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t.thStationDevice}</th>
                <th>{t.thPhoneNumber}</th>
                <th>{t.thRole}</th>
                <th>{t.thRelayStatus}</th>
                <th className="text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && devices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    Loading trusted responder registry...
                  </td>
                </tr>
              ) : filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gov-gray">
                    No registered trusted relay numbers found.
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                    <td className="font-semibold text-xs text-[#1e2533] dark:text-white">
                      {device.name}
                    </td>
                    <td className="font-mono text-xs text-gov-blue-dark dark:text-blue-300">
                      {device.phone}
                    </td>
                    <td>
                      <span className="gov-badge badge-resolved text-[10px]">
                        {device.role || 'GOVERNMENT'}
                      </span>
                    </td>
                    <td>
                      <span className="gov-badge badge-online text-[10px]">
                        {t.activeRelay}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="text-gov-gray hover:text-severity-critical p-1 transition cursor-pointer"
                        title="Remove trusted device"
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

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRegister} className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider">
                {t.addTrustedNumber}
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gov-gray hover:text-[#1e2533] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'थाना / अधिकारी का नाम *' : 'Station / Responder Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kanpur Police Command Relay"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="gov-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'आपातकालीन फोन नंबर *' : 'Emergency Phone Number *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="gov-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                    {lang === 'HI' ? 'नामित भूमिका' : 'Role Category'}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="gov-input w-full"
                  >
                    <option value="GOVERNMENT">Government EOC</option>
                    <option value="POLICE">Police Command</option>
                    <option value="FIRE">Fire & Rescue</option>
                    <option value="MEDICAL">Medical Ambulance</option>
                    <option value="VOLUNTEER">Volunteer Lead</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="gov-input w-full font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gov-gray-border dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="gov-btn btn-ghost btn-sm"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="gov-btn btn-primary btn-sm"
              >
                {submitting ? 'Saving...' : t.saveRelayNumber}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
