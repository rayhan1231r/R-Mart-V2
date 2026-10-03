import React, { useState } from 'react';
import { Video, Copy, Check, Sparkles, Loader2, Pin, Flame } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiFbLiveScript: React.FC = () => {
  const [productName, setProductName] = useState('Exclusive Eid Special Silk Embroidered Panjabi');
  const [price, setPrice] = useState('1650');
  const [specialLiveDiscount, setSpecialLiveDiscount] = useState('৳১৫০ লাইভ ডিসকাউন্ট');
  const [stockQuantity, setStockQuantity] = useState('15');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('fb_live_script', {
        productName,
        price: Number(price) || 1650,
        specialLiveDiscount,
        stockQuantity: Number(stockQuantity) || 15,
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
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center font-bold">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Facebook Live Shopping Script & Pitch Generator</h2>
            <p className="text-xs text-slate-500">Generate high-energy live sales scripts, scroll-stopping hooks, scarcity countdowns, and pinned comments.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Live Script</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Featured Product</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Live Price (৳)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Left</label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Special Live Offer</label>
            <input
              type="text"
              value={specialLiveDiscount}
              onChange={(e) => setSpecialLiveDiscount(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Opening Hook */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>0-30 Second Scroll-Stopping Hook:</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">{result.introHook}</p>
              </div>

              {/* Showcase & Pitch */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-800">Product Demonstration & Fabric Touch:</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">{result.productShowcase}</p>
              </div>

              {/* Scarcity & Call to action */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-amber-700">Urgency Scarcity & Live Ordering Call:</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">{result.scarcityUrgency}</p>
              </div>

              {/* Pin Comment */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Pin className="w-3 h-3 text-red-500" />
                    <span>Facebook Live Pinned Comment:</span>
                  </span>
                  <button
                    onClick={() => handleCopy(result.pinCommentTemplate, 'fb_pin')}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800"
                  >
                    {copiedKey === 'fb_pin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'fb_pin' ? 'Copied' : 'Copy Pin Comment'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 bg-red-50/50 p-2 rounded-lg border border-red-100 font-sans">
                  {result.pinCommentTemplate}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Video className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Generate Live Script" to create an engaging Facebook Live selling pitch.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
