import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, PackageCheck, ShoppingBag, Zap, Heart, 
  CheckCircle2, AlertTriangle, ArrowLeft, Share2, Award, Sparkles, Check 
} from 'lucide-react';
import type { Product } from '../types.js';
import { api } from '../lib/api.js';
import { useCart } from '../context/CartContext.js';

interface ProductDetailPageProps {
  productIdOrSlug: string;
  navigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productIdOrSlug, navigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    api.getProduct(productIdOrSlug)
      .then(setProduct)
      .catch((err) => {
        setError(err.message || 'Product not found');
      })
      .finally(() => setLoading(false));
  }, [productIdOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-stone-950 font-serif">Product Unavailable</h2>
        <p className="text-sm text-stone-600">
          {error || 'This collectible is either unpublished, archived, or does not exist.'}
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
        >
          Return to Collection
        </button>
      </div>
    );
  }

  const isSoldOut = product.stock <= 0;
  const currentPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=800&q=80'];

  const handleAddToCart = () => {
    if (isSoldOut) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      setAddedAnimation(true);
      setActionError(null);
      setTimeout(() => setAddedAnimation(false), 2000);
    } else {
      setActionError(res.message || 'Could not add to cart');
    }
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    const res = addToCart(product, quantity);
    if (res.success) {
      navigate('/checkout');
    } else {
      setActionError(res.message || 'Could not proceed to checkout');
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Back to Shop Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Vault Collection
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-amber-700 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Collectible'}</span>
        </button>
      </div>

      {/* Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Gallery (Images) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Display Image */}
          <div className="relative aspect-[4/5] bg-[#F9F8F6] border border-stone-200 rounded-2xl overflow-hidden flex items-center justify-center p-6 group shadow-xs">
            <img
              src={images[selectedImageIndex]}
              alt={product.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
            />

            {/* Condition Badge */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-white/95 text-stone-800 border border-stone-300 backdrop-blur-md shadow-xs">
                {product.condition}
              </span>
              {hasDiscount && (
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-red-600 text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Sold out watermark */}
            {isSoldOut && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center">
                <span className="text-base font-black tracking-widest text-red-600 uppercase px-6 py-2.5 rounded-xl border border-red-300 bg-red-50">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 p-1 bg-white shrink-0 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-amber-500 shadow-sm'
                      : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Details & Buy Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Metadata pill */}
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <span>{product.brand}</span>
            <span>•</span>
            <span>{product.series}</span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 text-stone-700">
              {product.productType}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-950 font-serif tracking-tight leading-tight">
            {product.name}
          </h1>

          {/* Price Bar */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-baseline justify-between shadow-xs">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-stone-950 tracking-tight font-serif">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-base text-stone-400 line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock & Availability */}
            <div>
              {isSoldOut ? (
                <span className="px-3 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs font-bold uppercase">
                  Sold Out
                </span>
              ) : product.stock <= 3 ? (
                <span className="text-xs font-bold text-amber-700">
                  Only {product.stock} units remaining
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isSoldOut && (
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">Quantity</label>
                <div className="flex items-center border border-stone-300 bg-white rounded-xl overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 text-sm font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-bold text-stone-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-2 text-stone-700 hover:text-stone-950 hover:bg-stone-100 text-sm font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-stone-500">Max {product.stock} units</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSoldOut
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                    : addedAnimation
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 shadow-xs'
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isSoldOut}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                  isSoldOut
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                    : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                {isSoldOut ? 'Sold Out' : 'Buy Now with Razorpay'}
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200">
            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-stone-900">100% Genuine Guaranteed</p>
                <p className="text-[11px] text-stone-500">CardVault verified tamper-proof seal.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-stone-200 shadow-xs flex items-start gap-2.5">
              <PackageCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-stone-900">Armored Rigid Packaging</p>
                <p className="text-[11px] text-stone-500">Shipped with magnetic slab protection.</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Description</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Specifications</h3>
              <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-200 text-xs shadow-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-3 p-2.5 bg-white">
                    <span className="font-semibold text-stone-500">{key}</span>
                    <span className="col-span-2 text-stone-800">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authenticity & Shipping Info */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-stone-800 shadow-xs">
              <p className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-700" /> Authenticity Protocol:
              </p>
              <p className="text-amber-950/80">{product.authenticityInfo || 'Authenticity guaranteed by CardVault inspection facility.'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 shadow-xs">
              <p className="font-bold text-stone-900 mb-1">Shipping & Transit Safety:</p>
              <p>{product.shippingInfo || 'Dispatched via express air courier within 24 hours with real-time tracking.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
