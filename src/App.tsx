import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { SearchModal } from './components/SearchModal.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderSuccessPage } from './pages/OrderSuccessPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AccountPage } from './pages/AccountPage.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { AboutPage } from './pages/AboutPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { PoliciesPage } from './pages/PoliciesPage.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname + window.location.search || '/';
  });
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route parsing
  const url = new URL(window.location.origin + currentPath);
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  const isAdminDashboard = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminLogin = pathname === '/admin/login';

  const renderRoute = () => {
    // 1. Home
    if (pathname === '/' || pathname === '') {
      return <HomePage navigate={navigate} />;
    }

    // 2. Shop
    if (pathname === '/shop') {
      return (
        <ShopPage
          navigate={navigate}
          initialCategory={searchParams.get('category') || undefined}
          initialSort={searchParams.get('sort') || undefined}
          initialSearch={searchParams.get('search') || undefined}
          initialFeatured={searchParams.get('isFeatured') === 'true'}
        />
      );
    }

    // 3. Product Details
    if (pathname.startsWith('/product/')) {
      const productIdOrSlug = pathname.replace('/product/', '');
      return <ProductDetailPage productIdOrSlug={productIdOrSlug} navigate={navigate} />;
    }

    // 4. Categories
    if (pathname === '/categories') {
      return <CategoriesPage navigate={navigate} />;
    }

    // 5. Cart
    if (pathname === '/cart') {
      return <CartPage navigate={navigate} />;
    }

    // 6. Checkout
    if (pathname === '/checkout') {
      return <CheckoutPage navigate={navigate} />;
    }

    // 7. Order Confirmation
    if (pathname.startsWith('/order-success/')) {
      const orderId = pathname.replace('/order-success/', '');
      return <OrderSuccessPage orderId={orderId} navigate={navigate} />;
    }

    // 8. Auth
    if (pathname === '/login') {
      return <LoginPage navigate={navigate} redirectPath="/" />;
    }
    if (pathname === '/register') {
      return <RegisterPage navigate={navigate} />;
    }

    // 9. Customer Account
    if (pathname === '/account') {
      return <AccountPage navigate={navigate} defaultTab="orders" />;
    }
    if (pathname === '/account/orders') {
      return <AccountPage navigate={navigate} defaultTab="orders" />;
    }
    if (pathname === '/account/addresses') {
      return <AccountPage navigate={navigate} defaultTab="addresses" />;
    }

    // 10. Admin
    if (pathname === '/admin/login') {
      return <AdminLoginPage navigate={navigate} />;
    }
    if (pathname === '/admin') {
      return <AdminDashboardPage navigate={navigate} />;
    }

    // 11. Content & Policies
    if (pathname === '/about') {
      return <AboutPage navigate={navigate} />;
    }
    if (pathname === '/contact') {
      return <ContactPage navigate={navigate} />;
    }
    if (pathname === '/shipping-policy') {
      return <PoliciesPage type="shipping" navigate={navigate} />;
    }
    if (pathname === '/refund-policy') {
      return <PoliciesPage type="refund" navigate={navigate} />;
    }
    if (pathname === '/privacy-policy') {
      return <PoliciesPage type="privacy" navigate={navigate} />;
    }
    if (pathname === '/terms-and-conditions') {
      return <PoliciesPage type="terms" navigate={navigate} />;
    }

    // 404 Fallback
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h1 className="text-3xl font-extrabold text-stone-900 font-serif">Page Not Found</h1>
        <p className="text-xs text-stone-600">The requested vault archive does not exist.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-sm"
        >
          Return Home
        </button>
      </div>
    );
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FAFAF9] text-stone-900 font-sans selection:bg-amber-200 selection:text-amber-950">
          {/* Public Header is shown unless inside admin dashboard */}
          {pathname !== '/admin' && (
            <Header
              currentPath={pathname}
              navigate={navigate}
              onOpenSearch={() => setIsSearchModalOpen(true)}
            />
          )}

          {/* Main content body */}
          <main className="flex-1">
            {renderRoute()}
          </main>

          {/* Public Footer is shown unless inside admin dashboard */}
          {pathname !== '/admin' && (
            <Footer navigate={navigate} />
          )}

          {/* Global Quick Search Modal */}
          <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            navigate={navigate}
          />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
