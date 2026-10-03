import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingDown, AlertTriangle, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiProfitReturnCalculator: React.FC = () => {
  const [sellingPrice, setSellingPrice] = useState('1450');
  const [cogs, setCogs] = useState('750');
  const [packagingCost, setPackagingCost] = useState('40');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('outside_dhaka');
  const [expectedReturnRate, setExpectedReturnRate] = useState('8');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('profit_calculator', {
        sellingPrice: Number(sellingPrice) || 1450,
        cogs: Number(cogs) || 750,
        packagingCost: Number(packagingCost) || 40,
        deliveryZone,
        expectedReturnRate: Number(expectedReturnRate) || 8,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI True Net Profit & Courier Return Loss Calculator</h2>
            <p className="text-xs text-slate-500">Calculate actual take-home net profit factoring in Steadfast COD commissions, parcel boxes, and two-way return losses.</p>
          </div>
        </div>
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Calculate Real Net Profit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (৳)</label>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Cost / COGS (৳)</label>
            <input
              type="number"
              value={cogs}
              onChange={(e) => setCogs(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Packaging (৳)</label>
              <input
                type="number"
                value={packagingCost}
                onChange={(e) => setPackagingCost(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Return Rate (%)</label>
              <input
                type="number"
                value={expectedReturnRate}
                onChange={(e) => setExpectedReturnRate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Destination</label>
            <select
              value={deliveryZone}
              onChange={(e: any) => setDeliveryZone(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="inside_dhaka">Inside Dhaka (৳60)</option>
              <option value="outside_dhaka">Outside Dhaka / Nationwide (৳120)</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Per Delivery Profit</span>
                  <span className="text-base font-bold text-emerald-600">৳{result.netProfitDelivered}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">({result.netMarginDelivered}% margin)</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Blended Net Profit</span>
                  <span className="text-base font-bold text-slate-900">৳{result.blendedNetProfit}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">({result.netMargin}% after returns)</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-rose-600 font-bold uppercase block mb-1">Loss Per Return</span>
                  <span className="text-base font-bold text-rose-600">-৳{result.lossPerReturn}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">2-way freight + box</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Break-Even Rate</span>
                  <span className="text-base font-bold text-amber-600">{result.breakEvenReturnRate}%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Max bearable return</span>
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>AI Business Margin Strategy:</span>
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {result.strategicAdvice}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1 font-mono">
                  <span>Courier: ৳{result.courierCost}</span>
                  <span>•</span>
                  <span>Steadfast 1% COD Fee: ৳{result.codFee}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Calculator className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Input your cost metrics and click "Calculate Real Net Profit" to audit true earnings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
