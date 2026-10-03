# cPanel (Apache) Static Deployment Guide for R Mart

This project is fully configured and optimized as a high-performance **React Single Page Application (SPA)** for cPanel / Apache shared hosting.

---

## 1. Firebase API Keys Configuration

You can easily configure your Firebase backend keys in **ONE** of two ways:

### Method A: Direct Paste in `src/lib/firebaseConfig.ts` (Recommended for static builds)
Open `src/lib/firebaseConfig.ts` and paste your web app credentials into `MANUAL_FIREBASE_CONFIG`:

```typescript
const MANUAL_FIREBASE_CONFIG: FirebaseConfigOptions = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
  measurementId: "G-XXXXXXXXXX",
};
```

*Note: If you leave these strings empty, the app will safely fall back to in-memory/localStorage offline demo data.*

### Method B: Environment Variables
Alternatively, you can define them in your `.env` file before running the build:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 2. How to Build the Static Site

Run the build command in your terminal:

```bash
npm run build
```

This will produce a production-ready `dist/` directory containing:
- `index.html` (root entrypoint with `/` base asset paths)
- `.htaccess` (automatically copied from `public/.htaccess`)
- `assets/` (compressed JS & CSS bundles)
- `favicon.png`, `logo.png`, `logo.jpg`

---

## 3. How to Upload to cPanel

1. **Login to cPanel**: Access your hosting control panel (e.g. `yourdomain.com/cpanel`).
2. **Open File Manager**: Navigate to `File Manager` -> open your website root folder (usually `public_html` for main domain, or `public_html/subfolder` for an addon domain or subdomain).
3. **Zip & Upload**:
   - Compress the **contents of the `dist/` folder** into a `.zip` file (make sure you zip the files *inside* `dist`, not the `dist` folder itself).
   - In cPanel File Manager, click **Upload** and upload the zip file.
   - Select the zip file and click **Extract**.
4. **Verify `.htaccess`**:
   - In cPanel File Manager, click **Settings** (top right) and ensure **"Show Hidden Files (dotfiles)"** is checked.
   - Verify that `.htaccess` is present in `public_html/`.

---

## 4. Apache `.htaccess` Configuration (Already Included)

The build output already includes `.htaccess` automatically. If you ever need to create or verify it manually in cPanel's `public_html/.htaccess`, here is the exact configuration:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # SPA Fallback: Rewrite all requests to index.html unless the actual file exists
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

Options -Indexes

# Gzip Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css application/xml application/xhtml+xml application/rss+xml application/javascript application/x-javascript application/json image/svg+xml
</IfModule>

# Caching Headers
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/jpg "access plus 1 month"
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType image/svg+xml "access plus 1 month"
  ExpiresByType image/x-icon "access plus 1 year"
</IfModule>

<IfModule mod_headers.c>
  <FilesMatch "index\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```
