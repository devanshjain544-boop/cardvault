import React, { useState, useRef } from 'react';
import { ShoppingBag, Zap, Heart, ShieldCheck, Check } from 'lucide-react';
import type { Product } from '../types.js';
import { useCart } from '../context/CartContext.js';

interface ProductCardProps {
  product: Product;
  navigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, navigate }) => {
  const { addToCart } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // 3D Card tilt state
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const isOutOfStock = product.stock <= 0;
  const currentPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    // Subtle 3D tilt calculation
    setRotateX(-normY * 9);
    setRotateY(normX * 9);
    setGlare({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlare({ x: 50, y: 50, opacity: 0 });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const res = addToCart(product, 1);
    if (res.success) {
      setAddedAnimation(true);
      setActionError(null);
      setTimeout(() => setAddedAnimation(false), 1500);
    } else {
      setActionError(res.message || 'Cannot add to cart');
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    const res = addToCart(product, 1);
    if (res.success) {
      navigate('/checkout');
    } else {
      setActionError(res.message || 'Cannot proceed to checkout');
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=600&q=80';
  const displayImage = product.images && product.images.length > 0 ? product.images[0] : fallbackImage;

  return (
    <div 
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(`/product/${product.slug || product.id}`)}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="group relative bg-white border border-stone-200 hover:border-amber-400 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:shadow-stone-300/60 cursor-pointer select-none"
      >
        {/* Dynamic Specular Light Glare Layer */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 z-20 mix-blend-multiply"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(245, 158, 11, ${glare.opacity * 0.8}) 0%, transparent 60%)`,
          }}
        />

        {/* Top Media Container */}
        <div className="relative aspect-[4/5] bg-[#F9F8F6] overflow-hidden flex items-center justify-center p-4 border-b border-stone-100">
          {/* Subtle archival card frame */}
          <div className="absolute inset-2 border border-stone-200/80 rounded-xl pointer-events-none group-hover:border-amber-400/50 transition-colors" />

          {/* Product Image */}
          <img 
            src={displayImage} 
            alt={product.name}
            className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {/* Condition Tag */}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/95 text-stone-800 border border-stone-300 backdrop-blur-sm shadow-xs">
              {product.condition}
            </span>
            {hasDiscount && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600 text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-stone-950 shadow-xs">
                Featured
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            aria-label="Add to wishlist"
            className="absolute top-3 right-3 p-2 rounded-full bg-white/95 hover:bg-white text-stone-600 hover:text-red-500 border border-stone-200 backdrop-blur-sm transition-colors shadow-xs z-10"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>

          {/* Sold Out Watermark overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="text-xs font-black tracking-widest text-red-600 uppercase px-3 py-1 rounded border border-red-300 bg-red-50">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Details Container */}
        <div className="p-4 flex-1 flex flex-col justify-between bg-white">
          <div>
            {/* Brand & Type Meta */}
            <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium mb-1.5">
              <span className="text-amber-800 truncate max-w-[65%] font-mono text-[10px] uppercase tracking-wider font-semibold">{product.brand} • {product.series}</span>
              <span className="truncate text-stone-500 text-[10px] uppercase font-mono font-medium">{product.productType}</span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-700 line-clamp-2 transition-colors mb-2">
              {product.name}
            </h3>

            {/* Short description snippet */}
            <p className="text-xs text-stone-600 line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div>
            {/* Pricing & Stock Bar */}
            <div className="flex items-baseline justify-between pt-2.5 border-t border-stone-200 mb-3">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-stone-950 tracking-tight">
                  ₹{currentPrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-stone-400 line-through">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Stock status indicator */}
              <div>
                {isOutOfStock ? (
                  <span className="text-[11px] font-bold text-red-600">Sold Out</span>
                ) : product.stock <= 3 ? (
                  <span className="text-[11px] font-semibold text-amber-700">Only {product.stock} left</span>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse" /> In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Action error notice */}
            {actionError && (
              <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 mb-2 text-center">
                {actionError}
              </p>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  isOutOfStock 
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' 
                    : addedAnimation
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 shadow-xs'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Added
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  isOutOfStock
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                    : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-xs'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" /> Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
