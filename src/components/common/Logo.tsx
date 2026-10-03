import React, { useState, useEffect } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'light' | 'dark'; // 'light' for dark background; 'dark' for white/light background
  logoUrl?: string;
  storeName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'dark',
  logoUrl: propLogoUrl,
  storeName: propStoreName,
}) => {
  const [imageError, setImageError] = useState(false);
  const [activeLogo, setActiveLogo] = useState<string>(() => {
    if (propLogoUrl) return propLogoUrl;
    try {
      const cached = localStorage.getItem('rmart_settings_v1') || localStorage.getItem('rmart_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.logoUrl) return parsed.logoUrl;
      }
    } catch {}
    return '/logo.png';
  });

  const [activeStoreName, setActiveStoreName] = useState<string>(() => {
    if (propStoreName) return propStoreName;
    try {
      const cached = localStorage.getItem('rmart_settings_v1') || localStorage.getItem('rmart_settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.storeName) return parsed.storeName;
      }
    } catch {}
    return 'R Mart';
  });

  useEffect(() => {
    if (propLogoUrl) {
      setActiveLogo(propLogoUrl);
      setImageError(false);
    }
  }, [propLogoUrl]);

  useEffect(() => {
    if (propStoreName) {
      setActiveStoreName(propStoreName);
    }
  }, [propStoreName]);

  useEffect(() => {
    const handleSettingsUpdated = (e: any) => {
      const detail = e.detail;
      if (detail) {
        if (detail.logoUrl) {
          setActiveLogo(detail.logoUrl);
          setImageError(false);
        }
        if (detail.storeName) {
          setActiveStoreName(detail.storeName);
        }
      }
    };

    const checkLogo = () => {
      try {
        const cached = localStorage.getItem('rmart_settings_v1') || localStorage.getItem('rmart_settings');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.logoUrl) {
            setActiveLogo(parsed.logoUrl);
            setImageError(false);
          }
          if (parsed?.storeName) {
            setActiveStoreName(parsed.storeName);
          }
        }
      } catch {}
    };

    checkLogo();
    window.addEventListener('storage', checkLogo);
    window.addEventListener('rmart_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('storage', checkLogo);
      window.removeEventListener('rmart_settings_updated', handleSettingsUpdated);
    };
  }, []);

  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { img: 'w-9 h-9', text: 'text-xl', sub: 'text-[10px]' },
    lg: { img: 'w-12 h-12', text: 'text-2xl', sub: 'text-xs' },
    xl: { img: 'w-16 h-16', text: 'text-3xl', sub: 'text-sm' },
  };

  const { img, text, sub } = sizeMap[size];
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official R Mart Logo Icon Emblem */}
      <div
        className={`relative ${img} shrink-0 rounded-2xl flex items-center justify-center overflow-hidden shadow-xs transition-transform ${
          isLight
            ? 'bg-slate-900 border border-slate-700'
            : 'bg-white border-2 border-emerald-500/20 shadow-emerald-500/5'
        }`}
      >
        {!imageError ? (
          <img
            src={activeLogo || '/logo.png'}
            alt="R Mart Logo"
            className="w-full h-full object-contain p-0.5"
            onError={() => setImageError(true)}
          />
        ) : (
          /* High-fidelity SVG Fallback matching official emblem */
          <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none">
            <rect width="100" height="100" rx="24" fill={isLight ? '#0F172A' : '#F0FDF4'} />
            <circle cx="50" cy="50" r="42" stroke="#10B981" strokeWidth="3" />
            <path
              d="M32 30 L54 30 C64 30 70 36 70 44 C70 51 64 57 54 57 L32 57 Z"
              stroke={isLight ? '#FFFFFF' : '#0F172A'}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M36 28 V72"
              stroke={isLight ? '#FFFFFF' : '#0F172A'}
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M48 55 L68 74"
              stroke="#10B981"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="38" cy="74" r="3.5" fill="#10B981" />
            <circle cx="62" cy="74" r="3.5" fill="#10B981" />
          </svg>
        )}
      </div>

      {/* Brand Name Text: High-Contrast and Sharp */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center tracking-tight">
            {activeStoreName && activeStoreName.toLowerCase() !== 'r mart' ? (
              <span
                className={`font-display font-black ${text} tracking-tight ${
                  isLight ? 'text-white' : 'text-slate-950'
                }`}
              >
                {activeStoreName}
              </span>
            ) : (
              <>
                <span
                  className={`font-display font-extrabold ${text} ${
                    isLight ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  R<span className="text-emerald-600 font-black">.</span>
                </span>
                <span
                  className={`font-display font-black ${text} tracking-wider ml-1 ${
                    isLight ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  MART
                </span>
              </>
            )}
          </div>
          <span
            className={`font-sans tracking-widest font-extrabold uppercase ${sub} mt-0.5 ${
              isLight ? 'text-emerald-400' : 'text-emerald-700'
            }`}
          >
            Online Store
          </span>
        </div>
      )}
    </div>
  );
};
