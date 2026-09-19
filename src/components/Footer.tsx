import React from 'react';
import { ShieldCheck, PackageCheck, CreditCard, Lock, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 text-stone-700">
      {/* Trust & Guarantee Highlights Bar */}
      <div className="border-b border-stone-200 bg-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">100% Authentic</h4>
              <p className="text-xs text-stone-600 mt-1">
                Zero counterfeit tolerance. All factory sealed products and raw cards are rigorously verified.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Armored Shipping</h4>
              <p className="text-xs text-stone-600 mt-1">
                Cards encased in magnetic one-touch cases or top-loaders with reinforced rigid boxed packaging.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Secure Indian Gateway</h4>
              <p className="text-xs text-stone-600 mt-1">
                Razorpay certified PCI-DSS Level 1 payments supporting UPI (GPay, PhonePe), Cards & NetBanking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Inspected Vaults</h4>
              <p className="text-xs text-stone-600 mt-1">
                Climate-controlled preservation storage in Mumbai to safeguard foil integrity and card centering.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Section with Large Editorial Typography */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Brand & Editorial Headline */}
          <div className="lg:col-span-6 space-y-6">
            <div 
              onClick={() => navigate('/')}
              className="flex items-center gap-3 cursor-pointer group inline-flex"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-300 p-1.5 flex items-center justify-center group-hover:border-amber-500 transition-colors shadow-xs">
                <div className="w-full h-full rounded border border-amber-600 flex items-center justify-center">
                  <span className="text-xs font-serif italic text-amber-800 font-bold">CV</span>
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tight text-stone-950 font-serif">
                Card<span className="text-amber-700">Vault</span>
              </span>
            </div>

            {/* Huge Serif Display Tagline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif italic text-stone-950 tracking-tight leading-none">
              Collect. Discover. Own.
            </h2>

            <p className="text-xs text-stone-600 leading-relaxed max-w-md">
              India's premier collector destination for genuine Pokémon, Sports, Anime, and limited edition sealed booster boxes. Every piece is authenticated, preserved, and shipped in armored protection.
            </p>
          </div>

          {/* Nav Columns: EXPLORE / SUPPORT / LEGAL */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-6 pt-2">
            {/* EXPLORE */}
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest mb-4">
                EXPLORE
              </h3>
              <ul className="space-y-2.5 text-xs text-stone-600 font-medium">
                <li>
                  <button onClick={() => navigate('/shop')} className="hover:text-stone-950 transition-colors">
                    All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/categories')} className="hover:text-stone-950 transition-colors">
                    Categories
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/shop?isFeatured=true')} className="hover:text-stone-950 transition-colors">
                    Vault Highlights
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/shop?sort=newest')} className="hover:text-stone-950 transition-colors">
                    New Arrivals
                  </button>
                </li>
              </ul>
            </div>

            {/* SUPPORT */}
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest mb-4">
                SUPPORT
              </h3>
              <ul className="space-y-2.5 text-xs text-stone-600 font-medium">
                <li>
                  <button onClick={() => navigate('/about')} className="hover:text-stone-950 transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/contact')} className="hover:text-stone-950 transition-colors">
                    Contact
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/shipping-policy')} className="hover:text-stone-950 transition-colors">
                    Shipping
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/refund-policy')} className="hover:text-stone-950 transition-colors">
                    Returns
                  </button>
                </li>
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className="text-xs font-mono font-bold text-amber-800 uppercase tracking-widest mb-4">
                LEGAL
              </h3>
              <ul className="space-y-2.5 text-xs text-stone-600 font-medium">
                <li>
                  <button onClick={() => navigate('/privacy-policy')} className="hover:text-stone-950 transition-colors">
                    Privacy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/terms-and-conditions')} className="hover:text-stone-950 transition-colors">
                    Terms
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/account')} className="hover:text-stone-950 transition-colors">
                    Account
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal note */}
        <div className="mt-14 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-600 uppercase tracking-widest">
          <p>© 2026 CARDVAULT · BUILT FOR COLLECTORS</p>
          <div className="flex items-center gap-3 text-[11px] text-stone-500">
            <span>AUTHENTIC</span>
            <span>·</span>
            <span>ARMORED DISPATCH</span>
            <span>·</span>
            <span>CV VERIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
