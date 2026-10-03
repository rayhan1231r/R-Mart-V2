import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  ShieldCheck,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import type { DeliveryZone, SiteSettings } from '../../types';

interface CartPageProps {
  navigate: (path: string) => void;
  deliveryZones?: DeliveryZone[];
  settings?: SiteSettings | null;
}

export const CartPage: React.FC<CartPageProps> = ({
  navigate,
  deliveryZones = [],
  settings,
}) => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    deliveryCharge,
    appliedCoupon,
    couponDiscount,
    selectedDeliveryZone,
    setSelectedDeliveryZone,
    applyCouponCode,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplying(true);
    setCouponError(null);
    await applyCouponCode(couponCodeInput.trim());
    setIsApplying(false);
  };

  const finalTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);
  const freeThreshold = settings?.freeDeliveryThreshold || 2500;
  const freeDeliveryProgress = Math.min(100, Math.round((cartSubtotal / freeThreshold) * 100));
  const remainingForFreeDelivery = Math.max(0, freeThreshold - cartSubtotal);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-900 mb-2">Your Shopping Bag is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
          Looks like you haven't added any products to your bag yet. Explore our genuine collection with fast nationwide Cash on Delivery.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
        >
          Explore Catalog Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Shopping Bag
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review your {cartCount} selected items and proceed to fast Cash on Delivery checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors self-start sm:self-auto hover:underline"
        >
          Clear All Items
        </button>
      </div>

      {/* Free Delivery Goal Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Truck className="w-4 h-4 text-emerald-600" />
            {remainingForFreeDelivery > 0 ? (
              <span>
                Add <span className="font-mono text-emerald-700 font-bold">৳{remainingForFreeDelivery.toLocaleString()}</span> more for <strong className="text-slate-900">FREE Delivery</strong>!
              </span>
            ) : (
              <span className="text-emerald-700 font-bold">
                🎉 Congratulations! You have unlocked FREE Nationwide Delivery!
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-slate-500">{freeDeliveryProgress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${freeDeliveryProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-slate-100 rounded-3xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
            {cart.map((item, idx) => (
              <div
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-slate-50/60 transition-colors"
              >
                {/* Product info */}
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                  <div className="space-y-1 min-w-0">
                    <h3
                      onClick={() => navigate(`/product/${item.slug || item.productId}`)}
                      className="text-sm font-bold text-slate-900 hover:text-emerald-600 cursor-pointer transition-colors truncate"
                    >
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {item.selectedSize && <span>Size: <strong className="text-slate-700">{item.selectedSize}</strong></span>}
                      {item.selectedColor && <span>Color: <strong className="text-slate-700">{item.selectedColor}</strong></span>}
                    </div>
                    <div className="text-sm font-mono font-extrabold text-emerald-700">
                      ৳{item.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Quantity and Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                      className="p-1.5 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                      disabled={item.quantity >= item.maxStock}
                      className="p-1.5 hover:bg-slate-200 text-slate-700 disabled:opacity-30 transition-colors"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-sm font-mono font-extrabold text-slate-900 min-w-[70px] text-right">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => navigate('/shop')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Delivery Zone Selector */}
            {deliveryZones.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Select Delivery Zone:
                </label>
                <div className="space-y-2">
                  {deliveryZones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedDeliveryZone(zone)}
                      className={`w-full p-3 rounded-2xl border text-xs text-left transition-all flex items-center justify-between ${
                        selectedDeliveryZone?.id === zone.id
                          ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-medium ring-1 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/60'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{zone.name}</div>
                        <div className="text-[11px] text-slate-500">{zone.estimatedDays}</div>
                      </div>
                      <span className="font-mono font-extrabold text-emerald-700">
                        {cartSubtotal >= (zone.minOrderForFreeDelivery || 999999)
                          ? 'FREE'
                          : `৳${zone.charge}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Promo Code Input */}
            <div className="pt-2">
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="w-full h-10 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 uppercase tracking-wider focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplying || !couponCodeInput.trim()}
                    className="px-4 h-10 rounded-xl bg-slate-900 hover:bg-emerald-600 text-xs font-bold text-white transition-colors disabled:opacity-40"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                    <span className="text-emerald-700 font-mono ml-1.5 font-bold">(-৳{couponDiscount})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-rose-600 hover:text-rose-700 underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cartCount} items)</span>
                <span className="font-mono font-bold text-slate-800">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span className="font-mono">-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-mono font-bold text-slate-800">
                  {deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-base pt-3 border-t border-slate-100">
                <span>Total Payable</span>
                <span className="font-mono text-emerald-700">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash on Delivery · Inspect Parcel Before Paying</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
