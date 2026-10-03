import React, { useState } from 'react';
import { MessageSquareText, Copy, Check, Sparkles, Loader2, AlertCircle, Send } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiCustomerDisputeResolver: React.FC = () => {
  const [scenario, setScenario] = useState<
    'courier_delay' | 'cancel_after_dispatch' | 'defective_wrong_item' | 'advance_delivery_charge'
  >('courier_delay');
  const [customerName, setCustomerName] = useState('Rahim Khan');
  const [orderNumber, setOrderNumber] = useState('RM-84920');
  const [extraDetails, setExtraDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerateReply = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('customer_dispute', {
        scenario,
        customerName,
        orderNumber,
        extraDetails,
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
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <MessageSquareText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Customer Support & Dispute Resolver</h2>
            <p className="text-xs text-slate-500">Generate polite, empathetic, brand-protecting replies in Bengali & English for delivery delays, returns, and disputes.</p>
          </div>
        </div>
        <button
          onClick={handleGenerateReply}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Support Reply</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Issue / Dispute Scenario</label>
            <select
              value={scenario}
              onChange={(e: any) => setScenario(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="courier_delay">🚚 Courier Delivery Delay (দেরিতে পৌঁছাচ্ছে)</option>
              <option value="cancel_after_dispatch">⚠️ Customer Wants to Cancel after Dispatch (পার্সেল পাঠানো হয়ে গেছে)</option>
              <option value="defective_wrong_item">🔄 Defective / Wrong Size Item Received (ভুল বা সমস্যাযুক্ত পণ্য)</option>
              <option value="advance_delivery_charge">💵 Inquiry about Advance Delivery Charge (অগ্রিম চার্জ প্রশ্ন)</option>
            </select>
          </div>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Order Number</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Extra Details / Context (Optional)</label>
            <textarea
              rows={2}
              value={extraDetails}
              onChange={(e) => setExtraDetails(e.target.value)}
              placeholder="e.g. Courier rider didn't call, or parcel in Mirpur hub"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Bengali Response */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">WhatsApp / Messenger Reply (বাংলা):</span>
                  <button
                    onClick={() => handleCopy(result.banglaReply, 'dispute_bn')}
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800"
                  >
                    {copiedKey === 'dispute_bn' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'dispute_bn' ? 'Copied' : 'Copy Bangla'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {result.banglaReply}
                </div>
              </div>

              {/* English Response */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Formal English Reply (Email / SMS):</span>
                  <button
                    onClick={() => handleCopy(result.englishReply, 'dispute_en')}
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800"
                  >
                    {copiedKey === 'dispute_en' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'dispute_en' ? 'Copied' : 'Copy English'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {result.englishReply}
                </div>
              </div>

              {/* Admin Action Advice */}
              <div className="bg-teal-50/70 border border-teal-200/80 p-3.5 rounded-xl text-xs text-teal-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Admin Operations Advice:</strong>
                  <span>{result.actionAdvice}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquareText className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Select a customer complaint scenario and generate an immediate polite resolution script.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
