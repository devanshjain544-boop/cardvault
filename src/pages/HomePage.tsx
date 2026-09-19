import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, PackageCheck, Sparkles, ArrowRight, ArrowUpRight,
  Layers, Flame, Box, Award, CheckCircle2, ChevronRight, Lock, 
  Search, Shield, Check
} from 'lucide-react';
import type { Product, Category } from '../types.js';
import { api } from '../lib/api.js';
import { ProductCard } from '../components/ProductCard.js';
import { HeroDualCards } from '../components/HeroDualCards.js';

interface HomePageProps {
  navigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts({ status: 'published' }),
      api.getCategories()
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes);
        setCategories(catRes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = products.filter(p => p.isFeatured);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const sealedBoxes = products.filter(p => p.productType === 'Booster Box' || p.productType === 'Sealed Box');
  const cardDecks = products.filter(p => p.productType === 'Card Deck');
  const singleCards = products.filter(p => p.productType === 'Single Card');
  const rareGrails = products.filter(p => (p.salePrice || p.price) >= 15000);

  // Category cards metadata matching Screenshot 2 colors & styling
  const categoryShowcase = [
    {
      num: '01',
      name: 'Single Cards',
      slug: 'single-cards',
      type: 'Single Card',
      count: `${singleCards.length || 6} PIECES`,
      desc: 'Raw and graded singles from coveted international sets.',
      bgClass: 'bg-[#7D4B36]', // Terracotta from screenshot
      borderClass: 'border-[#9E6047]',
      accentColor: '#D97706',
    },
    {
      num: '02',
      name: 'Sealed Boxes',
      slug: 'sealed-boxes',
      type: 'Booster Box',
      count: `${sealedBoxes.length || 3} PIECES`,
      desc: 'Factory shrink-wrapped booster boxes and premium cases.',
      bgClass: 'bg-[#4F5D4E]', // Sage green from screenshot
      borderClass: 'border-[#6B7E6A]',
      accentColor: '#10B981',
    },
    {
      num: '03',
      name: 'Card Decks',
      slug: 'card-decks',
      type: 'Card Deck',
      count: `${cardDecks.length || 2} PIECES`,
      desc: 'Ready-to-play competitive and starter decks.',
      bgClass: 'bg-[#354245]', // Slate steel from screenshot
      borderClass: 'border-[#4B5E62]',
      accentColor: '#38BDF8',
    },
    {
      num: '04',
      name: 'Rare Collectibles',
      slug: 'rare-collectibles',
      type: 'Grails',
      count: `${rareGrails.length || 4} PIECES`,
      desc: 'PSA 10 grails, low-population holy grails, and vintage.',
      bgClass: 'bg-[#5E4F44]', // Warm mocha from screenshot
      borderClass: 'border-[#7E6A5C]',
      accentColor: '#F59E0B',
    },
  ];

  return (
    <div className="w-full">
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                         */}
      {/* Warm ivory luxury canvas + Interactive 3D Cursor Cards  */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-[#FAF8F5] text-stone-900 border-b border-stone-200 pt-10 sm:pt-14 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Ambient warm radial glow in background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column Text */}
          <div className="lg:col-span-6 space-y-7 text-left z-10">
            {/* Fine Eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.25em] font-bold text-amber-800 uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-ping" />
              <span>THE COLLECTOR'S MARKETPLACE</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl text-stone-950 tracking-tight leading-[1.1]">
              <span className="block font-sans font-extrabold text-stone-950">Discover Your</span>
              <span className="block font-serif italic font-normal text-amber-700 mt-1 sm:mt-2">
                Next Collectible
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-stone-600 max-w-xl font-normal leading-relaxed">
              Premium trading cards, sealed boxes and collectible decks for every kind of collector. 100% genuine guaranteed with armored delivery across India.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/shop')}
                className="px-8 py-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-amber-500/25 hover:scale-[1.02] cursor-pointer"
              >
                <span>SHOP COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/categories')}
                className="px-7 py-4 rounded-lg bg-white hover:bg-stone-50 text-stone-900 font-mono font-bold text-xs uppercase tracking-wider border border-stone-300 hover:border-stone-400 flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <span>EXPLORE CATEGORIES</span>
                <ArrowUpRight className="w-4 h-4 text-stone-600" />
              </button>
            </div>

            {/* Proof line */}
            <div className="pt-6 border-t border-stone-200 flex items-center gap-2.5 text-[11px] font-mono tracking-widest text-stone-600 uppercase font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>SECURE CHECKOUT · CAREFULLY PACKED · TRACKED DELIVERY</span>
            </div>
          </div>

          {/* Right Column: INTERACTIVE 3D DUAL CARDS WITH CURSOR TRACKING */}
          {/* Dedicated luxury brown showcase area ("where there is cards") */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#38271F] via-[#2B1D16] to-[#1F1510] border border-[#523A2D] p-5 sm:p-7 lg:p-9 shadow-2xl shadow-stone-900/15 overflow-hidden flex flex-col items-center justify-center min-h-[540px] sm:min-h-[580px]">
              {/* Luxury ambient warm glow & lighting inside brown card area */}
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-700/15 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />

              {/* Showcase Top Archival Bar */}
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-[#4A3427] z-10 px-2 text-[10px] font-mono tracking-widest text-amber-300/80">
                <span className="flex items-center gap-2 font-bold uppercase text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                  ARCHIVAL CARD VAULT
                </span>
                <span className="text-amber-200/60 uppercase">AUTHENTICATED SPECIMENS</span>
              </div>

              {/* 3D Dual Cards Component */}
              <div className="w-full flex items-center justify-center my-auto">
                <HeroDualCards />
              </div>

              {/* Showcase Bottom Proof Seal */}
              <div className="w-full flex items-center justify-between pt-3 mt-2 border-t border-[#4A3427] z-10 px-2 text-[9px] font-mono text-amber-200/60 tracking-wider">
                <span>TAMPER-SEALED ARCHIVAL ACRYLIC</span>
                <span className="text-amber-300 font-semibold">MINT CENTERING 50/50</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CATEGORIES SECTION (Screenshot 2 Reference)          */}
      {/* Background: #F4EFE6 Archival Cream                      */}
      {/* Headline: "Find your corner of the vault."             */}
      {/* ======================================================== */}
      <section className="bg-[#F4EFE6] text-stone-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-300">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end justify-between mb-12">
            <div className="lg:col-span-7">
              <span className="text-[11px] font-mono tracking-[0.25em] font-bold text-stone-500 uppercase">
                CURATED FOR EVERY COLLECTOR
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-stone-950 tracking-tight mt-2">
                Find your corner of the vault.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                From a first deck to a centrepiece sealed box, browse categories designed around how collectors actually collect.
              </p>
            </div>
          </div>

          {/* 4 Architectural Category Cards (Colors from Screenshot 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryShowcase.map((card) => (
              <div
                key={card.num}
                onClick={() => {
                  if (card.type === 'Grails') {
                    navigate('/shop?sort=price-high-to-low');
                  } else {
                    navigate(`/shop?productType=${encodeURIComponent(card.type)}`);
                  }
                }}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between p-6 h-[340px]"
                style={{ backgroundColor: card.bgClass.replace('bg-[', '').replace(']', '') }}
              >
                {/* Subtle outer stroke */}
                <div className="absolute inset-0 border border-white/15 rounded-2xl pointer-events-none" />

                {/* Top Bar: Number & Stylized Card Silhouette */}
                <div className="flex items-start justify-between z-10">
                  <span className="text-xs font-mono font-bold tracking-widest text-white/70">
                    {card.num}
                  </span>
                  {/* Stylized Miniature Collectible Outline */}
                  <div className="w-10 h-14 rounded border border-white/30 p-1 flex flex-col items-center justify-between group-hover:border-white/70 transition-colors">
                    <div className="w-4 h-0.5 bg-white/40 rounded-full" />
                    <span className="text-[9px] font-serif italic text-white/80">CV</span>
                    <div className="w-6 h-0.5 bg-white/20 rounded-full" />
                  </div>
                </div>

                {/* Center Wireframe Graphic Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
                  <div className="w-36 h-48 border border-white rounded-xl" />
                </div>

                {/* Bottom Content */}
                <div className="z-10 text-left space-y-2">
                  <div className="inline-block text-[10px] font-mono tracking-widest text-white/60 bg-black/20 px-2 py-0.5 rounded">
                    {card.count}
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif tracking-tight flex items-center justify-between group-hover:text-amber-200 transition-colors">
                    <span>{card.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-200" />
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FRESH FROM THE VAULT                                  */}
      {/* Clean White Luxury Canvas + New arrivals                 */}
      {/* ======================================================== */}
      <section className="bg-white text-stone-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-200">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] font-bold text-amber-800 uppercase">
                FRESH FROM THE VAULT
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-stone-950 tracking-tight mt-2">
                New arrivals
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop?sort=newest')}
              className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Product Grid with 3D cursor tilt on every card */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[4/5] bg-stone-100 rounded-2xl animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
              <Sparkles className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
              <p className="text-xl font-bold text-stone-900 font-serif italic">Products are coming soon.</p>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                New pieces appear here as soon as they are inspected, documented, and published in the vault.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="mt-2 px-6 py-2.5 rounded bg-amber-400 text-stone-950 font-bold text-xs font-mono tracking-wider uppercase shadow-xs"
              >
                BROWSE THE VAULT
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(newArrivals.length > 0 ? newArrivals : products).slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. FEATURED GRAILS & HIGHLIGHTS                         */}
      {/* Light warm showcase for collectors                      */}
      {/* ======================================================== */}
      {featuredProducts.length > 0 && (
        <section className="bg-[#FAF8F5] text-stone-900 py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-stone-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[11px] font-mono tracking-[0.25em] font-bold text-amber-800 uppercase flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  AUTHENTICATED SHOWCASE
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-stone-950 tracking-tight mt-2">
                  Vault Highlights
                </h2>
              </div>
              <button
                onClick={() => navigate('/shop?isFeatured=true')}
                className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-amber-800 hover:text-amber-900 transition-colors cursor-pointer"
              >
                <span>EXPLORE ALL</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} navigate={navigate} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* 5. THE CARDVAULT STANDARD (Screenshot 7 Reference)      */}
      {/* Background: #F4EFE6 Archival Cream                      */}
      {/* Eyebrow: CV / 04 · THE CARDVAULT STANDARD               */}
      {/* Headline: "Serious about the details that matter."      */}
      {/* ======================================================== */}
      <section className="bg-[#F4EFE6] text-stone-900 py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-stone-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <span className="text-[11px] font-mono tracking-[0.25em] font-bold text-stone-600 uppercase">
              CV / 04 · THE CARDVAULT STANDARD
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif italic text-stone-950 tracking-tight mt-3">
              Serious about the details that matter.
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mt-4">
              Collectibles deserve clear information, considered handling, and a buying experience built on trust. Every listing is designed to show condition, authenticity notes, availability, and delivery information without the guesswork.
            </p>
          </div>

          {/* 4 Pillars Grid (Screenshot 7 layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pillar 01 */}
            <div className="pt-6 border-t border-stone-300/90 space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-stone-500">
                01
              </span>
              <h3 className="text-lg font-bold text-stone-950 font-serif">
                Secure payments
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Encrypted checkout with payment confirmation verified on the server. Instant UPI and card settlements.
              </p>
            </div>

            {/* Pillar 02 */}
            <div className="pt-6 border-t border-stone-300/90 space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-stone-500">
                02
              </span>
              <h3 className="text-lg font-bold text-stone-950 font-serif">
                Authentic products
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Clear condition notes, serial tracking, and authenticity verification on every piece that enters the vault.
              </p>
            </div>

            {/* Pillar 03 */}
            <div className="pt-6 border-t border-stone-300/90 space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-stone-500">
                03
              </span>
              <h3 className="text-lg font-bold text-stone-950 font-serif">
                Carefully packed
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Collector-minded protection from our vault to your shelf. Magnetic slabs, corner armor, and bubble mailers.
              </p>
            </div>

            {/* Pillar 04 */}
            <div className="pt-6 border-t border-stone-300/90 space-y-3">
              <span className="text-xs font-mono font-bold tracking-widest text-stone-500">
                04
              </span>
              <h3 className="text-lg font-bold text-stone-950 font-serif">
                Fast shipping
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tracked air dispatch with delivery updates available continuously from your CardVault account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
