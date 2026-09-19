import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, ShieldCheck, PackageCheck, Truck, 
  Printer, ArrowRight, Sparkles, MapPin, CreditCard, Clock, Loader2 
} from 'lucide-react';
import type { Order } from '../types.js';
import { api } from '../lib/api.js';

interface OrderSuccessPageProps {
  orderId: string;
  navigate: (path: string) => void;
}

export const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({ orderId, navigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrder(orderId)
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin mx-auto mb-3" />
        <p className="text-xs text-stone-500">Retrieving confirmed vault order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-950 font-serif">Order Details Not Found</h2>
        <p className="text-xs text-stone-500">We could not load this order confirmation record.</p>
        <button onClick={() => navigate('/shop')} className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer">
          Return to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xs">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> PAYMENT VERIFIED & CONFIRMED
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-950 font-serif tracking-tight">
          Thank You For Your Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Your authentic trading cards and sealed collectibles are safely reserved in our Mumbai vault and entering armored preparation.
        </p>
        <p className="text-xs font-mono text-amber-800">
          ORDER NUMBER: <span className="font-bold text-stone-950">{order.orderNumber}</span>
        </p>
      </div>

      {/* Next Steps Timeline Card */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
        <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" /> Fulfillment & Delivery Timeline
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-amber-800">1. Vault Inspection</span>
            <p className="text-stone-600 text-[11px]">Items verified under optical magnification and sealed in tamper-proof magnetic slabs.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-amber-800">2. Express Air Courier</span>
            <p className="text-stone-600 text-[11px]">Handed over to Blue Dart / Delhivery express air freight within 24 hours.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="font-bold text-emerald-700">3. Estimated Delivery</span>
            <p className="text-stone-600 text-[11px]">2 to 4 business days across major Indian metros with signature on delivery.</p>
          </div>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchased Items */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-amber-600" /> Purchased Collectibles
          </h2>

          <div className="divide-y divide-stone-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-stone-900">{item.productName}</p>
                  <p className="text-[11px] text-stone-500">
                    Condition: <span className="text-amber-700 font-semibold">{item.condition}</span> • Qty: {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-stone-800">
                  ₹{((item.unitPrice || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-100 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal</span>
              <span className="text-stone-800 font-medium">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-stone-500">
              <span>Shipping Fee</span>
              <span className="text-stone-800 font-medium">{order.shippingFee === 0 ? 'Free' : `₹${order.shippingFee}`}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Discount</span>
                <span>- ₹{order.discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="border-t border-stone-100 pt-2 flex justify-between items-baseline font-bold text-sm text-stone-900">
              <span>Total Paid</span>
              <span className="text-xl text-stone-950 font-serif">₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Payment & Shipping Summary */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3 text-xs shadow-xs">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" /> Payment Confirmation
            </h2>
            <div className="space-y-2 text-stone-700">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Payment Status:</span>
                <span className="font-bold text-emerald-800 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Method:</span>
                <span className="font-semibold text-stone-900">{order.paymentMethod || order.paymentDetails?.method || 'Direct Bank UPI Transfer'}</span>
              </div>
              {order.paymentDetails?.bankUtr && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Bank UTR / Ref No:</span>
                  <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {order.paymentDetails.bankUtr}
                  </span>
                </div>
              )}
              {order.paymentDetails?.settlementAccount && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Beneficiary Bank:</span>
                  <span className="font-medium text-stone-900 text-[11px]">{order.paymentDetails.settlementAccount}</span>
                </div>
              )}
              {(order.paymentId || order.paymentDetails?.paymentId) && !order.paymentDetails?.bankUtr && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Transaction ID:</span>
                  <span className="font-mono text-[11px] text-stone-700">{order.paymentId || order.paymentDetails?.paymentId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-3 text-xs shadow-xs">
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" /> Shipping Destination
            </h2>
            <div className="text-stone-600 space-y-1">
              <p className="font-bold text-stone-950">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine || order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode || order.shippingAddress.postalCode}</p>
              <p className="text-stone-500">Mobile: +91 {order.shippingAddress.mobile || order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save Invoice Receipt
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/account/orders')}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 text-xs font-semibold shadow-xs cursor-pointer"
          >
            View in My Orders
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
