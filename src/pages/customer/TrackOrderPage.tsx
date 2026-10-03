import React, { useState, useEffect } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { trackOrder, getSiteSettings } from '../../lib/store';
import type { Order, OrderStatus, SiteSettings } from '../../types';

interface TrackOrderPageProps {
  navigate: (path: string) => void;
  initialOrderId?: string;
  initialPhone?: string;
}

const LIFECYCLE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'Received in system' },
  { status: 'confirmed', label: 'Confirmed', desc: 'Verified by team' },
  { status: 'processing', label: 'Processing', desc: 'Picked from stock' },
  { status: 'packed', label: 'Packed', desc: 'Quality checked' },
  { status: 'shipped', label: 'Shipped', desc: 'With courier' },
  { status: 'delivered', label: 'Delivered', desc: 'Handed over' },
];

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  initialOrderId = '',
  initialPhone = '',
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderId);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
    if (initialOrderId && initialPhone) {
      handleSearch(null, initialOrderId, initialPhone);
    }
  }, [initialOrderId, initialPhone]);

  const handleSearch = async (e: React.FormEvent | null, oNum?: string, oPhone?: string) => {
    if (e) e.preventDefault();
    const queryNum = (oNum || orderNumber).trim();
    const queryPhone = (oPhone || phone).trim();

    if (!queryNum || !queryPhone) {
      setError('Please provide both Order Number and your registered Mobile Phone.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const found = await trackOrder(queryNum, queryPhone);
      setOrder(found);
      if (!found) {
        setError('No order found matching this Order Number and Phone. Please verify and try again.');
      }
    } catch {
      setError('Error tracking order. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepStatus: OrderStatus) => {
    if (!order) return 'upcoming';
    const statusOrder: OrderStatus[] = [
      'pending',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'delivered',
    ];
    const currentIndex = statusOrder.indexOf(order.orderStatus);
    const stepIndex = statusOrder.indexOf(stepStatus);

    if (order.orderStatus === 'cancelled') return 'cancelled';
    if (stepIndex <= currentIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Truck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Enter your Order Number and Bangladeshi mobile phone to check real-time courier shipping progress.
        </p>
      </div>

      {/* Lookup Form */}
      <form
        onSubmit={(e) => handleSearch(e)}
        className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5 max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Order Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. RM-2610-4829"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mobile Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 01619415744"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-3 rounded-xl border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-40"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching Status...' : 'Track Order Status'}</span>
        </button>
      </form>

      {/* Tracking Result View */}
      {order && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-8 animate-in fade-in duration-300">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Tracking Order
              </span>
              <h2 className="text-xl font-mono font-extrabold text-slate-900 mt-0.5">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} · Payment: Cash on Delivery (৳{order.totalAmount.toLocaleString()})
              </p>
            </div>

            <div className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold self-start sm:self-auto capitalize flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Status: {order.orderStatus}</span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Delivery Progress
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const status = getStepStatus(step.status);
                const isCurrent = order.orderStatus === step.status;

                return (
                  <div
                    key={step.status}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      status === 'completed'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isCurrent
                        ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20 text-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono ${
                            isCurrent
                              ? 'border-emerald-600 text-emerald-700 font-bold'
                              : 'border-slate-300 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold tracking-tight">{step.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Destination & Items Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Destination</span>
              </h4>
              <p className="text-slate-800 font-bold">{order.shippingAddress.fullName}</p>
              <p className="text-slate-600">{order.shippingAddress.streetAddress}</p>
              <p className="text-slate-600">
                {order.shippingAddress.upazilaOrArea}, {order.shippingAddress.district}
              </p>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span>Items ({order.items.length})</span>
              </h4>
              <ul className="space-y-1 text-slate-700">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span className="truncate pr-2">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-mono text-slate-900 font-bold shrink-0">
                      ৳{item.totalPrice.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Need help footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Need immediate assistance regarding this parcel?
            </div>
            <a
              href={`https://wa.me/880${(settings?.whatsapp || '01619415744').replace(/^0+/, '')}?text=Inquiry%20regarding%20Order%20${order.orderNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask Helpline on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
