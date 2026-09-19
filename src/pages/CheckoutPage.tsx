import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, CreditCard, ArrowLeft, 
  AlertCircle, CheckCircle2, Loader2, MapPin, Truck, Sparkles,
  KeyRound, ExternalLink, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { api } from '../lib/api.js';
import type { Address } from '../types.js';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const { user, saveAddress } = useAuth();
  const { items, subtotal, shippingFee, discount, total, appliedCoupon, clearCart, validateCartStock } = useCart();

  // Shipping Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.mobile || '');
  const [street, setStreet] = useState(user?.savedAddresses?.[0]?.addressLine || user?.savedAddresses?.[0]?.street || '');
  const [city, setCity] = useState(user?.savedAddresses?.[0]?.city || '');
  const [state, setState] = useState(user?.savedAddresses?.[0]?.state || 'Maharashtra');
  const [postalCode, setPostalCode] = useState(user?.savedAddresses?.[0]?.pincode || user?.savedAddresses?.[0]?.postalCode || '');
  const [country] = useState('India');
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Flow State
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Gateway Key Setup Modal (Shown if store owner has not configured Razorpay keys yet)
  const [showGatewayConfigModal, setShowGatewayConfigModal] = useState(false);
  const [configKeyId, setConfigKeyId] = useState('');
  const [configKeySecret, setConfigKeySecret] = useState('');
  const [savingGatewayKeys, setSavingGatewayKeys] = useState(false);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-950 font-serif">Your Cart is Empty</h2>
        <p className="text-xs text-stone-500">Add authentic collectible cards or boxes before checking out.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  const shippingAddress: Address = {
    fullName,
    mobile: phone,
    email,
    addressLine: street,
    city,
    state,
    pincode: postalCode,
    country,
    street,
    phone,
    postalCode
  };

  const launchRazorpay = (res: any) => {
    if (typeof (window as any).Razorpay === 'undefined') {
      setFormError('Razorpay checkout library is loading. Please check your internet connection and try again.');
      setInitiatingPayment(false);
      return;
    }

    const options = {
      key: res.keyId,
      amount: res.amountInPaise,
      currency: res.currency || 'INR',
      name: res.storeName || 'CardVault Collectibles',
      description: `CardVault Order Payment (${res.gatewayOrderId})`,
      image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=200&q=80',
      order_id: res.gatewayOrderId,
      prefill: {
        name: fullName,
        email: email,
        contact: phone
      },
      theme: {
        color: '#0c0a09'
      },
      modal: {
        ondismiss: () => {
          setInitiatingPayment(false);
          setFormError('Payment was cancelled or closed. No money was debited from your bank, and collectible cards were not booked.');
        }
      },
      handler: async (response: any) => {
        try {
          setVerifyingPayment(true);
          const verifyRes = await api.verifyPayment({
            gatewayOrderId: response.razorpay_order_id || res.gatewayOrderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            shippingAddress,
            items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
            couponCode: appliedCoupon?.code
          });
          clearCart();
          navigate(`/order-success/${verifyRes.order.id}`);
        } catch (err: any) {
          setFormError(`Bank payment verification failed: ${err.message}. Collectible items were not booked.`);
        } finally {
          setVerifyingPayment(false);
          setInitiatingPayment(false);
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (resp: any) {
      setInitiatingPayment(false);
      setFormError(`Payment failed: ${resp.error?.description || 'Transaction declined by issuing bank'}. No items were booked.`);
    });
    rzp.open();
  };

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form validations
    if (!fullName.trim() || !email.trim() || !phone.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      setFormError('Please fill in all required shipping address and contact fields.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setFormError('Please enter a valid 10-digit Indian mobile number for courier dispatch SMS alerts.');
      return;
    }

    if (postalCode.replace(/\D/g, '').length !== 6) {
      setFormError('Please enter a valid 6-digit Indian PIN / Postal Code.');
      return;
    }

    setInitiatingPayment(true);

    try {
      // 1. Verify stock live with the database
      const stockCheck = await validateCartStock();
      if (!stockCheck.valid) {
        setFormError(`Stock changed: ${stockCheck.errors.join('. ')}`);
        setInitiatingPayment(false);
        return;
      }

      // 2. Save address to user profile if requested
      if (user && saveToProfile) {
        saveAddress(shippingAddress).catch(console.warn);
      }

      // 3. Request server to create Razorpay payment order
      const orderPayload = {
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress,
        couponCode: appliedCoupon?.code
      };

      const res = await api.createPaymentOrder(orderPayload);
      launchRazorpay(res);
    } catch (err: any) {
      if (err.message?.includes('Razorpay Payment Gateway is not configured') || err.needsConfiguration) {
        setShowGatewayConfigModal(true);
      } else {
        setFormError(err.message || 'Failed to initialize payment gateway.');
      }
      setInitiatingPayment(false);
    }
  };

  const handleSaveGatewayKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configKeyId.trim() || !configKeySecret.trim()) {
      setFormError('Both Razorpay Key ID and Key Secret are required for automated bank verification.');
      return;
    }

    setSavingGatewayKeys(true);
    setFormError(null);
    try {
      await api.configureGateway({
        keyId: configKeyId.trim(),
        keySecret: configKeySecret.trim()
      });
      setShowGatewayConfigModal(false);

      // Immediately launch payment with newly configured credentials
      setInitiatingPayment(true);
      const res = await api.createPaymentOrder({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress,
        couponCode: appliedCoupon?.code
      });
      launchRazorpay(res);
    } catch (err: any) {
      setFormError(`Failed to save Razorpay keys: ${err.message}`);
    } finally {
      setSavingGatewayKeys(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <button
          onClick={() => navigate('/cart')}
          className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1.5 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Automated Razorpay Bank Verification Guard</span>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">{formError}</p>
            {formError.includes('Razorpay') && (
              <button
                type="button"
                onClick={() => setShowGatewayConfigModal(true)}
                className="text-[11px] text-red-800 font-bold underline cursor-pointer hover:text-red-950"
              >
                Configure Razorpay Keys Now &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {verifyingPayment && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-3 shadow-xs">
          <Loader2 className="w-5 h-5 text-amber-600 animate-spin shrink-0" />
          <div>
            <p className="font-bold">Verifying payment with bank & booking collectibles...</p>
            <p className="text-[11px] text-amber-700">Checking captured status on Razorpay API. Please do not refresh the page.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleStartPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Contact & Shipping */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact Details */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-600" /> Contact & Delivery Updates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email (for Invoice & Receipt) *</label>
                <input
                  type="email"
                  required
                  placeholder="collector@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mobile Number (for Courier & SMS Tracking) *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-stone-300 bg-stone-100 text-stone-600 text-xs font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-r-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" /> Shipping Destination (India Only)
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Flat, House No., Building, Street Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 402, Lotus Towers, 14th Road"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">PIN / Postal Code *</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="400050"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {user && (
              <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="rounded border-stone-300 text-amber-500"
                />
                <span>Save this address to my CardVault profile for future checkouts</span>
              </label>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Razorpay Gateway CTA */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider">Order Items Review</h2>

            {/* Micro items list */}
            <div className="max-h-56 overflow-y-auto divide-y divide-stone-200 pr-1">
              {items.map((item) => {
                const price = item.product.salePrice || item.product.price;
                return (
                  <div key={item.productId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="truncate flex-1">
                      <p className="font-bold text-stone-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-stone-500">Qty: {item.quantity} × ₹{price.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="font-bold text-stone-800">₹{(price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                );
              })}
            </div>

            {/* Financial breakdown */}
            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
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
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-bold text-stone-950">Total Payable Amount</span>
                <span className="text-2xl font-extrabold text-stone-950 font-serif">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Real Razorpay Checkout Action */}
            <button
              type="submit"
              disabled={initiatingPayment || verifyingPayment}
              className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {initiatingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Opening Razorpay Gateway...
                </>
              ) : verifyingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Bank Capture...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Pay ₹{total.toLocaleString('en-IN')} with Razorpay
                </>
              )}
            </button>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1.5">
              <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Automated Bank Verification:
              </p>
              <p>
                Payments are processed exclusively through Razorpay (UPI, NetBanking, Cards). Collectible items are booked ONLY when Razorpay confirms the amount is captured in our merchant bank account.
              </p>
              <p className="text-[10px] text-stone-400">
                Manual reference numbers are strictly rejected. Unpaid orders are never placed.
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* Razorpay Gateway Setup Modal (Opens when Razorpay credentials are required) */}
      {showGatewayConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 font-serif">Razorpay Gateway Setup</h3>
                  <p className="text-[11px] text-stone-500">Configure credentials for automated bank verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGatewayConfigModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGatewayKeys} className="p-6 space-y-4 text-xs">
              <p className="text-stone-600 leading-relaxed">
                To guarantee that orders are verified and items are only booked once funds credit the merchant bank account, please enter your Razorpay API credentials.
              </p>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Razorpay Key ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="rzp_test_... or rzp_live_..."
                  value={configKeyId}
                  onChange={(e) => setConfigKeyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Razorpay Key Secret *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter Razorpay Secret Key"
                  value={configKeySecret}
                  onChange={(e) => setConfigKeySecret(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-stone-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Where do I get free Razorpay keys?
                </p>
                <p>
                  You can get free sandbox test keys instantly with zero paperwork from{' '}
                  <a
                    href="https://dashboard.razorpay.com/#/access/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-bold text-amber-900"
                  >
                    Razorpay Dashboard &rarr; Settings &rarr; API Keys
                  </a>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGatewayConfigModal(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGatewayKeys}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingGatewayKeys ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save & Open Razorpay'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
