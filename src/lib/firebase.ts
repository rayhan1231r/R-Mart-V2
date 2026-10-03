import { initializeApp, getApps, getApp, FirebaseApp, deleteApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import {
  firebaseConfig,
  isFirebaseConfigValid,
  resolveActiveFirebaseConfig,
  saveStoredFirebaseConfig,
  type FirebaseConfigOptions,
} from './firebaseConfig';

// Re-export type and resolved configuration for backward compatibility
export type { FirebaseConfigOptions };
const envConfig: FirebaseConfigOptions = firebaseConfig;

// Check if Firebase has a valid API key and Project ID configured
export const isFirebaseConfigured = (): boolean => {
  return isFirebaseConfigValid();
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.info('Firebase initialized successfully for R Mart project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
  }
}

/**
 * Re-initialize Firebase with updated credentials dynamically
 */
export async function reinitializeFirebase(
  newConfig?: FirebaseConfigOptions
): Promise<{ success: boolean; error?: string }> {
  try {
    if (newConfig) {
      saveStoredFirebaseConfig(newConfig);
    }
    const cfg = resolveActiveFirebaseConfig();
    Object.assign(firebaseConfig, cfg);

    const apps = getApps();
    for (const a of apps) {
      try {
        await deleteApp(a);
      } catch {
        // ignore delete app errors
      }
    }

    if (isFirebaseConfigValid(cfg)) {
      app = initializeApp(cfg);
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);
      console.info('Firebase dynamically re-initialized for project:', cfg.projectId);
      return { success: true };
    } else {
      app = null;
      auth = null;
      db = null;
      storage = null;
      return { success: true };
    }
  } catch (err: any) {
    console.warn('Firebase re-initialization warning:', err);
    return { success: false, error: err?.message || 'Failed to reinitialize Firebase' };
  }
}

/**
 * Test Firebase credentials without breaking existing connection
 */
export async function testFirebaseConnection(
  config: FirebaseConfigOptions
): Promise<{ success: boolean; message?: string; error?: string }> {
  if (!isFirebaseConfigValid(config)) {
    return {
      success: false,
      error: 'Please fill in both a valid Firebase API Key (starts with AIzaSy) and Project ID.',
    };
  }

  let tempApp: FirebaseApp | null = null;
  const tempAppName = 'temp_test_ping_' + Date.now();
  try {
    tempApp = initializeApp(config, tempAppName);
    const testAuth = getAuth(tempApp);
    if (!testAuth) {
      throw new Error('Unable to create Firebase Auth service with provided configuration.');
    }
    return {
      success: true,
      message: `Firebase configuration verified successfully! Project "${config.projectId}" credentials are valid.`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Connection test failed. Please verify the credentials.',
    };
  } finally {
    if (tempApp) {
      try {
        await deleteApp(tempApp);
      } catch {
        // ignore cleanup error
      }
    }
  }
}

export { app, auth, db, storage, envConfig, firebaseConfig };
