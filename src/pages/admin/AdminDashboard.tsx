import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Package,
  Boxes,
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Plus,
  Truck,
  ExternalLink,
  Layers,
  Settings,
  Bot,
  Sparkles,
  Calendar,
  Download,
  FileText,
  Printer,
  Trash2,
  Lock,
  Key,
  ShieldAlert,
  RotateCcw,
  DollarSign,
  ChevronDown,
  Filter,
  Check,
} from 'lucide-react';
import {
  getOrders,
  getProducts,
  getCustomers,
  getCategories,
  getDeliveryZones,
  getSiteSettings,
  resetStoreOrdersAndMetrics,
} from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { Order, Product, SiteSettings } from '../../types';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

interface DaySalesRecord {
  dayNumber: number;
  dateStr: string;
  dayName: string;
  ordersCount: number;
  deliveredCount: number;
  grossRevenue: number;
  deliveryCharge: number;
  netRevenue: number;
  itemsCount: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Store Reset Modal States
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ success: boolean; text: string } | null>(null);

  // Month & Daily Ledger States
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-indexed
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordList, prodList, custList, catList, settings] = await Promise.all([
          getOrders(),
          getProducts({ activeOnly: false }),
          getCustomers(),
          getCategories(),
          getSiteSettings(),
        ]);
        setOrders(ordList);
        setProducts(prodList);
        setCustomerCount(custList.length);
        setCategoryCount(catList.length);
        setSiteSettings(settings);
      } catch (err) {
        console.warn('Dashboard data notice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending');
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered');
  const lowStockProducts = products.filter((p) => p.totalStock <= 5);
  const outOfStockProducts = products.filter((p) => p.totalStock <= 0);

  // Setup Checklist steps
  const hasCategories = categoryCount > 0;
  const hasProducts = products.length > 0;
  const hasOrders = orders.length > 0;

  // Handle Reset Store Analytics
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPin.trim()) return;
    setResetting(true);
    setResetMsg(null);
    try {
      const res = await resetStoreOrdersAndMetrics(resetPin, user?.email);
      if (res.success) {
        setResetMsg({
          success: true,
          text: 'স্টোরের সকল অর্ডার, হিস্টোরি ও রেভিনিউ সফলভাবে ০ (রিসেট) করা হয়েছে!',
        });
        setOrders([]);
        setResetPin('');
        setTimeout(() => {
          setResetModalOpen(false);
          setResetMsg(null);
        }, 2200);
      } else {
        setResetMsg({
          success: false,
          text: res.error || 'রিসেট ব্যর্থ হয়েছে। সঠিক পিন দিন।',
        });
      }
    } finally {
      setResetting(false);
    }
  };

  // Calculate day-by-day sales for selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dailyRecords: DaySalesRecord[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(selectedYear, selectedMonth, d);
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayName = dayNamesShort[dateObj.getDay()];

    const dayOrders = orders.filter((o) => {
      if (!o.createdAt) return false;
      return o.createdAt.startsWith(dateStr);
    });

    const dayDelivered = dayOrders.filter((o) => o.orderStatus === 'delivered');
    const gross = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const deliv = dayOrders.reduce((sum, o) => sum + (o.deliveryCharge || 0), 0);
    const net = gross - deliv;
    const items = dayOrders.reduce((sum, o) => sum + (o.items?.reduce((s, it) => s + (it.quantity || 1), 0) || 0), 0);

    dailyRecords.push({
      dayNumber: d,
      dateStr,
      dayName,
      ordersCount: dayOrders.length,
      deliveredCount: dayDelivered.length,
      grossRevenue: gross,
      deliveryCharge: deliv,
      netRevenue: net,
      itemsCount: items,
    });
  }

  // Monthly aggregated totals
  const monthGrossRevenue = dailyRecords.reduce((sum, r) => sum + r.grossRevenue, 0);
  const monthDeliveryCharges = dailyRecords.reduce((sum, r) => sum + r.deliveryCharge, 0);
  const monthNetRevenue = dailyRecords.reduce((sum, r) => sum + r.netRevenue, 0);
  const monthOrdersCount = dailyRecords.reduce((sum, r) => sum + r.ordersCount, 0);
  const monthDeliveredCount = dailyRecords.reduce((sum, r) => sum + r.deliveredCount, 0);
  const monthItemsSold = dailyRecords.reduce((sum, r) => sum + r.itemsCount, 0);
  const monthAvgOrder = monthOrdersCount > 0 ? Math.round(monthGrossRevenue / monthOrdersCount) : 0;

  // Print/Download PDF handler
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            Store Performance Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics and inventory health for {siteSettings?.storeName || 'R Mart'} ({siteSettings?.domain || 'rmartoffcial.shop'})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reset Store Button with PIN Requirement */}
          <button
            onClick={() => {
              setResetModalOpen(true);
              setResetPin('');
              setResetMsg(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-all border border-rose-500/30 flex items-center gap-1.5 shadow-xs active:scale-95"
            title="Reset Store Revenue & Orders to 0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset Store (০ করুন)</span>
          </button>

          <button
            onClick={() => navigate('/admin/ai-agent')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span>AI Business Co-Pilot</span>
          </button>

          <button
            onClick={() => navigate('/admin/courier')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 flex items-center gap-1.5 active:scale-95"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Courier Dispatch</span>
          </button>

          <button
            onClick={() => navigate('/admin/products/new')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/10 flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* AI & Dispatch Fast Banner Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/admin/ai-agent')}
          className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/30 border border-emerald-500/30 cursor-pointer hover:border-emerald-500/60 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">AI Business Co-Pilot Agent</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  NEW
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate SEO descriptions, draft WhatsApp/SMS dispatches & analyze restock urgency.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>

        <div
          onClick={() => navigate('/admin/courier')}
          className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 cursor-pointer hover:border-emerald-500/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Courier & Logistics Dispatch Hub</h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                  STEADFAST / REDX
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                1-click consignment generation, parcel barcode challan & Cash on Delivery tracking.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      </div>

      {/* Real Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Orders</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white">
              {orders.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {orders.length === 0 ? 'No orders placed yet (0)' : `${deliveredOrders.length} delivered`}
            </p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-5 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Verification</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-amber-400">
              {pendingOrders.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {pendingOrders.length > 0 ? 'Requires order confirmation' : 'Zero pending orders'}
            </p>
          </div>
        </div>

        {/* Revenue */}
        <div className="p-5 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue (COD)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              ৳{totalRevenue.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {totalRevenue === 0 ? 'Reset to ৳0' : 'From actual customer checkouts'}
            </p>
          </div>
        </div>

        {/* Catalog Size */}
        <div className="p-5 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Catalog</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white">
              {products.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {products.length} products ({categoryCount} categories)
            </p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts If Any */}
      {lowStockProducts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">Inventory Alert:</span>{' '}
              <span className="text-slate-300">
                {lowStockProducts.length} product(s) have reached low stock (5 or fewer units).
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/inventory')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold self-start sm:self-auto transition-colors"
          >
            Review Inventory →
          </button>
        </div>
      )}

      {/* MONTHLY & DAILY REVENUE / SALES ANALYTICS SECTION WITH PDF DOWNLOAD */}
      <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.08] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Monthly & Daily Sales Ledger (প্রতি মাসের দৈনিক হিসাব ও রিপোর্ট)</span>
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                AUDIT READY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Detailed daily breakdown of orders, gross revenue, delivery fees & net sales for{' '}
              <span className="text-white font-semibold">{monthNames[selectedMonth]} {selectedYear}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Selector */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMonth ?? 0}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {monthNames.map((m, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear ?? new Date().getFullYear()}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer border-l border-white/10 pl-2"
              >
                {[selectedYear - 1, selectedYear, selectedYear + 1].map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-900 text-white">
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Download PDF / Print Button */}
            <button
              onClick={() => setReportModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </button>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Month Sales</span>
            <div className="text-lg font-mono font-bold text-emerald-400">
              ৳{monthGrossRevenue.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Delivered Sales</span>
            <div className="text-lg font-mono font-bold text-teal-400">
              {monthDeliveredCount} orders
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Orders</span>
            <div className="text-lg font-mono font-bold text-white">
              {monthOrdersCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Delivery Fees</span>
            <div className="text-lg font-mono font-bold text-slate-300">
              ৳{monthDeliveryCharges.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Net Product Revenue</span>
            <div className="text-lg font-mono font-bold text-emerald-300">
              ৳{monthNetRevenue.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Order Value</span>
            <div className="text-lg font-mono font-bold text-amber-400">
              ৳{monthAvgOrder.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Day-by-day Breakdown Table */}
        <div className="overflow-x-auto max-h-[380px] rounded-2xl border border-white/[0.06]">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-[#161C24] text-slate-300 border-b border-white/[0.08] z-10">
              <tr>
                <th className="py-2.5 px-3">Date (Day)</th>
                <th className="py-2.5 px-3 text-center">Total Orders</th>
                <th className="py-2.5 px-3 text-center">Delivered</th>
                <th className="py-2.5 px-3 text-center">Items Sold</th>
                <th className="py-2.5 px-3 text-right">Delivery Fees</th>
                <th className="py-2.5 px-3 text-right">Gross Revenue (৳)</th>
                <th className="py-2.5 px-3 text-right">Net Sales (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {dailyRecords.map((r) => {
                const hasSales = r.ordersCount > 0;
                return (
                  <tr
                    key={r.dayNumber}
                    className={`transition-colors ${
                      hasSales ? 'bg-emerald-500/[0.03] hover:bg-emerald-500/[0.08]' : 'hover:bg-white/[0.01]'
                    }`}
                  >
                    <td className="py-2 px-3 font-mono">
                      <span className="font-bold text-white">{String(r.dayNumber).padStart(2, '0')}</span>{' '}
                      <span className="text-[11px] text-slate-400">{monthNames[selectedMonth].slice(0, 3)} ({r.dayName})</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        r.ordersCount > 0 ? 'bg-blue-500/20 text-blue-300' : 'text-slate-500'
                      }`}>
                        {r.ordersCount}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        r.deliveredCount > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-500'
                      }`}>
                        {r.deliveredCount}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-slate-400">
                      {r.itemsCount}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">
                      ৳{r.deliveryCharge.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-400">
                      ৳{r.grossRevenue.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-300">
                      ৳{r.netRevenue.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="sticky bottom-0 bg-[#161C24] border-t-2 border-white/20 font-bold text-white text-xs">
              <tr>
                <td className="py-2.5 px-3">MONTH TOTAL:</td>
                <td className="py-2.5 px-3 text-center font-mono text-blue-300">{monthOrdersCount}</td>
                <td className="py-2.5 px-3 text-center font-mono text-emerald-300">{monthDeliveredCount}</td>
                <td className="py-2.5 px-3 text-center font-mono">{monthItemsSold}</td>
                <td className="py-2.5 px-3 text-right font-mono">৳{monthDeliveryCharges.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-400">৳{monthGrossRevenue.toLocaleString()}</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-300">৳{monthNetRevenue.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Store Launch Setup Checklist */}
      <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>R Mart Launch & Setup Checklist</span>
            </h2>
            <p className="text-xs text-slate-400">
              Guide to building a complete, high-converting catalog without demo data
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Step 1: Categories */}
          <div
            onClick={() => navigate('/admin/categories')}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Create Categories</span>
              </span>
              {hasCategories ? (
                <span className="text-[10px] text-emerald-400 font-bold">✓ {categoryCount} Ready</span>
              ) : (
                <span className="text-[10px] text-amber-400">Needs Setup</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Set up apparel, footwear, accessories, or electronics departments.
            </p>
          </div>

          {/* Step 2: Products */}
          <div
            onClick={() => navigate('/admin/products/new')}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Add Real Products</span>
              </span>
              {hasProducts ? (
                <span className="text-[10px] text-emerald-400 font-bold">✓ {products.length} Added</span>
              ) : (
                <span className="text-[10px] text-amber-400">Empty Catalog</span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Upload images, add size variants, colors, and configure SKU stock.
            </p>
          </div>

          {/* Step 3: Delivery */}
          <div
            onClick={() => navigate('/admin/delivery')}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Delivery Zones</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">✓ Dhaka & BD Ready</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Confirm courier fees (৳70 inside Dhaka, ৳130 outside Dhaka).
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Orders</h3>
            <p className="text-xs text-slate-400">Latest customer transactions from checkout</p>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400">
                  <th className="py-2.5">Order ID</th>
                  <th className="py-2.5">Customer</th>
                  <th className="py-2.5">Phone</th>
                  <th className="py-2.5">Zone</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Total</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-white/[0.01]">
                    <td className="py-3 font-mono font-bold text-white">{o.orderNumber}</td>
                    <td className="py-3 text-slate-200">{o.customerInfo.name}</td>
                    <td className="py-3 font-mono text-slate-400">{o.customerInfo.phone}</td>
                    <td className="py-3 text-slate-400">{o.deliveryZoneName}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 uppercase">
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-white text-right">
                      ৳{o.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders?view=${o.id}`)}
                        className="text-emerald-400 hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No customer orders recorded yet. As customers place orders via Cash on Delivery, they will appear here in real time.
          </div>
        )}
      </div>

      {/* STORE RESET CONFIRMATION MODAL WITH PIN PROTECTION */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0F141A] border border-rose-500/40 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Reset Store Dashboard & Orders
                </h3>
                <p className="text-xs text-rose-400 font-semibold">
                  Are you sure you want to reset everything to 0?
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-slate-300 space-y-2">
              <p>
                <strong>সাবধান:</strong> এটি নিশ্চিত করলে মোট রেভিনিউ <strong>৳০</strong> হবে, মোট অর্ডার <strong>০</strong> হবে এবং <strong>সকল অর্ডার হিস্টোরি মুছে যাবে</strong>।
              </p>
              <p className="text-[11px] text-slate-400">
                এই কাজটি করার জন্য আপনার সিকিউরিটি পিন (Security PIN) প্রদান করুন।
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter Admin Security PIN (সিকিউরিটি পিন দিন) *
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  maxLength={8}
                  placeholder="••••"
                  value={resetPin || ''}
                  onChange={(e) => setResetPin(e.target.value)}
                  className="w-full h-11 px-4 text-center font-mono text-xl font-bold tracking-widest rounded-xl bg-white/[0.04] border border-white/20 text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 px-1">
                  <span>Default PIN: 1234</span>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(false);
                      navigate('/admin/settings');
                    }}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    Change PIN in Settings &rarr;
                  </button>
                </div>
              </div>

              {resetMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    resetMsg.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {resetMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                  <span>{resetMsg.text}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetModalOpen(false);
                    setResetPin('');
                    setResetMsg(null);
                  }}
                  className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting || !resetPin}
                  className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md active:scale-98 disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{resetting ? 'Resetting...' : 'Verify & Reset to 0'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF SALES LEDGER REPORT MODAL (Ready to print / download as PDF) */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Monthly Sales Ledger & Audit Report
                </h3>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handlePrintPdf}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save as PDF</span>
                </button>
                <button
                  onClick={() => setReportModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Report Content */}
            <div className="print-container space-y-6 text-slate-900">
              {/* Report Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
                <div>
                  <h1 className="text-2xl font-display font-extrabold text-slate-950 tracking-tight">
                    {siteSettings?.storeName || 'R Mart'} Bangladesh
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Official All-Category E-Commerce Marketplace
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Domain: {siteSettings?.domain || 'rmartoffcial.shop'} · Helpline: {siteSettings?.phone || '01619415744'}
                  </p>
                </div>

                <div className="text-right space-y-1">
                  <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-lg uppercase tracking-wider">
                    Official Sales Statement
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    Period: {monthNames[selectedMonth]} {selectedYear}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Generated: {new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              {/* KPI Summary Grid */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Gross Sales</span>
                  <div className="text-xl font-bold font-mono text-emerald-700">
                    ৳{monthGrossRevenue.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Orders Placed</span>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {monthOrdersCount} <span className="text-xs font-normal text-slate-500">({monthDeliveredCount} delivered)</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Delivery Fees Collected</span>
                  <div className="text-xl font-bold font-mono text-slate-800">
                    ৳{monthDeliveryCharges.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Net Product Sales</span>
                  <div className="text-xl font-bold font-mono text-emerald-800">
                    ৳{monthNetRevenue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Daily Ledger Table */}
              <table className="w-full text-xs text-left border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2 border border-slate-300">Date</th>
                    <th className="p-2 border border-slate-300 text-center">Day</th>
                    <th className="p-2 border border-slate-300 text-center">Orders</th>
                    <th className="p-2 border border-slate-300 text-center">Delivered</th>
                    <th className="p-2 border border-slate-300 text-center">Items</th>
                    <th className="p-2 border border-slate-300 text-right">Delivery Charge</th>
                    <th className="p-2 border border-slate-300 text-right">Gross Sales (৳)</th>
                    <th className="p-2 border border-slate-300 text-right">Net Sales (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRecords.map((r) => (
                    <tr
                      key={r.dayNumber}
                      className={r.ordersCount > 0 ? 'bg-emerald-50/40' : ''}
                    >
                      <td className="p-1.5 border border-slate-300 font-mono font-semibold">
                        {r.dateStr}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center text-slate-600">
                        {r.dayName}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">
                        {r.ordersCount}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono text-emerald-700 font-bold">
                        {r.deliveredCount}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-center font-mono">
                        {r.itemsCount}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-right font-mono">
                        ৳{r.deliveryCharge.toLocaleString()}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-right font-mono font-bold text-emerald-800">
                        ৳{r.grossRevenue.toLocaleString()}
                      </td>
                      <td className="p-1.5 border border-slate-300 text-right font-mono font-semibold text-slate-900">
                        ৳{r.netRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-200 font-extrabold text-slate-950 border-t-2 border-slate-900">
                    <td className="p-2 border border-slate-300" colSpan={2}>
                      MONTH TOTAL ({monthNames[selectedMonth]} {selectedYear})
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono">
                      {monthOrdersCount}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono text-emerald-800">
                      {monthDeliveredCount}
                    </td>
                    <td className="p-2 border border-slate-300 text-center font-mono">
                      {monthItemsSold}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono">
                      ৳{monthDeliveryCharges.toLocaleString()}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-emerald-900">
                      ৳{monthGrossRevenue.toLocaleString()}
                    </td>
                    <td className="p-2 border border-slate-300 text-right font-mono text-emerald-950">
                      ৳{monthNetRevenue.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Sign-off footer */}
              <div className="pt-8 flex justify-between items-end text-xs text-slate-500 border-t border-slate-200">
                <div>
                  <p>Certified Official Record</p>
                  <p className="font-semibold text-slate-700">R Mart Store Operations & Financial Ledger</p>
                </div>
                <div className="text-right">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <p>Authorized Signature / Stamp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
