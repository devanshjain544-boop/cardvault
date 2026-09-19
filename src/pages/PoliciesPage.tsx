import React from 'react';

interface PoliciesPageProps {
  type: 'shipping' | 'refund' | 'privacy' | 'terms';
  navigate: (path: string) => void;
}

export const PoliciesPage: React.FC<PoliciesPageProps> = ({ type, navigate }) => {
  const contentMap = {
    shipping: {
      title: 'Shipping & Delivery Policy',
      updated: 'October 2024',
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <h3 className="text-base font-bold text-stone-900">1. Shipping Coverage</h3>
          <p>
            CardVault ships across India covering all serviceable PIN codes via authorized express air couriers including Blue Dart, Delhivery, and India Post Speed Post.
          </p>

          <h3 className="text-base font-bold text-stone-900">2. Armored Packaging Standards</h3>
          <p>
            Every single trading card is double-sleeved and encased in a rigid magnetic one-touch slab or semi-rigid top-loader. Items are wrapped in shock-absorbing bubble cushioning and packed inside rigid corrugated boxes to eliminate corner dings, scratches, and bending during transit.
          </p>

          <h3 className="text-base font-bold text-stone-900">3. Dispatch & Delivery Timelines</h3>
          <p>
            Orders verified before 2:00 PM IST are dispatched from our Mumbai facility within 24 hours. Metros receive orders within 2 to 3 business days; other regions within 4 to 6 business days. Real-time AWB tracking is provided via SMS and email.
          </p>

          <h3 className="text-base font-bold text-stone-900">4. Shipping Charges</h3>
          <p>
            Standard Armored Shipping is ₹149. Orders with items subtotal of ₹2,999 and above receive Complimentary Free Armored Shipping automatically.
          </p>
        </div>
      )
    },
    refund: {
      title: 'Refund & Cancellation Policy',
      updated: 'October 2024',
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <h3 className="text-base font-bold text-stone-900">1. Factory Sealed Product Returns</h3>
          <p>
            Due to the speculative market nature and tamper risk of collectible booster packs and boxes, returns are accepted ONLY if the product remains completely unopened with intact factory shrink-wrap. Once any outer seal or tear-strip is broken, returns are strictly ineligible.
          </p>

          <h3 className="text-base font-bold text-stone-900">2. Transit Damage & Missing Items</h3>
          <p>
            If a package arrives physically crushed or shows signs of carrier tampering, customers must record an unboxing video without cuts. Notify us at support@cardvault.in within 48 hours of delivery with photographic and video evidence.
          </p>

          <h3 className="text-base font-bold text-stone-900">3. Order Cancellations</h3>
          <p>
            Orders may be cancelled before shipment handover. Once an order is dispatched and an AWB tracking number is generated, cancellations cannot be accepted.
          </p>

          <h3 className="text-base font-bold text-stone-900">4. Refund Processing</h3>
          <p>
            Approved refunds are credited back to the original payment source (UPI / NetBanking / Card) via Razorpay within 5 to 7 banking days.
          </p>
        </div>
      )
    },
    privacy: {
      title: 'Privacy Policy',
      updated: 'October 2024',
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <h3 className="text-base font-bold text-stone-900">1. Information Collection</h3>
          <p>
            CardVault collects minimal necessary data including name, shipping address, contact email, and phone number exclusively to fulfill orders and communicate delivery updates.
          </p>

          <h3 className="text-base font-bold text-stone-900">2. Payment Security</h3>
          <p>
            We do NOT store or access full debit/credit card numbers or CVV codes on our servers. All financial transactions are securely handled by PCI-DSS Level 1 certified gateway partners (Razorpay).
          </p>

          <h3 className="text-base font-bold text-stone-900">3. Zero Data Sale</h3>
          <p>
            We will never sell, rent, or trade your personal collector details to any third-party marketing brokers.
          </p>
        </div>
      )
    },
    terms: {
      title: 'Terms & Conditions',
      updated: 'October 2024',
      body: (
        <div className="space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
          <h3 className="text-base font-bold text-stone-900">1. Agreement to Terms</h3>
          <p>
            By visiting or purchasing from CardVault, you agree to adhere to these terms and conditions. All card grades, conditions, and descriptions represent professional assessments adhering to international numismatic and card grading standards.
          </p>

          <h3 className="text-base font-bold text-stone-900">2. Pricing & Currency</h3>
          <p>
            All listed prices are in Indian Rupees (INR ₹) inclusive of applicable taxes. In the event of a technical typographical error in catalog pricing, CardVault reserves the right to cancel orders with full immediate refund.
          </p>

          <h3 className="text-base font-bold text-stone-900">3. Governing Law</h3>
          <p>
            All transactions and dispute resolutions are governed under the laws of the Republic of India and subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.
          </p>
        </div>
      )
    }
  };

  const current = contentMap[type] || contentMap.shipping;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-stone-950 font-serif">{current.title}</h1>
        <p className="text-xs text-stone-500 mt-1">Last Updated: {current.updated}</p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-stone-200 shadow-xs">
        {current.body}
      </div>

      <div className="pt-4 border-t border-stone-200 flex flex-wrap gap-4 text-xs font-semibold">
        <button onClick={() => navigate('/shipping-policy')} className="text-stone-600 hover:text-amber-700 cursor-pointer">Shipping Policy</button>
        <span className="text-stone-300">•</span>
        <button onClick={() => navigate('/refund-policy')} className="text-stone-600 hover:text-amber-700 cursor-pointer">Refund Policy</button>
        <span className="text-stone-300">•</span>
        <button onClick={() => navigate('/privacy-policy')} className="text-stone-600 hover:text-amber-700 cursor-pointer">Privacy Policy</button>
        <span className="text-stone-300">•</span>
        <button onClick={() => navigate('/terms-and-conditions')} className="text-stone-600 hover:text-amber-700 cursor-pointer">Terms & Conditions</button>
      </div>
    </div>
  );
};
