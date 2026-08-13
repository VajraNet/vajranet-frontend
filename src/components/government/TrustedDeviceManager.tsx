import React, { useState, useEffect } from 'react';
import { Smartphone, Plus, Trash2, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { governmentApi } from '../../api/government';

export const TrustedDeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'GOVERNMENT',
    latitude: 12.9716,
    longitude: 77.5946
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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
      setStatusMsg('✅ Trusted Relay Device registered successfully!');
      setFormData({ name: '', phone: '', role: 'GOVERNMENT', latitude: 12.9716, longitude: 77.5946 });
      setShowAddForm(false);
      loadTrustedDevices();
    } catch (err: any) {
      const serverErr = err.response?.data?.detail || err.message || 'Verify role permissions.';
      setStatusMsg(`❌ Failed to register device: ${serverErr}`);
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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Registered Trusted SMS Relay Devices</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Registered responder phone numbers receive 1-tap SMS emergency alerts from citizens with zero internet data.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Register Trusted Number'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className={`p-3 rounded-lg text-sm font-medium ${statusMsg.includes('✅') ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'}`}>
          {statusMsg}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleRegister} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-semibold text-white">Register Responder Device Phone Number</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Official / Station Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Police Station Relay"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Mobile Phone Number (SMS Target)</label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Responder Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="GOVERNMENT">Government Officer / Police Station</option>
                <option value="FIELD_LEAD">Disaster Relief Field Lead</option>
                <option value="VOLUNTEER">Registered Field Volunteer</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-lg transition"
          >
            {submitting ? 'Registering...' : 'Save Trusted Relay Phone Number'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8 text-slate-500">Loading trusted relay devices...</div>
      ) : devices.length === 0 ? (
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-8 text-center space-y-2">
          <Smartphone className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-300 font-semibold">No Trusted Relay Devices Registered</p>
          <p className="text-xs text-slate-500">Register police station or responder phone numbers to receive fallback SMS SOS alerts.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-bold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Station / Responder</th>
                <th className="py-3 px-4">SMS Phone Number</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {devices.map((device) => (
                <tr key={device.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-white">{device.name}</td>
                  <td className="py-3 px-4 font-mono text-emerald-400">{device.phone}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs font-semibold">
                      {device.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Relay
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(device.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 transition"
                      title="Deactivate Device"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
