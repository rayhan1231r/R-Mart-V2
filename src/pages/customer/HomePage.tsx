import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Layers,
  PhoneCall,
  Clock,
  Flame,
  Zap,
  CheckCircle2,
  Headphones,
  ShoppingBag,
  Star,
  Gift,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { ProductCard } from '../../components/customer/ProductCard';
import { QuickViewModal } from '../../components/customer/QuickViewModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Logo } from '../../components/common/Logo';
import { getProducts, getCategories, getBanners, getSiteSettings } from '../../lib/store';
import type { Product, Category, Banner, SiteSettings } from '../../types';

interface HomePageProps {
  navigate: (path: string) => void;
  settings?: SiteSettings | null;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, settings: propSettings }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [flashDeals, setFlashDeals] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(propSettings || null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync settings when prop updates
  useEffect(() => {
    if (propSettings) {
      setSettings(propSettings);
    }
  }, [propSettings]);

  // Listen to live settings updates
  useEffect(() => {
    const handleSettingsUpdated = (e: any) => {
      if (e?.detail) setSettings(e.detail);
    };
    window.addEventListener('rmart_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('rmart_settings_updated', handleSettingsUpdated);
  }, []);

  // Auto-cycle banners if more than 1
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Flash Sale countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [prods, cats, bans, setts] = await Promise.all([
          getProducts({ activeOnly: true }),
          getCategories(),
          getBanners(),
          getSiteSettings(),
        ]);

        setFeaturedProducts(prods.filter((p) => p.isFeatured));
        setNewArrivals(prods.slice(0, 8));
        // Flash deals: items with discount or sale price
        const deals = prods.filter((p) => Boolean(p.salePrice && p.salePrice < p.price));
        setFlashDeals(deals.length > 0 ? deals.slice(0, 6) : prods.slice(0, 6));
        setCategories(cats.filter((c) => c.isActive));
        setBanners(bans.filter((b) => b.isActive));
        setSettings(setts);
      } catch (err) {
        console.warn('Notice loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const uiStyle = settings?.uiStyle || 'marketplace';

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 bg-[#F8FAFC]">
      {/* ============================================================ */}
      {/* 1. HERO SECTION - BASED ON SELECTED UI STYLE               */}
      {/* ============================================================ */}

      {/* STYLE 1: DARAZ / ALIBABA MEGA MARKETPLACE (Default) */}
      {uiStyle === 'marketplace' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Categories Sidebar (Classic Daraz Style) */}
            <div className="hidden lg:block lg:col-span-3 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-3">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 mb-1">
                <span>Categories</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                  All
                </span>
              </div>
              <div className="space-y-0.5 text-xs font-medium text-slate-700">
                {categories.slice(0, 9).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/category/${cat.slug}`)}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
                <button
                  onClick={() => navigate('/shop')}
                  className="w-full text-left px-3 py-2 rounded-xl text-emerald-600 font-bold hover:bg-emerald-50 transition-colors text-xs pt-2 border-t border-slate-100"
                >
                  More Departments →
                </button>
              </div>
            </div>

            {/* Center Main Carousel Banner */}
            <div className="lg:col-span-9 flex flex-col gap-4">
              {banners.length > 0 ? (
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[320px] sm:min-h-[400px] shadow-md group flex flex-col justify-between">
                  {/* Banner Image Background */}
                  <img
                    src={banners[currentBannerIndex]?.imageUrl || '/logo.png'}
                    alt={banners[currentBannerIndex]?.title || 'Banner'}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                  />
                  {/* Dark gradient overlay for readable text */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-transparent pointer-events-none" />

                  <div className="space-y-4 max-w-xl relative z-10 p-8 sm:p-12 flex-1 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 backdrop-blur-md w-fit">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{settings?.storeName || 'R Mart'} Official Promotion</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
                      {banners[currentBannerIndex]?.title}
                    </h1>

                    {banners[currentBannerIndex]?.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg line-clamp-2">
                        {banners[currentBannerIndex].subtitle}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => navigate(banners[currentBannerIndex]?.buttonLink || '/shop')}
                        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center gap-2"
                      >
                        <span>{banners[currentBannerIndex]?.buttonText || 'Shop Now'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate('/track-order')}
                        className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/20 flex items-center gap-2 backdrop-blur-xs"
                      >
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span>Track Order</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom ticker row */}
                  <div className="p-4 sm:px-12 border-t border-white/15 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-4 relative z-10 bg-black/40 backdrop-blur-xs">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Cash on Delivery in 64 Districts</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                      <span>7 Days Easy Return Policy</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span>Hotline: {settings?.phone || '01619415744'}</span>
                    </span>
                  </div>

                  {/* Carousel Left/Right Controls if more than 1 banner */}
                  {banners.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all z-20 opacity-0 group-hover:opacity-100"
                        aria-label="Previous Slide"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentBannerIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all z-20 opacity-0 group-hover:opacity-100"
                        aria-label="Next Slide"
                      >
                        ›
                      </button>

                      {/* Dots indicator */}
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                        {banners.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCurrentBannerIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === currentBannerIndex ? 'w-5 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white min-h-[300px] sm:min-h-[380px] p-8 sm:p-12 flex flex-col justify-between shadow-md">
                  {/* Background decorative artwork */}
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent pointer-events-none" />

                  <div className="space-y-4 max-w-xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{settings?.storeName || 'R Mart'} Mega Marketplace</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.15]">
                      Up to <span className="text-emerald-400">60% Off</span> Lifestyle & Fashion
                    </h1>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                      {settings?.storeDescription || 'Discover genuine multi-category shopping on R Mart. Verified Bangladesh quality, doorstep Cash on Delivery, and 7-day hassle-free exchange.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => navigate('/shop')}
                        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center gap-2"
                      >
                        <span>Shop Mega Sale</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => navigate('/track-order')}
                        className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/20 flex items-center gap-2"
                      >
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span>Track Order</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom ticker row */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-4 relative z-10">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Cash on Delivery in 64 Districts</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                      <span>7 Days Easy Return Policy</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span>Hotline: {settings?.phone || '01619415744'}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* STYLE 2: AMAZON / FLIPKART CLEAN COMPACT GRID */}
      {uiStyle === 'compact' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="space-y-6">
            {/* Amazon Style Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-950 p-8 sm:p-14 text-white shadow-md relative overflow-hidden">
              <div className="max-w-2xl space-y-4">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/30">
                  Amazon & Flipkart Grid Edition
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                  Super Savings & Rapid Nationwide Dispatch
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-lg">
                  Shop top-rated apparel, smart accessories, home tools, and gadgets. Free delivery on orders over ৳2,500 with zero prepayment.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => navigate('/shop')}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all"
                  >
                    Explore Prime Catalog
                  </button>
                </div>
              </div>
            </div>

            {/* Department Multi-Tile Showcase (Amazon 4-box pattern) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Men's & Women's Fashion</h3>
                <div className="aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80"
                    alt="Fashion"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => navigate('/shop')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  See More Deals →
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Electronics & Smart Gadgets</h3>
                <div className="aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
                    alt="Gadgets"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => navigate('/shop')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Shop Gadgets →
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Everyday Lifestyle & Bags</h3>
                <div className="aspect-[4/3] rounded-xl bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80"
                    alt="Bags"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => navigate('/shop')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Discover Collections →
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-900 text-sm">Steadfast & RedX Courier</h3>
                <div className="aspect-[4/3] rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex flex-col justify-center text-center">
                  <Truck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-900">Doorstep COD Available</p>
                  <p className="text-[11px] text-slate-500">Dhaka: ৳70 · Outside: ৳130</p>
                </div>
                <button
                  onClick={() => navigate('/track-order')}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Track Parcel →
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* STYLE 3: MINIMAL LUXURY AESTHETIC BOUTIQUE */}
      {uiStyle === 'aesthetic' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-700">
              Curated Boutique Collection
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-light text-slate-900 tracking-tight leading-tight">
              Thoughtful Living, Crafted for Bangladesh
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Every piece in our catalog is hand-selected for enduring quality, aesthetic balance, and effortless everyday comfort.
            </p>
            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => navigate('/shop')}
                className="px-8 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md active:scale-95"
              >
                Browse Curations
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 2. 6 TRUST BADGES BAR (Daraz/Flipkart Verification Strip)     */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Doorstep COD</h4>
              <p className="text-[10px] text-slate-500">Pay cash on receipt</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Genuine</h4>
              <p className="text-[10px] text-slate-500">Verified authenticity</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">7 Days Return</h4>
              <p className="text-[10px] text-slate-500">Free easy replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Fast Shipping</h4>
              <p className="text-[10px] text-slate-500">Dhaka 24-48 hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Free Delivery</h4>
              <p className="text-[10px] text-slate-500">Orders &gt; ৳2,500</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Direct Support</h4>
              <p className="text-[10px] text-slate-500">{settings?.phone || '01619415744'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. FLASH SALE COUNTDOWN SECTION (Daraz Style)                 */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Mega Flash Deals</h2>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                    HOT
                  </span>
                </div>
                <p className="text-xs text-slate-500">Limited quantities at special discount prices</p>
              </div>
            </div>

            {/* Live countdown timer */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-slate-500 font-medium">Ends in:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold shadow-xs">
                {String(timeLeft.hours).padStart(2, '0')}h
              </span>
              <span>:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono font-bold shadow-xs">
                {String(timeLeft.minutes).padStart(2, '0')}m
              </span>
              <span>:</span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono font-bold shadow-xs">
                {String(timeLeft.seconds).padStart(2, '0')}s
              </span>
            </div>
          </div>

          {flashDeals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {flashDeals.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  navigate={navigate}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">No active flash deals right now.</div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CATEGORIES SHOWCASE GRID                                  */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
              Explore Departments
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Browse curated categories across {settings?.storeName || 'R Mart'}</p>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>See All ({categories.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/40 text-center cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col items-center justify-center shadow-xs"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                  {(cat.image || cat.imageUrl) ? (
                    <img src={cat.image || cat.imageUrl} alt={cat.name} className="w-10 h-10 object-contain rounded-lg" />
                  ) : (
                    <Layers className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate max-w-full">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-400 mt-0.5">Explore →</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No categories available yet.
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 5. FEATURED PRODUCTS GRID                                    */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
              Featured Trending Products
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop?filter=featured')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigate={navigate}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="products"
            title="No featured products yet"
            description="The administrator hasn't marked any products as featured yet. Check back soon or visit our complete catalog."
            actionLabel="Browse Full Shop"
            onAction={() => navigate('/shop')}
            adminHint="You can mark products as 'Featured' from Admin > Products"
          />
        )}
      </section>

      {/* ============================================================ */}
      {/* 6. COURIER & VALUE CALLOUT BANNER (Bangladeshi Logistics)     */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20">
              Steadfast · RedX · Pathao Logistics
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight">
              Zero Risk Shopping with Cash on Delivery
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Order your favorite apparel, electronics, and daily essentials across all 64 districts. You can open and inspect your parcel at your doorstep before handing payment to the courier rider.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                Shop Full Collection
              </button>
              <button
                onClick={() => navigate('/track-order')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/30 flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Track My Parcel</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. NEW ARRIVALS                                              */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5 fill-rose-500" />
              <span>Just Added</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
              Fresh New Arrivals
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop?sort=newest')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                navigate={navigate}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-1">New Arrivals Launching Soon</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              We are updating our catalog with seasonal collections.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-sm"
            >
              Browse Shop
            </button>
          </div>
        )}
      </section>
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        navigate={navigate}
      />
    </div>
  );
};
