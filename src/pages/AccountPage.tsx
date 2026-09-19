import React, { useState, useEffect } from 'react';
import { 
  User, Package, MapPin, Settings, LogOut, 
  ExternalLink, Truck, CheckCircle2, Clock, AlertTriangle, Plus, Trash2, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import type { Order, Address } from '../types.js';

interface AccountPageProps {
  navigate: (path: string) => void;
  defaultTab?: 'orders' | 'profile' | 'addresses';
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate, defaultTab = 'orders' }) => {
  const { user, logout, updateProfile, saveAddress } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>(defaultTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New Address Form State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('Maharashtra');
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoadingOrders(true);
    api.getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [user]);

  if (!user) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    try {
      await updateProfile({ name, mobile });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAddr: Address = {
      fullName: user.name,
      mobile: user.mobile || '9876543210',
      email: user.email,
      addressLine: newStreet,
      city: newCity,
      state: newState,
      pincode: newPin,
      country: 'India',
      street: newStreet,
      phone: user.mobile || '9876543210',
      postalCode: newPin
    };
    await saveAddress(newAddr);
    setShowAddressModal(false);
    setNewStreet('');
    setNewCity('');
    setNewPin('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-xl font-bold uppercase">
            {user.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-950 font-serif">{user.name}</h1>
            <p className="text-xs text-stone-500">{user.email} • Collector Member</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="px-4 py-2 bg-white hover:bg-stone-50 text-stone-600 hover:text-red-600 border border-stone-200 text-xs font-semibold rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-amber-500 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Package className="w-4 h-4" /> My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-amber-500 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MapPin className="w-4 h-4" /> Saved Addresses
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'border-amber-500 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Settings className="w-4 h-4" /> Profile Settings
        </button>
      </div>

      {/* Tab: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="p-12 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600 mx-auto" />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-stone-50 border border-stone-200 space-y-3 shadow-xs">
              <Package className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="text-base font-bold text-stone-950 font-serif">No Orders Placed Yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Once you purchase cards, your verified orders and courier tracking updates will appear here.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Start Browsing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-800">{ord.orderNumber}</span>
                      <span className="text-stone-500 ml-2">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold uppercase text-[10px]">
                        Payment: {ord.paymentStatus}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-semibold uppercase text-[10px]">
                        Status: {ord.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div className="space-y-2">
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-stone-900">{it.productName}</p>
                          <p className="text-[11px] text-stone-500">Condition: {it.condition} • Qty: {it.quantity}</p>
                        </div>
                        <span className="font-mono font-medium text-stone-800">₹{((it.unitPrice || it.price || 0) * it.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking & Footer */}
                  <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      {ord.trackingNumber ? (
                        <div className="flex items-center gap-2 text-amber-800">
                          <Truck className="w-4 h-4 text-amber-600" />
                          <span>Air Courier Tracking: <strong className="text-stone-900 font-mono">{ord.trackingNumber}</strong></span>
                        </div>
                      ) : (
                        <span className="text-stone-500">Dispatching from Mumbai Vault</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-stone-950 font-serif">
                        Total: ₹{ord.total.toLocaleString('en-IN')}
                      </span>
                      <button
                        onClick={() => navigate(`/order-success/${ord.id}`)}
                        className="text-amber-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        View Receipt <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Saved Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">My Delivery Addresses</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user.savedAddresses?.map((addr, i) => (
              <div key={i} className="p-4 rounded-xl bg-white border border-stone-200 text-xs space-y-1 shadow-xs">
                <p className="font-bold text-stone-950">{addr.fullName}</p>
                <p className="text-stone-700">{addr.addressLine || addr.street}</p>
                <p className="text-stone-700">{addr.city}, {addr.state} - {addr.pincode || addr.postalCode}</p>
                <p className="text-stone-500">Mobile: +91 {addr.mobile || addr.phone}</p>
              </div>
            ))}
            {(!user.savedAddresses || user.savedAddresses.length === 0) && (
              <div className="p-8 text-center col-span-2 text-stone-500 text-xs border border-stone-200 rounded-xl bg-stone-50">
                No saved addresses yet. Addresses you use during checkout are saved automatically.
              </div>
            )}
          </div>

          {/* Add Address Dialog */}
          {showAddressModal && (
            <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-stone-900 uppercase">Add New Shipping Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-3">
                  <div>
                    <label className="block text-xs text-stone-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat, building, street"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-stone-700 mb-1">City</label>
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-700 mb-1">State</label>
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={newState}
                        onChange={(e) => setNewState(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-stone-700 mb-1">PIN / Postal Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="400050"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="max-w-lg p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Account Details</h2>

          {profileSuccess && (
            <p className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl shadow-xs">
              Profile updated successfully.
            </p>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-stone-400 mt-1">Email address cannot be changed.</p>
            </div>
            <div>
              <label className="block text-xs text-stone-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              disabled={profileSaving}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
