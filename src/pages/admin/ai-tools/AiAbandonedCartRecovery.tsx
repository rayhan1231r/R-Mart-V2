import React, { useState } from 'react';
import { ShoppingCart, Copy, Check, Sparkles, Loader2, Clock, Send, MessageCircle } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiAbandonedCartRecovery: React.FC = () => {
  const [customerName, setCustomerName] = useState('Nusrat Jahan');
  const [itemsSummary, setItemsSummary] = useState('2x Designer Kurti + Silk Scarf');
  const [totalAmount, setTotalAmount] = useState('2350');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('abandoned_cart', {
        customerName,
        itemsSummary,
        totalAmount: Number(totalAmount) || 1450,
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
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Abandoned Cart Recovery Sequences</h2>
            <p className="text-xs text-slate-500">Recover up to 40% of lost checkouts with psychological 3-stage WhatsApp & SMS urgency messages.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Sequences</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Items Left in Cart</label>
            <input
              type="text"
              value={itemsSummary}
              onChange={(e) => setItemsSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cart Total Amount (৳)</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Stage 1 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Stage 1: Friendly Reminder (1 Hour After Cart Abandonment)</span>
                  </span>
                  <button
                    onClick={() => handleCopy(result.stage1_whatsapp, 's1')}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 hover:text-cyan-800"
                  >
                    {copiedKey === 's1' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 's1' ? 'Copied' : 'Copy WhatsApp'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{result.stage1_whatsapp}</p>
              </div>

              {/* Stage 2 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Stage 2: Free Delivery Incentive (12 Hours Later)</span>
                  </span>
                  <button
                    onClick={() => handleCopy(result.stage2_whatsapp, 's2')}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 hover:text-cyan-800"
                  >
                    {copiedKey === 's2' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 's2' ? 'Copied' : 'Copy WhatsApp'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{result.stage2_whatsapp}</p>
              </div>

              {/* Stage 3 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-rose-500" />
                    <span>Stage 3: Final Urgency & Stock Expiry (24 Hours Later)</span>
                  </span>
                  <button
                    onClick={() => handleCopy(result.stage3_whatsapp, 's3')}
                    className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 hover:text-cyan-800"
                  >
                    {copiedKey === 's3' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 's3' ? 'Copied' : 'Copy WhatsApp'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{result.stage3_whatsapp}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <ShoppingCart className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Generate Sequences" to draft high-converting 3-stage cart recovery messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
