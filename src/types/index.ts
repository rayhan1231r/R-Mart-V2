export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = string;

export interface PaymentMethodConfig {
  id: string;
  name: string;
  code: string; // 'cod', 'bkash', 'nagad', 'rocket', 'bank', etc.
  description?: string;
  accountNumber?: string;
  instructions?: string;
  charge?: number;
  isActive: boolean;
  requiresTrxId?: boolean;
  isDefault?: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  color?: string;
  colorCode?: string;
  stock: number;
  priceModifier?: number;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: string;
  categoryId?: string;
  subcategory?: string;
  brand?: string;
  gender?: 'men' | 'women' | 'unisex' | 'kids' | 'all';
  fabricMaterial?: string;
  images: string[];
  thumbnail: string;
  videos?: string[]; // Up to 2-3 product videos (max 4 min per video)
  price: number;
  salePrice?: number;
  costPrice?: number;
  sizes?: string[];
  colors?: { name: string; code?: string; image?: string }[];
  variants?: ProductVariant[];
  totalStock: number;
  weight?: string;
  tags?: string[];
  allowedPaymentMethods?: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isFlashSale?: boolean;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  subcategories?: string[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  variantId?: string;
  maxStock: number;
  allowedPaymentMethods?: string[];
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  division: string;
  district: string;
  upazilaOrArea: string;
  streetAddress: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  deliveryZoneId: string;
  deliveryZoneName: string;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentMethodName?: string;
  paymentAccount?: string;
  transactionId?: string;
  senderPhone?: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  customerNote?: string;
  internalAdminNotes?: string[];
  consignmentId?: string;
  courierName?: string;
  ipAddress?: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  uid?: string;
  name: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  avatarUrl?: string;
  streetAddress?: string;
  district?: string;
  city?: string;
  upazilaOrArea?: string;
  postalCode?: string;
  bio?: string;
  dateOfBirth?: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  loyaltyPoints?: number;
  password?: string;
  role: 'customer' | 'admin';
  addresses?: ShippingAddress[];
  defaultAddress?: ShippingAddress;
  totalOrders: number;
  totalSpent: number;
  isBlocked?: boolean;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  bannedBy?: string;
  lastIpAddress?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export type AdminRole = 'owner' | 'admin' | 'sub-admin';

export interface AdminStaff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  permissions: string[];
  createdAt: string;
  lastLoginAt?: string;
  createdBy?: string;
}

export interface BannedIpRecord {
  id: string;
  ipAddress: string;
  reason?: string;
  bannedAt: string;
  bannedBy: string;
  associatedEmail?: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiryDate?: string;
  usageLimit?: number;
  usedCount: number;
  perCustomerLimit?: number;
  usedBy?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  charge: number;
  minOrderForFreeDelivery?: number;
  estimatedDays: string;
  isActive: boolean;
  isDefault?: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  badgeText?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: string;
}

export interface SiteSettings {
  storeName: string;
  domain: string;
  storeDescription: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  currencySymbol: string;
  currencyCode: string;
  timezone: string;
  announcementBarText?: string;
  announcementBarActive: boolean;
  cashOnDeliveryEnabled: boolean;
  freeDeliveryThreshold?: number;
  logoUrl?: string;
  adminResetPin?: string;
  themeColor?: string; // Hex color (e.g. #10B981, #F85606, #2874F0)
  themeName?: 'emerald' | 'orange' | 'amber' | 'blue' | 'crimson' | 'red' | 'purple' | 'custom';
  uiStyle?: 'marketplace' | 'compact' | 'aesthetic';
  orderNotificationEmail?: string;
  orderNotificationEmailCc?: string;
  notifyAdminOnNewOrder?: boolean;
  notifyCustomerOnOrder?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSenderName?: string;
  smtpSenderEmail?: string;
  smtpSecure?: boolean;
  smtpEnabled?: boolean;
  firebaseApiKey?: string;
  firebaseAuthDomain?: string;
  firebaseProjectId?: string;
  firebaseStorageBucket?: string;
  firebaseMessagingSenderId?: string;
  firebaseAppId?: string;
  firebaseMeasurementId?: string;
  firebaseEnabled?: boolean;
  autoBroadcastNewProducts?: boolean;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: 'product' | 'order' | 'category' | 'coupon' | 'delivery' | 'settings' | 'banner' | 'payment' | 'theme' | 'reset' | 'staff' | 'customer' | 'security';
  targetId?: string;
  details: string;
  timestamp: string;
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  lastUpdated: string;
}

export interface OrderNotificationRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  sentAt: string;
  recipientAdmin: string;
  recipientCustomer?: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  status: 'sent' | 'pending' | 'failed';
}

export interface OtpVerificationRecord {
  target: string;
  code: string;
  type: 'email' | 'phone';
  channel: 'email' | 'sms' | 'whatsapp';
  expiresAt: number;
}
