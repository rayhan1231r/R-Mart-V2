# R Mart (rmartoffcial.shop) — Official Online E-Commerce Platform

A production-ready, all-category e-commerce marketplace engineered for Bangladesh and ready for international expansion. Built from scratch with React 19, TypeScript, Tailwind CSS, and Firebase.

---

## 1. Project Overview & Identity
- **Store Name:** R Mart
- **Domain:** [rmartoffcial.shop](https://rmartoffcial.shop)
- **Business Phone & Hotline:** 01619415744
- **Support Email:** rmartoffcial@gmail.com
- **WhatsApp:** 01619415744
- **Delivery Areas:** Bangladesh nationwide coverage (Inside Dhaka, Outside Dhaka, all 64 districts)
- **Currency:** Bangladeshi Taka (৳ BDT)
- **Timezone:** Asia/Dhaka
- **Payment Method:** Cash on Delivery (COD) with doorstep parcel inspection

---

## 2. Technology Stack
- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS 4 with central design tokens (Deep Obsidian `#070A0D`, Brushed Metallic Chrome `#E2E8F0`, and Electric Emerald Accent `#10B981`)
- **Backend / Database:** Firebase Firestore & Firebase Authentication
- **Icons & Animation:** Lucide Icons & Canvas Confetti

---

## 3. Strict "Zero Demo Data" Architecture
In accordance with production standards:
- **No fake products, fake orders, fake customer reviews, or fabricated analytics** are hardcoded.
- The catalog begins empty with graceful, informative empty states and setup checklists.
- All real products, categories, variants, and delivery rates are created and managed by the administrator directly via the **Admin Panel** (`/admin`).

---

## 4. Admin Panel & Access Control
- **Admin Panel URL:** `/admin`
- **Admin Login:** `/admin/login`
- **Authorized Administrator Email:** `rmartoffcial@gmail.com`
- **Submodules included:**
  1. **Dashboard (`/admin`):** Real-time orders, pending confirmations, total revenue, catalog metrics, low-stock warnings, and setup checklist.
  2. **Products (`/admin/products`):** Full product CRUD, multi-image manager, sizes, colors, dynamic variant matrix (size + color + SKU + stock), prices, cost price, and flags.
  3. **Categories (`/admin/categories`):** Department management with slugs and subcategories.
  4. **Inventory (`/admin/inventory`):** SKU stock control with instant inline updates and low-stock filters.
  5. **Orders (`/admin/orders`):** Full lifecycle management (`pending` → `confirmed` → `processing` → `packed` → `shipped` → `delivered` → `cancelled`), status audit log, and printable invoice receipts.
  6. **Customers (`/admin/customers`):** Registered customer accounts, total orders, and lifetime spending.
  7. **Reviews (`/admin/reviews`):** Product review moderation (Approve, Hide, Delete).
  8. **Coupons (`/admin/coupons`):** Promo code creation with percentage or fixed discount, minimum spend, expiry date, and usage limits.
  9. **Delivery Zones (`/admin/delivery`):** Inside Dhaka (৳70), Outside Dhaka (৳130), and custom courier zone management with free delivery thresholds.
  10. **Banners (`/admin/banners`):** Promotional hero banners and campaign sliders.
  11. **Pages (`/admin/pages`):** Live editing for About Us, Contact, Shipping Policy, Return Policy, Privacy Policy, Terms, and Size Guide.
  12. **Settings (`/admin/settings`):** Store identity, hotline, WhatsApp, announcement ticker, and live Firebase connection status.
  13. **Audit Log (`/admin/audit-log`):** Real-time audit trail of all administrator actions.

---

## 5. Environment Variables (`.env`)
To link your live Firebase project, create or update `.env` in the root folder:

```env
# Firebase Client SDK Configuration (from Firebase Console > Project Settings > General)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="rmart-xxxxx.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="rmart-xxxxx"
VITE_FIREBASE_STORAGE_BUCKET="rmart-xxxxx.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXX"

# Official Admin Email & UID
VITE_ADMIN_EMAIL="rmartoffcial@gmail.com"
VITE_ADMIN_UID=""
```

*Note: If environment variables are empty, the application automatically runs in persistent local mode, allowing immediate catalog population and order testing without errors.*

---

## 6. Firestore Collections Structure
When connecting to Firestore, the following collections are used:
- `products`: Product catalog documents, images, variants, and stock.
- `categories`: Departmental categories and subcategory lists.
- `orders`: Customer orders, delivery addresses, itemized lines, and status history.
- `customers`: Customer profiles, phone numbers, and spend metrics.
- `coupons`: Promo codes, discounts, and usage counts.
- `deliveryZones`: Shipping zones and rates.
- `banners`: Homepage sliders.
- `settings`: Store configuration (`settings/general`).
- `reviews`: Customer product reviews with approval flags.
- `auditLogs`: Historical records of administrative changes.
- `pages`: Content for static policies and information pages.

---

## 7. Recommended Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if caller is an administrator
    function isAdmin() {
      return request.auth != null && (
        request.auth.token.email == 'rmartoffcial@gmail.com' ||
        request.auth.token.admin == true
      );
    }

    // Public catalog reads, admin writes
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /banners/{bannerId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /deliveryZones/{zoneId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /pages/{slug} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Reviews: Anyone can read approved reviews, customers can submit, admin can moderate
    match /reviews/{reviewId} {
      allow read: if resource.data.isApproved == true || isAdmin();
      allow create: if request.resource.data.isApproved == false;
      allow update, delete: if isAdmin();
    }

    // Coupons: Read-only for checkout validation, admin writes
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders: Customers can read their own orders; anyone authenticated can place an order; admin has full access
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if isAdmin() || (request.auth != null && resource.data.customerId == request.auth.uid);
      allow update, delete: if isAdmin();
    }

    // Customers: User can view and update their own profile, admin has full access
    match /customers/{customerId} {
      allow read, write: if isAdmin() || (request.auth != null && request.auth.uid == customerId);
    }

    // Audit logs: Strictly admin only
    match /auditLogs/{logId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 8. Development & Deployment
```bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev

# Verify TypeScript and build production bundle
npm run build
```
