import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  Star,
  Tag,
  Truck,
  Image,
  FileText,
  Settings,
  History,
  CreditCard,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Bot,
  Sparkles,
  Palette,
  Globe,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminTheme } from '../../context/AdminThemeContext';
import { AdminThemeCustomizer } from '../../components/admin/AdminThemeCustomizer';
import { Logo } from '../../components/common/Logo';
import { AdminLogin } from './AdminLogin';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  navigate,
  children,
}) => {
  const { user, isAdmin, isOwner, adminRole, logout } = useAuth();
  const { theme, accentStyles } = useAdminTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [themeTab, setThemeTab] = useState<'admin' | 'storefront'>('admin');

  // If user is not authenticated at all, present Admin Login
  if (!user) {
    return <AdminLogin navigate={navigate} />;
  }

  // If user is logged in as a normal customer and NOT admin: show Access Denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070A0D] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold font-display text-white mb-2">Access Denied</h1>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          The signed-in account (<span className="text-white font-mono">{user.email}</span>) does not possess administrator permissions for R Mart.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-semibold"
          >
            Go to Storefront
          </button>
          <button
            onClick={() => logout()}
            className="px-5 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold hover:bg-rose-500/30"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'AI Business Co-Pilot', path: '/admin/ai-agent', icon: Bot, isNew: true },
    { label: 'Courier Dispatch Hub', path: '/admin/courier', icon: Truck, isNew: true },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers & Bans', path: '/admin/customers', icon: Users },
    { label: 'Staff & Roles', path: '/admin/staff', icon: ShieldCheck, isNew: true },
    { label: 'IP Security & Bans', path: '/admin/ip-bans', icon: Globe, isNew: true },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Delivery Zones', path: '/admin/delivery', icon: Truck },
    { label: 'Payment Methods', path: '/admin/payments', icon: CreditCard },
    { label: 'Banners', path: '/admin/banners', icon: Image },
    { label: 'Pages & Policy', path: '/admin/pages', icon: FileText },
    { label: 'Site Settings', path: '/admin/settings', icon: Settings },
    { label: 'Audit Log', path: '/admin/audit-log', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#070A0D] flex text-slate-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-[#0A0D10] border-r border-white/[0.08] p-4 shrink-0">
        <div className="space-y-6">
          {/* Logo & Store Info */}
          <div className="px-2 pt-2 flex items-center justify-between">
            <div onClick={() => navigate('/admin')} className="cursor-pointer">
              <Logo size="md" variant="light" />
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? currentPath === '/admin'
                  : currentPath.startsWith(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="pt-4 border-t border-white/[0.06] space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-xs text-slate-300 font-medium flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>View Storefront</span>
            </span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </button>

          <div className="flex items-center justify-between px-2 pt-1 text-xs">
            <div className="truncate pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white truncate text-xs">{user.name}</span>
                {isOwner ? (
                  <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1 rounded flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />
                    <span>Owner</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded">
                    {adminRole === 'sub-admin' ? 'Sub-Admin' : 'Admin'}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#0A0D10]/90 backdrop-blur-md border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05]"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">R Mart Admin Console</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Separate Button 1: Admin UI Color Option */}
            <button
              onClick={() => {
                setThemeTab('admin');
                setThemeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-200 border border-white/10 transition-colors"
              title="Change Admin Panel Theme & Accent Color"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Admin UI Theme</span>
              <span className="md:hidden">Admin Theme</span>
            </button>

            {/* Separate Button 2: Storefront Theme Color Option */}
            <button
              onClick={() => {
                setThemeTab('storefront');
                setThemeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-400 border border-emerald-500/30 transition-colors"
              title="Change Customer Storefront Brand Palette & Color"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Storefront Theme</span>
              <span className="md:hidden">Store Theme</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-200 border border-white/10 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Customer Store</span>
            </button>

            <button
              onClick={() => logout()}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-white/[0.05] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#0A0D10] border-r border-white/10 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <Logo size="sm" />
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/admin'
                      ? currentPath === '/admin'
                      : currentPath.startsWith(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => {
                  navigate('/');
                  setMobileSidebarOpen(false);
                }}
                className="w-full py-2 px-3 rounded-lg bg-white/5 text-xs text-slate-300 font-medium text-left flex items-center justify-between"
              >
                <span>View Storefront</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => logout()}
                className="w-full py-2 px-3 rounded-lg bg-rose-500/10 text-xs text-rose-400 font-semibold text-left"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Theme Customizer Modal with separate Admin & Storefront options */}
      <AdminThemeCustomizer
        isOpen={themeModalOpen}
        onClose={() => setThemeModalOpen(false)}
        initialTab={themeTab}
      />
    </div>
  );
};
