import React, { useState } from 'react';
import { Megaphone, Copy, Check, RefreshCw, Loader2, Sparkles, Video, Target, TrendingUp } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiAdCampaignCreator: React.FC = () => {
  const [productName, setProductName] = useState('Premium Polo Shirt (100% Combed Cotton)');
  const [price, setPrice] = useState('850');
  const [offer, setOffer] = useState('Buy 2 Get 1 Free Delivery');
  const [category, setCategory] = useState('Men Fashion');
  const [targetPlatform, setTargetPlatform] = useState<'facebook' | 'instagram' | 'tiktok'>('facebook');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('ad_campaign', {
        productName,
        price: Number(price) || 850,
        offer,
        category,
        targetPlatform,
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Meta Ads & TikTok Campaign Creator</h2>
            <p className="text-xs text-slate-500">Generate high-converting Facebook/Instagram ad copy, TikTok video hooks, and Bangladesh interest targeting.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Ad Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (৳)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Platform</label>
              <select
                value={targetPlatform}
                onChange={(e: any) => setTargetPlatform(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="facebook">Facebook Ads</option>
                <option value="instagram">Instagram Ads</option>
                <option value="tiktok">TikTok / Reels</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Special Offer / Angle</label>
            <input
              type="text"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g. 20% Off or Free Delivery"
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
              {/* Meta Primary Text */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Facebook & Instagram Ad Copy:</span>
                  </span>
                  <button
                    onClick={() => handleCopy(result.primaryText, 'ad_primary')}
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedKey === 'ad_primary' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'ad_primary' ? 'Copied' : 'Copy Ad Text'}</span>
                  </button>
                </div>
                <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-sans">
                  {result.primaryText}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                    <span className="font-bold text-indigo-900">Headline: </span>
                    <span className="text-indigo-800">{result.headline}</span>
                  </div>
                  <div className="bg-indigo-50/60 p-2 rounded-lg border border-indigo-100">
                    <span className="font-bold text-indigo-900">CTA Button: </span>
                    <span className="text-indigo-800">{result.cta}</span>
                  </div>
                </div>
              </div>

              {/* TikTok / Reels Script */}
              {result.tiktokScript && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-rose-500" />
                      <span>TikTok & Reels 15s Video Concept:</span>
                    </span>
                    <button
                      onClick={() => handleCopy(`${result.tiktokScript.hook}\n\nVisual: ${result.tiktokScript.visual}\nAudio: ${result.tiktokScript.audio}`, 'tiktok')}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      {copiedKey === 'tiktok' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Script</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-900 block mb-1">0-3s Hook:</span>
                      <p className="text-slate-600 text-[11px]">{result.tiktokScript.hook}</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-900 block mb-1">Visual Direction:</span>
                      <p className="text-slate-600 text-[11px]">{result.tiktokScript.visual}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Targeting & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <Target className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Meta Targeting Interests (BD):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.targetInterests?.map((item: string, i: number) => (
                      <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Recommended Budget & Test:</span>
                  </span>
                  <p className="text-xs text-slate-700 font-semibold">{result.budgetRecommendation}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Megaphone className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Configure product parameters and click "Generate Ad Campaign" to create ready-to-run Meta & TikTok ad sets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
