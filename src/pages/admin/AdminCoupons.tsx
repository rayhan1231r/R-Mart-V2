import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, X, Calendar, DollarSign, Percent } from 'lucide-react';
import { getCoupons, createCoupon, deleteCoupon } from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { Coupon } from '../../types';

export const AdminCoupons: React.FC = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>(1000);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<number | undefined>(500);
  const [expiryDate, setExpiryDate] = useState('');
  const [usageLimit, setUsageLimit] = useState<number | undefined>(100);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const list = await getCoupons();
      setCoupons(list);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountValue <= 0) return;

    await createCoupon(
      {
        code: code.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        isActive: true,
      },
      user?.email
    );

    setModalOpen(false);
    setCode('');
    setActionSuccess('Coupon created successfully!');
    setTimeout(() => setActionSuccess(null), 3000);
    loadCoupons();
  };

  const handleDelete = async (id: string, codeName: string) => {
    setDeletingId(id);
    // Optimistic UI update so row vanishes immediately
    setCoupons((prev) => prev.filter((c) => c.id !== id && c.code !== id));
    setConfirmDeleteId(null);

    try {
      await deleteCoupon(id, user?.email);
      setActionSuccess(`Coupon "${codeName}" deleted successfully!`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      console.error('Delete coupon error:', err);
    } finally {
      setDeletingId(null);
      await loadCoupons();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-emerald-400" />
            <span>Coupons & Discount Promotions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure promo codes, threshold requirements and usage caps
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Promo Coupon</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Notice about 1-time per user limit */}
      <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
        <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong>1-Time Per User Policy Enforced:</strong> Each customer / phone number / email can only redeem any given coupon code <strong>once</strong> across all orders.
        </span>
      </div>

      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading coupons...</div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400">
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount</th>
                  <th className="py-3 px-4">Min Spend</th>
                  <th className="py-3 px-4">Max Discount</th>
                  <th className="py-3 px-4">Usage Limit</th>
                  <th className="py-3 px-4">Used By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{c.code}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">1x per user limit</span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : `৳${c.discountValue} FLAT OFF`}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {c.minOrderAmount ? `৳${c.minOrderAmount}` : 'None'}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {c.maxDiscountAmount ? `৳${c.maxDiscountAmount}` : 'None'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {c.usageLimit ? `${c.usageLimit} total` : 'Unlimited'}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-mono">
                      <span className="font-bold">{c.usedCount}</span>
                      {c.usedBy && c.usedBy.length > 0 && (
                        <span className="text-[10px] text-slate-400 block">({c.usedBy.length} users)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {confirmDeleteId === c.id ? (
                        <div className="flex items-center justify-end gap-1.5 animate-in fade-in">
                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            disabled={deletingId === c.id}
                            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors"
                          >
                            {deletingId === c.id ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-slate-300 text-[11px] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(c.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <Tag className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Coupons Configured</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create coupons to offer promotional campaigns to your customers during checkout.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0E1318] border border-white/10 p-6 space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create New Coupon</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RMART10 / WELCOME50"
                  value={code || ''}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Discount Type</label>
                  <select
                    value={discountType || 'percentage'}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-[#080B0E] border border-white/10 text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed BDT (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue ?? ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Min Order Amount (৳)</label>
                  <input
                    type="number"
                    value={minOrderAmount ?? ''}
                    onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 1000"
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Discount Cap (৳)</label>
                  <input
                    type="number"
                    value={maxDiscountAmount ?? ''}
                    onChange={(e) => setMaxDiscountAmount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 500"
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={usageLimit ?? ''}
                  onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 100 uses"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
