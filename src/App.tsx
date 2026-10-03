import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { Logo } from './components/common/Logo';
import { getSiteSettings } from './lib/store';
import type { SiteSettings } from './types';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderConfirmationPage } from './pages/customer/OrderConfirmationPage';
import { TrackOrderPage } from './pages/customer/TrackOrderPage';
import { AccountPage } from './pages/customer/AccountPage';
import { WishlistPage } from './pages/customer/WishlistPage';
import { ComparePage } from './pages/customer/ComparePage';
import { StaticPage } from './pages/customer/StaticPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminStaff } from './pages/admin/AdminStaff';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminDelivery } from './pages/admin/AdminDelivery';
import { AdminPaymentMethods } from './pages/admin/AdminPaymentMethods';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminPages } from './pages/admin/AdminPages';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAuditLog } from './pages/admin/AdminAuditLog';
import { AdminAiAgent } from './pages/admin/AdminAiAgent';
import { AdminCourierHub } from './pages/admin/AdminCourierHub';
import { AiShoppingAssistant } from './components/customer/AiShoppingAssistant';
import { applyThemeToDom } from './lib/theme';
import { AdminThemeProvider } from './context/AdminThemeContext';

// Helper to normalize path by stripping trailing slashes and hash/query for reliable SPA routing
export const normalizePath = (rawPath: string): string => {
  const clean = (rawPath || '/').split('?')[0].split('#')[0];
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean || '/';
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return normalizePath(window.location.pathname);
  });
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);

    const refreshSettings = () => {
      getSiteSettings().then((s) => {
        setSettings(s);
        applyThemeToDom(s.themeName || s.themeColor);
        if (s.storeName) {
          document.title = `${s.storeName} - Official Online Store`;
        }
      });
    };

    refreshSettings();

    const handleSettingsUpdated = (e: any) => {
      if (e?.detail) {
        setSettings(e.detail);
        applyThemeToDom(e.detail.themeName || e.detail.themeColor);
        if (e.detail.storeName) {
          document.title = `${e.detail.storeName} - Official Online Store`;
        }
      } else {
        refreshSettings();
      }
    };

    window.addEventListener('rmart_settings_updated', handleSettingsUpdated);
    window.addEventListener('storage', refreshSettings);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('rmart_settings_updated', handleSettingsUpdated);
      window.removeEventListener('storage', refreshSettings);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(normalizePath(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine URL path and params
  const fullPath = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  const isAdminRoute = currentPath.startsWith('/admin');

  // Customer Route Rendering
  const renderCustomerRoute = () => {
    // Category route: /category/:slug
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '').replace(/\/$/, '');
      return <ShopPage navigate={navigate} initialCategory={slug} />;
    }

    // Product detail route: /product/:id
    if (currentPath.startsWith('/product/')) {
      const productId = currentPath.replace('/product/', '').replace(/\/$/, '');
      return <ProductDetailPage productId={productId} navigate={navigate} />;
    }

    // Order confirmation route: /order-confirmation/:id
    if (currentPath.startsWith('/order-confirmation/')) {
      const orderId = currentPath.replace('/order-confirmation/', '').replace(/\/$/, '');
      return <OrderConfirmationPage orderId={orderId} navigate={navigate} />;
    }

    // Standard static routes
    switch (currentPath) {
      case '/':
        return <HomePage navigate={navigate} settings={settings} />;
      case '/shop':
        return (
          <ShopPage
            navigate={navigate}
            initialSearch={searchParams.get('search') || undefined}
            initialCategory={searchParams.get('category') || undefined}
          />
        );
      case '/cart':
        return <CartPage navigate={navigate} />;
      case '/checkout':
        return <CheckoutPage navigate={navigate} />;
      case '/track-order':
        return (
          <TrackOrderPage
            navigate={navigate}
            initialOrderId={searchParams.get('orderId') || ''}
            initialPhone={searchParams.get('phone') || ''}
          />
        );
      case '/account':
        return <AccountPage navigate={navigate} />;
      case '/wishlist':
        return <WishlistPage navigate={navigate} />;
      case '/compare':
        return <ComparePage navigate={navigate} />;

      // Static content pages
      case '/about':
      case '/contact':
      case '/shipping-policy':
      case '/return-policy':
      case '/privacy-policy':
      case '/terms':
      case '/size-guide':
      case '/faq':
        return <StaticPage slug={currentPath.replace('/', '')} navigate={navigate} />;

      default:
        // 404 Not Found Page
        return (
          <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
            <div className="inline-block">
              <Logo size="lg" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-extrabold text-slate-900">404 - Page Not Found</h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                The requested page or product link does not exist on R Mart.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                Back to Homepage
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          </div>
        );
    }
  };

  // Admin Route Rendering
  const renderAdminRoute = () => {
    if (currentPath === '/admin/login') {
      return <AdminLogin navigate={navigate} />;
    }

    let subComponent: React.ReactNode;
    if (currentPath === '/admin/products/new') {
      subComponent = <AdminProducts navigate={navigate} openCreateImmediately={true} />;
    } else if (currentPath.startsWith('/admin/products')) {
      subComponent = <AdminProducts navigate={navigate} />;
    } else if (currentPath.startsWith('/admin/categories')) {
      subComponent = <AdminCategories />;
    } else if (currentPath.startsWith('/admin/inventory')) {
      subComponent = <AdminInventory />;
    } else if (currentPath.startsWith('/admin/orders')) {
      subComponent = <AdminOrders navigate={navigate} selectedOrderId={searchParams.get('view') || undefined} />;
    } else if (currentPath.startsWith('/admin/customers')) {
      subComponent = <AdminCustomers initialTab="customers" />;
    } else if (currentPath.startsWith('/admin/ip-bans')) {
      subComponent = <AdminCustomers initialTab="ip-bans" />;
    } else if (currentPath.startsWith('/admin/staff')) {
      subComponent = <AdminStaff />;
    } else if (currentPath.startsWith('/admin/reviews')) {
      subComponent = <AdminReviews />;
    } else if (currentPath.startsWith('/admin/coupons')) {
      subComponent = <AdminCoupons />;
    } else if (currentPath.startsWith('/admin/delivery')) {
      subComponent = <AdminDelivery />;
    } else if (currentPath.startsWith('/admin/payments')) {
      subComponent = <AdminPaymentMethods />;
    } else if (currentPath.startsWith('/admin/banners')) {
      subComponent = <AdminBanners />;
    } else if (currentPath.startsWith('/admin/pages')) {
      subComponent = <AdminPages />;
    } else if (currentPath.startsWith('/admin/settings')) {
      subComponent = <AdminSettings />;
    } else if (currentPath.startsWith('/admin/ai-agent')) {
      subComponent = <AdminAiAgent />;
    } else if (currentPath.startsWith('/admin/courier')) {
      subComponent = <AdminCourierHub />;
    } else if (currentPath.startsWith('/admin/audit-log')) {
      subComponent = <AdminAuditLog />;
    } else {
      subComponent = <AdminDashboard navigate={navigate} />;
    }

    return (
      <AdminThemeProvider>
        <AdminLayout currentPath={currentPath} navigate={navigate}>
          {subComponent}
        </AdminLayout>
      </AdminThemeProvider>
    );
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
          {!isAdminRoute ? (
            <>
              <Header currentPath={currentPath} navigate={navigate} settings={settings} />
              <main className="flex-1">{renderCustomerRoute()}</main>
              <Footer settings={settings} navigate={navigate} />
              <CartDrawer navigate={navigate} />
              <AiShoppingAssistant navigate={navigate} />
            </>
          ) : (
            renderAdminRoute()
          )}
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
