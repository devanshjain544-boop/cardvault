export type Role = 'CUSTOMER' | 'ADMIN';

export type ProductType = 
  | 'Single Card'
  | 'Card Deck'
  | 'Booster Pack'
  | 'Booster Box'
  | 'Collection Box'
  | 'Sealed Box'
  | 'Card Bundle'
  | 'Other Collectible';

export type ProductCondition =
  | 'Gem Mint (PSA/BGS 10)'
  | 'Mint / Candidate'
  | 'Near Mint (NM)'
  | 'Lightly Played (LP)'
  | 'Moderately Played (MP)'
  | 'Factory Sealed';

export type ProductStatus = 'published' | 'draft' | 'archived';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: Role;
  savedAddresses?: Address[];
  createdAt: string;
}

export interface Address {
  id?: string;
  fullName: string;
  mobile: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
  // Aliases for convenience
  street?: string;
  phone?: string;
  postalCode?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  productType: ProductType | string;
  categoryId: string;
  categoryName?: string;
  brand: string;
  series: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  lowStockThreshold?: number;
  condition: ProductCondition | string;
  rarity?: string;
  gradingStatus?: string;
  finish?: string;
  description: string;
  specifications: Record<string, string>;
  authenticityInfo?: string;
  shippingInfo?: string;
  images: string[];
  isFeatured: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  productTypes?: string[];
  brands?: string[];
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export type OrderStatus =
  | 'Pending Payment'
  | 'Payment Processing'
  | 'Paid'
  | 'Order Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Refund Initiated'
  | 'Refunded';

export type PaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refund Pending'
  | 'Refunded';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  condition: string;
  unitPrice: number;
  price?: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentId?: string;
  paymentDetails?: {
    paymentId?: string;
    orderId?: string;
    signature?: string;
    method?: string;
    paidAt?: string;
    bank?: string;
    rrn?: string;
    bankUtr?: string;
    settlementAccount?: string;
    verificationSource?: string;
  };
  orderStatus: OrderStatus;
  courierName?: string;
  courierPartner?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  expiryDate?: string;
}

export interface BankSettlementDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  accountType: 'Current' | 'Savings';
  upiId: string;
  settlementSchedule?: string;
  isVerified?: boolean;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail?: string;
  supportPhone?: string;
  businessAddress: string;
  currency: string;
  currencySymbol: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRatePercent: number;
  lowStockThreshold: number;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    discord?: string;
  };
  policies: {
    privacyPolicy: string;
    termsAndConditions: string;
    refundPolicy: string;
    shippingPolicy: string;
  };
  paymentGateway: {
    provider: 'razorpay' | 'cashfree' | 'phonepe';
    keyId?: string;
    keySecret?: string;
    keyIdConfigured: boolean;
    hasKeySecret?: boolean;
    webhookConfigured: boolean;
    isLiveMode: boolean;
  };
  bankSettlement?: BankSettlementDetails;
}

export interface DashboardStats {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  lowStockCount?: number;
  outOfStockProducts: number;
  outOfStockCount?: number;
  totalProducts: number;
  recentOrders: Order[];
  salesByDay: { date: string; sales: number; orders: number }[];
}
