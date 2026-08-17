import React, { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Plus, DollarSign, HeartHandshake, ShieldCheck, RefreshCw, X, Users, Target, Trash2 } from 'lucide-react';
import { TRANSLATIONS, Language } from '../../utils/translations';

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

interface ReliefFundraisersProps {
  lang?: Language;
}

export function ReliefFundraisers({ lang = 'EN' }: ReliefFundraisersProps) {
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

  const t = TRANSLATIONS[lang];

  const getRaisedOverrides = (): Record<string, number> => {
    try {
      const saved = localStorage.getItem('vajranet_fundraiser_raised_cache');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveRaisedOverride = (fundId: string, amount: number) => {
    try {
      const current = getRaisedOverrides();
      current[fundId] = amount;
      localStorage.setItem('vajranet_fundraiser_raised_cache', JSON.stringify(current));
    } catch {}
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

      localUserCamps.forEach(uc => {
        if (!combined.some(c => c.id === uc.id)) {
          combined.unshift(uc);
        }
      });

      const finalized = combined.map(c => {
        const customRaised = raisedMap[c.id];
        const baseRaised = Number(c.raised_amount ?? c.raisedAmount ?? 0);
        const actualRaised = customRaised !== undefined ? customRaised : baseRaised;
        return {
          ...c,
          raised_amount: actualRaised,
          raisedAmount: actualRaised,
          status: c.status || 'ACTIVE'
        };
      });

      setCampaigns(finalized);
    } catch {
      setCampaigns([
        {
          id: 'fund-1',
          title: 'Sector 4 Clean Water Purification Units',
          organizer: 'Kanpur Citizen Welfare Trust',
          target_amount: 50000,
          raised_amount: 34500,
          description: 'Funding 10 portable water purification units for flooded residential sectors.',
          status: 'ACTIVE'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleFundAdjustment = (camp: Fundraiser, delta: number) => {
    const target = Number(camp.target_amount ?? camp.targetAmount ?? 50000);
    const current = Number(camp.raised_amount ?? camp.raisedAmount ?? 0);
    const newAmount = Math.max(0, Math.min(target, current + delta));

    saveRaisedOverride(camp.id, newAmount);
    setCampaigns(prev =>
      prev.map(c => (c.id === camp.id ? { ...c, raised_amount: newAmount, raisedAmount: newAmount } : c))
    );
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  };

  const handleDeleteCampaign = (id: string) => {
    const localList = getLocalUserCampaigns().filter(c => c.id !== id);
    localStorage.setItem('vajranet_user_fundraisers', JSON.stringify(localList));

    setCampaigns(prev => prev.filter(c => c.id !== id));
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setSubmitting(true);
    const newCamp: Fundraiser = {
      id: `fund-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      target_amount: Number(form.target_amount),
      raised_amount: Number(form.raised_amount),
      organizer: form.organizer.trim(),
      status: 'ACTIVE'
    };

    try {
      await apiClient.post('/volunteers/fundraisers', newCamp);
    } catch (e) {}

    const localList = getLocalUserCampaigns();
    localList.unshift(newCamp);
    localStorage.setItem('vajranet_user_fundraisers', JSON.stringify(localList));

    setCampaigns(prev => [newCamp, ...prev]);
    setIsModalOpen(false);
    setForm({
      title: '',
      description: '',
      target_amount: 50000,
      raised_amount: 12000,
      organizer: 'VajraNet Volunteer Squad / NGO',
    });
    setSubmitting(false);
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-status-online" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {lang === 'HI' ? 'आपदा राहत सहायता अभियान' : 'Disaster Relief Fundraisers & Campaigns'}
            </h1>
            <span className="gov-badge badge-online font-mono font-bold">
              {campaigns.length} {lang === 'HI' ? 'सक्रिय अभियान' : 'ACTIVE CAMPAIGNS'}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {lang === 'HI' ? 'सत्यापित जनसहयोग एवं राहत सामग्री खरीद अभियान' : 'Community crowdfunding initiatives for direct procurement of food rations, medicines, and rescue boats'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchCampaigns} 
            className="gov-btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {lang === 'HI' ? 'नया अभियान शुरू करें' : 'Launch Relief Campaign'}
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="section-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Organizer / NGO</th>
                <th>Funds Raised / Goal</th>
                <th>Progress</th>
                <th>Adjust Raised</th>
                <th className="text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    Loading campaigns...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gov-gray">
                    No active relief campaigns found.
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => {
                  const target = Number(camp.target_amount ?? camp.targetAmount ?? 50000);
                  const raised = Number(camp.raised_amount ?? camp.raisedAmount ?? 0);
                  const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;

                  return (
                    <tr key={camp.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                      <td>
                        <div className="font-bold text-xs text-[#1e2533] dark:text-white">{camp.title}</div>
                        <p className="text-[11px] text-gov-gray mt-0.5 line-clamp-1">{camp.description}</p>
                      </td>
                      <td className="text-xs text-[#2d3748] dark:text-slate-300">
                        {camp.organizer || 'Community Trust'}
                      </td>
                      <td className="font-mono text-xs">
                        <span className="font-bold text-status-online">₹{raised.toLocaleString()}</span>
                        <span className="text-gov-gray"> / ₹{target.toLocaleString()}</span>
                      </td>
                      <td className="w-36">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-status-online rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono font-bold text-gov-gray">{pct}%</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleFundAdjustment(camp, -1000)}
                            className="gov-btn btn-ghost btn-sm px-2 py-0.5 text-xs font-bold"
                            title="Decrease Raised (-₹1000)"
                          >
                            -1k
                          </button>
                          <button
                            onClick={() => handleFundAdjustment(camp, 1000)}
                            className="gov-btn btn-secondary btn-sm px-2 py-0.5 text-xs font-bold"
                            title="Increase Raised (+₹1000)"
                          >
                            +1k
                          </button>
                        </div>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="text-gov-gray hover:text-severity-critical p-1 transition cursor-pointer"
                          title="Delete Campaign"
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

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateCampaign} className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider">
                Launch Relief Fundraiser
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
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Life Rafts for Flood Rescue"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="gov-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Organizer / Trust Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Cross Citizen Squad"
                  value={form.organizer}
                  onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  className="gov-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Funding Target (₹)</label>
                  <input
                    type="number"
                    value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })}
                    className="gov-input w-full font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Initial Seed (₹)</label>
                  <input
                    type="number"
                    value={form.raised_amount}
                    onChange={(e) => setForm({ ...form, raised_amount: Number(e.target.value) })}
                    className="gov-input w-full font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">Relief Purpose & Utilization</label>
                <textarea
                  rows={3}
                  placeholder="Specify how funds will be disbursed and audited..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="gov-input w-full"
                />
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
                {submitting ? 'Creating...' : 'Publish Campaign'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}