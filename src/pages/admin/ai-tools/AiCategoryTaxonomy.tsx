import React, { useState } from 'react';
import { Tags, Copy, Check, Sparkles, Loader2, FolderTree, Search } from 'lucide-react';
import { callAiSuiteAction } from '../../../lib/store';

export const AiCategoryTaxonomy: React.FC = () => {
  const [productName, setProductName] = useState('Men Casual Semi-Fitting Embroidered Cotton Panjabi');
  const [description, setDescription] = useState('Breathable lightweight fabric for Eid festival and prayer wear.');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await callAiSuiteAction('category_taxonomy', {
        productName,
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
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <Tags className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Category, Filter & Search Synonyms Generator</h2>
            <p className="text-xs text-slate-500">Auto-generate taxonomy, e-commerce filter attributes (Size, Fabric, Fit), and colloquial Bangladeshi search keywords.</p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Generate Taxonomy</span>
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Brief Description</label>
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
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-2 text-xs">
                <FolderTree className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-bold text-slate-800">{result.primaryCategory}</span>
                <span className="text-slate-400">›</span>
                <span className="text-teal-700 font-semibold">{result.subCategory}</span>
              </div>

              {/* Attributes */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">E-Commerce Filter Attributes:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(result.attributes || {}).map(([key, val]: any, i) => (
                    <div key={i} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">{key}</span>
                      <span className="font-semibold text-slate-800">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synonyms */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-teal-600" />
                  <span>Bangladeshi Search Query Synonyms:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.searchSynonyms?.map((syn: string, i: number) => (
                    <span key={i} className="text-[10px] bg-teal-50 text-teal-700 px-2.5 py-1 rounded-md font-medium border border-teal-100">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Tags className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-xs font-medium">Click "Generate Taxonomy" to structure categories, attributes, and search tags.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
