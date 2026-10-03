import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Check,
  AlertCircle,
  Plus,
  Minus,
  Ruler,
  Share2,
  ChevronRight,
  Send,
  Zap,
  Play,
  Video,
  Film,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from '../../components/customer/ProductCard';
import { ProductVideoPlayer } from '../../components/customer/ProductVideoPlayer';
import { ProductVideoLightbox } from '../../components/customer/ProductVideoLightbox';
import { ShareModal } from '../../components/common/ShareModal';
import { getProductById, getProducts, getReviews, submitReview } from '../../lib/store';
import type { Product, Review } from '../../types';

interface ProductDetailPageProps {
  productId: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, navigate }) => {
  const { addToCart, wishlist, toggleWishlist, toggleCompare, isInCompare } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>('image');
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isVideoLightboxOpen, setIsVideoLightboxOpen] = useState(false);
  const [lightboxVideoIndex, setLightboxVideoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review submission form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(user?.name || '');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const prod = await getProductById(productId);
        if (prod) {
          setProduct(prod);
          setSelectedImage(prod.thumbnail || prod.images?.[0] || '/logo.png');
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0].name);

          // Fetch related products in the same category
          const all = await getProducts({ categorySlug: prod.category, activeOnly: true });
          setRelatedProducts(all.filter((p) => p.id !== prod.id).slice(0, 4));

          // Fetch approved reviews
          const revs = await getReviews(prod.id, true);
          setReviews(revs);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      }
    }
    loadProduct();
  }, [productId]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested product could not be located or may have been unlisted.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  // Calculate available variant stock
  let currentStock = product.totalStock;
  if (product.variants && product.variants.length > 0) {
    const match = product.variants.find(
      (v) =>
        (!selectedSize || v.size === selectedSize) &&
        (!selectedColor || v.color === selectedColor)
    );
    if (match) currentStock = match.stock;
  }

  const isOutOfStock = currentStock <= 0;
  const currentPrice = product.salePrice ?? product.price;
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, selectedSize, selectedColor, quantity);
    if (res.success) {
      setFeedbackMsg({ text: res.message, type: 'success' });
    } else {
      setFeedbackMsg({ text: res.message, type: 'error' });
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const res = addToCart(product, selectedSize, selectedColor, quantity);
    if (res.success) {
      navigate('/checkout');
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewerName.trim()) return;
    setReviewSubmitting(true);
    try {
      await submitReview({
        productId: product.id,
        productName: product.name,
        customerId: user?.uid || 'guest_' + Date.now(),
        customerName: reviewerName.trim(),
        customerEmail: user?.email,
        rating: reviewRating,
        comment: reviewComment.trim(),
        verifiedPurchase: false,
      });
      setReviewSubmitted(true);
      setReviewComment('');
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isLiked = wishlist.includes(product.id);
  const isCompared = isInCompare(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <button onClick={() => navigate('/')} className="hover:text-emerald-700 transition-colors font-medium">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button onClick={() => navigate('/shop')} className="hover:text-emerald-700 transition-colors font-medium">
          Catalog
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => navigate(`/category/${product.category}`)}
          className="hover:text-emerald-700 transition-colors font-medium capitalize"
        >
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-[220px]">{product.name}</span>
      </nav>

      {/* Product Hero: Gallery + Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left Column: Image & Video Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[4/5] w-full rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden group">
            {selectedMediaType === 'video' && product.videos && product.videos[selectedVideoIndex] ? (
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
                  onClick={() => setSelectedMediaType('image')}
                  className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 shadow-lg"
                >
                  <span>✕ Back to Photos</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLightboxVideoIndex(selectedVideoIndex);
                    setIsVideoLightboxOpen(true);
                  }}
                  className="absolute top-4 right-16 z-20 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                  title="Expand to Full-Screen Lightbox"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lightbox View</span>
                </button>
              </div>
            ) : (
              <>
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {hasDiscount && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-md flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-white" />
                      <span>Save {discountPercent}%</span>
                    </span>
                  )}
                  {product.isNewArrival && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold text-xs uppercase shadow-md">
                      New Arrival
                    </span>
                  )}
                </div>

                {/* Watch Video Floating Button if product has videos */}
                {product.videos && product.videos.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMediaType('video');
                      setSelectedVideoIndex(0);
                      setLightboxVideoIndex(0);
                      setIsVideoLightboxOpen(true);
                    }}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-950/90 hover:bg-slate-950 text-white font-bold text-xs shadow-2xl backdrop-blur-md flex items-center gap-2 border border-white/20 transition-all hover:scale-105 active:scale-95 z-10 group/vid"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Play className="w-3 h-3 fill-slate-950 text-slate-950 ml-0.5" />
                    </div>
                    <span>Watch Product Video ({product.videos.length})</span>
                  </button>
                )}
              </>
            )}

            {/* Wishlist & Share buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 text-slate-700 hover:text-emerald-700 transition-colors shadow-sm"
                title="Share product (WhatsApp, Facebook, Link)"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full backdrop-blur-xs border transition-colors shadow-sm ${
                  isLiked
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-white/90 text-slate-700 hover:text-rose-600 border-slate-200'
                }`}
                title={isLiked ? 'Saved in Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Thumbnails row (Images + Videos) */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {/* Photos */}
            {product.images &&
              product.images.map((img, i) => (
                <button
                  key={'img_' + i}
                  onClick={() => {
                    setSelectedImage(img);
                    setSelectedMediaType('image');
                  }}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden border shrink-0 transition-all ${
                    selectedMediaType === 'image' && selectedImage === img
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}

            {/* Videos Thumbnails */}
            {product.videos &&
              product.videos.map((vid, vIdx) => (
                <button
                  key={'vid_' + vIdx}
                  onClick={() => {
                    setSelectedMediaType('video');
                    setSelectedVideoIndex(vIdx);
                    setLightboxVideoIndex(vIdx);
                    setIsVideoLightboxOpen(true);
                  }}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden border shrink-0 transition-all bg-slate-900 flex flex-col items-center justify-center text-white ${
                    selectedMediaType === 'video' && selectedVideoIndex === vIdx
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : 'border-slate-300 hover:border-slate-400 opacity-85 hover:opacity-100'
                  }`}
                  title={`Play Product Video #${vIdx + 1} in Lightbox`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md mb-1">
                    <Play className="w-3.5 h-3.5 fill-slate-950 ml-0.5" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight">Video {vIdx + 1}</span>
                  <span className="text-[8px] text-emerald-400 uppercase font-mono">Watch</span>
                </button>
              ))}
          </div>
        </div>

        {/* Right Column: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="text-emerald-700 font-extrabold uppercase tracking-wider">
                {product.category}
              </span>
              <span className="font-mono text-slate-400">SKU: {product.sku || 'N/A'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-mono font-black text-slate-950">
                ৳{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-lg font-mono text-slate-400 line-through">
                  ৳{product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Real Stock Status */}
            <div className="mt-3 flex items-center gap-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Out of Stock</span>
                </span>
              ) : currentStock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Only {currentStock} items left in stock</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>In Stock Ready to Ship ({currentStock} available)</span>
                </span>
              )}
            </div>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider">
                  Select Size: <span className="text-emerald-700 font-extrabold">{selectedSize}</span>
                </span>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-slate-500 hover:text-emerald-700 flex items-center gap-1 transition-colors font-semibold"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`h-11 min-w-[48px] px-4 rounded-xl text-xs font-mono font-bold transition-all border ${
                      selectedSize === s
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Color: <span className="text-emerald-700 font-extrabold">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                      selectedColor === c.name
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {c.code && (
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: c.code }}
                      />
                    )}
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Add / Buy Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <div className="text-xs font-bold text-slate-700 uppercase">Quantity:</div>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 hover:bg-slate-200 text-slate-700 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-mono font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock}
                  className="p-2 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md active:scale-98"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
              >
                <span>Buy Now (COD)</span>
              </button>
            </div>

            {/* Comparison button */}
            <button
              onClick={() => toggleCompare(product)}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors text-center"
            >
              {isCompared ? '✓ Added to Product Compare' : '+ Add to Comparison Matrix'}
            </button>

            {/* Feedback notification banner */}
            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}
          </div>

          {/* Delivery & Service Assurance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-3 text-slate-700">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong className="text-slate-900">Dhaka:</strong> 1–2 days (৳70) · <strong className="text-slate-900">Outside Dhaka:</strong> 3–5 days (৳130)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              {product.allowedPaymentMethods &&
              product.allowedPaymentMethods.length > 0 &&
              !product.allowedPaymentMethods.includes('all') &&
              !product.allowedPaymentMethods.includes('cod') ? (
                <span>
                  <strong className="text-slate-900">Online Payment:</strong> Accepted via{' '}
                  <span className="font-semibold uppercase text-emerald-700">
                    {product.allowedPaymentMethods.join(', ')}
                  </span>{' '}
                  (COD unavailable for this specific item)
                </span>
              ) : (
                <span>
                  Cash on Delivery (COD) available with parcel inspection before payment
                  {product.allowedPaymentMethods &&
                    product.allowedPaymentMethods.length > 0 &&
                    !product.allowedPaymentMethods.includes('all') && (
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Allowed payments: {product.allowedPaymentMethods.join(', ').toUpperCase()}
                      </span>
                    )}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>7-Day free exchange support for defect or size replacement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications */}
      <div className="pt-8 border-t border-slate-200 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Detailed Description */}
          <div className="md:col-span-7 space-y-4">
            <h3 className="text-lg font-bold font-display text-slate-900 tracking-tight">Product Description</h3>
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
              {product.description || 'No detailed description provided for this product.'}
            </div>
          </div>

          {/* Specifications Table */}
          <div className="md:col-span-5 space-y-4">
            <h3 className="text-lg font-bold font-display text-slate-900 tracking-tight">Specifications</h3>
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden text-xs">
              <div className="divide-y divide-slate-100">
                {product.brand && (
                  <div className="flex justify-between p-3.5 bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Brand</span>
                    <span className="font-bold text-slate-900">{product.brand}</span>
                  </div>
                )}
                {product.category && (
                  <div className="flex justify-between p-3.5">
                    <span className="text-slate-500 font-medium">Department</span>
                    <span className="font-bold text-slate-900">{product.category}</span>
                  </div>
                )}
                {product.fabricMaterial && (
                  <div className="flex justify-between p-3.5 bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Material / Fabric</span>
                    <span className="font-bold text-slate-900">{product.fabricMaterial}</span>
                  </div>
                )}
                {product.gender && (
                  <div className="flex justify-between p-3.5">
                    <span className="text-slate-500 font-medium">Target Segment</span>
                    <span className="font-bold text-slate-900 capitalize">{product.gender}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between p-3.5 bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Weight</span>
                    <span className="font-bold text-slate-900">{product.weight}</span>
                  </div>
                )}
                <div className="flex justify-between p-3.5">
                  <span className="text-slate-500 font-medium">Payment Options</span>
                  <span className="font-bold text-slate-900 uppercase">
                    {product.allowedPaymentMethods &&
                    product.allowedPaymentMethods.length > 0 &&
                    !product.allowedPaymentMethods.includes('all')
                      ? product.allowedPaymentMethods.join(', ')
                      : 'All Store Methods (COD, bKash, Nagad, etc.)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-8 border-t border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-900 tracking-tight">Customer Reviews</h3>
            <p className="text-xs text-slate-500">Real customer feedback</p>
          </div>
        </div>

        {/* Existing verified reviews */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{r.customerName}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${idx < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white border border-slate-200/90 text-center shadow-xs">
            <p className="text-xs font-bold text-slate-700 mb-1">No reviews submitted yet for this product.</p>
            <p className="text-[11px] text-slate-400">Be the first customer to share your experience below.</p>
          </div>
        )}

        {/* Write a review form */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs max-w-xl">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
            Leave a Customer Review
          </h4>

          {reviewSubmitted ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              Thank you! Your review has been submitted and will appear upon store moderation.
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={reviewerName || ''}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Write your review about the fit, quality and experience..."
                  value={reviewComment || ''}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Review</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Product Video Showcase (if product has videos) */}
      {product.videos && product.videos.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-700">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Film className="w-4 h-4" />
                <span>Product Video Showcase</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                Live Video Demo of {product.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Watch full product unboxing, fit review, and design details
              </p>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 shrink-0 self-start sm:self-auto">
              📹 {product.videos.length} {product.videos.length === 1 ? 'Video' : 'Videos'} Available
            </span>
          </div>

          <div
            className={`grid gap-6 ${
              product.videos.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {product.videos.map((vidUrl, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Video Demo #{idx + 1}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {product.brand || 'R Mart Official'}
                  </span>
                </div>
                <ProductVideoPlayer
                  videoUrl={vidUrl}
                  title={`${product.name} - Demo ${idx + 1}`}
                  className="w-full aspect-video rounded-2xl"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <h3 className="text-xl font-bold font-display text-slate-900 tracking-tight">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSizeGuideOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-emerald-600" />
                <span>Standard Size Chart (Inches)</span>
              </h3>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 font-bold">Size</th>
                  <th className="py-2.5 font-bold">Chest</th>
                  <th className="py-2.5 font-bold">Length</th>
                  <th className="py-2.5 font-bold">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr><td className="py-2.5 font-mono font-bold text-emerald-700">S</td><td>38"</td><td>27"</td><td>17"</td></tr>
                <tr><td className="py-2.5 font-mono font-bold text-emerald-700">M</td><td>40"</td><td>28"</td><td>18"</td></tr>
                <tr><td className="py-2.5 font-mono font-bold text-emerald-700">L</td><td>42"</td><td>29"</td><td>19"</td></tr>
                <tr><td className="py-2.5 font-mono font-bold text-emerald-700">XL</td><td>44"</td><td>30"</td><td>20"</td></tr>
                <tr><td className="py-2.5 font-mono font-bold text-emerald-700">XXL</td><td>46"</td><td>31"</td><td>21"</td></tr>
              </tbody>
            </table>

            <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              For custom measurements or fit assistance, message our hotline on WhatsApp: 01619415744.
            </p>
          </div>
        </div>
      )}

      {/* Product Share Modal */}
      <ShareModal
        product={product}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Product Video Fullscreen Lightbox Modal */}
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
