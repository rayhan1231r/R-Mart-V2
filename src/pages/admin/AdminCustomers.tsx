import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingBag,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  MapPin,
  Lock,
  Copy,
  Check,
} from 'lucide-react';
import {
  getCustomers,
  banCustomer,
  unbanCustomer,
  getBannedIps,
  banIpAddress,
  unbanIpAddress,
  getClientIp,
  PRIMARY_OWNER_EMAIL,
} from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { Customer, BannedIpRecord } from '../../types';

export const AdminCustomers: React.FC<{ initialTab?: 'customers' | 'ip-bans' }> = ({
  initialTab = 'customers',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'customers' | 'ip-bans'>(initialTab);

  // Customers state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<'all' | 'active' | 'banned'>('all');

  // IP Blacklist state
  const [bannedIps, setBannedIps] = useState<BannedIpRecord[]>([]);
  const [loadingIps, setLoadingIps] = useState(true);
  const [ipSearch, setIpSearch] = useState('');
  const [detectedClientIp, setDetectedClientIp] = useState<string>('');

  // Modals & Feedback
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isBanCustomerModalOpen, setIsBanCustomerModalOpen] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<Customer | null>(null);
  const [banReason, setBanReason] = useState('Repeated fake order or fraudulent cash on delivery refusal');
  const [alsoBanCustomerIp, setAlsoBanCustomerIp] = useState(true);

  const [isAddIpModalOpen, setIsAddIpModalOpen] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newIpReason, setNewIpReason] = useState('Suspicious fraudulent order activity or automated bot');
  const [newIpAssociatedEmail, setNewIpAssociatedEmail] = useState('');

  const [inspectCustomer, setInspectCustomer] = useState<Customer | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  const adminEmail = user?.email || PRIMARY_OWNER_EMAIL;

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadData = async () => {
    setLoadingCustomers(true);
    setLoadingIps(true);
    try {
      const [custList, ipList, clientIp] = await Promise.all([
        getCustomers(),
        getBannedIps(),
        getClientIp(),
      ]);
      setCustomers(custList);
      setBannedIps(ipList);
      setDetectedClientIp(clientIp);
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to load customers and IP records.', 'error');
    } finally {
      setLoadingCustomers(false);
      setLoadingIps(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // BAN CUSTOMER HANDLER
  const handleConfirmBanCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCustomer) return;

    setIsActionInProgress(true);
    try {
      await banCustomer(targetCustomer.id, banReason, adminEmail);

      // Also ban their IP if requested and available
      if (alsoBanCustomerIp && targetCustomer.lastIpAddress) {
        await banIpAddress(
          targetCustomer.lastIpAddress,
          `Banned along with user ${targetCustomer.email}: ${banReason}`,
          adminEmail,
          targetCustomer.email
        );
      }

      showFeedback(`Successfully banned account: ${targetCustomer.name} (${targetCustomer.email})`);
      setIsBanCustomerModalOpen(false);
      setTargetCustomer(null);
      await loadData();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to ban user account.', 'error');
    } finally {
      setIsActionInProgress(false);
    }
  };

  // UNBAN CUSTOMER HANDLER
  const handleUnbanCustomer = async (customer: Customer) => {
    setIsActionInProgress(true);
    try {
      await unbanCustomer(customer.id, adminEmail);
      showFeedback(`Reinstated customer account: ${customer.name} (${customer.email})`);
      await loadData();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to unban user account.', 'error');
    } finally {
      setIsActionInProgress(false);
    }
  };

  // BAN NEW IP ADDRESS HANDLER
  const handleConfirmBanIp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = newIpAddress.trim();
    if (!cleanIp) {
      showFeedback('Please provide a valid IP address.', 'error');
      return;
    }

    setIsActionInProgress(true);
    try {
      await banIpAddress(
        cleanIp,
        newIpReason.trim() || 'Restricted by store administration',
        adminEmail,
        newIpAssociatedEmail.trim() || undefined
      );

      showFeedback(`Successfully blocked IP address: ${cleanIp}`);
      setIsAddIpModalOpen(false);
      setNewIpAddress('');
      setNewIpAssociatedEmail('');
      setNewIpReason('Suspicious fraudulent order activity or automated bot');
      await loadData();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to ban IP address.', 'error');
    } finally {
      setIsActionInProgress(false);
    }
  };

  // UNBAN IP HANDLER
  const handleUnbanIp = async (ipAddress: string) => {
    setIsActionInProgress(true);
    try {
      await unbanIpAddress(ipAddress, adminEmail);
      showFeedback(`Removed restriction for IP: ${ipAddress}`);
      await loadData();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to unban IP address.', 'error');
    } finally {
      setIsActionInProgress(false);
    }
  };

  // QUICK BAN CUSTOMER IP
  const handleQuickBanCustomerIp = async (customer: Customer) => {
    if (!customer.lastIpAddress) {
      showFeedback('No IP address recorded for this customer yet.', 'error');
      return;
    }

    setIsActionInProgress(true);
    try {
      await banIpAddress(
        customer.lastIpAddress,
        `Direct ban from customer record: ${customer.name} (${customer.email})`,
        adminEmail,
        customer.email
      );
      showFeedback(`IP ${customer.lastIpAddress} has been added to the blacklist!`);
      await loadData();
    } catch (err: any) {
      showFeedback(err?.message || 'Failed to ban customer IP.', 'error');
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Filtered customer list
  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.lastIpAddress && c.lastIpAddress.includes(q));

    const matchesStatus =
      customerStatusFilter === 'all'
        ? true
        : customerStatusFilter === 'banned'
        ? Boolean(c.isBanned || c.isBlocked)
        : !c.isBanned && !c.isBlocked;

    return matchesQuery && matchesStatus;
  });

  // Filtered IP list
  const filteredIps = bannedIps.filter((item) => {
    const q = ipSearch.toLowerCase().trim();
    return (
      !q ||
      item.ipAddress.toLowerCase().includes(q) ||
      (item.reason && item.reason.toLowerCase().includes(q)) ||
      (item.associatedEmail && item.associatedEmail.toLowerCase().includes(q))
    );
  });

  const totalBannedCount = customers.filter((c) => c.isBanned || c.isBlocked).length;
  const totalActiveCount = customers.length - totalBannedCount;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Customer Accounts & Security Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer profiles, order history, user account ban/unban, and IP address blacklists
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-colors"
            title="Refresh Records"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loadingCustomers || loadingIps ? 'animate-spin text-emerald-400' : ''
              }`}
            />
          </button>

          {activeTab === 'ip-bans' && (
            <button
              onClick={() => setIsAddIpModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Ban className="w-4 h-4" />
              <span>Ban New IP Address</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-white/[0.08] gap-2">
        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'customers'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer Directory</span>
          <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-[10px] font-mono font-bold text-slate-300">
            {customers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ip-bans')}
          className={`pb-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'ip-bans'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>IP Blacklist & Security</span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold border border-rose-500/30">
            {bannedIps.length} Banned
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CUSTOMER DIRECTORY & USER BAN/UNBAN                                */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-5">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Registered Accounts</span>
              <div className="text-2xl font-bold font-mono text-white">{customers.length}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F141A] border border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-emerald-300 font-medium">Active Customers</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{totalActiveCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F141A] border border-rose-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-rose-300 font-medium">Banned Accounts</span>
                <Ban className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-rose-400">{totalBannedCount}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F141A] border border-white/[0.06] space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Total Spent (BDT)</span>
              <div className="text-2xl font-bold font-mono text-white">
                ৳{customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name, phone, email, or IP..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              {(['all', 'active', 'banned'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setCustomerStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    customerStatusFilter === s
                      ? s === 'banned'
                        ? 'bg-rose-600 text-white font-bold shadow-md'
                        : 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5'
                  }`}
                >
                  {s === 'all' ? 'All Customers' : s}
                </button>
              ))}
            </div>
          </div>

          {/* Customers Table */}
          <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden shadow-xl">
            {loadingCustomers ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                <span>Loading customer accounts...</span>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-400 uppercase tracking-wider font-mono text-[10px] bg-white/[0.02]">
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Phone Number</th>
                      <th className="py-3.5 px-4">Recorded IP</th>
                      <th className="py-3.5 px-4">Orders & Spent</th>
                      <th className="py-3.5 px-4">Account Status</th>
                      <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredCustomers.map((c) => {
                      const isBanned = Boolean(c.isBanned || c.isBlocked);

                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-white/[0.015] transition-colors ${
                            isBanned ? 'bg-rose-500/[0.03]' : ''
                          }`}
                        >
                          {/* Name & Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                  isBanned
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}
                              >
                                {isBanned ? (
                                  <Ban className="w-4 h-4 text-rose-400" />
                                ) : (
                                  c.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setInspectCustomer(c)}
                                    className="font-semibold text-white hover:text-emerald-400 transition-colors truncate text-left"
                                  >
                                    {c.name}
                                  </button>
                                  {c.tier && (
                                    <span className="text-[9px] uppercase font-mono font-bold bg-white/5 px-1.5 py-0.5 rounded text-amber-300">
                                      {c.tier}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                                  <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                                  <span>{c.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            <a
                              href={`tel:${c.phone}`}
                              className="hover:text-emerald-400 flex items-center gap-1.5"
                            >
                              <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                              <span>{c.phone}</span>
                            </a>
                          </td>

                          {/* Recorded IP Address */}
                          <td className="py-3.5 px-4">
                            {c.lastIpAddress ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] text-slate-300 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/5">
                                  {c.lastIpAddress}
                                </span>
                                <button
                                  onClick={() => handleCopy(c.lastIpAddress!)}
                                  className="p-1 rounded text-slate-500 hover:text-white"
                                  title="Copy IP"
                                >
                                  {copiedIp === c.lastIpAddress ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleQuickBanCustomerIp(c)}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30"
                                  title="Ban this IP"
                                >
                                  Ban IP
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-600 font-mono italic">
                                Recorded on order
                              </span>
                            )}
                          </td>

                          {/* Orders & Spent */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="text-white font-bold">{c.totalOrders} Orders</div>
                            <div className="text-emerald-400 text-[11px]">
                              ৳{(c.totalSpent || 0).toLocaleString()}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4">
                            {isBanned ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  <Ban className="w-3 h-3 text-rose-400" />
                                  <span>BANNED</span>
                                </span>
                                {c.banReason && (
                                  <div
                                    className="text-[10px] text-slate-400 truncate max-w-[180px]"
                                    title={c.banReason}
                                  >
                                    {c.banReason}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>ACTIVE</span>
                              </span>
                            )}
                          </td>

                          {/* Moderation Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setInspectCustomer(c)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold"
                              >
                                View Profile
                              </button>

                              {isBanned ? (
                                <button
                                  onClick={() => handleUnbanCustomer(c)}
                                  disabled={isActionInProgress}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5"
                                  title="Restore customer account to Active status"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Unban User</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setTargetCustomer(c);
                                    setIsBanCustomerModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5"
                                  title="Restrict customer from logging in and ordering"
                                >
                                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                                  <span>Ban User</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <Users className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-white">No Customers Match Filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search query or filter selection.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IP SECURITY & BLACKLIST (USER IP BAN / UNBAN)                      */}
      {/* ========================================================================= */}
      {activeTab === 'ip-bans' && (
        <div className="space-y-5">
          {/* Client IP Detector & Diagnostic Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0F141A] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Your Current Detected Visitor IP:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base font-bold font-mono text-cyan-300">
                    {detectedClientIp || '103.145.22.45'}
                  </span>
                  <button
                    onClick={() => handleCopy(detectedClientIp || '103.145.22.45')}
                    className="p-1 rounded text-slate-500 hover:text-white"
                  >
                    {copiedIp === detectedClientIp ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewIpAddress(detectedClientIp);
                  setIsAddIpModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold"
              >
                Test Ban on This IP
              </button>
              <button
                onClick={() => setIsAddIpModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/40"
              >
                <Plus className="w-4 h-4" />
                <span>Add IP to Blacklist</span>
              </button>
            </div>
          </div>

          {/* Search IP */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search banned IP address, reason or customer email..."
              value={ipSearch}
              onChange={(e) => setIpSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Banned IPs Table */}
          <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden shadow-xl">
            {loadingIps ? (
              <div className="py-16 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
                <span>Loading banned IP repository...</span>
              </div>
            ) : filteredIps.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-slate-400 uppercase tracking-wider font-mono text-[10px] bg-white/[0.02]">
                      <th className="py-3.5 px-4">Banned IP Address</th>
                      <th className="py-3.5 px-4">Ban Reason & Security Log</th>
                      <th className="py-3.5 px-4">Associated User</th>
                      <th className="py-3.5 px-4">Enforced By</th>
                      <th className="py-3.5 px-4">Date Blacklisted</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredIps.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.015] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                              {item.ipAddress}
                            </span>
                            <button
                              onClick={() => handleCopy(item.ipAddress)}
                              className="p-1 rounded text-slate-500 hover:text-white"
                              title="Copy IP Address"
                            >
                              {copiedIp === item.ipAddress ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-sm">
                          <p className="text-white font-medium text-xs">{item.reason || 'Restricted by administrator'}</p>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {item.associatedEmail ? (
                            <span className="text-slate-300">{item.associatedEmail}</span>
                          ) : (
                            <span className="text-slate-600 italic">None</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {item.bannedBy || 'System Admin'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(item.bannedAt).toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleUnbanIp(item.ipAddress)}
                            disabled={isActionInProgress}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                            title="Remove IP ban and restore network access"
                          >
                            Unban IP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <Globe className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-white">No Banned IPs</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  There are currently no network IP restrictions enforced. Click "Ban New IP Address" to blacklist malicious visitors.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BAN CUSTOMER MODAL                                                        */}
      {/* ========================================================================= */}
      {isBanCustomerModalOpen && targetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0F141A] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Ban Customer Account</h3>
                <p className="text-[11px] text-slate-400">Suspend login and order placement privileges</p>
              </div>
            </div>

            <form onSubmit={handleConfirmBanCustomer} className="space-y-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="text-xs font-semibold text-white">{targetCustomer.name}</div>
                <div className="text-[11px] text-slate-400 font-mono">{targetCustomer.email}</div>
                <div className="text-[11px] text-slate-400 font-mono">Mobile: {targetCustomer.phone}</div>
                {targetCustomer.lastIpAddress && (
                  <div className="text-[11px] text-cyan-400 font-mono">
                    Last IP: {targetCustomer.lastIpAddress}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ban Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                  placeholder="Explain why this account is being banned..."
                />
              </div>

              {targetCustomer.lastIpAddress && (
                <div
                  onClick={() => setAlsoBanCustomerIp(!alsoBanCustomerIp)}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between cursor-pointer"
                >
                  <div className="pr-2">
                    <div className="text-xs font-semibold text-white">Also Blacklist Customer's IP Address</div>
                    <div className="text-[10px] text-slate-400">
                      Block IP <span className="font-mono text-rose-400">{targetCustomer.lastIpAddress}</span> from placing orders
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      alsoBanCustomerIp
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'border-white/20'
                    }`}
                  >
                    {alsoBanCustomerIp && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBanCustomerModalOpen(false);
                    setTargetCustomer(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionInProgress}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>{isActionInProgress ? 'Banning...' : 'Confirm Account Ban'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BAN NEW IP MODAL                                                          */}
      {/* ========================================================================= */}
      {isAddIpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0F141A] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Blacklist IP Address</h3>
                <p className="text-[11px] text-slate-400">Block network traffic and checkout from this IP</p>
              </div>
            </div>

            <form onSubmit={handleConfirmBanIp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  IP Address (IPv4 or IPv6) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 103.145.22.45"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ban Reason *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Repeated fraudulent COD orders"
                  value={newIpReason}
                  onChange={(e) => setNewIpReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Associated Customer Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. abuser@gmail.com"
                  value={newIpAssociatedEmail}
                  onChange={(e) => setNewIpAssociatedEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddIpModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionInProgress}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                >
                  <Ban className="w-4 h-4" />
                  <span>{isActionInProgress ? 'Blacklisting...' : 'Blacklist IP'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOMER DETAIL INSPECT MODAL                                             */}
      {/* ========================================================================= */}
      {inspectCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0F141A] border border-white/10 p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center text-sm">
                  {inspectCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{inspectCustomer.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{inspectCustomer.email}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectCustomer(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Account Status Card */}
              <div
                className={`p-3.5 rounded-2xl border ${
                  inspectCustomer.isBanned || inspectCustomer.isBlocked
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : 'bg-emerald-500/10 border-emerald-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Account Status</span>
                  {inspectCustomer.isBanned || inspectCustomer.isBlocked ? (
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                      BANNED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      ACTIVE
                    </span>
                  )}
                </div>
                {inspectCustomer.banReason && (
                  <p className="text-xs text-rose-300 mt-1">
                    <strong>Reason:</strong> {inspectCustomer.banReason}
                  </p>
                )}
                {inspectCustomer.bannedAt && (
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    Suspended on: {new Date(inspectCustomer.bannedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400">Total Orders</span>
                  <div className="text-base font-bold font-mono text-white">
                    {inspectCustomer.totalOrders}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400">Total Spent</span>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    ৳{(inspectCustomer.totalSpent || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] text-slate-400">Loyalty Tier</span>
                  <div className="text-xs font-bold uppercase font-mono text-amber-300 mt-1">
                    {inspectCustomer.tier || 'Standard'}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Mobile Phone:</span>
                  <a
                    href={`tel:${inspectCustomer.phone}`}
                    className="font-mono text-white hover:text-emerald-400"
                  >
                    {inspectCustomer.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-400">Registered Date:</span>
                  <span className="font-mono text-white">
                    {new Date(inspectCustomer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {inspectCustomer.lastIpAddress && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-slate-400">Last Recorded IP:</span>
                    <span className="font-mono text-cyan-300">{inspectCustomer.lastIpAddress}</span>
                  </div>
                )}
                {inspectCustomer.streetAddress && (
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-slate-400 block">Shipping Address:</span>
                    <span className="text-white block">
                      {inspectCustomer.streetAddress}, {inspectCustomer.upazilaOrArea}{' '}
                      {inspectCustomer.district}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons inside inspect modal */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.08]">
                {inspectCustomer.isBanned || inspectCustomer.isBlocked ? (
                  <button
                    onClick={async () => {
                      await handleUnbanCustomer(inspectCustomer);
                      setInspectCustomer(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Unban Customer Account</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTargetCustomer(inspectCustomer);
                      setInspectCustomer(null);
                      setIsBanCustomerModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Ban This Customer</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
