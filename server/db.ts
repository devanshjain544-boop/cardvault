import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { 
  User, Product, Category, Order, Coupon, StoreSettings, DashboardStats, Address, OrderStatus, PaymentStatus 
} from '../src/types.js';
import { DEFAULT_PRODUCTS } from './defaultProducts.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'cardvault.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  categories: Category[];
  productTypes: string[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-pokemon',
    name: 'Pokémon TCG',
    slug: 'pokemon-tcg',
    description: 'Rare Pokémon singles, booster boxes, elite trainer boxes, and PSA graded cards.',
    productTypes: ['Single Card', 'Booster Box', 'Booster Pack', 'Collection Box', 'Card Deck'],
    brands: ['Pokémon', 'Nintendo']
  },
  {
    id: 'cat-sports',
    name: 'Sports Cards',
    slug: 'sports-cards',
    description: 'Premier sports collectibles including Cricket, Football, Basketball, and F1 cards.',
    productTypes: ['Single Card', 'Booster Box', 'Collection Box', 'Card Bundle'],
    brands: ['Topps', 'Panini', 'Upper Deck']
  },
  {
    id: 'cat-anime',
    name: 'Anime & Manga TCG',
    slug: 'anime-manga-tcg',
    description: 'One Piece Card Game, Dragon Ball Super, Weiss Schwarz, and collectible Japanese cards.',
    productTypes: ['Single Card', 'Booster Box', 'Booster Pack', 'Card Deck'],
    brands: ['Bandai', 'Bushiroad']
  },
  {
    id: 'cat-sealed',
    name: 'Sealed Boxes & Cases',
    slug: 'sealed-boxes',
    description: 'Factory sealed booster boxes, collector cases, and premium tins.',
    productTypes: ['Booster Box', 'Sealed Box', 'Collection Box'],
    brands: ['Pokémon', 'Bandai', 'Topps', 'Konami']
  },
  {
    id: 'cat-decks',
    name: 'Starter & Battle Decks',
    slug: 'starter-battle-decks',
    description: 'Ready-to-play competitive and starter decks for collectors and players.',
    productTypes: ['Card Deck', 'Card Bundle'],
    brands: ['Pokémon', 'Bandai', 'Konami']
  }
];

