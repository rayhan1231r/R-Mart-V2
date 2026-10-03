import React, { useState } from 'react';
import { Building2, Copy, Check, Sparkles, Loader2, FileText, Send } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiSupplierPurchaseOrder: React.FC = () => {
  const [supplierName, setSupplierName] = useState('Islam Garments & Textiles (Chawkbazar, Dhaka)');
  const [items, setItems] = useState('300 pcs Men Premium Panjabi (M, L, XL), Cotton Fabric');
  const [paymentTerms, setPaymentTerms] = useState('30% Advance, 70% upon warehouse QC inspection');
  const [deliveryDate, setDeliveryDate] = useState('7 Business Days');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('vendor_po', {
        supplierName,
        items,
        paymentTerms,
        deliveryDate,
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
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Supplier & Factory Purchase Order Drafter</h2>
            <p className="text-xs text-slate-500">Draft professional replenishment requisition orders with quality clauses for local wholesalers & factories.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Draft Purchase Order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Factory Name</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Products & Quantity Specifications</label>
            <textarea
              rows={2}
              value={items}
              onChange={(e) => setItems(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms</label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Lead Time</label>
            <input
              type="text"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">PO Number: {result.poNumber}</span>
                    <h4 className="text-xs font-bold text-slate-900">{result.poSubject}</h4>
                  </div>
                  <button
                    onClick={() => handleCopy(result.officialLetter, 'po_letter')}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    {copiedKey === 'po_letter' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'po_letter' ? 'Copied' : 'Copy Official Order'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-sans">
                  {result.officialLetter}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-slate-800 block">Quality Control Clauses:</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {result.termsAndConditions?.map((term: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{term}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Building2 className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Draft Purchase Order" to generate official wholesaler procurement documentation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
