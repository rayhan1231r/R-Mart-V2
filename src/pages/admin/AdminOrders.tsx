import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Truck,
  Printer,
  X,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  User,
  Send,
  Mail,
  Check,
} from 'lucide-react';
import { getOrders, updateOrderStatus, sendOrderNotificationEmail } from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { Order, OrderStatus } from '../../types';

interface AdminOrdersProps {
  navigate: (path: string) => void;
  selectedOrderId?: string;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ navigate, selectedOrderId }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSentMsg, setEmailSentMsg] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (selectedOrderId && orders.length > 0) {
      const found = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId);
      if (found) setActiveOrder(found);
    }
  }, [selectedOrderId, orders]);

  async function loadOrders() {
    setLoading(true);
    try {
      const list = await getOrders();
      setOrders(list);
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!activeOrder) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(activeOrder.id, newStatus, statusNote, user?.email);
      if (updated) {
        setActiveOrder(updated);
        setStatusNote('');
        loadOrders();
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleResendEmail = async () => {
    if (!activeOrder) return;
    setResendingEmail(true);
    setEmailSentMsg(null);
    try {
      const res = await sendOrderNotificationEmail(activeOrder);
      setEmailSentMsg(`Order email dispatched to ${res.recipientAdmin}!`);
      setTimeout(() => setEmailSentMsg(null), 4000);
    } catch (err: any) {
      console.warn('Error resending order email:', err);
    } finally {
      setResendingEmail(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.orderStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerInfo.name.toLowerCase().includes(q) ||
        o.customerInfo.phone.includes(q) ||
        o.shippingAddress.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <span>Order Fulfillment & Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real customer orders ({orders.length} total) with Cash on Delivery tracking
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        {/* Status filters */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-xl text-xs">
          {['all', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search Order #, Phone, Name..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading orders...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">District / Zone</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {o.customerInfo.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {o.customerInfo.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {o.shippingAddress.district} ({o.deliveryZoneName})
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono">
                      {o.items.reduce((s, it) => s + it.quantity, 0)} pcs
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ৳{o.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.orderStatus === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : o.orderStatus === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-400'
                            : o.orderStatus === 'shipped'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveOrder(o)}
                        className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Orders Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try clearing your active status or search filters.'
                : 'When customers place real orders through the customer checkout, they will appear here in real time.'}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal / Drawer */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setActiveOrder(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#0E1318] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto text-xs text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Order Details
                </span>
                <h2 className="text-xl font-mono font-bold text-white">
                  {activeOrder.orderNumber}
                </h2>
                <p className="text-[11px] text-slate-400">
                  Placed on {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resendingEmail}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  title="Resend email notification with complete order details"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{resendingEmail ? 'Sending...' : 'Resend Email'}</span>
                </button>
                <button
                  onClick={() => setActiveOrder(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {emailSentMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{emailSentMsg}</span>
              </div>
            )}

            {/* Lifecycle Status Updater */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Update Order Status
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 uppercase">
                  Current: {activeOrder.orderStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    'pending',
                    'confirmed',
                    'processing',
                    'packed',
                    'shipped',
                    'delivered',
                    'cancelled',
                  ] as OrderStatus[]
                ).map((st) => (
                  <button
                    key={st}
                    disabled={updating}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      activeOrder.orderStatus === st
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-500/20'
                        : 'bg-white/[0.04] text-slate-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Optional log note (e.g. Phone confirmed with customer)"
                  value={statusNote || ''}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="flex-1 h-8 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="space-y-1">
                <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer Contact</span>
                </h4>
                <p className="text-white font-medium">{activeOrder.customerInfo.name}</p>
                <p className="font-mono text-emerald-400">
                  <a href={`tel:${activeOrder.customerInfo.phone}`} className="hover:underline">
                    📞 {activeOrder.customerInfo.phone}
                  </a>
                </p>
                {activeOrder.customerInfo.email && (
                  <p className="text-slate-400">{activeOrder.customerInfo.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shipping Address</span>
                </h4>
                <p className="text-slate-300">{activeOrder.shippingAddress.streetAddress}</p>
                <p className="text-slate-400">
                  {activeOrder.shippingAddress.upazilaOrArea}, {activeOrder.shippingAddress.district}
                </p>
                <p className="text-slate-400">
                  Division: {activeOrder.shippingAddress.division} ({activeOrder.deliveryZoneName})
                </p>
                {activeOrder.customerNote && (
                  <p className="text-amber-300 italic pt-1">
                    Customer Note: "{activeOrder.customerNote}"
                  </p>
                )}
              </div>
            </div>

            {/* Ordered Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px]">Items Ordered</h4>
              <div className="divide-y divide-white/[0.04] border border-white/10 rounded-xl overflow-hidden bg-black/20">
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.productImage}
                        alt={it.productName}
                        className="w-10 h-12 rounded object-cover bg-slate-900 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                      <div>
                        <div className="font-semibold text-white">{it.productName}</div>
                        <div className="text-[11px] text-slate-400">
                          Qty: {it.quantity} {it.size && `· Size: ${it.size}`}{' '}
                          {it.color && `· Color: ${it.color}`}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white">
                      ৳{it.totalPrice.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price calculation */}
            <div className="space-y-1.5 pt-2 border-t border-white/10 text-right">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono text-white">৳{activeOrder.subtotal.toLocaleString()}</span>
              </div>
              {activeOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({activeOrder.couponCode}):</span>
                  <span className="font-mono">-৳{activeOrder.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Delivery Charge ({activeOrder.deliveryZoneName}):</span>
                <span className="font-mono text-white">
                  {activeOrder.deliveryCharge === 0 ? 'FREE' : `৳${activeOrder.deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-white/10">
                <span>Total Due on Delivery (COD):</span>
                <span className="font-mono text-emerald-400">
                  ৳{activeOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* History timeline */}
            {activeOrder.statusHistory && activeOrder.statusHistory.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <h4 className="font-bold text-white uppercase text-[11px]">Status Audit Log</h4>
                <div className="space-y-1 text-[11px] font-mono text-slate-400">
                  {activeOrder.statusHistory.map((h, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        • <span className="text-white capitalize">{h.status}</span>:{' '}
                        {h.note || 'No notes'}
                      </span>
                      <span>{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
