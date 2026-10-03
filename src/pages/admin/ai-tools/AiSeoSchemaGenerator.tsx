import React, { useState } from 'react';
import { Search, Copy, Check, Sparkles, Loader2, Code, Globe, FileCode } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiSeoSchemaGenerator: React.FC = () => {
  const [productName, setProductName] = useState('Smart Fitness Watch with Bluetooth Calling');
  const [price, setPrice] = useState('2450');
  const [category, setCategory] = useState('Electronics & Gadgets');
  const [description, setDescription] = useState('HD AMOLED display, waterproof IP68, 7-day battery life, heart rate and sleep monitor.');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('seo_schema', {
        productName,
        price: Number(price) || 2450,
        category,
        description,
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
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI SEO Meta Tags & Schema.org Rich Snippets</h2>
            <p className="text-xs text-slate-500">Generate Google Bangladesh #1 rank-ready Meta Titles, Descriptions, OpenGraph tags, and JSON-LD Structured Data.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate SEO & Schema</span>
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price (৳)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Product Short Highlights</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Google SERP Preview Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Google Search Result Preview (Bangladesh)</span>
                <div className="text-xs text-emerald-700 font-mono">https://rmartofficial.shop › product › {productName.toLowerCase().replace(/\s+/g, '-').slice(0, 25)}</div>
                <h4 className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer">{result.metaTitle}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{result.metaDescription}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-600 font-medium">
                  <span>★★★★★</span>
                  <span>4.8 (24 reviews)</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-emerald-700 font-bold">BDT {price} in stock</span>
                </div>
              </div>

              {/* JSON-LD Schema */}
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5" />
                    <span>Schema.org JSON-LD (Rich Snippet):</span>
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(result.jsonLdSchema, null, 2), 'schema_json')}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300"
                  >
                    {copiedKey === 'schema_json' ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'schema_json' ? 'Copied' : 'Copy JSON-LD'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {JSON.stringify(result.jsonLdSchema, null, 2)}
                </pre>
              </div>

              {/* Focus Keywords */}
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-1.5">Recommended SEO Target Keywords:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.focusKeywords?.map((kw: string, i: number) => (
                    <span key={i} className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-1 rounded-md font-medium border border-sky-100">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Search className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Generate SEO & Schema" to create Google rich snippet meta tags.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
