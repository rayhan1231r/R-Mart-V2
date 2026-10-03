import React, { useState, useEffect } from 'react';
import { ChevronRight, Phone, MessageCircle, Mail } from 'lucide-react';
import { getPages, getSiteSettings } from '../../lib/store';
import type { PageContent, SiteSettings } from '../../types';

interface StaticPageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const StaticPage: React.FC<StaticPageProps> = ({ slug, navigate }) => {
  const [page, setPage] = useState<PageContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getPages().then((pages: PageContent[]) => {
      const found = pages.find((p: PageContent) => p.slug === slug);
      setPage(found || null);
    });
    getSiteSettings().then(setSettings);
  }, [slug]);

  const phone = settings?.phone || '01619415744';
  const email = settings?.email || 'ahmedskkawsar43@gmail.com';
  const whatsapp = settings?.whatsapp || '01619415744';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigate('/')} className="hover:text-emerald-700 transition-colors font-medium">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold capitalize">{page?.title || slug.replace('-', ' ')}</span>
      </nav>

      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
          {page?.title || slug.replace('-', ' ')}
        </h1>
        {page?.lastUpdated && (
          <p className="text-xs text-slate-400 mt-1">
            Last updated: {new Date(page.lastUpdated).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Main Content Body */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4 whitespace-pre-line">
        {page?.content || 'This page content is currently being prepared.'}
      </div>

      {/* Contact Cards if on Contact or Support page */}
      {(slug === 'contact' || slug === 'about') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold">Direct Call</div>
              <a href={`tel:${phone}`} className="text-xs font-bold text-slate-900 hover:text-emerald-700">
                {phone}
              </a>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold">WhatsApp Chat</div>
              <a
                href={`https://wa.me/880${whatsapp.replace(/^0+/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-900 hover:text-emerald-700"
              >
                {whatsapp}
              </a>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-semibold">Email Support</div>
              <a href={`mailto:${email}`} className="text-xs font-bold text-slate-900 hover:text-emerald-700 truncate block">
                {email}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
