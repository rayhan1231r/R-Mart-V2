import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  Phone,
  User,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Banknote,
  Copy,
  Check,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getDeliveryZones, createOrder, getPaymentMethods, getProducts, isIpBanned, getClientIp } from '../../lib/store';
import type { DeliveryZone, PaymentMethodConfig, ShippingAddress } from '../../types';

interface CheckoutPageProps {
  navigate: (path: string) => void;
}

const BD_DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Rajshahi',
  'Khulna',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ navigate }) => {
  const {
    cart,
    cartSubtotal,
    appliedCoupon,
    couponDiscount,
    selectedDeliveryZone,
    setSelectedDeliveryZone,
    deliveryCharge,
    clearCart,
  } = useCart();

  const { user, loginCustomer, registerCustomer, loginWithGoogle } = useAuth();

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auth toggle modal/state if not logged in
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Address form fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [upazilaOrArea, setUpazilaOrArea] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodConfig | null>(null);
  const [senderPhone, setSenderPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Map of product IDs to their custom allowed payment methods
  const [productPaymentMap, setProductPaymentMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    getClientIp().then(async (ip) => {
      if (await isIpBanned(ip)) {
        setErrorMessage(`Security Notice: Your IP address (${ip}) is restricted from placing orders. Helpline: 01619415744.`);
      }
    });
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      getProducts({ activeOnly: false }).then((allProds) => {
        const map: Record<string, string[]> = {};
        allProds.forEach((p) => {
          if (
            p.allowedPaymentMethods &&
            p.allowedPaymentMethods.length > 0 &&
            !p.allowedPaymentMethods.includes('all')
          ) {
            map[p.id] = p.allowedPaymentMethods;
          }
        });
        setProductPaymentMap(map);
      });
    }
  }, [cart]);

  // Identify eligible payment methods and any restrictions caused by cart items
  const { eligiblePaymentMethods, disallowedMethodsInfo } = React.useMemo(() => {
    const restrictions: { productName: string; allowedCodes: string[] }[] = [];

    cart.forEach((item) => {
      const allowed = item.allowedPaymentMethods || productPaymentMap[item.productId];
      if (allowed && allowed.length > 0 && !allowed.includes('all')) {
        restrictions.push({
          productName: item.name,
          allowedCodes: allowed,
        });
      }
    });

    if (restrictions.length === 0) {
      return { eligiblePaymentMethods: paymentMethods, disallowedMethodsInfo: {} as Record<string, string[]> };
    }

    const disallowedInfo: Record<string, string[]> = {};

    paymentMethods.forEach((method) => {
      const disallowingItems = restrictions.filter((r) => !r.allowedCodes.includes(method.code));
      if (disallowingItems.length > 0) {
        disallowedInfo[method.id] = disallowingItems.map((r) => r.productName);
      }
    });

    const eligible = paymentMethods.filter((method) => !disallowedInfo[method.id]);

    return {
      eligiblePaymentMethods: eligible.length > 0 ? eligible : paymentMethods,
      disallowedMethodsInfo: disallowedInfo,
    };
  }, [cart, paymentMethods, productPaymentMap]);

  // Auto-switch to first eligible payment method if current is disallowed
  useEffect(() => {
    if (eligiblePaymentMethods.length > 0) {
      if (
        !selectedPaymentMethod ||
        disallowedMethodsInfo[selectedPaymentMethod.id] ||
        !eligiblePaymentMethods.some((m) => m.id === selectedPaymentMethod.id)
      ) {
        const def = eligiblePaymentMethods.find((m) => m.isDefault) || eligiblePaymentMethods[0];
        if (def) {
          setSelectedPaymentMethod(def);
        }
      }
    }
  }, [eligiblePaymentMethods, disallowedMethodsInfo, selectedPaymentMethod]);

  useEffect(() => {
    getDeliveryZones().then((zones) => {
      const active = zones.filter((z) => z.isActive);
      setDeliveryZones(active);
      if (!selectedDeliveryZone && active.length > 0) {
        setSelectedDeliveryZone(active[0]);
      }
    });

    getPaymentMethods().then((methods) => {
      const active = methods.filter((m) => m.isActive);
      setPaymentMethods(active);
      const def = active.find((m) => m.isDefault) || active[0];
      if (def) {
        setSelectedPaymentMethod(def);
      }
    });
  }, []);

  useEffect(() => {
    if (user) {
      if (!fullName && user.name) setFullName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
    }
  }, [user]);

  // Adjust delivery zone recommendation when division changes
  const handleDivisionChange = (newDivision: string) => {
    setDivision(newDivision);
    if (deliveryZones.length > 0) {
      if (newDivision === 'Dhaka') {
        const inside = deliveryZones.find((z) => z.id.includes('inside') || z.name.toLowerCase().includes('dhaka'));
        if (inside) setSelectedDeliveryZone(inside);
      } else {
        const outside = deliveryZones.find((z) => z.id.includes('outside') || z.name.toLowerCase().includes('outside'));
        if (outside) setSelectedDeliveryZone(outside);
      }
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (authMode === 'login') {
      const res = await loginCustomer(authEmail, authPassword);
      if (!res.success) {
        setAuthError(res.error || 'Login failed.');
      }
    } else {
      if (!authName.trim() || !authPhone.trim()) {
        setAuthError('Name and Bangladeshi phone number are required.');
        return;
      }
      const res = await registerCustomer(authEmail, authPassword, authName, authPhone);
      if (!res.success) {
        setAuthError(res.error || 'Registration failed.');
      } else {
        setFullName(authName);
        setPhone(authPhone);
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before placing an order.');
      return;
    }

    if (!user) {
      setErrorMessage('Please sign in or register below to place your order.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    // Validate Bangladesh mobile phone format
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11 || (!cleanPhone.startsWith('01') && !cleanPhone.startsWith('8801'))) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017xxxxxxxx).');
      return;
    }

    if (!streetAddress.trim() || !upazilaOrArea.trim()) {
      setErrorMessage('Please provide complete street address and area/upazila.');
      return;
    }

    if (!selectedDeliveryZone) {
      setErrorMessage('Please select a delivery zone.');
      return;
    }

    if (selectedPaymentMethod && disallowedMethodsInfo[selectedPaymentMethod.id]) {
      const blockers = disallowedMethodsInfo[selectedPaymentMethod.id].join(', ');
      setErrorMessage(
        `"${selectedPaymentMethod.name}" is not supported for: ${blockers}. Please select an eligible payment method.`
      );
      return;
    }

    if (selectedPaymentMethod?.requiresTrxId) {
      if (!senderPhone.trim()) {
        setErrorMessage(`Please provide your sender ${selectedPaymentMethod.name} mobile/wallet number.`);
        return;
      }
      if (!transactionId.trim()) {
        setErrorMessage('Please provide the Transaction ID (TrxID) from your payment app.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const shippingAddress: ShippingAddress = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || user.email,
        division,
        district,
        upazilaOrArea: upazilaOrArea.trim(),
        streetAddress: streetAddress.trim(),
        postalCode: postalCode.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const finalTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);

      const orderData = {
        customerId: user.uid,
        customerInfo: {
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || user.email,
        },
        shippingAddress,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.name,
          productImage: item.image,
          size: item.selectedSize,
          color: item.selectedColor,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        subtotal: cartSubtotal,
        discountAmount: couponDiscount,
        couponCode: appliedCoupon?.code,
        deliveryZoneId: selectedDeliveryZone.id,
        deliveryZoneName: selectedDeliveryZone.name,
        deliveryCharge,
        totalAmount: finalTotal + (selectedPaymentMethod?.charge || 0),
        paymentMethod: selectedPaymentMethod?.code || 'cod',
        paymentMethodName: selectedPaymentMethod?.name || 'Cash on Delivery',
        paymentAccount: selectedPaymentMethod?.accountNumber,
        transactionId: transactionId.trim() || undefined,
        senderPhone: senderPhone.trim() || undefined,
        paymentStatus: 'pending' as const,
        orderStatus: 'pending' as const,
        customerNote: notes.trim() || undefined,
      };

      const created = await createOrder(orderData);

      // Trigger festive celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#ffffff', '#059669'],
        });
      } catch {
        // ignore
      }

      clearCart();
      navigate(`/order-confirmation/${created.id}`);
    } catch (err: any) {
      console.warn('Order creation notice:', err);
      setErrorMessage(err?.message || 'Failed to place order. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - couponDiscount + deliveryCharge);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-xs">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Items in Cart</h2>
        <p className="text-xs text-slate-500 mb-6">Your shopping bag is empty. Please add items to checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          Checkout & Confirmation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete your delivery details for fast nationwide Cash on Delivery (COD)
        </p>
      </div>

      {/* If customer is NOT authenticated: inline login/register requirement */}
      {!user && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500/30 shadow-md space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Customer Account Required for Delivery Tracking</h3>
              <p className="text-xs text-slate-500">
                Sign in or register your mobile number below to track this order.
              </p>
            </div>
          </div>

          {/* Toggle Login / Register */}
          <div className="flex border-b border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`pb-2 px-4 font-bold transition-colors ${
                authMode === 'login'
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In Existing Account
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`pb-2 px-4 font-bold transition-colors ${
                authMode === 'register'
                  ? 'border-b-2 border-emerald-600 text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create New Customer Account
            </button>
          </div>

          {/* Direct Google Sign In */}
          <div className="max-w-md pt-2 space-y-3">
            <button
              type="button"
              onClick={async () => {
                const res = await loginWithGoogle();
                if (!res.success) setAuthError(res.error || 'Google sign in failed');
              }}
              className="w-full h-10 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Instant Checkout with Google</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 shrink-0">
                Or with Email & Password
              </span>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3 max-w-md pt-1">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName || ''}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Rayhan Ahmed"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Bangladeshi)</label>
                  <input
                    type="tel"
                    required
                    value={authPhone || ''}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="01619415744"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={authEmail || ''}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={authPassword || ''}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </p>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
            >
              {authMode === 'login' ? 'Sign In & Continue' : 'Register Account'}
            </button>
          </form>
        </div>
      )}

      {/* Main Checkout Form */}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Shipping & Delivery Info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shipping Address */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>1. Delivery Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Recipient Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName || ''}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient's Name"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number (BD) *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone || ''}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01619415744"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Division *
                </label>
                <select
                  value={division || 'Dhaka'}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                >
                  {BD_DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={district || ''}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Dhaka, Gazipur, Chittagong"
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upazila / Police Station / Area *
                </label>
                <input
                  type="text"
                  required
                  value={upazilaOrArea || ''}
                  onChange={(e) => setUpazilaOrArea(e.target.value)}
                  placeholder="e.g. Mirpur, Dhanmondi, Uttara"
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  value={postalCode || ''}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 1216"
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Street / Village / House & Road Address *
              </label>
              <textarea
                required
                rows={2}
                value={streetAddress || ''}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="House #, Road #, Sector/Block, Landmark details"
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes || ''}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Call before delivery, deliver in afternoon"
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Delivery Zone Selection */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>2. Delivery Zone & Shipping Method</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deliveryZones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => setSelectedDeliveryZone(zone)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedDeliveryZone?.id === zone.id
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{zone.name}</span>
                    <span className="text-xs font-mono font-extrabold text-emerald-700">
                      {cartSubtotal >= (zone.minOrderForFreeDelivery || 999999)
                        ? 'FREE'
                        : `৳${zone.charge}`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{zone.estimatedDays}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>3. Payment Method</span>
              </h2>
              {Object.keys(disallowedMethodsInfo).length > 0 && (
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Custom Product Payment Policy Applied
                </span>
              )}
            </div>

            {Object.keys(disallowedMethodsInfo).length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <span className="font-bold block">Notice: Payment Method Restriction</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Some item(s) in your bag require specific payment methods. Unsupported payment methods are disabled below:
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(disallowedMethodsInfo).map(([methodId, blockerNames]) => {
                      const m = paymentMethods.find((pm) => pm.id === methodId);
                      return (
                        <span
                          key={methodId}
                          className="inline-flex items-center text-[10px] bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded-md shadow-2xs"
                        >
                          <strong>{m?.name || 'Method'}</strong>: Not allowed for {blockerNames.join(', ')}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = selectedPaymentMethod?.id === method.id;
                const isDisallowed = Boolean(disallowedMethodsInfo[method.id]);
                const isMobile = method.code.includes('bkash') || method.code.includes('nagad') || method.code.includes('rocket') || method.code.includes('upay');

                return (
                  <div
                    key={method.id}
                    onClick={() => {
                      if (!isDisallowed) {
                        setSelectedPaymentMethod(method);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDisallowed
                        ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs cursor-pointer'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        disabled={isDisallowed}
                        checked={isSelected && !isDisallowed}
                        onChange={() => {
                          if (!isDisallowed) {
                            setSelectedPaymentMethod(method);
                          }
                        }}
                        className="mt-1 w-4 h-4 text-emerald-600 focus:ring-0 disabled:opacity-30"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                            {isMobile ? (
                              <Smartphone className="w-3.5 h-3.5 text-rose-500" />
                            ) : method.code === 'cod' ? (
                              <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                            )}
                            <span>{method.name}</span>
                            {isDisallowed && (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                                Unavailable for items in cart
                              </span>
                            )}
                          </span>
                          {method.charge && method.charge > 0 ? (
                            <span className="text-[10px] font-mono text-amber-600 font-bold">
                              +৳{method.charge} fee
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-700">
                              Free
                            </span>
                          )}
                        </div>

                        {method.description && (
                          <p className="text-[11px] text-slate-500 mt-1">
                            {method.description}
                          </p>
                        )}

                        {/* Extra fields if selected and requiresTrxId */}
                        {isSelected && method.requiresTrxId && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                            {method.accountNumber && (
                              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] text-slate-500 block">
                                    Official Payment Account:
                                  </span>
                                  <span className="font-mono font-bold text-slate-900 text-xs">
                                    {method.accountNumber}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(method.accountNumber || '');
                                    setCopiedAccount(true);
                                    setTimeout(() => setCopiedAccount(false), 2000);
                                  }}
                                  className="px-3 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-[10px] text-slate-800 font-bold flex items-center gap-1 shadow-2xs"
                                >
                                  {copiedAccount ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-500" />
                                      <span>Copy Number</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {method.instructions && (
                              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                                {method.instructions}
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Your Sender Mobile / Account No. *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={senderPhone || ''}
                                  onChange={(e) => setSenderPhone(e.target.value)}
                                  placeholder="01XXXXXXXXX"
                                  className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  Transaction ID (TrxID) *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={transactionId || ''}
                                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                                  placeholder="e.g. 9B3K912X4"
                                  className="w-full h-9 px-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 font-mono uppercase focus:outline-none focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Cart Review & Submit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5 sticky top-24">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Quick item list */}
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-12 rounded-lg object-cover bg-slate-100 border border-slate-100 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-slate-900 truncate font-bold">{item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity} {item.selectedSize && `· ${item.selectedSize}`}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-800">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span className="font-mono">-৳{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge</span>
                <span className="font-mono font-bold text-slate-800">
                  {deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-extrabold text-base pt-3 border-t border-slate-100">
                <span>Total Amount Due</span>
                <span className="font-mono text-emerald-700">৳{finalTotal.toLocaleString()}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !user}
              className="w-full h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-40"
            >
              {isSubmitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order (Cash on Delivery)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[10px] text-slate-400 text-center leading-relaxed">
              By confirming this order, you agree to receive SMS/Call verification from R Mart logistics.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
