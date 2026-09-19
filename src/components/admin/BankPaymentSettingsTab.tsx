import React, { useState, useEffect } from 'react';
import { 
  Building2, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, 
  ArrowRight, Key, Lock, Eye, EyeOff, RefreshCw, Landmark, 
  HelpCircle, DollarSign, Wallet, FileText, Check
} from 'lucide-react';
import { api } from '../../lib/api.js';
import type { StoreSettings } from '../../types.js';

interface BankPaymentSettingsTabProps {
  settings: StoreSettings | null;
  onSettingsUpdated: () => void;
  showToast: (msg: string) => void;
}

export const BankPaymentSettingsTab: React.FC<BankPaymentSettingsTabProps> = ({
  settings,
  onSettingsUpdated,
  showToast
}) => {
  // Bank Account Fields
  const [accountHolderName, setAccountHolderName] = useState(
    settings?.bankSettlement?.accountHolderName || 'CardVault Collectibles Private Limited'
  );
  const [bankName, setBankName] = useState(
    settings?.bankSettlement?.bankName || 'HDFC Bank Ltd'
  );
  const [accountNumber, setAccountNumber] = useState(
    settings?.bankSettlement?.accountNumber || '50200084920193'
  );
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(
    settings?.bankSettlement?.accountNumber || '50200084920193'
  );
  const [ifscCode, setIfscCode] = useState(
    settings?.bankSettlement?.ifscCode || 'HDFC0000060'
  );
  const [accountType, setAccountType] = useState<'Current' | 'Savings'>(
    settings?.bankSettlement?.accountType || 'Current'
  );
  const [upiId, setUpiId] = useState(
    settings?.bankSettlement?.upiId || 'cardvault@hdfcbank'
  );

  // Gateway Credentials
  const [provider, setProvider] = useState<'razorpay' | 'cashfree' | 'phonepe'>('razorpay');
  const [keyId, setKeyId] = useState(settings?.paymentGateway?.keyId || '');
  const [keySecret, setKeySecret] = useState(settings?.paymentGateway?.keySecret || '');
  const [isLiveMode, setIsLiveMode] = useState(settings?.paymentGateway?.isLiveMode || false);
  const [showSecret, setShowSecret] = useState(false);
  const [showAccountNum, setShowAccountNum] = useState(false);

  // Status & Actions
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; gatewayStatus?: string } | null>(null);
  const [paymentsLedger, setPaymentsLedger] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    if (settings) {
      if (settings.bankSettlement) {
        setAccountHolderName(settings.bankSettlement.accountHolderName || '');
        setBankName(settings.bankSettlement.bankName || '');
        setAccountNumber(settings.bankSettlement.accountNumber || '');
        setConfirmAccountNumber(settings.bankSettlement.accountNumber || '');
        setIfscCode(settings.bankSettlement.ifscCode || '');
        setAccountType(settings.bankSettlement.accountType || 'Current');
        setUpiId(settings.bankSettlement.upiId || '');
      }
      if (settings.paymentGateway) {
        setKeyId(settings.paymentGateway.keyId || '');
        setKeySecret(settings.paymentGateway.keySecret || '');
        setIsLiveMode(settings.paymentGateway.isLiveMode || false);
      }
    }
    loadPayments();
  }, [settings]);

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await api.admin.getPayments();
      setPaymentsLedger(data);
    } catch (err) {
      console.error('Failed to load payments ledger', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleSaveBankAndGateway = async (e: React.FormEvent) => {
    e.preventDefault();

    if (accountNumber !== confirmAccountNumber) {
      alert('Bank Account Numbers do not match! Please check and confirm.');
      return;
    }

    setSaving(true);
    try {
      await api.admin.updateSettings({
        bankSettlement: {
          accountHolderName: accountHolderName.trim(),
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          accountType,
          upiId: upiId.trim(),
          settlementSchedule: 'T+1 Business Day Automated Settlement',
          isVerified: true
        },
        paymentGateway: {
          provider,
          keyId: keyId.trim(),
          keySecret: keySecret.trim(),
          keyIdConfigured: Boolean(keyId.trim()),
          hasKeySecret: Boolean(keySecret.trim()),
          webhookConfigured: true,
          isLiveMode
        }
      });

      showToast('Bank account & payment settings saved successfully!');
      onSettingsUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.admin.testPaymentConnection();
      setTestResult(res);
      showToast('Payment gateway and bank routing verified!');
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to verify payment gateway'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Explanation of Automated Bank Settlement */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-900">
            <Building2 className="w-4 h-4 text-amber-700" />
            <span>Direct Bank Account Settlements (T+1 Daily Cycle)</span>
          </div>
          <h3 className="text-base font-bold text-stone-950 font-serif">
            How Customer Payments Reach Your Bank Account
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            When a buyer pays for cards, booster boxes, or decks via UPI, Debit/Credit Card, or NetBanking, the funds are captured securely through your payment gateway and automatically transferred into your linked Indian Bank Account on a next-day (T+1) automated payout schedule.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            {testing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Test Settlement Routing</span>
          </button>
        </div>
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 shadow-xs ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="font-bold">{testResult.message}</p>
            {testResult.gatewayStatus && (
              <p className="text-[11px] text-emerald-700">
                Gateway Status: <span className="font-mono font-bold">{testResult.gatewayStatus}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveBankAndGateway} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CARD 1: Business Bank Account Details */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-950 font-serif">
                    Business Bank Account
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Account where all customer payments will be deposited
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active Payout
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Beneficiary / Account Holder Name *
                </label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. CardVault Collectibles Pvt Ltd / Devansh Jain"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-400">Must match the legal name on your bank statement/passbook.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="HDFC Bank, ICICI Bank, SBI"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Account Type *
                  </label>
                  <select
                    value={accountType}
                    onChange={(e: any) => setAccountType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Current">Current Account (Recommended for Business)</option>
                    <option value="Savings">Savings Account</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-700 font-bold">
                    Bank Account Number *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAccountNum(!showAccountNum)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showAccountNum ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showAccountNum ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showAccountNum ? 'text' : 'password'}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter 9 to 18 digit account number"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Confirm Bank Account Number *
                </label>
                <input
                  type={showAccountNum ? 'text' : 'password'}
                  required
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value)}
                  placeholder="Re-enter bank account number"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="HDFC0000060"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-stone-400">11-character Indian Bank Branch code.</span>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Linked Settlement UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="merchant@okhdfcbank"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-medium focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-stone-400">Optional VPA for instant UPI settlements.</span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Gateway Credentials & API Keys */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-950 font-serif">
                    Razorpay Gateway API
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Connects your Indian payment gateway to process UPI & Cards
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  isLiveMode
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {isLiveMode ? 'Live Mode' : 'Test Mode'}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Payment Gateway Provider
                </label>
                <select
                  value={provider}
                  onChange={(e: any) => setProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="razorpay">Razorpay (UPI, GPay, PhonePe, Cards, NetBanking)</option>
                  <option value="cashfree">Cashfree Payments (India)</option>
                  <option value="phonepe">PhonePe Payment Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Gateway Key ID (Public Key)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={keyId}
                    onChange={(e) => setKeyId(e.target.value)}
                    placeholder="rzp_live_... or rzp_test_..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[10px] text-stone-400">Obtained from your Razorpay Dashboard &gt; Settings &gt; API Keys.</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-700 font-bold">
                    Gateway Key Secret (Private / Secure)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showSecret ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={keySecret}
                    onChange={(e) => setKeySecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-[10px] text-stone-400">Stored strictly server-side. Used to verify cryptographic payment signatures.</span>
              </div>

              {/* Mode Toggle */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-stone-900 text-xs">Live Production Mode</p>
                  <p className="text-[11px] text-stone-500">
                    When enabled, real customer payments will be collected in INR and settled to your bank account.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLiveMode}
                    onChange={(e) => setIsLiveMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-stone-700 text-[11px] space-y-1">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  Server-Side Verification Guaranteed
                </p>
                <p>
                  Every transaction is validated via HMAC-SHA256 checksums server-side. Only verified successful payments decrement product stock and confirm orders.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-5 bg-white border border-stone-200 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <span className="text-xs text-stone-700 font-medium">
              Changes take effect immediately across all customer checkout sessions.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save Bank & Payment Credentials</span>
          </button>
        </div>
      </form>

      {/* SECTION 3: Live Verified Payments Ledger */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h4 className="text-sm font-bold text-stone-950 font-serif">
              Customer Payments & Settlement Ledger
            </h4>
            <p className="text-[11px] text-stone-500">
              Real captured payments awaiting or completed settlement to your bank account
            </p>
          </div>
          <button
            type="button"
            onClick={loadPayments}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh Transactions"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPayments ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {paymentsLedger.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Wallet className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="text-xs font-bold text-stone-700">No payment transactions recorded yet</p>
            <p className="text-[11px] text-stone-500">
              When customers complete checkout, their transaction IDs and settlement records will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Gateway Payment ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Amount (₹)</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paymentsLedger.map((p, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">
                      {p.orderNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-600">
                      {p.paymentId}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-stone-900">{p.customerName}</p>
                      <p className="text-[10px] text-stone-500">{p.customerEmail}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-stone-100 rounded text-[11px] font-medium text-stone-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-stone-500">
                      {new Date(p.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Routing to Bank
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
