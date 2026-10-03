import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Heart,
  Zap,
  Check,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Play,
  Film,
  Share2,
} from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { ProductVideoPlayer } from './ProductVideoPlayer';
import { ProductVideoLightbox } from './ProductVideoLightbox';
import { ShareModal } from '../common/ShareModal';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  navigate,
}) => {
  const { addToCart, wishlist, toggleWishlist, setIsCartOpen } = useCart();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [mediaMode, setMediaMode] = useState<'image' | 'video'>('image');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [isVideoLightboxOpen, setIsVideoLightboxOpen] = useState(false);
  const [lightboxVideoIndex, setLightboxVideoIndex] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Initialize or reset state when product changes or opens
  useEffect(() => {
    if (product) {
      const allImgs = [
        product.thumbnail,
        ...(product.images || []),
      ].filter(Boolean) as string[];
      
      const uniqueImages = Array.from(new Set(allImgs));
      const initialImg = uniqueImages[0] || '/logo.png';
      setSelectedImage(initialImg);
      setActiveImageIndex(0);
      setMediaMode('image');
      setSelectedVideoIndex(0);

      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('');
      }

      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0].name);
      } else {
        setSelectedColor('');
      }

      setQuantity(1);
      setIsAdded(false);
    }
  }, [product, isOpen]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isLiked = wishlist.includes(product.id);

  // Collect unique images for thumbnail carousel
  const imagesList = Array.from(
    new Set([product.thumbnail, ...(product.images || [])].filter(Boolean))
  ) as string[];
  const validImages = imagesList.length > 0 ? imagesList : ['/logo.png'];

  // Calculate variant stock
  let currentStock = product.totalStock;
  if (product.variants && product.variants.length > 0) {
    const match = product.variants.find(
      (v) =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || v.color === selectedColor)
    );
    if (match) {
      currentStock = match.stock;
    }
  }

  const isOutOfStock = currentStock <= 0;
  const currentPrice = product.salePrice ?? product.price;
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;
  const savingsAmount = hasDiscount ? product.price - currentPrice : 0;

  const handleSelectImage = (img: string, idx: number) => {
    setSelectedImage(img);
    setActiveImageIndex(idx);
  };

  const handlePrevImage = () => {
    if (validImages.length <= 1) return;
    const newIdx = (activeImageIndex - 1 + validImages.length) % validImages.length;
    setActiveImageIndex(newIdx);
    setSelectedImage(validImages[newIdx]);
  };

  const handleNextImage = () => {
    if (validImages.length <= 1) return;
    const newIdx = (activeImageIndex + 1) % validImages.length;
    setActiveImageIndex(newIdx);
    setSelectedImage(validImages[newIdx]);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, selectedSize, selectedColor, quantity);
    if (res.success) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2200);
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, selectedSize, selectedColor, quantity);
    if (res.success) {
      onClose();
      navigate('/checkout');
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product.slug || product.id}`);
  };

  const cleanDescription =
    product.shortDescription ||
    (product.description ? product.description.slice(0, 160) + '...' : '');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors z-30"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] md:max-h-[82vh] overflow-y-auto">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 bg-slate-50/70 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
            <div>
              {/* Main Image or Video Display */}
              <div className="relative aspect-[4/5] sm:aspect-square w-full rounded-2xl bg-white border border-slate-200/80 overflow-hidden flex items-center justify-center shadow-xs">
                {mediaMode === 'video' && product.videos && product.videos[selectedVideoIndex] ? (
                  <div className="w-full h-full bg-black flex items-center justify-center relative">
                    <ProductVideoPlayer
                      key={product.videos[selectedVideoIndex]}
                      videoUrl={product.videos[selectedVideoIndex]}
                      title={`${product.name} - Video ${selectedVideoIndex + 1}`}
                      autoPlay
                      className="w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => setMediaMode('image')}
                      className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white font-bold text-[11px] backdrop-blur-md border border-white/20 transition-all shadow-md"
                    >
                      ✕ Photos
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src={selectedImage || '/logo.png'}
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-all duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/logo.png';
                      }}
                    />

                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      {hasDiscount && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-[11px] tracking-wider shadow-sm">
                          -{discountPercent}% OFF
                        </span>
                      )}
                      {product.isNewArrival && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] tracking-wider shadow-sm">
                          NEW ARRIVAL
                        </span>
                      )}
                      {product.isBestSeller && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] tracking-wider shadow-sm">
                          BEST SELLER
                        </span>
                      )}
                    </div>

                    {/* Watch Video Floating Pill */}
                    {product.videos && product.videos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setMediaMode('video');
                          setSelectedVideoIndex(0);
                          setLightboxVideoIndex(0);
                          setIsVideoLightboxOpen(true);
                        }}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-slate-950/90 hover:bg-slate-950 text-white font-bold text-[11px] shadow-xl backdrop-blur-md flex items-center gap-1.5 border border-white/20 transition-all hover:scale-105 active:scale-95 z-10"
                      >
                        <Play className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                        <span>Watch Video ({product.videos.length})</span>
                      </button>
                    )}
                  </>
                )}

                {/* Stock Tag */}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-15">
                    <span className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-sm uppercase tracking-wider shadow-lg">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Wishlist & Share Buttons on Image */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                  <button
                    type="button"
                    onClick={() => setIsShareOpen(true)}
                    className="p-2 rounded-full transition-all shadow-md bg-white/95 text-slate-600 hover:text-emerald-700 hover:bg-white border border-slate-200"
                    title="Share product"
                    aria-label="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`p-2 rounded-full transition-all shadow-md ${
                      isLiked
                        ? 'bg-rose-50 text-rose-500 border border-rose-200'
                        : 'bg-white/95 text-slate-600 hover:text-rose-500 hover:bg-white border border-slate-200'
                    }`}
                    aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                {/* Left/Right Image Navigation Controls */}
                {mediaMode === 'image' && validImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all hover:scale-105 active:scale-95"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition-all hover:scale-105 active:scale-95"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Strip (Images + Videos) */}
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {validImages.map((img, idx) => (
                  <button
                    key={'img_' + idx}
                    type="button"
                    onClick={() => {
                      handleSelectImage(img, idx);
                      setMediaMode('image');
                    }}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      mediaMode === 'image' && activeImageIndex === idx
                        ? 'border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

                {product.videos &&
                  product.videos.map((_, vIdx) => (
                    <button
                      key={'vid_' + vIdx}
                      type="button"
                      onClick={() => {
                        setMediaMode('video');
                        setSelectedVideoIndex(vIdx);
                        setLightboxVideoIndex(vIdx);
                        setIsVideoLightboxOpen(true);
                      }}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all bg-slate-900 flex flex-col items-center justify-center text-white ${
                        mediaMode === 'video' && selectedVideoIndex === vIdx
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-slate-300 hover:border-slate-400 opacity-80 hover:opacity-100'
                      }`}
                      title={`Watch Video #${vIdx + 1} in Lightbox`}
                    >
                      <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 mb-0.5" />
                      <span className="text-[9px] font-bold">Vid {vIdx + 1}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Guarantees Strip */}
            <div className="mt-4 pt-3 border-t border-slate-200/70 hidden sm:grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-semibold text-slate-700 leading-tight">
                  Fast Delivery
                </span>
                <span className="text-[9px] text-slate-400">2-3 Days BD</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-semibold text-slate-700 leading-tight">
                  100% Genuine
                </span>
                <span className="text-[9px] text-slate-400">Authentic</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-semibold text-slate-700 leading-tight">
                  Easy Return
                </span>
                <span className="text-[9px] text-slate-400">7 Days Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Module */}
          <div className="md:col-span-6 p-5 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Category, Brand & Rating */}
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
                <span className="font-bold text-emerald-600 uppercase tracking-wider text-[11px]">
                  {product.category || 'R Mart Collection'}
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-slate-800 text-[11px]">4.9</span>
                  <span className="text-slate-400 text-[10px]">(Verified)</span>
                </div>
              </div>

              {/* Title */}
              <h2
                id="quick-view-title"
                className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug"
              >
                {product.name}
              </h2>

              {/* Price & Savings */}
              <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-950">
                  ৳{currentPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm sm:text-base font-mono text-slate-400 line-through">
                      ৳{product.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Save ৳{savingsAmount.toLocaleString()}
                    </span>
                  </>
                )}
                {product.allowedPaymentMethods &&
                product.allowedPaymentMethods.length > 0 &&
                !product.allowedPaymentMethods.includes('all') &&
                !product.allowedPaymentMethods.includes('cod') ? (
                  <span className="text-[10px] font-medium text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded ml-auto">
                    Online Payment Only
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded ml-auto">
                    Cash on Delivery Available
                  </span>
                )}
              </div>

              {/* Short Description */}
              {cleanDescription && (
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cleanDescription}
                </p>
              )}

              {/* Allowed Payment Methods Pills */}
              {product.allowedPaymentMethods &&
                product.allowedPaymentMethods.length > 0 &&
                !product.allowedPaymentMethods.includes('all') && (
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[11px]">
                    <span className="text-slate-400 font-medium">Accepted Payments:</span>
                    {product.allowedPaymentMethods.map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold font-mono text-[10px] uppercase border border-slate-200"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}

              {/* SKU & Stock Availability */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      isOutOfStock ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {isOutOfStock
                      ? 'Out of Stock'
                      : currentStock <= 5
                      ? `Only ${currentStock} left in stock!`
                      : `In Stock (${currentStock} available)`}
                  </span>
                </div>

                {product.sku && (
                  <span className="text-slate-400 font-mono text-[11px]">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Select Size:{' '}
                      <span className="text-emerald-600 font-semibold">{selectedSize}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => {
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-10 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800">
                      Select Color:{' '}
                      <span className="text-emerald-600 font-semibold">{selectedColor}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => {
                      const isSelected = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-2 ring-emerald-500/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {c.code && (
                            <span
                              className="w-3 h-3 rounded-full border border-slate-300 shrink-0 shadow-2xs"
                              style={{ backgroundColor: c.code }}
                            />
                          )}
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs font-bold text-slate-800">Quantity:</span>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-sm hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono font-bold text-xs text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= currentStock || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-sm hover:bg-slate-100 disabled:opacity-40 transition-colors shadow-2xs"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-slate-500 ml-auto">
                  Subtotal:{' '}
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ৳{(currentPrice * quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isAdded
                      ? 'bg-emerald-500 text-slate-950 font-extrabold'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>Buy Now (Checkout)</span>
                </button>
              </div>

              {/* View Full Product Details Link */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleViewFullDetails}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline transition-colors"
                >
                  <span>View Complete Details & Reviews</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {isAdded && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setIsCartOpen(true);
                    }}
                    className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                  >
                    <span>Open Bag</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        product={product}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Fullscreen Video Lightbox Modal */}
      <ProductVideoLightbox
        isOpen={isVideoLightboxOpen}
        onClose={() => setIsVideoLightboxOpen(false)}
        product={product}
        initialVideoIndex={lightboxVideoIndex}
        navigate={navigate}
      />
    </div>
  );
};
