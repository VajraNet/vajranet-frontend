import React, { useEffect, useState } from 'react';
import { Package, Plus, CheckCircle2, XCircle, RefreshCw, MapPin, Phone, X, Trash2 } from 'lucide-react';
import { governmentApi } from '../../api/government';
import { TRANSLATIONS, Language } from '../../utils/translations';

interface ResourceReliefProps {
  lang?: Language;
}

export function ResourceRelief({ lang = 'EN' }: ResourceReliefProps) {
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [itemsAvailable, setItemsAvailable] = useState('Clean Water Packets, Ration Kits, Medical First Aid, Blankets');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    fetchReliefCenters();
  }, []);

  async function fetchReliefCenters() {
    setLoading(true);
    try {
      const data = await governmentApi.getReliefCenters();
      if (Array.isArray(data)) {
        setCenters(data);
      } else {
        setCenters([]);
      }
    } catch {
      setCenters([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await governmentApi.deleteReliefCenter(id);
    } catch (e) {
      console.warn('Deleted locally:', e);
    }
    setCenters((prev) => prev.filter((c) => c.id !== id));
    window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
  }

  async function handleCreateReliefCenter(e: React.FormEvent) {
    e.preventDefault();
    const itemsList = itemsAvailable.split(',').map(s => s.trim()).filter(Boolean);
    const payload: any = {
      name,
      address,
      latitude: 28.6139 + (Math.random() - 0.5) * 0.02,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.02,
      items_available: itemsList.length > 0 ? itemsList : ['Ration Kits', 'Clean Water', 'First Aid'],
      status: 'OPEN',
      contact_person: contactPerson || 'Relief Officer Incharge',
    };

    try {
      const created = await governmentApi.createReliefCenter(payload);
      setCenters((prev) => [...prev, created]);
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } catch {
      const fallbackCreated = {
        ...payload,
        id: `rc-${Date.now()}`,
      };
      setCenters((prev) => [...prev, fallbackCreated]);
      window.dispatchEvent(new CustomEvent('vajranet_data_updated'));
    } finally {
      setShowAddModal(false);
      setName('');
      setAddress('');
      setContactPerson('');
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 section-card p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-gov-blue dark:text-blue-400" />
            <h1 className="text-base font-bold text-[#1e2533] dark:text-white uppercase tracking-wider">
              {t.reliefTitle}
            </h1>
            <span className="gov-badge badge-medium font-mono font-bold">
              {centers.length} {t.activeDepots}
            </span>
          </div>
          <p className="text-xs text-gov-gray dark:text-slate-400 mt-0.5">
            {t.reliefSubtext}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={fetchReliefCenters} 
            className="gov-btn btn-ghost btn-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> {t.refresh}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="gov-btn btn-primary btn-sm"
          >
            <Plus className="w-3.5 h-3.5" /> {t.establishDepot}
          </button>
        </div>
      </div>

      {/* Relief Centers Table */}
      <div className="section-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t.thDepotHub}</th>
                <th>{t.thStockpileItems}</th>
                <th>{t.thOfficerInCharge}</th>
                <th>{t.status}</th>
                <th className="text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading && centers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gov-gray">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-gov-blue" />
                    Loading relief depot inventory...
                  </td>
                </tr>
              ) : centers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gov-gray">
                    No relief supply depots established yet.
                  </td>
                </tr>
              ) : (
                centers.map((center) => {
                  let items: string[] = [];
                  if (Array.isArray(center.items_available)) {
                    items = center.items_available;
                  } else if (typeof center.items_available === 'string') {
                    try {
                      items = JSON.parse(center.items_available);
                    } catch {
                      items = center.items_available.split(',').map((s: string) => s.trim());
                    }
                  }

                  return (
                    <tr key={center.id} className="hover:bg-gov-blue-faint/60 dark:hover:bg-slate-800/40">
                      
                      {/* Name & Address */}
                      <td>
                        <div className="font-semibold text-xs text-[#1e2533] dark:text-white">
                          {center.name}
                        </div>
                        <div className="text-[10px] text-gov-gray flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-gov-blue shrink-0" />
                          <span>{center.address}</span>
                        </div>
                      </td>

                      {/* Items Stockpiled */}
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {items.map((item, idx) => (
                            <span key={idx} className="gov-badge badge-resolved text-[10px]">
                              {item}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="text-xs text-[#2d3748] dark:text-slate-300">
                        {center.contact_person || 'District Relief Officer'}
                      </td>

                      {/* Status */}
                      <td>
                        <span className="gov-badge badge-online">
                          {t.distributionReady}
                        </span>
                      </td>

                      {/* Delete Action */}
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(center.id)}
                          className="text-gov-gray hover:text-severity-critical p-1 transition cursor-pointer"
                          title="Delete Relief Depot"
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

      {/* Add Relief Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreateReliefCenter}
            className="bg-white dark:bg-[#151e2e] border border-gov-gray-border dark:border-slate-800 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gov-gray-border dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-[#1e2533] dark:text-white uppercase tracking-wider">
                {t.establishDepot}
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
                  {lang === 'HI' ? 'डिपो / केंद्र का नाम *' : 'Depot Hub Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 4 Central Relief Depot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="gov-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'स्थान व वितरण बिंदु *' : 'Address / Distribution Point *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Near Railway Colony Ground"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="gov-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'उपलब्ध राहत सामग्री (कॉमा से अलग करें)' : 'Supplies Stockpiled (Comma Separated)'}
                </label>
                <input
                  type="text"
                  value={itemsAvailable}
                  onChange={(e) => setItemsAvailable(e.target.value)}
                  className="gov-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gov-gray-dark dark:text-slate-300">
                  {lang === 'HI' ? 'प्रभारी अधिकारी का नाम' : 'Officer In-Charge Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Officer S. Verma"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="gov-input w-full"
                />
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
                {t.establishDepot}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}