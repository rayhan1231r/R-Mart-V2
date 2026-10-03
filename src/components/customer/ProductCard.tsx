import React, { useState } from 'react';
import { Heart, ShoppingBag, Check, Star, Eye, Zap, Share2, Play } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { ShareModal } from '../common/ShareModal';
import { ProductVideoLightbox } from './ProductVideoLightbox';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  navigate,
  onQuickView,
}) => {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVideoLightboxOpen, setIsVideoLightboxOpen] = useState(false);

  const isLiked = wishlist.includes(product.id);
  const isOutOfStock = product.totalStock <= 0;
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - (product.salePrice ?? product.price)) / product.price) * 100)
    : 0;

  const currentPrice = product.salePrice ?? product.price;
  const displayImage = product.thumbnail || product.images?.[0] || '/logo.png';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const res = addToCart(product, product.sizes?.[0], product.colors?.[0]?.name, 1);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const res = addToCart(product, product.sizes?.[0], product.colors?.[0]?.name, 1);
    if (res.success) {
      navigate('/checkout');
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      navigate(`/product/${product.slug || product.id}`);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug || product.id}`)}
      className="group relative rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500/50 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-[3/4] w-full bg-slate-50 overflow-hidden">
        {!imageError ? (
          <img
            src={displayImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-100 text-slate-400">
            <ShoppingBag className="w-8 h-8 mb-2 opacity-40 text-slate-500" />
            <span className="text-[11px] text-center font-medium line-clamp-2 text-slate-600">{product.name}</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-extrabold text-[10px] tracking-wider shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-bold text-[10px] tracking-wider shadow-sm">
              NEW
            </span>
          )}
          {product.videos && product.videos.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsVideoLightboxOpen(true);
              }}
              className="px-2 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] tracking-wider shadow-sm flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 z-20 cursor-pointer"
              title="Watch Product Video"
            >
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>VIDEO</span>
            </button>
          )}
        </div>

        {/* Stock status overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-15">
            <span className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top Right Action Buttons: Wishlist, Quick View & Share */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-20">
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`p-2 rounded-full transition-all shadow-xs ${
              isLiked
                ? 'bg-rose-50 text-rose-500 border border-rose-200'
                : 'bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200'
            }`}
            aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isLiked ? 'In Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>

          {onQuickView && (
            <button
              type="button"
              onClick={handleQuickViewClick}
              className="p-2 rounded-full bg-white/90 text-slate-600 hover:text-emerald-700 hover:bg-white border border-slate-200 transition-all shadow-xs active:scale-95 group/btn"
              title="Quick View"
              aria-label="Quick View product"
            >
              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsShareOpen(true);
            }}
            className="p-2 rounded-full bg-white/90 text-slate-600 hover:text-emerald-700 hover:bg-white border border-slate-200 transition-all shadow-xs active:scale-95"
            title="Share Product"
            aria-label="Share product"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions Floating Overlay on Hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-2.5 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col gap-1.5">
            {onQuickView && (
              <button
                type="button"
                onClick={handleQuickViewClick}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-950/90 hover:bg-slate-950 text-white backdrop-blur-md flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 hover:text-emerald-400"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Quick View</span>
              </button>
            )}

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={handleQuickAdd}
                className={`flex-1 py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md active:scale-95 ${
                  isAdded
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'bg-white/95 backdrop-blur-xs hover:bg-white text-slate-900 border border-slate-200/90 hover:text-emerald-700'
                }`}
                title="Add to Cart"
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span className="text-[11px] truncate">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-[11px] truncate">Add Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-2 px-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-950/20 active:scale-95"
                title="Buy Now (Direct Checkout)"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-amber-300 shrink-0" />
                <span className="text-[11px] truncate">Buy Now</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
            <span className="font-semibold text-emerald-600 uppercase tracking-wider truncate">
              {product.category || 'R Mart Collection'}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500 font-semibold shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>4.9</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </div>

        <div>
          {/* Price & Variant Hints */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-mono font-extrabold text-slate-950">
                ৳{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs font-mono text-slate-400 line-through">
                  ৳{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {product.allowedPaymentMethods &&
            product.allowedPaymentMethods.length > 0 &&
            !product.allowedPaymentMethods.includes('all') &&
            !product.allowedPaymentMethods.includes('cod') ? (
              <span className="text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100">
                Online Pay
              </span>
            ) : (
              <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                COD
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Buy Now (Always visible) */}
          <div className="mt-2.5 pt-2 border-t border-slate-100/80">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full py-2 px-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed text-center"
              >
                Out of Stock
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 border ${
                    isAdded
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 hover:bg-emerald-50 border-slate-200/90 hover:border-emerald-300 text-slate-700 hover:text-emerald-700'
                  }`}
                  title="Add to Cart"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Added!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-2 px-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs hover:shadow-md hover:shadow-emerald-600/20 active:scale-95"
                  title="Buy Now (Direct Checkout)"
                >
                  <Zap className="w-3.5 h-3.5 fill-current shrink-0 text-white" />
                  <span className="truncate">Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        product={product}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Full-Screen Video Lightbox Modal */}
      <ProductVideoLightbox
        isOpen={isVideoLightboxOpen}
        onClose={() => setIsVideoLightboxOpen(false)}
        product={product}
        navigate={navigate}
      />
    </div>
  );
};
