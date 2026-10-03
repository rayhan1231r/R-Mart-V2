import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  Truck,
  Printer,
  Clock,
  Mail,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { getOrders, getOrderNotification } from '../../lib/store';
import type { Order, OrderNotificationRecord } from '../../types';

interface OrderConfirmationPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, navigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<OrderNotificationRecord | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const all = await getOrders();
        const found = all.find((o) => o.id === orderId || o.orderNumber === orderId);
        setOrder(found || null);
        if (found) {
          const notif = await getOrderNotification(found.orderNumber);
          setNotification(notif);
        }
      } catch (err) {
        console.warn('Error fetching order confirmation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-xs text-slate-400">
        Loading order confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Order Not Located</h2>
        <p className="text-xs text-slate-500">
          The requested order verification details could not be found. Please check your order ID.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Notification Banner */}
      <div className="text-center space-y-3 no-print">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          We have received your order. Our team will verify your parcel details and prepare it for dispatch.
        </p>
      </div>

      {/* Email Notification Dispatch Status */}
      <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 text-slate-800 space-y-3 no-print shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  Order Email Notification Dispatched
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Sent
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Full order details and customer delivery address have been sent to R Mart Dispatch ({order.customerInfo.email || 'ahmedskkawsar43@gmail.com'}).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEmailPreview(!showEmailPreview)}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>{showEmailPreview ? 'Hide Notification' : 'View Email Details'}</span>
            {showEmailPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Notification Content */}
        {showEmailPreview && notification && (
          <div className="pt-3 border-t border-emerald-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <p className="text-slate-600">
                  <strong>Subject:</strong> {notification.subject}
                </p>
                <p className="text-slate-500 text-[11px]">
                  <strong>Recipient:</strong> {notification.recipientAdmin}
                  {notification.recipientCustomer ? ` · ${notification.recipientCustomer}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(notification.textContent);
                  setCopiedText(true);
                  setTimeout(() => setCopiedText(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60">
              {notification.textContent}
            </pre>
          </div>
        )}
      </div>

      {/* Invoice Card */}
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 space-y-6 print-container text-slate-800 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <Logo size="md" />
            <p className="text-[11px] text-slate-500 mt-1">rmartoffcial.shop · Hotline: 01619415744</p>
          </div>
          <div className="sm:text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Order Number
            </span>
            <span className="text-lg font-mono font-extrabold text-emerald-700">
              {order.orderNumber}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Status: {order.orderStatus}
              </span>
              <p className="text-[11px] text-slate-500">
                Payment: Cash on Delivery (৳{order.totalAmount.toLocaleString()} upon arrival)
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Zone: {order.deliveryZoneName}</span>
          </div>
        </div>

        {/* Customer & Shipping Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
              Customer Information
            </h4>
            <p className="text-slate-800 font-bold">{order.customerInfo.name}</p>
            <p className="text-slate-600">{order.customerInfo.phone}</p>
            {order.customerInfo.email && <p className="text-slate-500">{order.customerInfo.email}</p>}
          </div>

          <div className="space-y-1.5">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
              Delivery Address
            </h4>
            <p className="text-slate-700">{order.shippingAddress.streetAddress}</p>
            <p className="text-slate-700">
              {order.shippingAddress.upazilaOrArea}, {order.shippingAddress.district}
            </p>
            <p className="text-slate-500">Division: {order.shippingAddress.division}</p>
            {order.customerNote && (
              <p className="text-slate-500 italic pt-1">Note: "{order.customerNote}"</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-xs mb-3">
            Items Ordered
          </h4>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-10 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                  <div>
                    <p className="font-bold text-slate-900">{item.productName}</p>
                    <p className="text-[11px] text-slate-500">
                      Qty: {item.quantity} {item.size && `· Size: ${item.size}`}{' '}
                      {item.color && `· Color: ${item.color}`}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-bold text-slate-900">
                  ৳{item.totalPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span className="font-mono font-medium text-slate-700">৳{order.subtotal.toLocaleString()}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span className="font-mono">-৳{order.discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>Delivery Fee ({order.deliveryZoneName})</span>
            <span className="font-mono font-medium text-slate-700">
              {order.deliveryCharge === 0 ? 'FREE' : `৳${order.deliveryCharge}`}
            </span>
          </div>
          <div className="flex justify-between text-slate-900 font-extrabold text-base pt-3 border-t border-slate-100">
            <span>Total Payable (COD)</span>
            <span className="font-mono text-emerald-700">৳{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <button
          onClick={() => window.print()}
          className="px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          <span>Print Receipt / Invoice</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/track-order?orderId=${order.orderNumber}&phone=${order.customerInfo.phone}`)}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-md active:scale-95 flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            <span>Track Live Status</span>
          </button>

          <button
            onClick={() => navigate('/shop')}
            className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};
