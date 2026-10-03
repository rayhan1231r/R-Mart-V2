import React, { useState, useEffect } from 'react';
import {
  Palette,
  Check,
  Sun,
  Moon,
  Sparkles,
  X,
  ShoppingBag,
  Monitor,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAdminTheme, AdminThemeMode, AdminAccentColor } from '../../context/AdminThemeContext';
import { THEME_PRESETS, applyThemeToDom } from '../../lib/theme';
import { getSiteSettings, updateSiteSettings } from '../../lib/store';
import type { SiteSettings } from '../../types';

interface AdminThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'admin' | 'storefront';
}

export const AdminThemeCustomizer: React.FC<AdminThemeCustomizerProps> = ({
  isOpen,
  onClose,
  initialTab = 'admin',
}) => {
  const { theme, setMode, setAccent, accentStyles } = useAdminTheme();
  const [activeTab, setActiveTab] = useState<'admin' | 'storefront'>(initialTab);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [storeThemeName, setStoreThemeName] = useState<string>('emerald');
  const [storeCustomHex, setStoreCustomHex] = useState<string>('#10B981');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (isOpen) {
      getSiteSettings().then((s) => {
        setSiteSettings(s);
        setStoreThemeName(s.themeName || 'emerald');
        setStoreCustomHex(s.themeColor || '#10B981');
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modes: { id: AdminThemeMode; name: string; desc: string; icon: any; bg: string }[] = [
    { id: 'dark', name: 'Deep Dark (Default)', desc: 'Pure black obsidian aesthetic', icon: Moon, bg: 'bg-[#070A0D]' },
    { id: 'midnight', name: 'Midnight Navy', desc: 'Deep executive slate blue', icon: Moon, bg: 'bg-[#0B1120]' },
    { id: 'light', name: 'Executive Light', desc: 'Crisp, high-contrast white & slate', icon: Sun, bg: 'bg-[#F8FAFC]' },
    { id: 'cyber', name: 'Cyber Matrix', desc: 'Deep forest green darkness', icon: Sparkles, bg: 'bg-[#05130D]' },
  ];

  const accents: { id: AdminAccentColor; name: string; hex: string }[] = [
    { id: 'emerald', name: 'Emerald Green', hex: '#10b981' },
    { id: 'indigo', name: 'Royal Indigo', hex: '#6366f1' },
    { id: 'cyan', name: 'Ocean Cyan', hex: '#06b6d4' },
    { id: 'rose', name: 'Crimson Rose', hex: '#f43f5e' },
    { id: 'amber', name: 'Amber Gold', hex: '#f59e0b' },
    { id: 'purple', name: 'Luxury Violet', hex: '#a855f7' },
    { id: 'teal', name: 'Modern Teal', hex: '#14b8a6' },
  ];

  const handleSelectStorefrontPreset = async (presetId: string, hex: string) => {
    setStoreThemeName(presetId);
    setStoreCustomHex(hex);
    applyThemeToDom(presetId);
    if (siteSettings) {
      const updated: SiteSettings = {
        ...siteSettings,
        themeName: presetId as any,
        themeColor: hex,
      };
      setSiteSettings(updated);
      await updateSiteSettings(updated, 'admin');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleSaveStoreCustomHex = async () => {
    if (!storeCustomHex) return;
    applyThemeToDom(storeCustomHex);
    if (siteSettings) {
      const updated: SiteSettings = {
        ...siteSettings,
        themeName: 'custom',
        themeColor: storeCustomHex,
      };
      setSiteSettings(updated);
      await updateSiteSettings(updated, 'admin');
      setStoreThemeName('custom');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl rounded-3xl bg-[#0E1318] border border-white/10 p-6 sm:p-7 shadow-2xl text-white space-y-6 z-10 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-950 font-bold shadow-md transition-colors"
              style={{ backgroundColor: accentStyles.hex }}
            >
              <Palette className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Appearance & Theme Settings</h2>
              <p className="text-xs text-slate-400">
                অ্যাডমিন প্যানেল UI এবং কাস্টমার স্টোরের কালার থিম পরিবর্তন করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Admin Theme vs Storefront Theme */}
        <div className="flex p-1 bg-white/[0.04] border border-white/10 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'admin'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Admin Panel UI Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storefront')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'storefront'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Store Theme</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Theme settings saved and applied instantly!</span>
          </div>
        )}

        {/* TAB 1: ADMIN PANEL UI THEME */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            {/* 1. Theme Mode Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Admin Background Theme Mode
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {modes.map((m) => {
                  const Icon = m.icon;
                  const isActive = theme.mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        isActive
                          ? 'border-white/40 ring-2 ring-white/20 bg-white/10 shadow-lg'
                          : 'border-white/5 hover:border-white/20 bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full border border-white/20 ${m.bg}`} />
                          <Icon className="w-4 h-4 text-slate-300" />
                        </div>
                        {isActive && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{m.name}</h4>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{m.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Accent Color Palette */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>2. Admin Primary Accent Color</span>
                <span className="text-[11px] font-semibold" style={{ color: accentStyles.hex }}>
                  {accentStyles.name}
                </span>
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {accents.map((a) => {
                  const isSelected = theme.accent === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAccent(a.id)}
                      className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0E1318] scale-105 shadow-md'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: a.hex }}
                      title={a.name}
                    >
                      {isSelected && <Check className="w-4 h-4 text-slate-950 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Admin Preview */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Live Admin Element Preview
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg text-slate-950 font-bold text-xs shadow-sm transition-all"
                  style={{ backgroundColor: accentStyles.hex }}
                >
                  Action Button
                </button>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  style={{
                    backgroundColor: `${accentStyles.hex}18`,
                    color: accentStyles.hex,
                    borderColor: `${accentStyles.hex}40`,
                  }}
                >
                  Active Status Badge
                </span>
                <span className="text-xs font-mono font-bold" style={{ color: accentStyles.hex }}>
                  ৳ 12,450 BDT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STOREFRONT CUSTOMER THEME */}
        {activeTab === 'storefront' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Customer Storefront Brand Palette
                </label>
                <span className="text-[10px] text-slate-400">
                  কাস্টমার সাইটের হেডার, বাটন ও প্রাইস কালার
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {THEME_PRESETS.map((p) => {
                  const isSelected = storeThemeName === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectStorefrontPreset(p.id, p.hex)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-white/40 ring-2 ring-white/20 bg-white/10 shadow-lg'
                          : 'border-white/5 hover:border-white/20 bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="w-5 h-5 rounded-full shadow-sm" style={{ backgroundColor: p.hex }} />
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{p.name}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{p.hex}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Hex Color Picker */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Or Pick Custom Brand Hex Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={storeCustomHex?.startsWith('#') && storeCustomHex.length === 7 ? storeCustomHex : '#10B981'}
                  onChange={(e) => setStoreCustomHex(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                />
                <input
                  type="text"
                  value={storeCustomHex || '#10B981'}
                  onChange={(e) => setStoreCustomHex(e.target.value)}
                  placeholder="#10B981"
                  className="w-36 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSaveStoreCustomHex}
                  className="px-4 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Apply & Save</span>
                </button>
              </div>
            </div>

            {/* Live Storefront Component Preview */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Storefront Customer Card Preview
              </span>
              <div className="p-3 rounded-xl bg-white text-slate-900 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                    R Mart
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Premium Cotton Panjabi</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold" style={{ color: storeCustomHex }}>
                        ৳ 1,850
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">৳ 2,450</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-sm"
                  style={{ backgroundColor: storeCustomHex }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
