export interface ThemePreset {
  id: string;
  name: string;
  hex: string;
  hoverHex: string;
  glow: string;
  borderFocus: string;
  lightBg: string;
  isRed?: boolean;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'emerald',
    name: 'Emerald Green (Classic R Mart)',
    hex: '#10B981',
    hoverHex: '#059669',
    glow: 'rgba(16, 185, 129, 0.25)',
    borderFocus: 'rgba(16, 185, 129, 0.4)',
    lightBg: 'rgba(16, 185, 129, 0.1)',
  },
  {
    id: 'orange',
    name: 'Daraz Orange (Marketplace)',
    hex: '#F85606',
    hoverHex: '#E04B00',
    glow: 'rgba(248, 86, 6, 0.25)',
    borderFocus: 'rgba(248, 86, 6, 0.4)',
    lightBg: 'rgba(248, 86, 6, 0.1)',
  },
  {
    id: 'amber',
    name: 'Amazon Gold / Amber',
    hex: '#F59E0B',
    hoverHex: '#D97706',
    glow: 'rgba(245, 158, 11, 0.25)',
    borderFocus: 'rgba(245, 158, 11, 0.4)',
    lightBg: 'rgba(245, 158, 11, 0.1)',
  },
  {
    id: 'blue',
    name: 'Flipkart Blue',
    hex: '#2874F0',
    hoverHex: '#1A5BCA',
    glow: 'rgba(40, 116, 240, 0.25)',
    borderFocus: 'rgba(40, 116, 240, 0.4)',
    lightBg: 'rgba(40, 116, 240, 0.1)',
  },
  {
    id: 'crimson',
    name: 'Alibaba Crimson',
    hex: '#E11D48',
    hoverHex: '#BE123C',
    glow: 'rgba(225, 29, 72, 0.25)',
    borderFocus: 'rgba(225, 29, 72, 0.4)',
    lightBg: 'rgba(225, 29, 72, 0.1)',
    isRed: true,
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    hex: '#8B5CF6',
    hoverHex: '#7C3AED',
    glow: 'rgba(139, 92, 246, 0.25)',
    borderFocus: 'rgba(139, 92, 246, 0.4)',
    lightBg: 'rgba(139, 92, 246, 0.1)',
  },
];

export function getThemePreset(idOrHex?: string): ThemePreset {
  if (!idOrHex) return THEME_PRESETS[0];
  const found = THEME_PRESETS.find(
    (p) => p.id === idOrHex.toLowerCase() || p.hex.toLowerCase() === idOrHex.toLowerCase()
  );
  if (found) return found;

  // Custom hex color fallback
  const isHex = /^#[0-9A-Fa-f]{6}$/.test(idOrHex);
  const hex = isHex ? idOrHex : '#10B981';
  return {
    id: 'custom',
    name: 'Custom Palette',
    hex,
    hoverHex: hex,
    glow: `${hex}40`,
    borderFocus: `${hex}66`,
    lightBg: `${hex}1a`,
  };
}

export function applyThemeToDom(themeKeyOrHex?: string): void {
  if (typeof document === 'undefined') return;

  const preset = getThemePreset(themeKeyOrHex);
  const root = document.documentElement;

  root.setAttribute('data-theme', preset.id);

  // Set primary variables
  root.style.setProperty('--primary', preset.hex);
  root.style.setProperty('--primary-hover', preset.hoverHex);
  root.style.setProperty('--primary-glow', preset.glow);
  root.style.setProperty('--primary-light', preset.lightBg);
  root.style.setProperty('--brand-emerald', preset.hex);
  root.style.setProperty('--brand-emerald-hover', preset.hoverHex);
  root.style.setProperty('--brand-emerald-glow', preset.glow);
  root.style.setProperty('--brand-border-focus', preset.borderFocus);

  // Override Tailwind emerald color shades dynamically so all existing emerald classes adopt the active theme!
  root.style.setProperty('--color-emerald-300', preset.id === 'orange' ? '#fdba74' : preset.id === 'red' || preset.id === 'crimson' ? '#fca5a5' : preset.id === 'blue' ? '#93c5fd' : preset.id === 'amber' ? '#fcd34d' : preset.id === 'purple' ? '#c4b5fd' : '#6ee7b7');
  root.style.setProperty('--color-emerald-400', preset.id === 'orange' ? '#fb923c' : preset.id === 'red' || preset.id === 'crimson' ? '#f87171' : preset.id === 'blue' ? '#60a5fa' : preset.id === 'amber' ? '#fbbf24' : preset.id === 'purple' ? '#a78bfa' : '#34d399');
  root.style.setProperty('--color-emerald-500', preset.hex);
  root.style.setProperty('--color-emerald-600', preset.hoverHex);
  root.style.setProperty('--color-emerald-700', preset.hoverHex);
  root.style.setProperty('--color-emerald-950', preset.id === 'orange' ? '#431407' : preset.id === 'red' || preset.id === 'crimson' ? '#450a0a' : preset.id === 'blue' ? '#082f49' : preset.id === 'amber' ? '#451a03' : preset.id === 'purple' ? '#2e1065' : '#022c22');
}
