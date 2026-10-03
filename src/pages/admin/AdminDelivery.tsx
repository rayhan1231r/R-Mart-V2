import React, { useState, useEffect } from 'react';
import { Truck, Plus, Trash2, Save, Check } from 'lucide-react';
import { getDeliveryZones, updateDeliveryZones } from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { DeliveryZone } from '../../types';

export const AdminDelivery: React.FC = () => {
  const { user } = useAuth();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getDeliveryZones().then((list) => {
      setZones(list);
      setLoading(false);
    });
  }, []);

  const handleFieldChange = (index: number, field: keyof DeliveryZone, value: any) => {
    const updated = [...zones];
    updated[index] = { ...updated[index], [field]: value };
    setZones(updated);
  };

  const handleAddZone = () => {
    const newZone: DeliveryZone = {
      id: 'zone_' + Date.now(),
      name: 'New Custom Zone',
      charge: 100,
      minOrderForFreeDelivery: 3000,
      estimatedDays: '2 - 3 Business Days',
      isActive: true,
    };
    setZones([...zones, newZone]);
  };

  const handleRemoveZone = (index: number) => {
    const updated = zones.filter((_, i) => i !== index);
    setZones(updated);
  };

  const handleSaveAll = async () => {
    await updateDeliveryZones(zones, user?.email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-emerald-400" />
            <span>Delivery Zones & Courier Rates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure shipping fees, estimated courier delivery windows and free shipping thresholds
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddZone}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Zone</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Saved Changes!' : 'Save All Zones'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone, idx) => (
          <div
            key={zone.id}
            className="p-5 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">Zone #{idx + 1}</span>
              {zones.length > 1 && (
                <button
                  onClick={() => handleRemoveZone(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Remove zone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Zone Name</label>
              <input
                type="text"
                value={zone.name || ''}
                onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Shipping Fee (৳ BDT)</label>
                <input
                  type="number"
                  min={0}
                  value={zone.charge ?? 0}
                  onChange={(e) => handleFieldChange(idx, 'charge', Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Free Delivery Over (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={zone.minOrderForFreeDelivery ?? ''}
                  onChange={(e) =>
                    handleFieldChange(
                      idx,
                      'minOrderForFreeDelivery',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="e.g. 2500"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Estimated Days</label>
              <input
                type="text"
                value={zone.estimatedDays || ''}
                onChange={(e) => handleFieldChange(idx, 'estimatedDays', e.target.value)}
                placeholder="e.g. 1 - 2 Business Days"
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
              <input
                type="checkbox"
                id={`zoneActive_${idx}`}
                checked={!!zone.isActive}
                onChange={(e) => handleFieldChange(idx, 'isActive', e.target.checked)}
                className="w-4 h-4 text-emerald-500 rounded"
              />
              <label htmlFor={`zoneActive_${idx}`} className="text-slate-300 cursor-pointer">
                Zone Active in Checkout
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
