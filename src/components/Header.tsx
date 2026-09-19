import React, { useState } from 'react';
import { 
  ShieldCheck, Search, ShoppingBag, User, Menu, X, 
  ExternalLink, ChevronDown, LogOut, Package, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenSearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate, onOpenSearch }) => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Categories', path: '/categories' },
    { label: 'New Arrivals', path: '/shop?sort=newest' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Wordmark */}
          <div 
            onClick={() => handleNav('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* CV Monogram Seal Badge */}
            <div className="w-11 h-11 rounded-2xl bg-[#FFFDF8] border-2 border-amber-300 p-1 flex items-center justify-center shadow-xs group-hover:border-amber-400 group-hover:shadow-sm transition-all shrink-0">
              <div className="w-full h-full rounded-xl border-[1.5px] border-amber-500 flex items-center justify-center bg-gradient-to-b from-[#FFFDF9] to-[#FFF8EC]">
                <span className="text-xl font-serif italic font-black text-amber-900 drop-shadow-[0_1px_1px_rgba(217,119,6,0.3)] tracking-normal leading-none">
                  CV
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-bold tracking-tight text-stone-950 font-serif">
                  Card<span className="text-amber-700">Vault</span>
                </span>
              </div>
              <p className="text-[11px] tracking-wider text-stone-500 uppercase font-semibold">
                Collect. Discover. Own.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const active = currentPath === link.path;
              return (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.path)}
                  className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    active 
                      ? 'text-amber-900 bg-amber-50 border border-amber-200 shadow-xs' 
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={() => onOpenSearch ? onOpenSearch() : handleNav('/shop')}
              aria-label="Search catalog"
              className="p-2.5 text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 hover:border-stone-300"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => handleNav('/cart')}
              aria-label="View Shopping Cart"
              className="relative p-2.5 text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 hover:border-stone-300"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-stone-950 font-bold text-xs rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-800 text-sm font-semibold transition-all shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-xs font-bold uppercase">
                      {user.name[0]}
                    </div>
                    <span className="max-w-[100px] truncate hidden sm:inline">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-stone-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="text-xs text-stone-500">Signed in as</p>
                        <p className="text-sm font-semibold text-stone-900 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                            <Lock className="w-3 h-3" /> Store Administrator
                          </span>
                        )}
                      </div>

                      {/* Admin Dashboard link ONLY visible to verified admins */}
                      {isAdmin && (
                        <button
                          onClick={() => handleNav('/admin')}
                          className="w-full text-left px-4 py-2.5 text-sm text-amber-900 font-semibold hover:bg-amber-50 flex items-center justify-between border-b border-stone-100"
                        >
                          <span className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-700" />
                            Admin Dashboard
                          </span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleNav('/account')}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:text-stone-950 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-stone-500" />
                        My Profile & Addresses
                      </button>

                      <button
                        onClick={() => handleNav('/account/orders')}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:text-stone-950 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Package className="w-4 h-4 text-stone-500" />
                        My Orders
                      </button>

                      <div className="border-t border-stone-100 my-1" />

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          handleNav('/');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNav('/login')}
                  aria-label="Account Login"
                  title="Account Login"
                  className="p-2.5 text-stone-700 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 hover:border-stone-300 flex items-center justify-center"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg border border-stone-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.path)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                currentPath === link.path
                  ? 'text-amber-900 bg-amber-50 font-bold border border-amber-200'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              {link.label}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => handleNav('/admin')}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-300 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Admin Dashboard
            </button>
          )}

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 px-3">
            <span>Currency: INR (₹)</span>
            <span>Support: +91 98765 43210</span>
          </div>
        </div>
      )}
    </header>
  );
};
