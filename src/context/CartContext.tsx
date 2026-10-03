import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, DeliveryZone, Coupon } from '../types';
import { validateCoupon } from '../lib/store';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (
    product: Product,
    selectedSize?: string,
    selectedColor?: string,
    quantity?: number
  ) => { success: boolean; message: string };
  updateQuantity: (
    productId: string,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string
  ) => void;
  removeFromCart: (
    productId: string,
    selectedSize?: string,
    selectedColor?: string
  ) => void;
  clearCart: () => void;

  // Coupon state
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  couponError: string | null;
  applyCouponCode: (code: string, customerIdOrEmail?: string) => Promise<boolean>;
  removeCoupon: () => void;

  // Delivery zone selection
  selectedDeliveryZone: DeliveryZone | null;
  setSelectedDeliveryZone: (zone: DeliveryZone | null) => void;
  deliveryCharge: number;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Compare
  compareList: Product[];
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('rmart_cart_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('rmart_wishlist_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('rmart_compare_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedDeliveryZone, setSelectedDeliveryZone] = useState<DeliveryZone | null>(null);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('rmart_cart_v1', JSON.stringify(cart));
  }, [cart]);

  // Sync wishlist to local storage
  useEffect(() => {
    localStorage.setItem('rmart_wishlist_v1', JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync compare to local storage
  useEffect(() => {
    localStorage.setItem('rmart_compare_v1', JSON.stringify(compareList));
  }, [compareList]);

  // Calculate cart subtotal
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate cart count
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Re-evaluate coupon if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon.minOrderAmount && cartSubtotal < appliedCoupon.minOrderAmount) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(`Coupon removed: minimum order of ৳${appliedCoupon.minOrderAmount} required.`);
      } else {
        let disc = 0;
        if (appliedCoupon.discountType === 'percentage') {
          disc = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
          if (appliedCoupon.maxDiscountAmount && disc > appliedCoupon.maxDiscountAmount) {
            disc = appliedCoupon.maxDiscountAmount;
          }
        } else {
          disc = appliedCoupon.discountValue;
        }
        setCouponDiscount(Math.min(disc, cartSubtotal));
      }
    }
  }, [cartSubtotal, appliedCoupon]);

  // Calculate delivery charge
  const deliveryCharge = React.useMemo(() => {
    if (!selectedDeliveryZone) return 0;
    if (
      selectedDeliveryZone.minOrderForFreeDelivery &&
      cartSubtotal >= selectedDeliveryZone.minOrderForFreeDelivery
    ) {
      return 0; // Free delivery threshold met
    }
    return selectedDeliveryZone.charge;
  }, [selectedDeliveryZone, cartSubtotal]);

  const addToCart = (
    product: Product,
    selectedSize?: string,
    selectedColor?: string,
    quantity = 1
  ): { success: boolean; message: string } => {
    if (!product.isActive) {
      return { success: false, message: 'This product is currently unavailable.' };
    }

    // Determine available stock for the variant or product
    let availableStock = product.totalStock;
    let variantId: string | undefined = undefined;

    if (product.variants && product.variants.length > 0) {
      const match = product.variants.find((v) => {
        const sMatch = !selectedSize || v.size === selectedSize;
        const cMatch = !selectedColor || v.color === selectedColor;
        return sMatch && cMatch;
      });

      if (match) {
        availableStock = match.stock;
        variantId = match.id;
      } else if (selectedSize || selectedColor) {
        return { success: false, message: 'Selected combination is out of stock.' };
      }
    }

    if (availableStock <= 0) {
      return { success: false, message: 'Sorry, this item is currently out of stock.' };
    }

    // Find existing item in cart
    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === product.id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    );

    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const requestedTotalQty = currentQtyInCart + quantity;

    if (requestedTotalQty > availableStock) {
      return {
        success: false,
        message: `Only ${availableStock} units available in stock. You already have ${currentQtyInCart} in cart.`,
      };
    }

    const price = product.salePrice ?? product.price;

    setCart((prev) => {
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity = requestedTotalQty;
        return updated;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.thumbnail || product.images?.[0] || '/logo.png',
          price,
          originalPrice: product.salePrice ? product.price : undefined,
          quantity,
          selectedSize,
          selectedColor,
          variantId,
          maxStock: availableStock,
          allowedPaymentMethods: product.allowedPaymentMethods,
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
    return { success: true, message: `Added "${product.name}" to cart.` };
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          item.productId === productId &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        ) {
          const validQty = Math.min(quantity, item.maxStock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (
    productId: string,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const applyCouponCode = async (code: string, customerIdOrEmail?: string): Promise<boolean> => {
    setCouponError(null);
    let identifier = customerIdOrEmail;
    if (!identifier) {
      try {
        const saved = localStorage.getItem('rmart_auth_session');
        if (saved) {
          const u = JSON.parse(saved);
          identifier = u.email || u.phone || u.uid;
        }
      } catch {}
    }
    const res = await validateCoupon(code, cartSubtotal, identifier);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponDiscount(res.discountAmount || 0);
      return true;
    } else {
      setCouponError(res.error || 'Invalid or expired promo code');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError(null);
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Compare
  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const isInCompare = (productId: string) => compareList.some((p) => p.id === productId);
  const clearCompare = () => setCompareList([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        couponDiscount,
        couponError,
        applyCouponCode,
        removeCoupon,
        selectedDeliveryZone,
        setSelectedDeliveryZone,
        deliveryCharge,
        wishlist,
        toggleWishlist,
        isInWishlist,
        compareList,
        toggleCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
