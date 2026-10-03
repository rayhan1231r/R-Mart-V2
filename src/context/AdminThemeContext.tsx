import React, { createContext, useContext, useState, useEffect } from 'react';

export type AdminThemeMode = 'dark' | 'midnight' | 'light' | 'cyber';
export type AdminAccentColor = 'emerald' | 'indigo' | 'cyan' | 'rose' | 'amber' | 'purple' | 'teal';

interface AdminThemeSettings {
  mode: AdminThemeMode;
  accent: AdminAccentColor;
}

interface AdminThemeContextType {
  theme: AdminThemeSettings;
  setMode: (mode: AdminThemeMode) => void;
  setAccent: (accent: AdminAccentColor) => void;
  accentStyles: {
    name: string;
    hex: string;
    bgClass: string;
    hoverBgClass: string;
    textClass: string;
    borderClass: string;
    ringClass: string;
    badgeBg: string;
    badgeText: string;
  };
}

const DEFAULT_THEME: AdminThemeSettings = {
  mode: 'dark',
  accent: 'emerald',
};

const ACCENT_MAP: Record<AdminAccentColor, {
  name: string;
  hex: string;
  bgClass: string;
  hoverBgClass: string;
  textClass: string;
  borderClass: string;
  ringClass: string;
  badgeBg: string;
  badgeText: string;
}> = {
  emerald: {
    name: 'Emerald Green',
    hex: '#10b981',
    bgClass: 'bg-emerald-500',
    hoverBgClass: 'hover:bg-emerald-600',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/40',
    ringClass: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
  },
  indigo: {
    name: 'Royal Indigo',
    hex: '#6366f1',
    bgClass: 'bg-indigo-600',
    hoverBgClass: 'hover:bg-indigo-700',
    textClass: 'text-indigo-400',
    borderClass: 'border-indigo-500/40',
    ringClass: 'focus:border-indigo-500 focus:ring-indigo-500/20',
    badgeBg: 'bg-indigo-500/10',
    badgeText: 'text-indigo-400',
  },
  cyan: {
    name: 'Ocean Cyan',
    hex: '#06b6d4',
    bgClass: 'bg-cyan-500',
    hoverBgClass: 'hover:bg-cyan-600',
    textClass: 'text-cyan-400',
    borderClass: 'border-cyan-500/40',
    ringClass: 'focus:border-cyan-500 focus:ring-cyan-500/20',
    badgeBg: 'bg-cyan-500/10',
    badgeText: 'text-cyan-400',
  },
  rose: {
    name: 'Crimson Rose',
    hex: '#f43f5e',
    bgClass: 'bg-rose-500',
    hoverBgClass: 'hover:bg-rose-600',
    textClass: 'text-rose-400',
    borderClass: 'border-rose-500/40',
    ringClass: 'focus:border-rose-500 focus:ring-rose-500/20',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-400',
  },
  amber: {
    name: 'Amber Gold',
    hex: '#f59e0b',
    bgClass: 'bg-amber-500',
    hoverBgClass: 'hover:bg-amber-600',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/40',
    ringClass: 'focus:border-amber-500 focus:ring-amber-500/20',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
  },
  purple: {
    name: 'Luxury Violet',
    hex: '#a855f7',
    bgClass: 'bg-purple-600',
    hoverBgClass: 'hover:bg-purple-700',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/40',
    ringClass: 'focus:border-purple-500 focus:ring-purple-500/20',
    badgeBg: 'bg-purple-500/10',
    badgeText: 'text-purple-400',
  },
  teal: {
    name: 'Modern Teal',
    hex: '#14b8a6',
    bgClass: 'bg-teal-500',
    hoverBgClass: 'hover:bg-teal-600',
    textClass: 'text-teal-400',
    borderClass: 'border-teal-500/40',
    ringClass: 'focus:border-teal-500 focus:ring-teal-500/20',
    badgeBg: 'bg-teal-500/10',
    badgeText: 'text-teal-400',
  },
};

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AdminThemeSettings>(() => {
    try {
      const saved = localStorage.getItem('rmart_admin_theme');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_THEME;
  });

  useEffect(() => {
    try {
      localStorage.setItem('rmart_admin_theme', JSON.stringify(theme));
    } catch {}
  }, [theme]);

  const setMode = (mode: AdminThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }));
  };

  const setAccent = (accent: AdminAccentColor) => {
    setTheme((prev) => ({ ...prev, accent }));
  };

  const accentStyles = ACCENT_MAP[theme.accent] || ACCENT_MAP.emerald;

  return (
    <AdminThemeContext.Provider value={{ theme, setMode, setAccent, accentStyles }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    return {
      theme: DEFAULT_THEME,
      setMode: () => {},
      setAccent: () => {},
      accentStyles: ACCENT_MAP.emerald,
    };
  }
  return ctx;
};
