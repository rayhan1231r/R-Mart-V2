import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Send,
  ExternalLink,
  Mail,
  Smartphone,
} from 'lucide-react';
import type { Product } from '../../types';

interface ShareModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build canonical share URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const productPath = `/product/${product.slug || product.id}`;
  const shareUrl = `${origin}${productPath}`;
  const price = product.salePrice ?? product.price;
  const shareTitle = `${product.name} - ৳${price.toLocaleString()} on R Mart`;
  const shareText = `Check out "${product.name}" on R Mart! Fast delivery & Cash on Delivery across Bangladesh.`;

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const shareChannels = [
    {
      name: 'WhatsApp',
      color: 'bg-[#25D366] text-white hover:bg-[#1ebd59]',
      icon: MessageCircle,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
    },
    {
      name: 'Facebook',
      color: 'bg-[#1877F2] text-white hover:bg-[#166fe5]',
      icon: ExternalLink,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Telegram',
      color: 'bg-[#229ED9] text-white hover:bg-[#1e8cc0]',
      icon: Send,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: 'X (Twitter)',
      color: 'bg-black text-white hover:bg-slate-800',
      icon: ExternalLink,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: 'Email',
      color: 'bg-slate-700 text-white hover:bg-slate-600',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + '\n\nLink: ' + shareUrl)}`,
    },
  ];

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-base">Share Product</h3>
              <p className="text-[11px] text-slate-500">Share this item with friends & family</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Mini Preview Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <img
            src={product.thumbnail || product.images?.[0] || '/logo.png'}
            alt={product.name}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{product.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-black text-emerald-600">
                ৳{price.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                • {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Share Via
          </label>
          <div className="grid grid-cols-3 gap-2">
            {shareChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.name}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all active:scale-95 shadow-xs ${channel.color}`}
                >
                  <Icon className="w-5 h-5 mb-1.5" />
                  <span className="text-[11px] font-bold">{channel.name}</span>
                </a>
              );
            })}

            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all active:scale-95 shadow-xs"
              >
                <Smartphone className="w-5 h-5 mb-1.5 text-emerald-400" />
                <span className="text-[11px] font-bold">More Options</span>
              </button>
            )}
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Product Link
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-2.5 bg-transparent text-xs text-slate-700 outline-none truncate font-mono select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
