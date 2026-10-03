import React from 'react';
import { PackageX, ShoppingBag, FolderX, SearchX, Clock, Heart, SlidersHorizontal } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'products' | 'cart' | 'categories' | 'search' | 'orders' | 'wishlist' | 'generic';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  adminHint?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  adminHint,
}) => {
  const getIcon = () => {
    const props = { className: 'w-10 h-10 text-slate-400' };
    switch (icon) {
      case 'products':
        return <PackageX {...props} />;
      case 'cart':
        return <ShoppingBag {...props} />;
      case 'categories':
        return <FolderX {...props} />;
      case 'search':
        return <SearchX {...props} />;
      case 'orders':
        return <Clock {...props} />;
      case 'wishlist':
        return <Heart {...props} />;
      default:
        return <SlidersHorizontal {...props} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-5 shadow-xs">
        {getIcon()}
      </div>
      <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
        >
          {actionLabel}
        </button>
      )}

      {adminHint && (
        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Admin hint: {adminHint}</span>
        </div>
      )}
    </div>
  );
};
