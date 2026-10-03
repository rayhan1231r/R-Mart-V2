import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Smartphone,
  Banknote,
  Building,
  HelpCircle,
  Copy,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethodStatus,
} from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { PaymentMethodConfig } from '../../types';

export const AdminPaymentMethods: React.FC = () => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [charge, setCharge] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [requiresTrxId, setRequiresTrxId] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [sortOrder, setSortOrder] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const list = await getPaymentMethods();
      setMethods(list);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openAddModal = () => {
    setEditingMethod(null);
    setName('');
    setCode('');
    setAccountNumber('');
    setDescription('');
    setInstructions('');
    setCharge(0);
    setIsActive(true);
    setRequiresTrxId(false);
    setIsDefault(false);
    setSortOrder(methods.length + 1);
    setModalOpen(true);
  };

  const openEditModal = (m: PaymentMethodConfig) => {
    setEditingMethod(m);
    setName(m.name);
    setCode(m.code);
    setAccountNumber(m.accountNumber || '');
    setDescription(m.description || '');
    setInstructions(m.instructions || '');
    setCharge(m.charge || 0);
    setIsActive(m.isActive);
    setRequiresTrxId(m.requiresTrxId || false);
    setIsDefault(m.isDefault || false);
    setSortOrder(m.sortOrder || 1);
    setModalOpen(true);
  };

  const handleNamePreset = (presetName: string, presetCode: string, isMobile: boolean) => {
    setName(presetName);
    setCode(presetCode);
    if (isMobile) {
      setRequiresTrxId(true);
      if (!accountNumber) setAccountNumber('01619415744');
      if (!description) setDescription(`Pay easily with ${presetName} mobile wallet.`);
      if (!instructions) {
        setInstructions(
          `1. Open your ${presetName} App\n2. Select "Send Money" to: 01619415744\n3. Enter exact Order Amount\n4. Submit your sender phone number and TrxID below.`
        );
      }
    } else {
      setRequiresTrxId(false);
      if (!description) setDescription('Pay securely upon delivery.');
      if (!instructions) setInstructions('Keep exact cash ready for the delivery courier.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        code: (code.trim() || name.toLowerCase().replace(/\s+/g, '-')).toLowerCase(),
        accountNumber: accountNumber.trim() || undefined,
        description: description.trim() || undefined,
        instructions: instructions.trim() || undefined,
        charge: Number(charge) || 0,
        isActive,
        requiresTrxId,
        isDefault,
        sortOrder: Number(sortOrder) || 1,
      };

      if (editingMethod) {
        await updatePaymentMethod(editingMethod.id, payload, user?.email);
        showToast(`Payment method "${name}" updated.`);
      } else {
        await createPaymentMethod(payload, user?.email);
        showToast(`Payment method "${name}" created.`);
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast('Error saving payment method: ' + (err?.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (m: PaymentMethodConfig) => {
    await togglePaymentMethodStatus(m.id, user?.email);
    showToast(`${m.name} is now ${!m.isActive ? 'Active' : 'Disabled'}.`);
    loadData();
  };

  const handleDelete = async (id: string) => {
    await deletePaymentMethod(id, user?.email);
    setDeleteConfirmId(null);
    showToast('Payment method deleted.');
    loadData();
  };

  const getMethodIcon = (code: string) => {
    const c = code.toLowerCase();
    if (c === 'cod') return <Banknote className="w-5 h-5 text-emerald-400" />;
    if (c.includes('bkash') || c.includes('nagad') || c.includes('rocket') || c.includes('upay')) {
      return <Smartphone className="w-5 h-5 text-rose-400" />;
    }
    if (c.includes('bank')) return <Building className="w-5 h-5 text-sky-400" />;
    return <CreditCard className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Payment Methods & Gateway Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure payment options offered to customers at checkout ({methods.length} methods configured)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Quick Info Banner */}
      <div className="p-4 rounded-2xl bg-[#0F141A] border border-white/[0.08] flex items-start gap-3 text-xs text-slate-300">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">How payment methods work in R Mart:</span>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            All active payment methods appear directly on the Customer Checkout page. For mobile payment methods (like bKash or Nagad), checking "Requires Transaction ID" will automatically prompt the customer to submit their sender phone number and TrxID after sending money to your account.
          </p>
        </div>
      </div>

      {/* Payment Methods Grid / Cards */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading payment options...</div>
      ) : methods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((m) => (
            <div
              key={m.id}
              className={`p-5 rounded-2xl border transition-all ${
                m.isActive
                  ? 'bg-[#0E1318] border-white/10 hover:border-emerald-500/30'
                  : 'bg-[#090C0F] border-white/5 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                    {getMethodIcon(m.code)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{m.name}</h3>
                      {m.isDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">Code: {m.code}</span>
                  </div>
                </div>

                {/* 1-Click Active Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggle(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    m.isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                  }`}
                  title="Click to toggle status"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      m.isActive ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  <span>{m.isActive ? 'Active' : 'Disabled'}</span>
                </button>
              </div>

              {/* Details */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2 text-xs">
                {m.accountNumber && (
                  <div className="flex items-center justify-between text-slate-300 bg-white/[0.02] p-2 rounded-lg font-mono">
                    <span className="text-slate-400">Account / Number:</span>
                    <span className="font-bold text-white">{m.accountNumber}</span>
                  </div>
                )}

                {m.description && (
                  <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                    {m.description}
                  </p>
                )}

                {m.instructions && (
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-slate-300 whitespace-pre-line line-clamp-3">
                    {m.instructions}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  {m.requiresTrxId ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Requires TrxID & Phone
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      No TrxID needed
                    </span>
                  )}

                  {m.charge && m.charge > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">
                      Extra Fee: ৳{m.charge}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                      Free (0 Fee)
                    </span>
                  )}

                  <span className="text-slate-500 ml-auto">Sort: #{m.sortOrder}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(m)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(m.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Payment Method"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-xs text-slate-400 space-y-3">
          <CreditCard className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No payment methods configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the "Add Payment Method" button above to add Cash on Delivery or Mobile Wallets.
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteConfirmId(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0E1318] border border-white/10 p-6 space-y-4 z-10 text-xs">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Payment Method?</h3>
            <p className="text-slate-400">
              Are you sure you want to delete this payment method? Customers will no longer be able to select it at checkout.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#0E1318] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
                </h2>
                <p className="text-slate-400 text-[11px]">
                  Configure gateway information and customer instructions
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            {!editingMethod && (
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 block">Quick Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleNamePreset('Cash on Delivery (COD)', 'cod', false)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold"
                  >
                    + Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNamePreset('bKash (Send Money)', 'bkash', true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-semibold"
                  >
                    + bKash
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNamePreset('Nagad (Send Money)', 'nagad', true)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold"
                  >
                    + Nagad
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNamePreset('Rocket', 'rocket', true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-semibold"
                  >
                    + Rocket
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNamePreset('Bank Transfer', 'bank', false)}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px] font-semibold"
                  >
                    + Bank Transfer
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Payment Method Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. bKash (Personal) / Cash on Delivery"
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    System Code / Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={code || ''}
                    onChange={(e) => setCode(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="e.g. bkash / cod / nagad"
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Account / Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={accountNumber || ''}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 01619415744"
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder ?? 1}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={description || ''}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Pay easily using your bKash Mobile Wallet."
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Customer Instructions (Shown at Checkout)
                </label>
                <textarea
                  rows={4}
                  value={instructions || ''}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Step-by-step instructions for the customer when this payment option is selected..."
                  className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <span>Active in Store</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!requiresTrxId}
                    onChange={(e) => setRequiresTrxId(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <span>Requires TrxID</span>
                </label>

                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded"
                  />
                  <span>Default Method</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingMethod
                    ? 'Update Payment Method'
                    : 'Save Payment Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
