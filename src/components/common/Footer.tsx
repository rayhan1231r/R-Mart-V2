import React from 'react';
import { Logo } from './Logo';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { SiteSettings } from '../../types';

interface FooterProps {
  settings?: SiteSettings | null;
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings: propSettings, navigate }) => {
  const [activeSettings, setActiveSettings] = React.useState<SiteSettings | null>(propSettings || null);
  const currentYear = new Date().getFullYear();

  React.useEffect(() => {
    if (propSettings) {
      setActiveSettings(propSettings);
    }
  }, [propSettings]);

  React.useEffect(() => {
    const handleUpdated = (e: any) => {
      if (e?.detail) {
        setActiveSettings(e.detail);
      }
    };
    window.addEventListener('rmart_settings_updated', handleUpdated);
    return () => window.removeEventListener('rmart_settings_updated', handleUpdated);
  }, []);

  const phone = activeSettings?.phone || '01619415744';
  const email = activeSettings?.email || 'ahmedskkawsar43@gmail.com';
  const whatsapp = activeSettings?.whatsapp || '01619415744';
  const storeName = activeSettings?.storeName || 'R Mart';

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 transition-colors">
      {/* Trust Badges Bar (Daraz/Amazon style) */}
      <div className="border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/80">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Nationwide Delivery</h4>
              <p className="text-[11px] text-slate-500">Dhaka 1-2 days, all 64 districts 3-5 days</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Cash on Delivery</h4>
              <p className="text-[11px] text-slate-500">Pay cash only after inspecting your parcel</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">7-Day Free Exchange</h4>
              <p className="text-[11px] text-slate-500">Hassle-free replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Customer Hotline</h4>
              <p className="text-[11px] text-slate-500">Direct phone & WhatsApp: {phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div onClick={() => navigate('/')} className="cursor-pointer inline-block">
              <Logo size="lg" logoUrl={activeSettings?.logoUrl} storeName={activeSettings?.storeName} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm">
              {activeSettings?.storeDescription ||
                `${storeName} is Bangladesh’s official multi-category shopping destination for fashion, electronics, gadgets and lifestyle essentials. Handpicked quality with dependable nationwide Cash on Delivery.`}
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-emerald-600 transition-colors font-semibold">
                  Hotline: {phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <a
                  href={`https://wa.me/880${whatsapp.replace(/^0+/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-600 transition-colors font-semibold"
                >
                  WhatsApp: {whatsapp} (Instant Chat)
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-emerald-600 transition-colors">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{settings?.address || 'Dhaka, Bangladesh · Official Distribution Hub'}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-emerald-600 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/shop')} className="hover:text-emerald-600 transition-colors">
                  Shop All Products
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/track-order')} className="hover:text-emerald-600 transition-colors">
                  Track Your Parcel
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/wishlist')} className="hover:text-emerald-600 transition-colors">
                  My Wishlist
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/account')} className="hover:text-emerald-600 transition-colors">
                  Customer Account
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => navigate('/shipping-policy')} className="hover:text-emerald-600 transition-colors">
                  Shipping & Courier Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/return-policy')} className="hover:text-emerald-600 transition-colors">
                  7-Day Return Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/size-guide')} className="hover:text-emerald-600 transition-colors">
                  Size Guide & Chart
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-emerald-600 transition-colors">
                  FAQs & Help Center
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-emerald-600 transition-colors">
                  Support & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Legal & Company</h4>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li>
                <button onClick={() => navigate('/privacy-policy')} className="hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/terms')} className="hover:text-emerald-600 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-emerald-600 transition-colors">
                  About R Mart Official
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with payment options */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} {settings?.storeName || 'R Mart'} ({settings?.domain || 'rmartofficial.shop'}). Bangladesh’s Verified Online Store. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] text-slate-600 font-medium">Payment Partners:</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200">
              Cash on Delivery (COD)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 font-bold text-[10px] border border-pink-200">
              bKash
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
              Nagad
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-[10px] border border-purple-200">
              Rocket
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
