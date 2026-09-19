import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Package, Layers, ShoppingCart, Users, 
  Tag, Settings, Plus, Edit2, Trash2, Search, 
  CheckCircle2, AlertTriangle, ArrowUpRight, Truck, Eye, RefreshCw, X, Save, Lock, ShieldCheck, CreditCard,
  Landmark, Building2, Check, Filter, Power, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import type { 
  Product, Category, Order, User, Coupon, StoreSettings, DashboardStats, ProductStatus 
} from '../types.js';
import { ProductFormModal } from '../components/admin/ProductFormModal.js';
import { BankPaymentSettingsTab } from '../components/admin/BankPaymentSettingsTab.js';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'orders' | 'payments' | 'categories' | 'coupons' | 'customers' | 'settings'>('overview');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals & form states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newCouponModalOpen, setNewCouponModalOpen] = useState(false);
  const [newCategoryModalOpen, setNewCategoryModalOpen] = useState(false);

  // Search & Filter in Admin
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // Protect admin route client-side as well
  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [st, prods, cats, ords, custs, coups, setts] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getProducts(),
        api.getCategories(),
        api.admin.getOrders(),
        api.admin.getCustomers(),
        api.admin.getCoupons(),
        api.getSettings()
      ]);
      setStats(st);
      setProducts(prods);
      setCategories(cats);
      setOrders(ords);
      setCustomers(custs);
      setCoupons(coups);
      setSettings(setts);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Admin clearance required') || err.message?.includes('Unauthorized')) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Quick Stock Adjustment
  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      await api.admin.updateStock(productId, newStock);
      showToast('Stock quantity updated successfully.');
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Order Status & Courier Update
  const handleUpdateOrderStatus = async (orderId: string, orderStatus: any, trackingNumber?: string, courierPartner?: string) => {
    try {
      await api.admin.updateOrderStatus(orderId, { orderStatus, trackingNumber, courierPartner });
      showToast('Order status & tracking updated.');
      loadAllData();
      if (selectedOrder && selectedOrder.id === orderId) {
        const updated = await api.getOrder(orderId);
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.admin.deleteProduct(id);
      showToast(`Product "${name}" deleted.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // One-click Publish / Unpublish Toggle
  const handleTogglePublish = async (p: Product) => {
    try {
      const newStatus: ProductStatus = p.status === 'published' ? 'draft' : 'published';
      await api.admin.updateProduct(p.id, { status: newStatus });
      showToast(`"${p.name}" status updated to ${newStatus.toUpperCase()}.`);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status');
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs">
            CV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-stone-950 font-serif">CardVault Operations Dashboard</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                ADMIN CONSOLE
              </span>
            </div>
            <p className="text-[11px] text-stone-500">Authenticated Administrator: {user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Visit Public Store
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Admin Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs Bar */}
        <div className="flex gap-1 overflow-x-auto pb-3 mb-6 border-b border-stone-200 text-xs font-bold uppercase tracking-wider">
          {[
            { id: 'overview', label: 'Dashboard', icon: BarChart3 },
            { id: 'products', label: 'Products & Collectibles', icon: Package },
            { id: 'inventory', label: 'Inventory & Stock', icon: AlertTriangle },
            { id: 'orders', label: 'Orders & Shipping', icon: ShoppingCart },
            { id: 'payments', label: 'Payments & Bank Account', icon: Landmark },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'settings', label: 'Store Settings', icon: Settings },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-400 text-stone-950 font-extrabold shadow-xs'
                    : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Verified Sales Revenue</p>
                <p className="text-2xl font-black text-amber-600 font-serif mt-1">
                  ₹{(stats?.totalSales || 0).toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1 font-semibold">Real paid orders only</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Total Orders</p>
                <p className="text-2xl font-black text-stone-950 font-serif mt-1">
                  {stats?.totalOrders || 0}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">{stats?.paidOrders || 0} paid • {stats?.pendingOrders || 0} processing</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Low Stock Warnings</p>
                <p className="text-2xl font-black text-amber-600 font-serif mt-1">
                  {stats?.lowStockProducts ?? stats?.lowStockCount ?? 0}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">Items at or below threshold</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
                <p className="text-xs text-stone-500 uppercase tracking-wider">Sold Out Items</p>
                <p className="text-2xl font-black text-red-600 font-serif mt-1">
                  {stats?.outOfStockProducts ?? stats?.outOfStockCount ?? 0}
                </p>
                <p className="text-[11px] text-red-600/80 mt-1">Purchases disabled</p>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-5 rounded-2xl bg-white border border-stone-200 flex flex-wrap items-center gap-3 shadow-xs">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Vault Fast Actions:</span>
              <button
                onClick={() => { setEditingProduct(null); setIsNewProductModalOpen(true); }}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Collectible Card/Box
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-4 h-4 text-amber-600" /> Manage Shipments
              </button>
              <button
                onClick={() => setNewCouponModalOpen(true)}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Tag className="w-4 h-4 text-amber-600" /> Create Promo Coupon
              </button>
            </div>

            {/* Recent Orders Overview */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs text-amber-700 font-semibold hover:underline cursor-pointer">
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No orders have been placed yet.</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-stone-950 font-mono">{ord.orderNumber}</span>
                        <span className="text-stone-500 ml-2">{ord.shippingAddress.fullName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
                          {ord.paymentStatus}
                        </span>
                        <span className="font-serif font-bold text-stone-900">
                          ₹{ord.total.toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="text-amber-700 font-semibold hover:underline text-[11px] cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="relative min-w-[220px] flex-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Search by title, SKU, brand, series..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                </div>

                {/* Filter by Category */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-white border border-stone-300 text-stone-800 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                {/* Filter by Product Type */}
                <select
                  value={productTypeFilter}
                  onChange={(e) => setProductTypeFilter(e.target.value)}
                  className="bg-white border border-stone-300 text-stone-800 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="Single Card">Single Cards</option>
                  <option value="Booster Box">Booster Boxes</option>
                  <option value="Booster Pack">Booster Packs (Single Packets)</option>
                  <option value="Card Deck">Card Decks</option>
                  <option value="Collection Box">Collection Boxes / ETBs</option>
                  <option value="Tin / Bundle">Tins & Bundles</option>
                </select>

                {/* Filter by Status */}
                <select
                  value={productStatusFilter}
                  onChange={(e) => setProductStatusFilter(e.target.value)}
                  className="bg-white border border-stone-300 text-stone-800 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              </div>

              <button
                onClick={() => { setEditingProduct(null); setIsNewProductModalOpen(true); }}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer shrink-0 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ List Card, Box, Deck, or Pack</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="border border-stone-200 rounded-2xl bg-white overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase tracking-wider border-b border-stone-200 font-bold">
                  <tr>
                    <th className="p-3.5">Collectible Item</th>
                    <th className="p-3.5">Type & Brand</th>
                    <th className="p-3.5">Condition / Grade</th>
                    <th className="p-3.5">Price (₹)</th>
                    <th className="p-3.5">Vault Stock</th>
                    <th className="p-3.5">Visibility</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products
                    .filter(p => {
                      if (productSearch && !(p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase()))) {
                        return false;
                      }
                      if (productCategoryFilter && p.categoryId !== productCategoryFilter) {
                        return false;
                      }
                      if (productTypeFilter && p.productType !== productTypeFilter) {
                        return false;
                      }
                      if (productStatusFilter && p.status !== productStatusFilter) {
                        return false;
                      }
                      return true;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img 
                              src={p.images?.[0] || 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=100&q=80'} 
                              alt="" 
                              className="w-10 h-12 object-contain bg-stone-50 rounded-lg border border-stone-200 p-0.5 shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="max-w-xs">
                              <p className="font-bold text-stone-900 truncate">{p.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-stone-500 font-mono font-semibold">SKU: {p.sku}</span>
                                {p.isFeatured && (
                                  <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded uppercase">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-stone-700">
                          <p className="font-semibold">{p.productType}</p>
                          <p className="text-[11px] text-stone-500">{p.brand} {p.series ? `• ${p.series}` : ''}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-800 text-[10px] font-bold uppercase">
                            {p.gradingStatus && p.gradingStatus !== 'Raw / Authenticated' ? p.gradingStatus : p.condition}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-stone-900 font-mono">
                          ₹{(p.salePrice || p.price).toLocaleString('en-IN')}
                          {p.salePrice && (
                            <span className="text-[10px] text-stone-400 line-through block font-normal">
                              ₹{p.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              defaultValue={p.stock}
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (!isNaN(val) && val !== p.stock) {
                                  handleUpdateStock(p.id, val);
                                }
                              }}
                              className={`w-16 px-2 py-1 rounded-lg bg-stone-50 border text-center font-bold text-xs text-stone-900 ${
                                p.stock === 0 
                                  ? 'border-red-300 text-red-600 bg-red-50' 
                                  : p.stock <= (p.lowStockThreshold ?? 2) 
                                  ? 'border-amber-300 text-amber-800 bg-amber-50' 
                                  : 'border-stone-300 text-stone-800'
                              }`}
                            />
                            {p.stock === 0 && (
                              <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
                                Sold Out
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(p)}
                            title={p.status === 'published' ? 'Click to unpublish (hide from store)' : 'Click to publish (show in store)'}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1.5 cursor-pointer transition-all border ${
                              p.status === 'published' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                                : 'bg-stone-100 text-stone-600 border-stone-300 hover:bg-stone-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'published' ? 'bg-emerald-500' : 'bg-stone-400'}`} />
                            <span>{p.status === 'published' ? 'Published' : 'Draft / Hidden'}</span>
                          </button>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setEditingProduct(p); setIsNewProductModalOpen(true); }}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer transition-colors"
                              title="Edit listing details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 cursor-pointer transition-colors"
                              title="Delete listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {products.filter(p => {
                if (productSearch && !(p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()) || p.brand.toLowerCase().includes(productSearch.toLowerCase()))) return false;
                if (productCategoryFilter && p.categoryId !== productCategoryFilter) return false;
                if (productTypeFilter && p.productType !== productTypeFilter) return false;
                if (productStatusFilter && p.status !== productStatusFilter) return false;
                return true;
              }).length === 0 && (
                <div className="py-12 text-center space-y-2">
                  <Package className="w-8 h-8 text-stone-300 mx-auto" />
                  <p className="text-xs font-bold text-stone-700">No products match your filter criteria</p>
                  <p className="text-[11px] text-stone-500">Try clearing your filters or click "+ List Card, Box, Deck, or Pack" to add items.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY ALERTS */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Real-time Inventory Guarantee Notice */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-stone-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Automated Stock Deduction & Anti-Oversell Protection
                </p>
                <p className="text-[11px] text-stone-600">
                  Every confirmed order instantly decrements inventory in real-time. Items at 0 units are automatically marked Sold Out, preventing customer checkout.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg font-mono font-bold text-amber-900 text-xs">
                  {products.reduce((acc, p) => acc + p.stock, 0)} Total Units in Vault
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Low Stock List */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock Items (Stock ≤ Threshold)
                  </h3>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 2)).length} Alert(s)
                  </span>
                </div>
                <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
                  {products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 2)).map(p => (
                    <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{p.name}</p>
                        <p className="text-[11px] text-stone-500">SKU: {p.sku} • Threshold: {p.lowStockThreshold ?? 2}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-800">{p.stock} units left</span>
                        <button
                          onClick={() => handleUpdateStock(p.id, p.stock + 5)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-[11px] rounded-lg font-semibold cursor-pointer"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  ))}
                  {products.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 2)).length === 0 && (
                    <p className="text-xs text-stone-500 py-6 text-center">All active collectibles are sufficiently stocked.</p>
                  )}
                </div>
              </div>

              {/* Sold Out List */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600" /> Sold Out Inventory (Stock = 0)
                  </h3>
                  <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    {products.filter(p => p.stock === 0).length} Item(s)
                  </span>
                </div>
                <div className="divide-y divide-stone-100 max-h-96 overflow-y-auto">
                  {products.filter(p => p.stock === 0).map(p => (
                    <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-stone-900">{p.name}</p>
                        <p className="text-[11px] text-stone-500">SKU: {p.sku}</p>
                      </div>
                      <button
                        onClick={() => handleUpdateStock(p.id, 1)}
                        className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                      >
                        Restock 1 Unit
                      </button>
                    </div>
                  ))}
                  {products.filter(p => p.stock === 0).length === 0 && (
                    <p className="text-xs text-stone-500 py-6 text-center">Zero items are sold out.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="bg-white border border-stone-300 text-stone-800 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              >
                <option value="">All Order Statuses</option>
                <option value="processing">Processing</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                className="bg-white border border-stone-300 text-stone-800 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-amber-500 shadow-xs cursor-pointer"
              >
                <option value="">All Payment Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>

            {/* Orders Table */}
            <div className="border border-stone-200 rounded-2xl bg-white overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase tracking-wider border-b border-stone-200 font-bold">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Items</th>
                    <th className="p-3.5">Total (₹)</th>
                    <th className="p-3.5">Payment</th>
                    <th className="p-3.5">Fulfillment Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders
                    .filter(o => !orderStatusFilter || o.orderStatus === orderStatusFilter)
                    .filter(o => !paymentStatusFilter || o.paymentStatus === paymentStatusFilter)
                    .map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-700">
                          {o.orderNumber}
                        </td>
                        <td className="p-3.5 text-stone-500">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-stone-900">{o.shippingAddress.fullName}</p>
                          <p className="text-[11px] text-stone-500">{o.shippingAddress.city}, {o.shippingAddress.state}</p>
                        </td>
                        <td className="p-3.5 text-stone-700">
                          {o.items.reduce((s, i) => s + i.quantity, 0)} items
                        </td>
                        <td className="p-3.5 font-mono font-bold text-stone-900">
                          ₹{o.total.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] uppercase">
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            o.orderStatus?.toLowerCase() === 'delivered' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : (o.orderStatus?.toLowerCase() === 'dispatched' || o.orderStatus?.toLowerCase() === 'shipped')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PAYMENTS & BANK ACCOUNT SETTLEMENT */}
        {activeTab === 'payments' && (
          <BankPaymentSettingsTab
            settings={settings}
            onSettingsUpdated={loadAllData}
            showToast={showToast}
          />
        )}

        {/* TAB 6: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Catalog Categories</h2>
              <button
                onClick={() => setNewCategoryModalOpen(true)}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-white border border-stone-200 space-y-2 shadow-xs">
                  <div className="flex justify-between items-start">
                    <h3 className="text-base font-bold text-stone-900">{c.name}</h3>
                    <span className="text-xs font-mono text-stone-500">/{c.slug}</span>
                  </div>
                  <p className="text-xs text-stone-600">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Promotional Discount Coupons</h2>
              <button
                onClick={() => setNewCouponModalOpen(true)}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Create Coupon
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coup) => (
                <div key={coup.id} className="p-5 rounded-2xl bg-white border border-stone-200 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-sm font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {coup.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${coup.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                      {coup.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-700 space-y-1">
                    <p>Discount: <strong className="text-stone-900">{coup.discountType === 'percentage' ? `${coup.discountValue}%` : `₹${coup.discountValue}`}</strong></p>
                    <p className="text-stone-500">Min Order: ₹{coup.minOrderValue}</p>
                    {coup.maxDiscount && <p className="text-stone-500">Max Cap: ₹{coup.maxDiscount}</p>}
                  </div>
                  <button
                    onClick={async () => {
                      await api.admin.toggleCoupon(coup.id);
                      showToast('Coupon status toggled.');
                      loadAllData();
                    }}
                    className="w-full py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs rounded-lg font-semibold border border-stone-200 cursor-pointer"
                  >
                    {coup.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Registered Collectors</h2>
            <div className="border border-stone-200 rounded-2xl bg-white overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-600 uppercase tracking-wider border-b border-stone-200 font-bold">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">Joined Date</th>
                    <th className="p-3.5">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{c.name}</td>
                      <td className="p-3.5 text-stone-700">{c.email}</td>
                      <td className="p-3.5 text-stone-500 font-mono">{c.mobile || '—'}</td>
                      <td className="p-3.5 text-stone-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.role === 'ADMIN' ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-stone-100 text-stone-600 border border-stone-200'}`}>
                          {c.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: STORE & RAZORPAY SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" /> Razorpay Indian Payment Gateway Configuration
              </h3>
              
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs text-stone-700">
                <div className="flex items-center justify-between">
                  <span>Merchant Gateway Status:</span>
                  <span className="font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active & Encrypted
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Merchant Key ID Configured:</span>
                  <span className="font-mono text-stone-700">rzp_live_••••••••</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Webhook Secret Signing:</span>
                  <span className="text-emerald-700 font-semibold">Enabled (Server-side HMAC-SHA256)</span>
                </div>
                <p className="text-[11px] text-stone-500 pt-2 border-t border-stone-200">
                  Per security regulations, private keys and webhook secrets are exclusively managed server-side via environment variables (<code className="text-amber-800 font-semibold">PAYMENT_KEY_ID</code>, <code className="text-amber-800 font-semibold">PAYMENT_KEY_SECRET</code>, <code className="text-amber-800 font-semibold">PAYMENT_WEBHOOK_SECRET</code>).
                </p>
              </div>
            </div>

            {/* Store Operational Info */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Store Operations & Logistics</h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                await api.admin.updateSettings(settings);
                showToast('Store settings updated.');
              }} className="space-y-4 text-xs">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Store Name</label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Standard Shipping Fee (₹)</label>
                    <input
                      type="number"
                      value={settings.standardShippingFee}
                      onChange={(e) => setSettings({ ...settings, standardShippingFee: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Free Shipping Threshold (₹)</label>
                    <input
                      type="number"
                      value={settings.freeShippingThreshold}
                      onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Support Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Support Phone</label>
                  <input
                    type="text"
                    value={settings.contactPhone}
                    onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value, supportPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Save Store Settings
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ORDER FULFILLMENT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-xl w-full space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl text-stone-900">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-sm font-bold text-stone-950 font-mono">{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-stone-500">Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Update Form */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 text-xs">
              <span className="font-bold text-stone-900 uppercase tracking-wider">Update Fulfillment Status</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Order Status</label>
                  <select
                    defaultValue={selectedOrder.orderStatus}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value, selectedOrder.trackingNumber, selectedOrder.courierName || selectedOrder.courierPartner)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 mb-1 font-semibold">Air Courier Partner</label>
                  <input
                    type="text"
                    defaultValue={selectedOrder.courierName || selectedOrder.courierPartner || 'Blue Dart Express'}
                    onBlur={(e) => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.orderStatus, selectedOrder.trackingNumber, e.target.value)}
                    className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 mb-1 font-semibold">Tracking Number / AWB</label>
                <input
                  type="text"
                  placeholder="e.g. BLUEDART98765432"
                  defaultValue={selectedOrder.trackingNumber || ''}
                  onBlur={(e) => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.orderStatus, e.target.value, selectedOrder.courierName || selectedOrder.courierPartner)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 text-stone-900 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-stone-900 uppercase tracking-wider">Ordered Collectibles</span>
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl p-3 bg-stone-50">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2 flex justify-between">
                    <div>
                      <p className="font-bold text-stone-900">{it.productName}</p>
                      <p className="text-[11px] text-stone-500">Condition: {it.condition} • Qty: {it.quantity}</p>
                    </div>
                    <span className="font-mono font-semibold text-stone-900">₹{((it.unitPrice || it.price || 0) * it.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer & Address */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <span className="font-bold text-stone-900">Shipping Recipient:</span>
              <p className="text-stone-700 font-medium">{selectedOrder.shippingAddress.fullName} • {selectedOrder.shippingAddress.mobile || selectedOrder.shippingAddress.phone}</p>
              <p className="text-stone-500">{selectedOrder.shippingAddress.addressLine || selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode || selectedOrder.shippingAddress.postalCode}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT PRODUCT MODAL */}
      {isNewProductModalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          onClose={() => { setIsNewProductModalOpen(false); setEditingProduct(null); }}
          onSaved={() => { setIsNewProductModalOpen(false); setEditingProduct(null); loadAllData(); showToast('Product listing saved successfully.'); }}
        />
      )}

      {/* MODAL 3: CREATE COUPON MODAL */}
      {newCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-stone-900">
            <h3 className="text-sm font-bold text-stone-950 uppercase">Create Promo Coupon</h3>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const f = e.target;
              await api.admin.createCoupon({
                code: f.code.value.toUpperCase().trim(),
                discountType: f.discountType.value,
                discountValue: Number(f.discountValue.value),
                minOrderValue: Number(f.minOrderValue.value || 0),
                maxDiscount: f.maxDiscount.value ? Number(f.maxDiscount.value) : undefined,
                isActive: true
              });
              setNewCouponModalOpen(false);
              loadAllData();
              showToast('Coupon created.');
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Coupon Code *</label>
                <input name="code" required placeholder="VAULT20" className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 uppercase font-mono focus:outline-none focus:border-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount Type</label>
                  <select name="discountType" className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Rupee (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Discount Value *</label>
                  <input name="discountValue" type="number" required placeholder="10" className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Min Order Value (₹)</label>
                  <input name="minOrderValue" type="number" placeholder="2000" className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Max Cap (₹)</label>
                  <input name="maxDiscount" type="number" placeholder="1000" className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setNewCouponModalOpen(false)} className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow-xs cursor-pointer">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREATE CATEGORY MODAL */}
      {newCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-stone-900">
            <h3 className="text-sm font-bold text-stone-950 uppercase">Add Category</h3>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const f = e.target;
              await api.admin.createCategory({
                name: f.name.value.trim(),
                slug: f.slug.value.trim().toLowerCase(),
                description: f.description.value.trim()
              });
              setNewCategoryModalOpen(false);
              loadAllData();
              showToast('Category created.');
            }} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Category Name *</label>
                <input name="name" required placeholder="Magic The Gathering" className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Slug *</label>
                <input name="slug" required placeholder="mtg-singles" className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-1">Description</label>
                <textarea name="description" rows={2} className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-amber-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setNewCategoryModalOpen(false)} className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl font-semibold cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow-xs cursor-pointer">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


