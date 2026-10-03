import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  Search,
  CheckCircle,
  ExternalLink,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { getOrders, updateOrderStatus, recordAuditLog } from '../../lib/store';
import type { Order } from '../../types';

export const AdminCourierHub: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<'steadfast' | 'redx' | 'pathao'>('steadfast');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const list = await getOrders();
    setOrders(list);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDispatch = async (order: Order) => {
    setProcessingId(order.id);
    try {
      const courierPrefix =
        selectedCourier === 'steadfast' ? 'STF' : selectedCourier === 'redx' ? 'RDX' : 'PTH';
      const consignmentNo = `${courierPrefix}-${Math.floor(1000000 + Math.random() * 9000000)}`;

      await updateOrderStatus(
        order.id,
        'shipped',
        `Dispatched via ${selectedCourier.toUpperCase()} Courier (Consignment: ${consignmentNo})`
      );
      await loadOrders();
    } finally {
      setProcessingId(null);
    }
  };

  const pendingDispatches = orders.filter(
    (o) => o.orderStatus === 'pending' || o.orderStatus === 'processing'
  );

  const filteredOrders = pendingDispatches.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customerInfo.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
            <Truck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Courier Dispatch & Fulfillment Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Steadfast Courier, RedX Logistics & Pathao Courier consignment generation and bulk challan printing.
            </p>
          </div>
        </div>

        {/* Courier selector */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSelectedCourier('steadfast')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedCourier === 'steadfast'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Steadfast Courier
          </button>
          <button
            onClick={() => setSelectedCourier('redx')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedCourier === 'redx'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            RedX Logistics
          </button>
          <button
            onClick={() => setSelectedCourier('pathao')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              selectedCourier === 'pathao'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pathao Courier
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Ready for Consignment</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{pendingDispatches.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total COD Collection Amount</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
            ৳{pendingDispatches.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Courier Coverage</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">64 Districts</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by order number, customer name or phone..."
            value={search || ''}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <button
          onClick={loadOrders}
          className="h-11 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Order List */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredOrders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredOrders.map((o) => (
              <div key={o.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-slate-900">{o.orderNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 capitalize">
                      {o.orderStatus}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    <div>
                      <strong className="text-slate-900">{o.customerInfo.name}</strong> ·{' '}
                      <span className="font-mono text-slate-600">{o.customerInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {o.shippingAddress.streetAddress}, {o.shippingAddress.upazilaOrArea}, {o.shippingAddress.district}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{o.items.length} item(s)</span>
                    <span>·</span>
                    <span>Delivery: {o.deliveryZoneName || 'Bangladesh'}</span>
                    <span>·</span>
                    <span className="font-bold text-slate-900 font-mono">
                      COD Payable: ৳{o.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => window.print()}
                    className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Challan</span>
                  </button>

                  <button
                    onClick={() => handleDispatch(o)}
                    disabled={processingId === o.id}
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Truck className="w-4 h-4" />
                    <span>
                      {processingId === o.id
                        ? 'Generating...'
                        : `Dispatch via ${selectedCourier.toUpperCase()}`}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-800">No pending orders awaiting courier dispatch.</p>
          </div>
        )}
      </div>
    </div>
  );
};
