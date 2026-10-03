/**
 * ============================================================================
 * FIREBASE CONFIGURATION (MANUAL SETUP + ADMIN DYNAMIC SETUP + ENV FALLBACK)
 * ============================================================================
 * 
 * PASTE YOUR FIREBASE API KEYS DIRECTLY IN THE 'MANUAL_FIREBASE_CONFIG' OBJECT BELOW.
 * 
 * How to get your Firebase Web credentials:
 *   1. Go to Firebase Console (https://console.firebase.google.com/)
 *   2. Select your project -> Project Settings (gear icon) -> General tab
 *   3. Scroll down to "Your apps" section and select your Web app (</>)
 *   4. Copy the values and paste them into MANUAL_FIREBASE_CONFIG below.
 */

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_KEY = 'rmart_firebase_config';

/**
 * ⬇️ PASTE YOUR FIREBASE KEYS DIRECTLY HERE (EASIEST FOR cPanel / Apache HOSTING):
 * (If left empty '', it automatically falls back to Admin Panel settings or .env)
 */
export const MANUAL_FIREBASE_CONFIG: FirebaseConfigOptions = {
  apiKey: '',             // e.g. "AIzaSyD-xxxxxxxxxxxxxxxxxxxxxxxx"
  authDomain: '',         // e.g. "my-project.firebaseapp.com"
  projectId: '',          // e.g. "my-project"
  storageBucket: '',      // e.g. "my-project.appspot.com"
  messagingSenderId: '',  // e.g. "1029384756"
  appId: '',              // e.g. "1:1029384756:web:8a7b6c5d4e"
  measurementId: '',      // e.g. "G-ABC1234567" (Optional)
};

/**
 * Retrieve saved Firebase credentials from localStorage (configured via Admin Settings)
 */
export const getStoredFirebaseConfig = (): FirebaseConfigOptions => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          apiKey: (parsed.apiKey || '').trim(),
          authDomain: (parsed.authDomain || '').trim(),
          projectId: (parsed.projectId || '').trim(),
          storageBucket: (parsed.storageBucket || '').trim(),
          messagingSenderId: (parsed.messagingSenderId || '').trim(),
          appId: (parsed.appId || '').trim(),
          measurementId: (parsed.measurementId || '').trim(),
        };
      }
    }
  } catch {
    // LocalStorage unavailable or invalid JSON
  }

  // Check store settings cache as secondary source
  try {
    const rawSettings = localStorage.getItem('rmart_store_settings');
    if (rawSettings) {
      const parsedSettings = JSON.parse(rawSettings);
      if (parsedSettings && parsedSettings.firebaseApiKey) {
        return {
          apiKey: (parsedSettings.firebaseApiKey || '').trim(),
          authDomain: (parsedSettings.firebaseAuthDomain || '').trim(),
          projectId: (parsedSettings.firebaseProjectId || '').trim(),
          storageBucket: (parsedSettings.firebaseStorageBucket || '').trim(),
          messagingSenderId: (parsedSettings.firebaseMessagingSenderId || '').trim(),
          appId: (parsedSettings.firebaseAppId || '').trim(),
          measurementId: (parsedSettings.firebaseMeasurementId || '').trim(),
        };
      }
    }
  } catch {
    // Ignore error
  }

  return {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  };
};

/**
 * Save Firebase configuration to localStorage so it persists across reloads
 */
export const saveStoredFirebaseConfig = (config: Partial<FirebaseConfigOptions>): void => {
  try {
    const existing = getStoredFirebaseConfig();
    const merged: FirebaseConfigOptions = {
      apiKey: (config.apiKey !== undefined ? config.apiKey : existing.apiKey).trim(),
      authDomain: (config.authDomain !== undefined ? config.authDomain : existing.authDomain).trim(),
      projectId: (config.projectId !== undefined ? config.projectId : existing.projectId).trim(),
      storageBucket: (config.storageBucket !== undefined ? config.storageBucket : existing.storageBucket).trim(),
      messagingSenderId: (config.messagingSenderId !== undefined ? config.messagingSenderId : existing.messagingSenderId).trim(),
      appId: (config.appId !== undefined ? config.appId : existing.appId).trim(),
      measurementId: (config.measurementId !== undefined ? config.measurementId : (existing.measurementId || '')).trim(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    
    // Also update in-memory active config object
    Object.assign(firebaseConfig, merged);
  } catch (err) {
    console.warn('Failed to save Firebase config to storage:', err);
  }
};

/**
 * Clear stored Firebase configuration
 */
export const clearStoredFirebaseConfig = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    firebaseConfig.apiKey = '';
    firebaseConfig.authDomain = '';
    firebaseConfig.projectId = '';
    firebaseConfig.storageBucket = '';
    firebaseConfig.messagingSenderId = '';
    firebaseConfig.appId = '';
    firebaseConfig.measurementId = '';
  } catch {
    // Ignore error
  }
};

/**
 * Helper to resolve active configuration:
 * Prioritizes:
 * 1. Hardcoded MANUAL_FIREBASE_CONFIG (direct paste in this file)
 * 2. Stored config in localStorage (Admin Settings)
 * 3. Vite environment variables (.env)
 */
export const resolveActiveFirebaseConfig = (): FirebaseConfigOptions => {
  const stored = getStoredFirebaseConfig();
  
  return {
    apiKey:
      MANUAL_FIREBASE_CONFIG.apiKey.trim() ||
      stored.apiKey ||
      import.meta.env.VITE_FIREBASE_API_KEY ||
      '',
    authDomain:
      MANUAL_FIREBASE_CONFIG.authDomain.trim() ||
      stored.authDomain ||
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
      '',
    projectId:
      MANUAL_FIREBASE_CONFIG.projectId.trim() ||
      stored.projectId ||
      import.meta.env.VITE_FIREBASE_PROJECT_ID ||
      '',
    storageBucket:
      MANUAL_FIREBASE_CONFIG.storageBucket.trim() ||
      stored.storageBucket ||
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
      '',
    messagingSenderId:
      MANUAL_FIREBASE_CONFIG.messagingSenderId.trim() ||
      stored.messagingSenderId ||
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      '',
    appId:
      MANUAL_FIREBASE_CONFIG.appId.trim() ||
      stored.appId ||
      import.meta.env.VITE_FIREBASE_APP_ID ||
      '',
    measurementId:
      MANUAL_FIREBASE_CONFIG.measurementId?.trim() ||
      stored.measurementId ||
      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
      '',
  };
};

/**
 * Active resolved configuration singleton
 */
export const firebaseConfig: FirebaseConfigOptions = resolveActiveFirebaseConfig();

/**
 * Validation helper: Returns true if valid Firebase credentials are provided.
 */
export const isFirebaseConfigValid = (config?: FirebaseConfigOptions): boolean => {
  const cfg = config || firebaseConfig;
  return Boolean(
    cfg.apiKey &&
    cfg.apiKey !== 'YOUR_API_KEY' &&
    cfg.apiKey.length > 5 &&
    cfg.projectId &&
    cfg.projectId !== 'YOUR_PROJECT_ID' &&
    cfg.projectId.length > 2
  );
};

export default firebaseConfig;