const DEFAULT_PRODUCT_TYPES = [
  'Single Card',
  'Card Deck',
  'Booster Pack',
  'Booster Box',
  'Collection Box',
  'Sealed Box',
  'Card Bundle',
  'Other Collectible'
];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'CardVault',
  logo: '/logo.svg',
  tagline: 'Collect. Discover. Own.',
  contactEmail: 'support@cardvault.in',
  contactPhone: '+91 98765 43210',
  businessAddress: 'CardVault Collectibles Private Limited, 402 Crystal Tower, Bandra West, Mumbai, Maharashtra 400050, India',
  currency: 'INR',
  currencySymbol: '₹',
  freeShippingThreshold: 2999,
  standardShippingFee: 149,
  taxRatePercent: 18,
  lowStockThreshold: 3,
  socialLinks: {
    instagram: 'https://instagram.com/cardvault_india',
    twitter: 'https://x.com/cardvault_in',
    youtube: 'https://youtube.com/@cardvault',
    discord: 'https://discord.gg/cardvault'
  },
  policies: {
    privacyPolicy: `At CardVault, accessible from cardvault.in, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by CardVault and how we use it.\n\nInformation We Collect: When you register for an Account or place an order, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.\n\nHow We Use Your Information: We use the information we collect to communicate with you regarding your orders, provide customer support, detect fraud, and fulfill genuine collectible shipments.\n\nPayment Security: All card and UPI payments are processed securely through certified Indian payment gateways (PCI-DSS Level 1 compliant). We do not store your complete card or bank numbers on our servers.`,
    termsAndConditions: `Welcome to CardVault. By accessing or using our marketplace, you agree to be bound by these terms.\n\n1. Authenticity Guarantee: Every collectible sold on CardVault is guaranteed 100% genuine. Factory sealed products are inspected for tampering prior to dispatch.\n\n2. Pricing & Orders: All prices are listed in Indian Rupees (INR) inclusive of applicable GST unless stated otherwise. We reserve the right to cancel orders arising from erroneous pricing or inventory errors.\n\n3. Shipping: Orders are carefully packaged in protective sleeves, top loaders, and reinforced rigid boxes to ensure transit safety.\n\n4. Limitation of Liability: CardVault is not liable for indirect or consequential damages resulting from courier transit delays once a valid tracking ID has been issued.`,
    refundPolicy: `At CardVault, we take collectible integrity with utmost seriousness.\n\n1. Sealed Products: Unopened, factory sealed boxes and booster packs can be returned within 48 hours of delivery ONLY if the outer tamper seal remains completely unbroken and an unboxing video is provided.\n\n2. Single Cards: Due to market price volatility and collectible grading nuances, single cards are eligible for return only if the card delivered does not match the SKU, condition, or authenticity specified on the invoice.\n\n3. Refund Process: Once the returned item is inspected at our vault facility, approved refunds are initiated within 48 business hours back to the original payment source.`,
    shippingPolicy: `All orders are dispatched from our Mumbai vault facility.\n\n1. Packaging: Single cards are sleeved, top-loaded, and placed in waterproof bubble mailers. Sealed boxes are double-bubble wrapped and packaged inside reinforced corrugated cartons.\n\n2. Timelines: Metro cities: 2-3 business days. Rest of India: 4-6 business days. Express shipping is available.\n\n3. Tracking: Full real-time tracking from Blue Dart / Delhivery / DTDC is provided via email and SMS once dispatched.`
  },
  paymentGateway: {
    provider: 'razorpay',
    keyIdConfigured: Boolean(process.env.PAYMENT_KEY_ID),
    webhookConfigured: Boolean(process.env.PAYMENT_WEBHOOK_SECRET),
    isLiveMode: Boolean(process.env.PAYMENT_KEY_ID?.startsWith('rzp_live_'))
  },
  bankSettlement: {
    accountHolderName: 'CardVault Collectibles Private Limited',
    accountNumber: '50200084920193',
    bankName: 'HDFC Bank Ltd',
    ifscCode: 'HDFC0000060',
    accountType: 'Current',
    upiId: 'cardvault@hdfcbank',
    settlementSchedule: 'T+1 Business Day Automated Settlement',
    isVerified: true
  }
};

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'cpn-vault10',
    code: 'VAULT10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 1999,
    maxDiscount: 500,
    isActive: true
  },
  {
    id: 'cpn-collector',
    code: 'COLLECTOR200',
    discountType: 'flat',
    discountValue: 200,
    minOrderValue: 2499,
    isActive: true
  }
];

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const userSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, userSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: userSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(check), Buffer.from(hash));
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.ensureInitialAdmin();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const products = (parsed.products && parsed.products.length > 0) ? parsed.products : DEFAULT_PRODUCTS;
        const loaded: DatabaseSchema = {
          users: parsed.users || [],
          categories: parsed.categories || DEFAULT_CATEGORIES,
          productTypes: parsed.productTypes || DEFAULT_PRODUCT_TYPES,
          products,
          orders: parsed.orders || [],
          coupons: parsed.coupons || DEFAULT_COUPONS,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
        };
        // Ensure products are written back if they were newly seeded
        if (!parsed.products || parsed.products.length === 0) {
          this.save(loaded);
        }
        return loaded;
      } catch (err) {
        console.error('Failed to parse database file, initializing clean database:', err);
      }
    }

    const initial: DatabaseSchema = {
      users: [],
      categories: DEFAULT_CATEGORIES,
      productTypes: DEFAULT_PRODUCT_TYPES,
      products: DEFAULT_PRODUCTS,
      orders: [],
      coupons: DEFAULT_COUPONS,
      settings: DEFAULT_SETTINGS
    };
    this.save(initial);
    return initial;
  }

  private save(dataToSave?: DatabaseSchema) {
    const data = dataToSave || this.data;
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  private ensureInitialAdmin() {
    const adminEmail = 'admin@cardvault.in';
    const exists = this.data.users.find(u => u.email.toLowerCase() === adminEmail);
    if (!exists) {
      const { hash, salt } = hashPassword('AdminVault@2026');
      const adminUser: StoredUser = {
        id: 'usr-admin-01',
        name: 'CardVault Master Admin',
        email: adminEmail,
        role: 'ADMIN',
        mobile: '+91 98765 00000',
        createdAt: new Date().toISOString(),
        passwordHash: hash,
        salt
      };
      this.data.users.push(adminUser);
      this.save();
      console.log('✅ Initial secure admin account initialized: admin@cardvault.in');
    }
  }

  // --- Users & Auth ---
  findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  findUserById(id: string): StoredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(params: { name: string; email: string; password: string; mobile?: string; role?: 'CUSTOMER' | 'ADMIN' }): User {
    const existing = this.findUserByEmail(params.email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }
    const { hash, salt } = hashPassword(params.password);
    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      name: params.name.trim(),
      email: params.email.toLowerCase().trim(),
      mobile: params.mobile?.trim() || '',
      role: params.role || 'CUSTOMER',
      savedAddresses: [],
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt
    };
    this.data.users.push(newUser);
    this.save();
    const { passwordHash, salt: _, ...safeUser } = newUser;
    return safeUser;
  }

  validateUserCredentials(email: string, password: string): User | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) return null;
    const { passwordHash, salt: _, ...safeUser } = user;
    return safeUser;
  }

  updateUserProfile(userId: string, data: Partial<User>): User {
    const userIndex = this.data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    const user = this.data.users[userIndex];
    if (data.name) user.name = data.name.trim();
    if (data.mobile !== undefined) user.mobile = data.mobile;
    if (data.savedAddresses) user.savedAddresses = data.savedAddresses;
    this.save();
    const { passwordHash, salt, ...safeUser } = user;
    return safeUser;
  }

  saveUserAddress(userId: string, address: Address): Address[] {
    const user = this.findUserById(userId);
    if (!user) throw new Error('User not found');
    if (!user.savedAddresses) user.savedAddresses = [];
    if (!address.id) address.id = `addr-${crypto.randomUUID().slice(0, 8)}`;
    const existingIndex = user.savedAddresses.findIndex(a => a.id === address.id);
    if (existingIndex >= 0) {
      user.savedAddresses[existingIndex] = address;
    } else {
      user.savedAddresses.push(address);
    }
    this.save();
    return user.savedAddresses;
  }

  getAllCustomers(): User[] {
    return this.data.users
      .filter(u => u.role === 'CUSTOMER')
      .map(({ passwordHash, salt, ...safe }) => safe);
  }

  // --- Products ---
  getProducts(filters?: {
    categoryId?: string;
    productType?: string;
    status?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    brand?: string;
    isFeatured?: boolean;
    sort?: string;
  }): Product[] {
    let list = [...this.data.products];

    if (filters) {
      if (filters.status) {
        list = list.filter(p => p.status === filters.status);
      }
      if (filters.categoryId) {
        list = list.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.productType) {
        list = list.filter(p => p.productType.toLowerCase() === filters.productType!.toLowerCase());
      }
      if (filters.brand) {
        list = list.filter(p => p.brand.toLowerCase() === filters.brand!.toLowerCase());
      }
      if (filters.isFeatured !== undefined) {
        list = list.filter(p => p.isFeatured === filters.isFeatured);
      }
      if (filters.inStockOnly) {
        list = list.filter(p => p.stock > 0);
      }
      if (filters.minPrice !== undefined) {
        list = list.filter(p => (p.salePrice || p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        list = list.filter(p => (p.salePrice || p.price) <= filters.maxPrice!);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        list = list.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          (p.categoryName ? p.categoryName.toLowerCase().includes(q) : false) ||
          p.productType.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }

      // Sorting
      if (filters.sort === 'price-low-to-high') {
        list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      } else if (filters.sort === 'price-high-to-low') {
        list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      } else if (filters.sort === 'popular') {
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      } else if (filters.sort === 'newest') {
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return list;
  }

  getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find(p => p.slug === slug);
  }

  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product: Product = {
      ...data,
      id: `prd-${crypto.randomUUID().slice(0, 8)}`,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.products.push(product);
    this.save();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    const existing = this.data.products[idx];
    const updated: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.data.products[idx] = updated;
    this.save();
    return updated;
  }

  deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Categories & Types ---
  getCategories(): Category[] {
    return this.data.categories;
  }

  getProductTypes(): string[] {
    return this.data.productTypes;
  }

  createCategory(categoryData: { name: string; description?: string; slug?: string; image?: string; productTypes?: string[]; brands?: string[] }): Category {
    const slug = categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat: Category = {
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
      name: categoryData.name,
      slug,
      description: categoryData.description || '',
      image: categoryData.image,
      productTypes: categoryData.productTypes || [],
      brands: categoryData.brands || []
    };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  updateCategory(id: string, updates: Partial<Category>): Category {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Category not found');
    const updated = { ...this.data.categories[idx], ...updates };
    this.data.categories[idx] = updated;
    this.save();
    return updated;
  }

  deleteCategory(id: string): { success: boolean; message?: string } {
    // Check if products still use this category
    const count = this.data.products.filter(p => p.categoryId === id).length;
    if (count > 0) {
      return { 
        success: false, 
        message: `Cannot delete category: ${count} product(s) currently belong to this category. Please reassign or delete those products first.` 
      };
    }
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx === -1) return { success: false, message: 'Category not found' };
    this.data.categories.splice(idx, 1);
    this.save();
    return { success: true };
  }

  addProductType(typeName: string): string[] {
    const trimmed = typeName.trim();
    if (!this.data.productTypes.includes(trimmed)) {
      this.data.productTypes.push(trimmed);
      this.save();
    }
    return this.data.productTypes;
  }

  // --- Orders, Inventory & Transactions ---
  getOrders(filters?: { userId?: string; orderStatus?: string; paymentStatus?: string }): Order[] {
    let list = [...this.data.orders];
    if (filters?.userId) {
      list = list.filter(o => o.userId === filters.userId);
    }
    if (filters?.orderStatus) {
      list = list.filter(o => o.orderStatus === filters.orderStatus);
    }
    if (filters?.paymentStatus) {
      list = list.filter(o => o.paymentStatus === filters.paymentStatus);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  // Server-side atomic validation and inventory deduction
  deductInventoryForOrder(items: { productId: string; quantity: number }[]) {
    // Step 1: Pre-validate stock for every item
    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} does not exist.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient inventory for "${product.name}". Only ${product.stock} available.`);
      }
    }

    // Step 2: Deduct stock atomically
    for (const item of items) {
      const product = this.getProductById(item.productId)!;
      product.stock -= item.quantity;
      if (product.stock <= 0) {
        product.stock = 0;
      }
      product.updatedAt = new Date().toISOString();
    }
    this.save();
  }

  restockInventoryForOrder(items: { productId: string; quantity: number }[]) {
    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (product) {
        product.stock += item.quantity;
        product.updatedAt = new Date().toISOString();
      }
    }
    this.save();
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orderNumber = `CV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${crypto.randomUUID().slice(0, 8)}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  updateOrderStatus(orderId: string, updates: { 
    orderStatus?: OrderStatus; 
    paymentStatus?: PaymentStatus;
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    cancellationReason?: string;
  }): Order {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const previousStatus = order.orderStatus;

    if (updates.orderStatus) order.orderStatus = updates.orderStatus;
    if (updates.paymentStatus) order.paymentStatus = updates.paymentStatus;
    if (updates.courierName !== undefined) order.courierName = updates.courierName;
    if (updates.trackingNumber !== undefined) order.trackingNumber = updates.trackingNumber;
    if (updates.trackingUrl !== undefined) order.trackingUrl = updates.trackingUrl;
    if (updates.cancellationReason !== undefined) order.cancellationReason = updates.cancellationReason;

    // Handle inventory restocking on cancellation
    if (updates.orderStatus === 'Cancelled' && previousStatus !== 'Cancelled') {
      this.restockInventoryForOrder(order.items);
    }

    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  // --- Coupons ---
  getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);
    if (!coupon) {
      return { valid: false, discount: 0, message: 'Invalid or inactive coupon code.' };
    }
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      return { 
        valid: false, 
        discount: 0, 
        message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')} required for this coupon.` 
      };
    }
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }
    return { valid: true, discount, message: `Coupon applied successfully: ₹${discount} off`, coupon };
  }

  createCoupon(data: Omit<Coupon, 'id'>): Coupon {
    const newCoupon: Coupon = {
      ...data,
      id: `cpn-${crypto.randomUUID().slice(0, 8)}`,
      code: data.code.toUpperCase().trim()
    };
    this.data.coupons.push(newCoupon);
    this.save();
    return newCoupon;
  }

  toggleCoupon(id: string): Coupon {
    const cpn = this.data.coupons.find(c => c.id === id);
    if (!cpn) throw new Error('Coupon not found');
    cpn.isActive = !cpn.isActive;
    this.save();
    return cpn;
  }

  deleteCoupon(id: string): boolean {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.data.coupons.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Store Settings ---
  getSettings(): StoreSettings {
    const savedGateway = this.data.settings?.paymentGateway || { provider: 'razorpay' as const, keyIdConfigured: false, webhookConfigured: false, isLiveMode: false };
    const keyId = savedGateway.keyId || process.env.PAYMENT_KEY_ID || '';
    const keySecret = savedGateway.keySecret || process.env.PAYMENT_KEY_SECRET || '';

    return {
      ...this.data.settings,
      paymentGateway: {
        provider: (savedGateway.provider as any) || 'razorpay',
        keyId: keyId,
        keyIdConfigured: Boolean(keyId),
        hasKeySecret: Boolean(keySecret),
        webhookConfigured: Boolean(process.env.PAYMENT_WEBHOOK_SECRET || savedGateway.webhookConfigured),
        isLiveMode: Boolean(keyId.startsWith('rzp_live_') || savedGateway.isLiveMode)
      },
      bankSettlement: this.data.settings.bankSettlement || {
        accountHolderName: 'CardVault Collectibles Private Limited',
        accountNumber: '50200084920193',
        bankName: 'HDFC Bank Ltd',
        ifscCode: 'HDFC0000060',
        accountType: 'Current',
        upiId: 'cardvault@hdfcbank',
        settlementSchedule: 'T+1 Business Day Automated Settlement',
        isVerified: true
      }
    };
  }

  updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    const currentGateway = this.data.settings.paymentGateway || { provider: 'razorpay' as const, keyIdConfigured: false, webhookConfigured: false, isLiveMode: false };
    const updatedGateway = updates.paymentGateway 
      ? { ...currentGateway, ...updates.paymentGateway }
      : currentGateway;

    // If keyId or keySecret was provided, reflect into process.env so payment verify uses it
    if (updatedGateway.keyId) {
      process.env.PAYMENT_KEY_ID = updatedGateway.keyId;
    }
    if (updatedGateway.keySecret) {
      process.env.PAYMENT_KEY_SECRET = updatedGateway.keySecret;
    }

    this.data.settings = {
      ...this.data.settings,
      ...updates,
      paymentGateway: updatedGateway,
      bankSettlement: updates.bankSettlement 
        ? { ...(this.data.settings.bankSettlement || {}), ...updates.bankSettlement, isVerified: true }
        : this.data.settings.bankSettlement
    };
    this.save();
    return this.getSettings();
  }

  // --- Real Live Dashboard Metrics ---
  getDashboardStats(): DashboardStats {
    const orders = this.data.orders;
    const products = this.data.products;
    const lowStockThreshold = this.data.settings.lowStockThreshold || 3;

    const paidOrders = orders.filter(o => o.paymentStatus === 'Paid');
    const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);

    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySales = paidOrders
      .filter(o => o.createdAt.startsWith(todayStr))
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending Payment' || o.paymentStatus === 'Pending').length;
    const processingOrders = orders.filter(o => o.orderStatus === 'Processing' || o.orderStatus === 'Order Confirmed' || o.orderStatus === 'Packed').length;
    const shippedOrders = orders.filter(o => o.orderStatus === 'Shipped' || o.orderStatus === 'Out for Delivery').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;

    // Group last 7 days sales
    const salesByDayMap = new Map<string, { sales: number; orders: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      salesByDayMap.set(key, { sales: 0, orders: 0 });
    }

    paidOrders.forEach(o => {
      const day = o.createdAt.slice(0, 10);
      if (salesByDayMap.has(day)) {
        const entry = salesByDayMap.get(day)!;
        entry.sales += o.total;
        entry.orders += 1;
      }
    });

    const salesByDay = Array.from(salesByDayMap.entries()).map(([date, val]) => ({
      date,
      sales: val.sales,
      orders: val.orders
    }));

    return {
      totalSales,
      todaySales,
      totalOrders: orders.length,
      pendingOrders,
      paidOrders: paidOrders.length,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      totalProducts: products.length,
      recentOrders: orders.slice(0, 8),
      salesByDay
    };
  }

  // Helper for admin seeding authentic collectible cards if requested
  seedAuthenticCards() {
    if (this.data.products.length > 0) return;

    const initialProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Pokémon TCG: Charizard ex Special Illustration Rare (151)',
        slug: 'charizard-ex-151-sir',
        productType: 'Single Card',
        categoryId: 'cat-pokemon',
        categoryName: 'Pokémon TCG',
        brand: 'Pokémon',
        series: 'Scarlet & Violet: 151',
        sku: 'PKMN-151-199',
        price: 18999,
        salePrice: 16999,
        stock: 3,
        condition: 'Gem Mint (PSA/BGS 10)',
        description: 'The definitive centerpiece of the Scarlet & Violet 151 expansion. Features full-bleed textured foil artwork depicting Charizard bursting through volcanic embers. Preserved in magnetic ultra-pro one-touch case.',
        specifications: {
          'Card Number': '199/165',
          'Rarity': 'Special Illustration Rare (SIR)',
          'Finish': 'Full Art Textured Holofoil',
          'Language': 'English',
          'Release Year': '2023',
          'Centering Grade': '9.5+ Subgrade Estimate'
        },
        authenticityInfo: '100% Genuine Guaranteed. Certified with CardVault tamper-evident serial holographic sticker and UV anti-counterfeit inspection.',
        shippingInfo: 'Encased in a crystal magnetic case, sealed in team-bag, double bubble-wrapped, and dispatched in rigid armored packaging within 24 hours.',
        images: [
          'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80'
        ],
        isFeatured: true,
        status: 'published'
      },
      {
        name: 'Pokémon TCG: Scarlet & Violet 151 Booster Box (Sealed)',
        slug: 'pokemon-151-booster-box-sealed',
        productType: 'Booster Box',
        categoryId: 'cat-sealed',
        categoryName: 'Sealed Boxes & Cases',
        brand: 'Pokémon',
        series: 'Scarlet & Violet: 151',
        sku: 'PKMN-151-BBX',
        price: 14499,
        stock: 5,
        condition: 'Factory Sealed',
        description: 'Authentic factory sealed Japanese Pokémon 151 booster box featuring the iconic Pokéball shrink wrap. Contains 20 packs with 7 cards per pack including guaranteed Secret Rare pulls.',
        specifications: {
          'Box Type': 'Factory Sealed Booster Box',
          'Packs Count': '20 Packs',
          'Cards Per Pack': '7 Cards',
          'Language': 'Japanese',
          'Shrink Wrap': 'Original Pokéball Hologram Wrap',
          'Release Year': '2023'
        },
        authenticityInfo: 'Directly imported from authorized distributor. Strict zero-weighing and non-tampered guarantee.',
        shippingInfo: 'Packaged in a dedicated acrylic booster box protector with reinforced corner shock absorption.',
        images: [
          'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=800&q=80'
        ],
        isFeatured: true,
        status: 'published'
      },
      {
        name: 'One Piece Card Game: Romance Dawn OP-01 Booster Box',
        slug: 'one-piece-romance-dawn-op01-booster-box',
        productType: 'Booster Box',
        categoryId: 'cat-anime',
        categoryName: 'Anime & Manga TCG',
        brand: 'Bandai',
        series: 'Romance Dawn (OP-01)',
        sku: 'OP-01-BB-EN',
        price: 24999,
        salePrice: 22499,
        stock: 2,
        condition: 'Factory Sealed',
        description: 'The historic first set of the Bandai One Piece Card Game. Features Monkey D. Luffy Manga Rare, Shanks Super Parallel, and original Oda art cards.',
        specifications: {
          'Packs': '24 Booster Packs',
          'Cards Per Pack': '12 Cards',
          'Language': 'English',
          'Manufacturer': 'Bandai Namco Entertainment'
        },
        authenticityInfo: '100% verified authentic Bandai factory seal.',
        shippingInfo: 'Ships double-boxed with fragile-insured air courier express.',
        images: [
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
        ],
        isFeatured: true,
        status: 'published'
      },
      {
        name: 'Topps Chrome Cricket India Legends Virat Kohli Refractor',
        slug: 'topps-chrome-cricket-virat-kohli-refractor',
        productType: 'Single Card',
        categoryId: 'cat-sports',
        categoryName: 'Sports Cards',
        brand: 'Topps',
        series: 'Topps Chrome Cricket 2024',
        sku: 'TOPPS-CRIC-VK18',
        price: 8499,
        stock: 4,
        condition: 'Near Mint (NM)',
        description: 'Limited edition Chromium refractor card featuring Indian batting maestro Virat Kohli in blue jersey match-action. High refractive rainbow sheen and crisp edges.',
        specifications: {
          'Card Number': 'VK-18',
          'Sub-type': 'Rainbow Refractor',
          'Sport': 'Cricket',
          'Year': '2024',
          'Card Stock': '35pt Chromium'
        },
        authenticityInfo: 'Licensed Topps merchandise with micro-engraved serial hologram.',
        shippingInfo: 'Shipped in premium semi-rigid grading sleeve with water-resistant sealing.',
        images: [
          'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'
        ],
        isFeatured: false,
        status: 'published'
      },
      {
        name: 'Pokémon TCG: Pikachu VMAX Rainbow Rare (Vivid Voltage)',
        slug: 'pikachu-vmax-rainbow-rare-vivid-voltage',
        productType: 'Single Card',
        categoryId: 'cat-pokemon',
        categoryName: 'Pokémon TCG',
        brand: 'Pokémon',
        series: 'Sword & Shield: Vivid Voltage',
        sku: 'PKMN-SWSH-188',
        price: 19500,
        stock: 1,
        condition: 'Gem Mint (PSA/BGS 10)',
        description: 'The famed "Chonkachu" Secret Rainbow Rare. Flawless surface gloss, sharp corners, and deep rainbow holographic etching throughout the colossal Pikachu figure.',
        specifications: {
          'Card Number': '188/185',
          'Rarity': 'Secret Rainbow Rare',
          'Finish': 'Rainbow Texture Holofoil',
          'Language': 'English'
        },
        authenticityInfo: 'Certified authentic with CardVault spectral card examination verification.',
        shippingInfo: 'Magnetic one-touch display case, foam-lined security container.',
        images: [
          'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?auto=format&fit=crop&w=800&q=80'
        ],
        isFeatured: true,
        status: 'published'
      }
    ];

    for (const p of initialProducts) {
      this.createProduct(p);
    }
  }
}

export const db = new Database();
