import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
  Check,
  Share2,
  ExternalLink,
  Film,
} from 'lucide-react';
import type { Product } from '../../types';
import { ProductVideoPlayer } from './ProductVideoPlayer';
import { useCart } from '../../context/CartContext';
import { ShareModal } from '../common/ShareModal';

interface ProductVideoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  initialVideoIndex?: number;
  navigate: (path: string) => void;
}

export const ProductVideoLightbox: React.FC<ProductVideoLightboxProps> = ({
  isOpen,
  onClose,
  product,
  initialVideoIndex = 0,
  navigate,
}) => {
  const { addToCart } = useCart();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const [isAdded, setIsAdded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    setCurrentVideoIndex(initialVideoIndex);
  }, [initialVideoIndex, product]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && product?.videos && product.videos.length > 1) {
        setCurrentVideoIndex((prev) => (prev + 1) % (product.videos?.length || 1));
      } else if (e.key === 'ArrowLeft' && product?.videos && product.videos.length > 1) {
        setCurrentVideoIndex((prev) => (prev - 1 + (product.videos?.length || 1)) % (product.videos?.length || 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, product]);

  if (!isOpen || !product) return null;

  const videos = product.videos && product.videos.length > 0
    ? product.videos
    : [];

  if (videos.length === 0) return null;

  const safeIndex = Math.min(Math.max(0, currentVideoIndex), videos.length - 1);
  const activeVideoUrl = videos[safeIndex];

  const currentPrice = product.salePrice ?? product.price;
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;
  const isOutOfStock = product.totalStock <= 0;

  const handleNextVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrevVideo = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isOutOfStock) return;
    const res = addToCart(product, product.sizes?.[0], product.colors?.[0]?.name, 1);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    }
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isOutOfStock) return;
    const res = addToCart(product, product.sizes?.[0], product.colors?.[0]?.name, 1);
    if (res.success) {
      onClose();
      navigate('/checkout');
    }
  };

  const handleGoToProductPage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onClose();
    navigate(`/product/${product.slug || product.id}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-all p-2 sm:p-4 md:p-6 select-none animate-in fade-in duration-200"
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1.5 shadow-md">
            <Film className="w-3.5 h-3.5" />
            <span>Product Showcase Video</span>
          </div>
          {videos.length > 1 && (
            <span className="text-slate-300 text-xs font-mono font-medium hidden sm:inline-block">
              Video {safeIndex + 1} of {videos.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Share Video"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-rose-500/30 text-white hover:text-rose-300 transition-colors shadow-lg"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Lightbox Content Area */}
      <div className="relative z-20 w-full max-w-5xl flex flex-col items-center justify-center my-auto space-y-4">
        {/* Video Player Frame with Left / Right Navigation */}
        <div className="relative w-full aspect-[4/5] sm:aspect-video max-h-[72vh] rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center">
          <ProductVideoPlayer
            key={activeVideoUrl}
            videoUrl={activeVideoUrl}
            title={`${product.name} (Video ${safeIndex + 1})`}
            autoPlay={true}
            className="w-full h-full"
          />

          {/* Previous Video Arrow */}
          {videos.length > 1 && (
            <button
              type="button"
              onClick={handlePrevVideo}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/15 backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-xl z-20"
              title="Previous Video"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next Video Arrow */}
          {videos.length > 1 && (
            <button
              type="button"
              onClick={handleNextVideo}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/15 backdrop-blur-md transition-all hover:scale-110 active:scale-95 shadow-xl z-20"
              title="Next Video"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Video Switcher Thumbnails (if multiple videos) */}
        {videos.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto p-1 scrollbar-none z-20">
            {videos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentVideoIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  safeIndex === idx
                    ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400/30'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Video {idx + 1}</span>
              </button>
            ))}
          </div>
        )}

        {/* Bottom Interactive Product Action Bar */}
        <div className="w-full rounded-2xl bg-slate-900/90 border border-white/10 p-3 sm:p-4 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <img
              src={product.thumbnail || product.images?.[0] || '/logo.png'}
              alt={product.name}
              className="w-12 h-14 rounded-xl object-cover border border-white/10 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block truncate">
                {product.category}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm">
                {product.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-extrabold font-mono text-white">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xs font-mono text-slate-400 line-through">
                      ৳{product.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 ${
                isAdded
                  ? 'bg-emerald-500 text-slate-950 font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  <span>Add to Bag</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Buy Now</span>
            </button>

            <button
              type="button"
              onClick={handleGoToProductPage}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              title="View Complete Product Details"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        product={product}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};
