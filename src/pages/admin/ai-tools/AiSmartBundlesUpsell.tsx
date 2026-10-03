import React, { useState } from 'react';
import { Layers, Copy, Check, Sparkles, Loader2, Plus, ArrowRight, Tag } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiSmartBundlesUpsell: React.FC = () => {
  const [primaryProduct, setPrimaryProduct] = useState('Premium Combed Cotton T-Shirt');
  const [price, setPrice] = useState('650');
  const [category, setCategory] = useState('Fashion');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('smart_bundles', {
        primaryProduct,
        price: Number(price) || 650,
        category,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Smart Bundles & Upsell Engine</h2>
            <p className="text-xs text-slate-500">Create high-margin "Frequently Bought Together" combo packs and checkout drawer impulse add-ons.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Bundles & Combos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Anchor Product</label>
            <input
              type="text"
              value={primaryProduct}
              onChange={(e) => setPrimaryProduct(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Unit Price (৳)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Duo Bundle */}
              {result.duoBundle && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{result.duoBundle.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                      Save {result.duoBundle.discountPercent}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-slate-900">৳{result.duoBundle.bundlePrice}</span>
                    <span className="text-xs line-through text-slate-400">৳{result.duoBundle.regularPrice}</span>
                    <span className="text-xs font-semibold text-emerald-600">(কাস্টমার সেভ করবে ৳{result.duoBundle.savings})</span>
                  </div>
                  <p className="text-xs text-slate-600">{result.duoBundle.items.join(' + ')}</p>
                </div>
              )}

              {/* Trio Bundle */}
              {result.trioBundle && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{result.trioBundle.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                      Save {result.trioBundle.discountPercent}% + Free Shipping
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-slate-900">৳{result.trioBundle.bundlePrice}</span>
                    <span className="text-xs line-through text-slate-400">৳{result.trioBundle.regularPrice}</span>
                    <span className="text-xs font-semibold text-emerald-600">(কাস্টমার সেভ করবে ৳{result.trioBundle.savings})</span>
                  </div>
                </div>
              )}

              {/* Checkout Impulse Addons */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Recommended Checkout Add-ons (High Margin):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.impulseAddons?.map((addon: any, i: number) => (
                    <div key={i} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{addon.name}</span>
                        <span className="text-[10px] text-slate-500">{addon.reason}</span>
                      </div>
                      <span className="text-xs font-bold text-purple-700">+৳{addon.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Layers className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Generate Bundles & Combos" to craft profitable product pairing offers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
