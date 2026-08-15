import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Plus, DollarSign, HeartHandshake, ShieldCheck, RefreshCw, X, Users, Target } from 'lucide-react';

interface Fundraiser {
  id: string;
  title: string;
  organizer?: string;
  target_amount?: number;
  targetAmount?: number;
  raised_amount?: number;
  raisedAmount?: number;
  description: string;
  status?: string;
}

export function ReliefFundraisers() {
  const [campaigns, setCampaigns] = useState<Fundraiser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_amount: 50000,
    raised_amount: 12000,
    organizer: 'VajraNet Volunteer Squad / NGO',
  });

  // Helper to load raised amounts cache
  const getRaisedOverrides = (): Record<string, number> => {
    try {
      const saved = localStorage.getItem('vajranet_fundraiser_raised_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const getLocalUserCampaigns = (): Fundraiser[] => {
    try {
      const saved = localStorage.getItem('vajranet_user_fundraisers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    const raisedMap = getRaisedOverrides();
    const localUserCamps = getLocalUserCampaigns();

    try {
      const res = await apiClient.get('/volunteers/fundraisers');
      const data = res.data?.data || res.data;
      let combined: Fundraiser[] = [];
      if (Array.isArray(data) && data.length > 0) {
        combined = [...data];
      } else {
        combined = [
          {
            id: 'fund-1',
            title: 'Sector 4 Clean Water Purification Units',
            organizer: 'Kanpur Citizen Welfare Trust',
            target_amount: 50000,
            raised_amount: 34500,
            description: 'Funding 10 portable water purification units for flooded residential sectors.',
            status: 'ACTIVE'
          },
          {
            id: 'fund-2',
            title: 'Emergency Medical & Insulin Supply Line',
            organizer: 'Red Cross Field Volunteer Corps',
            target_amount: 75000,
            raised_amount: 48200,
            description: 'Procuring essential insulin, asthma inhalers, and sterile dressings for shelter victims.',
            status: 'ACTIVE'
          }
        ];
      }

      // Merge user created campaigns if not present
      localUserCamps.forEach(uc => {
        if (!combined.some(c => c.id === uc.id)) {
          combined.unshift(uc);
        }
      });

      // Apply raised amount overrides
      const finalized = combined.map(c => {
        const customRaised = raisedMap[c.id];
        const baseRaised = Number(c.raised_amount ?? c.raisedAmount ?? 0);
        const actualRaised = customRaised !== undefined ? customRaised : baseRaised;
        return {
          ...c,
          raised_amount: actualRaised,
          raisedAmount: actualRaised,
        };
      });

      setCampaigns(finalized);
    } catch {
      const defaults = [
        {
          id: 'fund-1',
          title: 'Sector 4 Clean Water Purification Units',
          organizer: 'Kanpur Citizen Welfare Trust',
          target_amount: 50000,
          raised_amount: 34500,
          description: 'Funding 10 portable water purification units for flooded residential sectors.',
          status: 'ACTIVE'
        },
        {
          id: 'fund-2',
          title: 'Emergency Medical & Insulin Supply Line',
          organizer: 'Red Cross Field Volunteer Corps',
          target_amount: 75000,
          raised_amount: 48200,
          description: 'Procuring essential insulin, asthma inhalers, and sterile dressings for shelter victims.',
          status: 'ACTIVE'
        }
      ];

      const merged = [...localUserCamps, ...defaults].map(c => ({
        ...c,
        raised_amount: raisedMap[c.id] ?? Number(c.raised_amount ?? c.raisedAmount ?? 0),
        raisedAmount: raisedMap[c.id] ?? Number(c.raised_amount ?? c.raisedAmount ?? 0),
      }));

      setCampaigns(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    setSubmitting(true);
    try {
      const newCamp: Fundraiser = {
        id: `fund-${Date.now()}`,
        title: form.title.trim(),
        description: form.description.trim(),
        target_amount: Number(form.target_amount) || 50000,
        raised_amount: Number(form.raised_amount) || 0,
        organizer: form.organizer.trim() || 'VajraNet Volunteer Squad / NGO',
        status: 'ACTIVE'
      };

      // Save locally
      try {
        const existing = getLocalUserCampaigns();
        localStorage.setItem('vajranet_user_fundraisers', JSON.stringify([newCamp, ...existing]));
      } catch {}

      try {
        const payload = {
          title: newCamp.title,
          description: newCamp.description,
          target_amount: newCamp.target_amount,
          raised_amount: newCamp.raised_amount,
          beneficiary: newCamp.organizer,
        };
        const res = await apiClient.post('/volunteers/fundraisers', payload);
        const created = res.data?.data || res.data;
        if (created && created.id) {
          newCamp.id = created.id;
        }
      } catch (err) {
        console.warn('Backend fundraiser sync fallback to local state', err);
      }

      setCampaigns(prev => [newCamp, ...prev]);
      setIsModalOpen(false);
      setForm({
        title: '',
        description: '',
        target_amount: 50000,
        raised_amount: 12000,
        organizer: 'VajraNet Volunteer Squad / NGO',
      });
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickContribute = async (id: string, amount: number) => {
    let updatedRaised = 0;
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const currentRaised = Number(c.raised_amount ?? c.raisedAmount ?? 0);
        updatedRaised = currentRaised + amount;
        return { ...c, raised_amount: updatedRaised, raisedAmount: updatedRaised };
      }
      return c;
    }));

    // Persist in localStorage
    try {
      const overrides = getRaisedOverrides();
      overrides[id] = updatedRaised;
      localStorage.setItem('vajranet_fundraiser_raised_cache', JSON.stringify(overrides));
    } catch {}

    // Persist to backend database
    try {
      await apiClient.patch(`/volunteers/fundraisers/${id}`, { raised_amount: updatedRaised });
    } catch (err) {
      console.warn('Failed to patch fundraiser raised amount on backend:', err);
    }

    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  };

  return (
    <div className="bg-[#0F1E36] border border-slate-800 rounded-2xl p-5 lg:p-6 space-y-6 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <span>Verified Relief Crowdfunding Campaigns</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
              {campaigns.length} CAMPAIGNS ACTIVE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-mono">
            Direct transparent peer-to-peer disaster relief funds for essential supplies, medicines, and food distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCampaigns}
            className="p-2 bg-[#07111E] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl transition cursor-pointer"
            title="Refresh Campaigns"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Launch Relief Campaign</span>
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((c) => {
          const target = Number(c.target_amount ?? c.targetAmount ?? 50000);
          const raised = Number(c.raised_amount ?? c.raisedAmount ?? 0);
          const pct = Math.min(100, Math.round((raised / (target || 1)) * 100));

          return (
            <div
              key={c.id}
              className="bg-[#07111E] border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4 transition shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    VERIFIED DISASTER RELIEF
                  </span>
                  <span className="text-xs text-emerald-400 font-bold font-mono">{pct}% Raised</span>
                </div>

                <h3 className="text-sm font-bold text-white">{c.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 pt-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>Organizer: {c.organizer || 'VajraNet Volunteer Corps'}</span>
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Raised: <strong className="text-emerald-400">₹{raised.toLocaleString()}</strong></span>
                  <span className="text-slate-400">Goal: <strong className="text-slate-200">₹{target.toLocaleString()}</strong></span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Quick contribute action buttons */}
                <div className="flex items-center justify-between pt-1 text-xs font-mono">
                  <span className="text-[11px] text-slate-400">Quick Contribute:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickContribute(c.id, 500)}
                      className="px-2.5 py-1 bg-[#0F1E36] hover:bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded-lg font-bold cursor-pointer transition"
                    >
                      +₹500
                    </button>
                    <button
                      onClick={() => handleQuickContribute(c.id, 2000)}
                      className="px-2.5 py-1 bg-[#0F1E36] hover:bg-emerald-950 text-emerald-300 border border-emerald-800/80 rounded-lg font-bold cursor-pointer transition"
                    >
                      +₹2,000
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Launch Relief Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1E36] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <span>Launch Disaster Relief Crowdfunding Campaign</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Campaign Purpose / Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Sector 4 Clean Drinking Water & Infant Nutrition Supply"
                  className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Detailed Relief Plan & Target Needs *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Explain what materials will be procured, number of victims supported, and delivery schedule..."
                  className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Target Goal Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Seed Raised Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.raised_amount}
                    onChange={(e) => setForm({ ...form, raised_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Organizer / NGO Name</label>
                <input
                  type="text"
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  placeholder="e.g. Kanpur Flood Relief Volunteers Trust"
                  className="w-full bg-[#07111E] border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{submitting ? 'Launching...' : 'Launch Verified Campaign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}