import React, { useState } from 'react';
import { Calendar, Sparkles, Copy, Check, Loader2, Tag, CheckCircle2, ShoppingBag } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiFestivalCampaignPlanner: React.FC = () => {
  const [festival, setFestival] = useState<'eid_ul_fitr' | 'pohela_boishakh' | 'winter_sale'>('eid_ul_fitr');
  const [focusCategory, setFocusCategory] = useState('Panjabi, Sarees, Clothing & Accessories');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handlePlan = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('festival_planner', { festival, focusCategory });
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
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Seasonal & Festival Mega Campaign Planner</h2>
            <p className="text-xs text-slate-500">Plan 360° promotional events for Eid-ul-Fitr, Pohela Boishakh, Winter Blast, and 11.11 shopping festivals.</p>
          </div>
        </div>
        <button
          onClick={handlePlan}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Festival Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Upcoming Festival / Season</label>
            <select
              value={festival}
              onChange={(e: any) => setFestival(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="eid_ul_fitr">🌙 ঈদ-উল-ফিতর মেগা শপিং (Eid-ul-Fitr)</option>
              <option value="pohela_boishakh">🌺 পহেলা বৈশাখ মেলা (Pohela Boishakh)</option>
              <option value="winter_sale">❄️ উইন্টার সেল ব্লাস্ট (Winter Clearance)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Focus Department / Category</label>
            <input
              type="text"
              value={focusCategory}
              onChange={(e) => setFocusCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{result.campaignName}</h3>
                  <p className="text-xs text-rose-600 font-semibold mt-0.5">{result.slogan}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Coupon: {result.recommendedCoupon}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Discount & Offer Mechanics:</span>
                  <p className="text-slate-600">{result.discountIdea}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-1">Projected Business Impact:</span>
                  <p className="text-emerald-700 font-bold">{result.expectedAovImpact}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">360° Multi-Channel Action Checklist:</span>
                <div className="space-y-1.5">
                  {result.multiChannelChecklist?.map((step: string, i: number) => (
                    <div key={i} className="text-xs text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Calendar className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Select an upcoming Bangladeshi festival to generate a promotional rollout roadmap.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
