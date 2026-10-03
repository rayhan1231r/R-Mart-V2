import React, { useState } from 'react';
import { Gift, Copy, Check, Sparkles, Loader2, QrCode, Heart } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiUnboxingNoteDrafter: React.FC = () => {
  const [brandName, setBrandName] = useState('R Mart Official');
  const [discountCode, setDiscountCode] = useState('REPEAT10');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [supportPhone, setSupportPhone] = useState('01619415744');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('unboxing_note', {
        brandName,
        discountCode,
        discountPercent: Number(discountPercent) || 10,
        supportPhone,
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
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center font-bold">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Packing Slip & Delivery Box Thank-You Note Drafter</h2>
            <p className="text-xs text-slate-500">Turn one-time buyers into loyal repeat customers with charming unboxing cards and VIP re-order promo codes.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Unboxing Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Discount (%)</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Support Phone</label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Bangla Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-600" />
                    <span>Unboxing Box Thank-You Note (বাংলা):</span>
                  </span>
                  <button
                    onClick={() => handleCopy(result.thankYouCardBangla, 'unboxing_bn')}
                    className="flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:text-pink-800"
                  >
                    {copiedKey === 'unboxing_bn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'unboxing_bn' ? 'Copied' : 'Copy Bangla Card'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {result.thankYouCardBangla}
                </div>
              </div>

              {/* English Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">English Thank-You Insert:</span>
                  <button
                    onClick={() => handleCopy(result.thankYouCardEnglish, 'unboxing_en')}
                    className="flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:text-pink-800"
                  >
                    {copiedKey === 'unboxing_en' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'unboxing_en' ? 'Copied' : 'Copy English Card'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {result.thankYouCardEnglish}
                </div>
              </div>

              {/* Social Tagging & QR */}
              <div className="bg-pink-50/70 border border-pink-100 p-3 rounded-xl text-xs text-pink-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-pink-600 shrink-0" />
                <span>{result.reviewCallout}</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Gift className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Generate Unboxing Note" to draft print-ready customer appreciation inserts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
