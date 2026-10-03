import React, { useState, useEffect } from 'react';
import { FileText, Save, Check } from 'lucide-react';
import { getAllPages, updatePageContent } from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { PageContent } from '../../types';

export const AdminPages: React.FC = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('shipping-policy');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getAllPages().then((list) => {
      setPages(list);
      const match = list.find((p) => p.slug === selectedSlug) || list[0];
      if (match) {
        setSelectedSlug(match.slug);
        setContent(match.content || '');
        setTitle(match.title || '');
      }
    });
  }, []);

  const handleSelectPage = (slug: string) => {
    setSelectedSlug(slug);
    const p = pages.find((item) => item.slug === slug);
    if (p) {
      setContent(p.content || '');
      setTitle(p.title || '');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePageContent(selectedSlug, content, title, user?.email);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    const list = await getAllPages();
    setPages(list);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>Store Policies & Content Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Edit live copy for legal policies, sizing charts and about us
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved Live!' : 'Save Page Content'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation of Pages */}
        <div className="md:col-span-4 space-y-1 rounded-2xl bg-[#0F141A] border border-white/[0.06] p-3 text-xs">
          {pages.map((p) => (
            <button
              key={p.slug}
              onClick={() => handleSelectPage(p.slug)}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-medium transition-all ${
                selectedSlug === p.slug
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Content Editor */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Page Title</label>
            <input
              type="text"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-semibold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Markdown / Prose Body
            </label>
            <textarea
              rows={16}
              value={content || ''}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-xl bg-white/[0.04] border border-white/10 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
