import React, { useState } from 'react';
import { Target, Copy, Check, Sparkles, Loader2, TrendingUp, BarChart3 } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiCompetitorAnalysis: React.FC = () => {
  const [productName, setProductName] = useState('Wireless Noise Cancelling Earbuds Pro');
  const [ourPrice, setOurPrice] = useState('1450');
  const [category, setCategory] = useState('Consumer Electronics');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('competitor_analysis', {
        productName,
        ourPrice: Number(ourPrice) || 1450,
        category,
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
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Competitor Price Benchmarking & Market Positioning</h2>
            <p className="text-xs text-slate-500">Benchmark product pricing against Daraz, Pickaboo, and Facebook shops to optimize psychological price points.</p>
          </div>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Run Market Benchmark</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Selling Price (৳)</label>
            <input
              type="number"
              value={ourPrice}
              onChange={(e) => setOurPrice(e.target.value)}
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
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Market Budget Range</span>
                  <span className="text-sm font-bold text-slate-700">৳{result.estimatedMarketRange?.low}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Market Average</span>
                  <span className="text-sm font-bold text-violet-700">৳{result.estimatedMarketRange?.avg}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Premium Top Range</span>
                  <span className="text-sm font-bold text-slate-700">৳{result.estimatedMarketRange?.high}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Positioning Tier:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                    {result.pricingTier}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {result.pricingRecommendation}
                </p>
                <div className="text-xs font-semibold text-emerald-700 pt-1">
                  💡 Psychological Price Anchor: ৳{result.psychologicalPrice}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <BarChart3 className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Run Market Benchmark" to evaluate competitive positioning against the Bangladeshi market.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
