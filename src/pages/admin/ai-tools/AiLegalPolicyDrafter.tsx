import React, { useState } from 'react';
import { Scale, Copy, Check, Sparkles, Loader2, ShieldCheck, FileText } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiLegalPolicyDrafter: React.FC = () => {
  const [policyType, setPolicyType] = useState<'return_refund' | 'cod_inspection' | 'shipping' | 'privacy'>('return_refund');
  const [storeName, setStoreName] = useState('R Mart Official');
  const [helpline, setHelpline] = useState('01619415744');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('legal_policy', {
        policyType,
        storeName,
        helpline,
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
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI E-Commerce Legal Policy & Terms Drafter</h2>
            <p className="text-xs text-slate-500">Generate Bangladesh Consumer Rights (DNCRP) compliant 7-day return policies, COD delivery rules, and privacy agreements.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Draft Store Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Policy Category</label>
            <select
              value={policyType}
              onChange={(e: any) => setPolicyType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="return_refund">🔄 7-Day Return & Replacement Policy</option>
              <option value="cod_inspection">📦 Cash on Delivery & Inspection Policy</option>
              <option value="shipping">🚚 Shipping Timelines & Tracking Policy</option>
              <option value="privacy">🔒 Privacy Policy & Data Protection</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Helpline Phone Number</label>
            <input
              type="text"
              value={helpline}
              onChange={(e) => setHelpline(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{result.policyTitle}</h4>
                  <button
                    onClick={() => handleCopy(result.policyContentBangla, 'pol_bn')}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-800"
                  >
                    {copiedKey === 'pol_bn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pol_bn' ? 'Copied' : 'Copy Bangla Policy'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {result.policyContentBangla}
                </div>
              </div>

              {/* English Version */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">English Version:</span>
                  <button
                    onClick={() => handleCopy(result.policyContentEnglish, 'pol_en')}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-800"
                  >
                    {copiedKey === 'pol_en' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'pol_en' ? 'Copied' : 'Copy English Policy'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {result.policyContentEnglish}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Scale className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Select a policy topic to draft official compliant terms ready to paste into your store policy pages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
