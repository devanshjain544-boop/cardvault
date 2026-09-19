import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, Coupon, StoreSettings } from '../types.js';
import { api } from '../lib/api.js';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  settings: StoreSettings | null;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  validateCartStock: () => Promise<{ valid: boolean; errors: string[] }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cardvault_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.salePrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const freeThreshold = settings?.freeShippingThreshold || 2999;
  const stdFee = settings?.standardShippingFee || 149;
  const shippingFee = items.length === 0 ? 0 : (subtotal >= freeThreshold ? 0 : stdFee);

  let discount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrderValue) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const total = Math.max(0, subtotal + shippingFee - discount);

  const addToCart = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    if (product.stock <= 0) {
      return { success: false, message: `"${product.name}" is currently sold out.` };
    }

    const existingIndex = items.findIndex(i => i.productId === product.id);
    if (existingIndex > -1) {
      const currentQty = items[existingIndex].quantity;
      const newQty = currentQty + quantity;
      if (newQty > product.stock) {
        return { 
          success: false, 
          message: `Cannot add more units. You already have ${currentQty} in cart, and only ${product.stock} are available.` 
        };
      }
      const updated = [...items];
      updated[existingIndex].quantity = newQty;
      // Refresh product data
      updated[existingIndex].product = product;
      setItems(updated);
      return { success: true };
    } else {
      if (quantity > product.stock) {
        return { 
          success: false, 
          message: `Only ${product.stock} units are currently in stock.` 
        };
      }
      setItems([...items, { productId: product.id, quantity, product }]);
      return { success: true };
    }
  };

  const removeFromCart = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    const item = items.find(i => i.productId === productId);
    if (!item) return { success: false, message: 'Item not in cart' };

    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    if (quantity > item.product.stock) {
      return { 
        success: false, 
        message: `Maximum stock available for "${item.product.name}" is ${item.product.stock}.` 
      };
    }

    setItems(items.map(i => i.productId === productId ? { ...i, quantity } : i));
    return { success: true };
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    setCouponError(null);
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.valid && res.coupon) {
        setAppliedCoupon(res.coupon);
        return { success: true, message: res.message };
      } else {
        setCouponError(res.message);
        return { success: false, message: res.message };
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to apply coupon';
      setCouponError(msg);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const validateCartStock = async (): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    const updatedItems: CartItem[] = [];

    for (const item of items) {
      try {
        const freshProduct = await api.getProduct(item.productId);
        if (freshProduct.stock === 0) {
          errors.push(`"${freshProduct.name}" is now sold out.`);
        } else if (item.quantity > freshProduct.stock) {
          errors.push(`"${freshProduct.name}" quantity adjusted to remaining stock (${freshProduct.stock}).`);
          updatedItems.push({ ...item, quantity: freshProduct.stock, product: freshProduct });
        } else {
          updatedItems.push({ ...item, product: freshProduct });
        }
      } catch {
        errors.push(`"${item.product.name}" is no longer available.`);
      }
    }

    if (errors.length > 0) {
      setItems(updatedItems);
      return { valid: false, errors };
    }

    return { valid: true, errors: [] };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingFee,
        discount,
        total,
        appliedCoupon,
        couponError,
        settings,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        validateCartStock
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
