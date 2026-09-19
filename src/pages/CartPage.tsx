import React, { useState } from 'react';
import { 
  ShoppingBag, Trash2, ArrowRight, ShieldCheck, Tag, 
  AlertCircle, Check, Loader2, ArrowLeft 
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';

interface CartPageProps {
  navigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ navigate }) => {
  const { 
    items, 
    subtotal, 
    shippingFee, 
    discount, 
    total, 
    appliedCoupon, 
    couponError, 
    updateQuantity, 
    removeFromCart, 
    applyCoupon, 
    removeCoupon,
    validateCartStock,
    settings 
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [stockChecking, setStockChecking] = useState(false);
  const [stockErrors, setStockErrors] = useState<string[]>([]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponSubmitting(true);
    await applyCoupon(couponInput.trim());
    setCouponSubmitting(false);
  };

  const handleProceedToCheckout = async () => {
    setStockChecking(true);
    setStockErrors([]);

    const res = await validateCartStock();
    setStockChecking(false);

    if (res.valid) {
      navigate('/checkout');
    } else {
      setStockErrors(res.errors);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 text-stone-500 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-950 font-serif">Your Vault Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          Explore our authenticated collection of rare singles, sealed boxes, and collector battle decks.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
        >
          Explore Collection <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const freeShippingThreshold = settings?.freeShippingThreshold || 2999;
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-serif">Shopping Cart</h1>
          <p className="text-xs text-stone-500 mt-1">Review your selected trading cards and sealed products.</p>
        </div>
        <button
          onClick={() => navigate('/shop')}
          className="text-xs text-amber-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </button>
      </div>

      {/* Free Shipping Progress bar */}
      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs shadow-xs">
        {neededForFreeShipping > 0 ? (
          <p className="text-stone-700">
            Add <strong className="text-amber-700 font-bold">₹{neededForFreeShipping.toLocaleString('en-IN')}</strong> more to unlock <strong className="text-stone-900 font-bold">Complimentary Armored Shipping</strong>.
          </p>
        ) : (
          <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
            <Check className="w-4 h-4" /> You have unlocked Complimentary Armored Express Shipping!
          </p>
        )}
      </div>

      {/* Stock Errors Banner */}
      {stockErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-1 text-xs text-red-700 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Cart updated to match current available inventory:</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {stockErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid: Items List + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-stone-200 border border-stone-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            {items.map((item) => {
              const price = item.product.salePrice || item.product.price;
              const lineTotal = price * item.quantity;
              const img = item.product.images?.[0] || 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=300&q=80';

              return (
                <div key={item.productId} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Thumbnail & Meta */}
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      onClick={() => navigate(`/product/${item.product.slug || item.productId}`)}
                      className="w-16 h-20 bg-stone-50 rounded-lg border border-stone-200 p-1 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <img src={img} alt={item.product.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                        {item.product.brand} • {item.product.condition}
                      </p>
                      <h3 
                        onClick={() => navigate(`/product/${item.product.slug || item.productId}`)}
                        className="text-sm font-bold text-stone-900 hover:text-amber-700 transition-colors cursor-pointer line-clamp-1"
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-xs font-semibold text-stone-600">
                        ₹{price.toLocaleString('en-IN')} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Line Total */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6">
                    {/* Qty controls */}
                    <div className="flex items-center border border-stone-300 bg-stone-50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-950 hover:bg-stone-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-stone-900 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-950 hover:bg-stone-200 disabled:opacity-30 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Total */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-stone-950 font-serif">
                        ₹{lineTotal.toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[11px] text-stone-400 hover:text-red-600 flex items-center gap-1 mt-1 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider">Order Summary</h2>

            {/* Coupon Application */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-600" /> Apply Coupon Code
              </label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                  <div>
                    <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                    <p className="text-[11px] text-emerald-600">
                      {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `₹${appliedCoupon.discountValue} off`}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. CARDVAULT10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 uppercase placeholder-stone-400 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={couponSubmitting}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {couponSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[11px] text-red-600 mt-1">{couponError}</p>
              )}
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span className="text-stone-900 font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Armored Express Shipping</span>
                <span className="text-stone-900 font-semibold">
                  {shippingFee === 0 ? <span className="text-emerald-700 font-bold">Free</span> : `₹${shippingFee.toLocaleString('en-IN')}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-950">Estimated Total</span>
                <span className="text-2xl font-extrabold text-stone-950 font-serif">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={stockChecking}
              className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {stockChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Inventory...
                </>
              ) : (
                <>
                  Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Razorpay encrypted checkout & inventory lock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
