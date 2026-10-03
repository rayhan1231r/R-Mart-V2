import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Phone,
  Truck,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  MapPin,
  Clock,
} from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getCategories, getSiteSettings } from '../../lib/store';
import type { Category, SiteSettings } from '../../types';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenSearch?: () => void;
  settings?: SiteSettings | null;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate, onOpenSearch, settings: propSettings }) => {
  const { cartCount, cartSubtotal, setIsCartOpen, wishlist } = useCart();
  const { user, isAdmin, logout } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(propSettings || null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [categoriesDropdown, setCategoriesDropdown] = useState(false);

  useEffect(() => {
    if (propSettings) {
      setSettings(propSettings);
    }
  }, [propSettings]);

  useEffect(() => {
    getCategories().then(setCategories);
    if (!propSettings) {
      getSiteSettings().then(setSettings);
    }

    const handleSettingsUpdated = (e: any) => {
      if (e?.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('rmart_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('rmart_settings_updated', handleSettingsUpdated);
  }, [propSettings]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop All', path: '/shop' },
    { label: 'Track Order', path: '/track-order' },
    { label: 'About Us', path: '/about' },
    { label: 'Customer Care', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-colors">
      {/* Top Utility & Announcement Bar (Clean Light Marketplace Style) */}
      <div className="bg-slate-100 text-slate-700 text-xs py-1.5 px-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            {settings?.announcementBarActive && (
              <>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate font-semibold text-slate-800">{settings.announcementBarText}</span>
              </>
            )}
            {!settings?.announcementBarActive && (
              <span className="text-slate-700 truncate font-medium">
                <strong className="text-slate-900">{settings?.storeName || 'R Mart'} Bangladesh</strong> · Official Multi-Category E-Commerce Marketplace
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-600 shrink-0 text-[11px]">
            {/* ONLY show Admin Panel button to logged-in admins */}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold transition-colors"
                title="Management Console"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Console</span>
              </button>
            )}

            <button
              onClick={() => navigate('/track-order')}
              className="hidden sm:flex items-center gap-1 hover:text-emerald-700 transition-colors font-medium"
            >
              <Truck className="w-3 h-3 text-emerald-600" />
              <span>Track Order</span>
            </button>

            <span className="hidden sm:inline text-slate-300">|</span>

            <a
              href={`tel:${settings?.phone || '01619415744'}`}
              className="flex items-center gap-1 hover:text-emerald-700 transition-colors font-mono font-semibold text-slate-700"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>{settings?.phone || '01619415744'}</span>
            </a>

            <span className="text-slate-300">|</span>
            <span className="font-bold text-slate-900">৳ BDT</span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 sm:gap-6">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="cursor-pointer shrink-0 transition-transform active:scale-95"
          >
            <Logo size="md" logoUrl={settings?.logoUrl} storeName={settings?.storeName} />
          </div>

          {/* High-Converting Marketplace Search Bar (Amazon / Daraz style) */}
          <div className="hidden sm:flex flex-1 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search in R Mart... (e.g. T-Shirt, Smart Watch, Headphone, Bag)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-24 rounded-xl bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                />
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-4 sm:px-5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* User Controls & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Mobile search toggle */}
            <button
              onClick={() => {
                if (onOpenSearch) onOpenSearch();
                else navigate('/shop');
              }}
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Search products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              className="relative p-2.5 text-slate-700 hover:text-emerald-600 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Wishlist"
              title="My Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 font-semibold text-xs border border-emerald-500/20 transition-all active:scale-95 shadow-xs"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 min-w-4.5 h-4.5 px-1 rounded-full bg-emerald-600 text-white font-extrabold text-[10px] flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-mono font-bold text-slate-900">
                ৳{cartSubtotal.toLocaleString()}
              </span>
            </button>

            {/* Customer / Admin Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 p-2 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-100 transition-colors"
                aria-label="User Account"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                  {user ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-600" />}
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <div className="text-[10px] text-slate-500 font-medium leading-tight">
                    {user ? (isAdmin ? 'Admin' : 'Welcome') : 'Sign In'}
                  </div>
                  <div className="font-semibold text-slate-800 truncate max-w-[90px]">
                    {user ? user.name : 'Account'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
              </button>

              {accountMenuOpen && (
                <div
                  onMouseLeave={() => setAccountMenuOpen(false)}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 text-slate-800"
                >
                  {user ? (
                    <>
                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                          {isAdmin && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px] font-bold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      {/* ONLY show Admin Console link inside profile if isAdmin is true */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            navigate('/admin');
                            setAccountMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors flex items-center justify-between bg-emerald-50/50 mb-1 border border-emerald-200"
                        >
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Admin Management Panel</span>
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          navigate('/account');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                      >
                        My Profile & Orders
                      </button>

                      <button
                        onClick={() => {
                          navigate('/track-order');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                      >
                        Track My Parcel
                      </button>

                      <button
                        onClick={() => {
                          navigate('/wishlist');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                      >
                        Saved Wishlist ({wishlist.length})
                      </button>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setAccountMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900">Welcome to R Mart</p>
                        <p className="text-[11px] text-slate-500">Sign in to view orders & track parcels</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/account');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-xs text-center"
                      >
                        Sign In / Register
                      </button>
                      <button
                        onClick={() => {
                          navigate('/track-order');
                          setAccountMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium mt-1"
                      >
                        Quick Parcel Tracking
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Header Category Navigation Row (Marketplace Style) */}
      <div className="hidden lg:block border-t border-slate-200/80 bg-slate-50/70 text-slate-700 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-10">
          <div className="flex items-center gap-6">
            {/* Categories Mega Dropdown button */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdown(!categoriesDropdown)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-emerald-500/10 text-emerald-800 font-bold hover:bg-emerald-500/20 transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>All Departments</span>
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              </button>

              {categoriesDropdown && (
                <div
                  onMouseLeave={() => setCategoriesDropdown(false)}
                  className="absolute top-full left-0 mt-1 w-64 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in"
                >
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Categories
                  </div>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          navigate(`/category/${cat.slug}`);
                          setCategoriesDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:text-emerald-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between font-medium"
                      >
                        <span>{cat.name}</span>
                        <ArrowRight className="w-3 h-3 opacity-40" />
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-500">No categories found.</div>
                  )}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        navigate('/shop');
                        setCategoriesDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-emerald-600 font-bold hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      Browse Entire Catalog →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Department Links */}
            {navLinks.map((link) => {
              const active = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`py-1 transition-colors hover:text-emerald-600 ${
                    active ? 'text-emerald-600 font-bold' : 'text-slate-700'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            <button
              onClick={() => navigate('/shop')}
              className="py-1 text-slate-700 hover:text-emerald-600 transition-colors flex items-center gap-1 font-semibold text-rose-600"
            >
              <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Flash Deals</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fast 64-District Courier</span>
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>100% Authentic Guaranteed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 animate-in slide-in-from-top-2 text-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <input
              type="text"
              placeholder="Search products in R Mart..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <div className="space-y-1 font-medium text-sm">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                  currentPath === link.path
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            <button
              onClick={() => {
                navigate('/shop');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>All Products & Categories</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                navigate('/wishlist');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>My Wishlist ({wishlist.length})</span>
              <Heart className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => {
                navigate('/account');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>{user ? `Account (${user.name})` : 'Sign In / Register'}</span>
              <User className="w-4 h-4 text-slate-400" />
            </button>

            {/* If Admin logged in on mobile */}
            {isAdmin && (
              <button
                onClick={() => {
                  navigate('/admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-between mt-2 border border-emerald-200"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Management Panel</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
