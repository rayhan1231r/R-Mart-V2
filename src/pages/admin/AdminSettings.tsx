import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Check,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Globe,
  Database,
  ShieldCheck,
  AlertCircle,
  Copy,
  Palette,
  Send,
  Bell,
  Sparkles,
  Monitor,
  ShoppingBag,
  Moon,
  Sun,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  Key,
  Lock,
  RotateCcw,
  Trash2,
  ShieldAlert,
  Eye,
  EyeOff,
  ExternalLink,
  Unlink,
  FileCode2,
} from 'lucide-react';
import {
  getSiteSettings,
  updateSiteSettings,
  sendOrderNotificationEmail,
  testSmtpConnection,
  resetStoreOrdersAndMetrics,
  updateAdminResetPin,
} from '../../lib/store';
import { isFirebaseConfigured, envConfig, testFirebaseConnection, reinitializeFirebase } from '../../lib/firebase';
import { getStoredFirebaseConfig, saveStoredFirebaseConfig, clearStoredFirebaseConfig, type FirebaseConfigOptions } from '../../lib/firebaseConfig';
import { THEME_PRESETS, applyThemeToDom } from '../../lib/theme';
import { useAdminTheme, AdminThemeMode, AdminAccentColor } from '../../context/AdminThemeContext';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { useAuth } from '../../context/AuthContext';
import type { SiteSettings } from '../../types';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const {
    theme: adminTheme,
    setMode: setAdminMode,
    setAccent: setAdminAccent,
    accentStyles: adminAccentStyles,
  } = useAdminTheme();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);

  // Real SMTP connection testing state
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState('');

  // Firebase connection testing & quick import states
  const [firebaseTesting, setFirebaseTesting] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  const [showSnippetModal, setShowSnippetModal] = useState(false);
  const [snippetInput, setSnippetInput] = useState('');
  const [snippetFeedback, setSnippetFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // Security PIN states
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [pinChanging, setPinChanging] = useState(false);

  // Reset store modal states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetInputPin, setResetInputPin] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ success: boolean; text: string } | null>(null);

  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: keyof SiteSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await updateSiteSettings(settings, user?.email);
      setSaved(true);
      setSavedMessage('Settings saved and live on website!');
      setTimeout(() => {
        setSaved(false);
        setSavedMessage(null);
      }, 3500);
    } catch (err: any) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    if (!settings) return;
    setTestSending(true);
    setTestSentMsg(null);
    try {
      const targetEmail = settings.orderNotificationEmail || settings.email || 'ahmedskkawsar43@gmail.com';
      await sendOrderNotificationEmail({
        id: 'ord_test_' + Date.now(),
        orderNumber: 'RM-TEST-9999',
        customerId: user?.uid || 'admin_test',
        customerInfo: {
          name: 'Tanvir Hossain (Sample Customer)',
          phone: '01711000000',
          email: 'sample.customer@gmail.com',
        },
        shippingAddress: {
          fullName: 'Tanvir Hossain',
          phone: '01711000000',
          streetAddress: 'House 14, Road 5, Block B, Banani',
          upazilaOrArea: 'Banani',
          district: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1213',
        },
        items: [
          {
            productId: 'p_sample_1',
            productName: 'Premium Embroidered Cotton Panjabi',
            productImage: '/logo.png',
            size: 'L',
            color: 'White',
            quantity: 1,
            unitPrice: 2450,
            totalPrice: 2450,
          },
        ],
        subtotal: 2450,
        discountAmount: 0,
        deliveryZoneId: 'zone-inside-dhaka',
        deliveryZoneName: 'Inside Dhaka City',
        deliveryCharge: 70,
        totalAmount: 2520,
        paymentMethod: 'cod',
        paymentMethodName: 'Cash on Delivery',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        customerNote: 'Sample test order from Admin Settings.',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Sample test order',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setTestSentMsg(`Test order notification successfully sent to ${targetEmail}!`);
      setTimeout(() => setTestSentMsg(null), 5000);
    } catch (err: any) {
      console.warn('Test email error:', err);
    } finally {
      setTestSending(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    if (!settings) return;
    setSmtpTesting(true);
    setSmtpTestResult(null);
    try {
      const recipient = testRecipientEmail.trim() || settings.orderNotificationEmail || settings.email || user?.email || '';
      const res = await testSmtpConnection({
        host: settings.smtpHost || 'smtp.gmail.com',
        port: settings.smtpPort || 587,
        user: settings.smtpUser || settings.orderNotificationEmail || settings.email || '',
        pass: settings.smtpPass || '',
        testRecipient: recipient,
      });
      setSmtpTestResult(res);
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        error: err?.message || 'Failed to connect to SMTP server',
      });
    } finally {
      setSmtpTesting(false);
    }
  };

  const applySmtpPreset = (type: 'gmail' | 'cpanel' | 'outlook') => {
    if (!settings) return;
    if (type === 'gmail') {
      handleChange('smtpHost', 'smtp.gmail.com');
      handleChange('smtpPort', 587);
      handleChange('smtpSecure', false);
    } else if (type === 'cpanel') {
      handleChange('smtpHost', `mail.${settings.domain || 'rmartofficial.shop'}`);
      handleChange('smtpPort', 465);
      handleChange('smtpSecure', true);
    } else if (type === 'outlook') {
      handleChange('smtpHost', 'smtp.office365.com');
      handleChange('smtpPort', 587);
      handleChange('smtpSecure', false);
    }
  };

  const handleTestFirebaseConnection = async () => {
    if (!settings) return;
    setFirebaseTesting(true);
    setFirebaseTestResult(null);
    try {
      const res = await testFirebaseConnection({
        apiKey: (settings.firebaseApiKey || '').trim(),
        authDomain: (settings.firebaseAuthDomain || '').trim(),
        projectId: (settings.firebaseProjectId || '').trim(),
        storageBucket: (settings.firebaseStorageBucket || '').trim(),
        messagingSenderId: (settings.firebaseMessagingSenderId || '').trim(),
        appId: (settings.firebaseAppId || '').trim(),
        measurementId: (settings.firebaseMeasurementId || '').trim(),
      });
      setFirebaseTestResult(res);
    } catch (err: any) {
      setFirebaseTestResult({
        success: false,
        error: err?.message || 'Failed to test Firebase connection',
      });
    } finally {
      setFirebaseTesting(false);
    }
  };

  const handleDisconnectFirebase = async () => {
    if (!settings) return;
    handleChange('firebaseApiKey', '');
    handleChange('firebaseAuthDomain', '');
    handleChange('firebaseProjectId', '');
    handleChange('firebaseStorageBucket', '');
    handleChange('firebaseMessagingSenderId', '');
    handleChange('firebaseAppId', '');
    handleChange('firebaseMeasurementId', '');
    handleChange('firebaseEnabled', false);
    clearStoredFirebaseConfig();
    await reinitializeFirebase();
    await updateSiteSettings({
      ...settings,
      firebaseApiKey: '',
      firebaseAuthDomain: '',
      firebaseProjectId: '',
      firebaseStorageBucket: '',
      firebaseMessagingSenderId: '',
      firebaseAppId: '',
      firebaseMeasurementId: '',
      firebaseEnabled: false,
    }, user?.email);
    setFirebaseTestResult({
      success: true,
      message: 'Firebase disconnected. Switched back to persistent local storage.',
    });
  };

  const handleApplySnippet = () => {
    if (!snippetInput.trim() || !settings) return;
    setSnippetFeedback(null);
    const parsed: Partial<FirebaseConfigOptions> = {};

    // Try parsing as JSON first
    try {
      const json = JSON.parse(snippetInput);
      if (json && typeof json === 'object') {
        if (json.apiKey) parsed.apiKey = String(json.apiKey).trim();
        if (json.authDomain) parsed.authDomain = String(json.authDomain).trim();
        if (json.projectId) parsed.projectId = String(json.projectId).trim();
        if (json.storageBucket) parsed.storageBucket = String(json.storageBucket).trim();
        if (json.messagingSenderId) parsed.messagingSenderId = String(json.messagingSenderId).trim();
        if (json.appId) parsed.appId = String(json.appId).trim();
        if (json.measurementId) parsed.measurementId = String(json.measurementId).trim();
      }
    } catch {
      // Not pure JSON, use regex parser
    }

    const regexMap: Record<keyof FirebaseConfigOptions, RegExp[]> = {
      apiKey: [/apiKey\s*:\s*["']([^"']+)["']/i, /"apiKey"\s*:\s*["']([^"']+)["']/i, /VITE_FIREBASE_API_KEY\s*=\s*["']?([^"'\s\n]+)["']?/i],
      authDomain: [/authDomain\s*:\s*["']([^"']+)["']/i, /"authDomain"\s*:\s*["']([^"']+)["']/i, /VITE_FIREBASE_AUTH_DOMAIN\s*=\s*["']?([^"'\s\n]+)["']?/i],
      projectId: [/projectId\s*:\s*["']([^"']+)["']/i, /"projectId"\s*:\s*["']([^"']+)["']/i, /VITE_FIREBASE_PROJECT_ID\s*=\s*["']?([^"'\s\n]+)["']?/i],
      storageBucket: [/storageBucket\s*:\s*["']([^"']+)["']/i, /"storageBucket"\s*:\s*["']([^"']+)["']/i, /VITE_FIREBASE_STORAGE_BUCKET\s*=\s*["']?([^"'\s\n]+)["']?/i],
      messagingSenderId: [/messagingSenderId\s*:\s*["']([^"']+)["']/i, /"messagingSenderId"\s*:\s*["']([^"']+)["']/i, /VITE_FIREBASE_MESSAGING_SENDER_ID\s*=\s*["']?([^"'\s\n]+)["']?/i],
      appId: [/appId\s*:\s*["']([^"']+)["']/i, /"appId"\s*:\s*["']([^"']+)["']/i, /VITE_FIREBASE_APP_ID\s*=\s*["']?([^"'\s\n]+)["']?/i],
      measurementId: [/measurementId\s*:\s*["']([^"']+)["']/i, /"measurementId"\s*:\s*["']([^"']+)["']/i, /VITE_FIREBASE_MEASUREMENT_ID\s*=\s*["']?([^"'\s\n]+)["']?/i],
    };

    for (const [key, rxList] of Object.entries(regexMap)) {
      if (!parsed[key as keyof FirebaseConfigOptions]) {
        for (const rx of rxList) {
          const m = snippetInput.match(rx);
          if (m && m[1]) {
            (parsed as any)[key] = m[1].trim();
            break;
          }
        }
      }
    }

    if (!parsed.apiKey && !parsed.projectId) {
      setSnippetFeedback({
        success: false,
        text: 'Could not extract Firebase credentials from snippet. Please verify snippet format.',
      });
      return;
    }

    if (parsed.apiKey) handleChange('firebaseApiKey', parsed.apiKey);
    if (parsed.authDomain) handleChange('firebaseAuthDomain', parsed.authDomain);
    if (parsed.projectId) handleChange('firebaseProjectId', parsed.projectId);
    if (parsed.storageBucket) handleChange('firebaseStorageBucket', parsed.storageBucket);
    if (parsed.messagingSenderId) handleChange('firebaseMessagingSenderId', parsed.messagingSenderId);
    if (parsed.appId) handleChange('firebaseAppId', parsed.appId);
    if (parsed.measurementId) handleChange('firebaseMeasurementId', parsed.measurementId);
    handleChange('firebaseEnabled', true);

    setSnippetFeedback({
      success: true,
      text: `Successfully extracted credentials for project "${parsed.projectId || 'Firebase'}"!`,
    });

    setTimeout(() => {
      setShowSnippetModal(false);
      setSnippetInput('');
      setSnippetFeedback(null);
    }, 1500);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinInput) return;
    setPinChanging(true);
    setPinChangeMsg(null);
    try {
      const res = await updateAdminResetPin(newPinInput, currentPinInput, user?.email);
      if (res.success) {
        setPinChangeMsg({ success: true, text: 'সিকিউরিটি পিন সফলভাবে আপডেট হয়েছে! (PIN updated successfully)' });
        setSettings((prev) => (prev ? { ...prev, adminResetPin: newPinInput } : prev));
        setNewPinInput('');
        setCurrentPinInput('');
        setTimeout(() => setPinChangeMsg(null), 4000);
      } else {
        setPinChangeMsg({ success: false, text: res.error || 'পিন পরিবর্তন ব্যর্থ হয়েছে।' });
      }
    } finally {
      setPinChanging(false);
    }
  };

  const handleResetStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetInputPin) return;
    setResetting(true);
    setResetStatus(null);
    try {
      const res = await resetStoreOrdersAndMetrics(resetInputPin, user?.email);
      if (res.success) {
        setResetStatus({
          success: true,
          text: 'ড্যাশবোর্ড ও অর্ডার হিস্টোরি সফলভাবে ০ (রিসেট) করা হয়েছে! (All orders & analytics reset to 0)',
        });
        setResetInputPin('');
        setTimeout(() => {
          setResetModalOpen(false);
          setResetStatus(null);
        }, 2500);
      } else {
        setResetStatus({ success: false, text: res.error || 'রিসেট ব্যর্থ হয়েছে।' });
      }
    } finally {
      setResetting(false);
    }
  };

  if (loading || !settings) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  const isConnectedToFirebase = isFirebaseConfigured();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-emerald-400" />
            <span>Store Configuration & Firebase Integration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            General brand settings, contact channels, and database connection status
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved Changes!' : 'Save Store Settings'}</span>
        </button>
      </div>

      {/* Firebase Interactive Configuration & Database Integration */}
      <div
        className={`p-6 rounded-3xl border space-y-5 ${
          isConnectedToFirebase
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : 'bg-[#0F141A] border-white/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isConnectedToFirebase
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Firebase Backend &amp; Database Controls</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isConnectedToFirebase
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isConnectedToFirebase ? 'LIVE CONNECTED' : 'PERSISTENT LOCAL STORAGE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isConnectedToFirebase
                  ? `Connected Project: ${settings.firebaseProjectId || envConfig.projectId}`
                  : 'Change or link your Firebase project credentials dynamically at any time.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setShowSnippetModal(true);
                setSnippetFeedback(null);
                setSnippetInput('');
              }}
              className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Paste Snippet</span>
            </button>

            <button
              type="button"
              onClick={handleTestFirebaseConnection}
              disabled={firebaseTesting}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 active:scale-95"
            >
              {firebaseTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{firebaseTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            {(settings.firebaseApiKey || isConnectedToFirebase) && (
              <button
                type="button"
                onClick={handleDisconnectFirebase}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                title="Disconnect Firebase"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            )}
          </div>
        </div>

        {/* Test Result Feedback */}
        {firebaseTestResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              firebaseTestResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {firebaseTestResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-semibold">
                {firebaseTestResult.success ? 'Firebase Connection Verified' : 'Firebase Connection Notice'}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5">
                {firebaseTestResult.message || firebaseTestResult.error}
              </div>
            </div>
          </div>
        )}

        {/* Firebase Config Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {/* Web API Key */}
          <div className="lg:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Firebase Web API Key (apiKey) *
            </label>
            <div className="relative">
              <input
                type={showFirebaseKey ? 'text' : 'password'}
                value={settings.firebaseApiKey || ''}
                onChange={(e) => {
                  handleChange('firebaseApiKey', e.target.value);
                  handleChange('firebaseEnabled', true);
                }}
                placeholder="AIzaSyD-..."
                className="w-full h-9 pl-3 pr-8 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowFirebaseKey(!showFirebaseKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showFirebaseKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Project ID */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Firebase Project ID *
            </label>
            <input
              type="text"
              value={settings.firebaseProjectId || ''}
              onChange={(e) => {
                handleChange('firebaseProjectId', e.target.value);
                handleChange('firebaseEnabled', true);
              }}
              placeholder="e.g. r-mart-official"
              className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Auth Domain */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Auth Domain
            </label>
            <input
              type="text"
              value={settings.firebaseAuthDomain || ''}
              onChange={(e) => handleChange('firebaseAuthDomain', e.target.value)}
              placeholder="e.g. r-mart-official.firebaseapp.com"
              className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Storage Bucket */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Storage Bucket
            </label>
            <input
              type="text"
              value={settings.firebaseStorageBucket || ''}
              onChange={(e) => handleChange('firebaseStorageBucket', e.target.value)}
              placeholder="e.g. r-mart-official.appspot.com"
              className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Messaging Sender ID */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Messaging Sender ID
            </label>
            <input
              type="text"
              value={settings.firebaseMessagingSenderId || ''}
              onChange={(e) => handleChange('firebaseMessagingSenderId', e.target.value)}
              placeholder="e.g. 1029384756"
              className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Web App ID */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Web App ID (appId)
            </label>
            <input
              type="text"
              value={settings.firebaseAppId || ''}
              onChange={(e) => handleChange('firebaseAppId', e.target.value)}
              placeholder="e.g. 1:1029384756:web:8a7b6c5d"
              className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Measurement ID (Optional) */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Measurement ID (Optional Google Analytics)
            </label>
            <input
              type="text"
              value={settings.firebaseMeasurementId || ''}
              onChange={(e) => handleChange('firebaseMeasurementId', e.target.value)}
              placeholder="e.g. G-ABC1234567"
              className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Quick Instructions & Firebase Console Direct Link */}
        <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💡</span>
            <span>
              ফায়ারবেস কনসোল থেকে প্রোজেক্টের <strong>Project Settings &gt; General &gt; Your apps &gt; Web app</strong> থেকে কোড কপি করে উপরের <strong>"Smart Paste Snippet"</strong> বোতামে পেস্ট করলেই সব তথ্য স্বয়ংক্রিয়ভাবে বসে যাবে।
            </span>
          </div>
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0 underline"
          >
            <span>Open Firebase Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Store Profile */}
        <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.06] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            Store Identity & Business Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={settings.storeName || ''}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Official Domain *</label>
              <input
                type="text"
                required
                value={settings.domain || ''}
                onChange={(e) => handleChange('domain', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Customer Phone *
              </label>
              <input
                type="text"
                required
                value={settings.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                WhatsApp Hotline *
              </label>
              <input
                type="text"
                required
                value={settings.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Support Email *
              </label>
              <input
                type="email"
                required
                value={settings.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Store Description
            </label>
            <textarea
              rows={2}
              value={settings.storeDescription || ''}
              onChange={(e) => handleChange('storeDescription', e.target.value)}
              className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Business Address
            </label>
            <input
              type="text"
              value={settings.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Website Logo Customizer */}
        <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.06] space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Website Official Logo (ওয়েবসাইট লোগো পরিবর্তন)</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Upload your brand's official logo or provide an image link. This logo will automatically update on the Header, Footer, Order Invoices, and Admin Console.
              </p>
            </div>
            {settings.logoUrl && settings.logoUrl !== '/logo.png' && (
              <button
                type="button"
                onClick={() => handleChange('logoUrl', '/logo.png')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 self-start sm:self-auto bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default R Mart Logo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Upload Field */}
            <div className="space-y-3">
              <label className="block font-semibold text-slate-300">
                Upload Logo Image / Paste URL
              </label>
              <ImageUploadField
                label="Store Logo"
                value={settings.logoUrl || '/logo.png'}
                onChange={(url) => handleChange('logoUrl', url)}
                helperText="Recommended: Transparent PNG or crisp SVG/JPG (square or horizontal layout, at least 250x250px)"
              />
            </div>

            {/* Live Dual Preview */}
            <div className="space-y-3">
              <span className="block font-semibold text-slate-300">
                Logo Display Live Preview
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* On White Background */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-2 flex flex-col items-center justify-center min-h-[140px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    On White (Header / Invoice)
                  </span>
                  <div className="w-full flex items-center justify-center p-2">
                    <img
                      src={settings.logoUrl || '/logo.png'}
                      alt="Logo preview"
                      className="max-h-14 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>
                </div>

                {/* On Dark Background */}
                <div className="p-4 rounded-2xl bg-[#070A0D] border border-white/10 text-center space-y-2 flex flex-col items-center justify-center min-h-[140px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    On Dark (Footer / Admin)
                  </span>
                  <div className="w-full flex items-center justify-center p-2">
                    <img
                      src={settings.logoUrl || '/logo.png'}
                      alt="Logo dark preview"
                      className="max-h-14 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Notification Email Configuration */}
        <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.06] space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Order Email Notification Settings (অর্ডার নোটিফিকেশন ইমেইল)</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Configure which email address receives automatic notifications with complete order, customer, and shipping details when an order is placed.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendTestNotification}
              disabled={testSending}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testSending ? 'Sending Test...' : 'Send Test Order Email'}</span>
            </button>
          </div>

          {testSentMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testSentMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">
                  Primary Notification Email * (যে ইমেইলে অর্ডারের মেইল যাবে)
                </label>
                {user?.email && (
                  <button
                    type="button"
                    onClick={() => handleChange('orderNotificationEmail', user.email)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 underline"
                  >
                    Use my email ({user.email})
                  </button>
                )}
              </div>
              <input
                type="email"
                required
                value={settings.orderNotificationEmail || settings.email || ''}
                onChange={(e) => handleChange('orderNotificationEmail', e.target.value)}
                placeholder="e.g. ahmedskkawsar43@gmail.com"
                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                All order details, item breakdown, customer phone & address will be sent to this email.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Secondary / CC Notification Email (Optional)
              </label>
              <input
                type="email"
                value={settings.orderNotificationEmailCc || ''}
                onChange={(e) => handleChange('orderNotificationEmailCc', e.target.value)}
                placeholder="e.g. warehouse@rmart.shop"
                className="w-full h-10 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Optional copy for fulfillment manager, partner, or backup inbox.
              </span>
            </div>
          </div>

          {/* Interactive SMTP Server Credentials */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Custom SMTP Server Setup (For Gmail App Password or cPanel Webmail)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Set custom host &amp; credentials directly in the database. Defaults to Gmail SMTP if left blank.
                </p>
              </div>

              {/* Quick One-Click Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => applySmtpPreset('gmail')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold transition-colors"
                >
                  Gmail (587)
                </button>
                <button
                  type="button"
                  onClick={() => applySmtpPreset('cpanel')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold transition-colors"
                >
                  cPanel (465 SSL)
                </button>
                <button
                  type="button"
                  onClick={() => applySmtpPreset('outlook')}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold transition-colors"
                >
                  Outlook (587)
                </button>
              </div>
            </div>

            {/* Test Result Banner */}
            {smtpTestResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  smtpTestResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {smtpTestResult.success ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">
                    {smtpTestResult.success
                      ? 'SMTP Connection Verified!'
                      : 'SMTP Connection Failed'}
                  </div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    {smtpTestResult.message || smtpTestResult.error}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.smtpHost || ''}
                  onChange={(e) => handleChange('smtpHost', e.target.value)}
                  placeholder="e.g. smtp.gmail.com"
                  className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.smtpPort || 587}
                  onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                  placeholder="587 or 465"
                  className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  SMTP Username / Email
                </label>
                <input
                  type="text"
                  value={settings.smtpUser || ''}
                  onChange={(e) => handleChange('smtpUser', e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  SMTP Password / App Password
                </label>
                <div className="relative">
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    value={settings.smtpPass || ''}
                    onChange={(e) => handleChange('smtpPass', e.target.value)}
                    placeholder="16-character App Password"
                    className="w-full h-8 pl-2.5 pr-8 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  value={settings.smtpSenderName || ''}
                  onChange={(e) => handleChange('smtpSenderName', e.target.value)}
                  placeholder="e.g. R Mart Official Store"
                  className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Dedicated From Email (Optional)
                </label>
                <input
                  type="email"
                  value={settings.smtpSenderEmail || ''}
                  onChange={(e) => handleChange('smtpSenderEmail', e.target.value)}
                  placeholder="e.g. noreply@rmartofficial.shop (defaults to username)"
                  className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Test Dispatcher Row */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 max-w-md">
                <label className="block text-[10px] text-slate-400 mb-1">
                  Test Email Recipient (টেস্ট ইমেইল কোন ঠিকানায় পাঠাবেন):
                </label>
                <input
                  type="email"
                  value={testRecipientEmail || ''}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  placeholder={settings.orderNotificationEmail || settings.email || user?.email || 'admin@example.com'}
                  className="w-full h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="button"
                onClick={handleTestSmtpConnection}
                disabled={smtpTesting}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95 shrink-0 self-start sm:self-end"
              >
                {smtpTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{smtpTesting ? 'Testing & Sending...' : '⚡ Test SMTP Server & Send Email'}</span>
              </button>
            </div>
          </div>

          {/* Real SMTP Instructions Box */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span>🔑 Gmail SMTP Configuration Guide (For Real Email &amp; OTP Delivery)</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Google requires a 16-character <strong>Google App Password</strong> to dispatch automated OTPs, order receipts, and AI product launch campaigns through Gmail.
            </p>
            <div className="p-3 bg-black/40 rounded-xl font-mono text-[11px] text-slate-300 space-y-1">
              <p>1. Go to Google Account &gt; Security (myaccount.google.com/security)</p>
              <p>2. Ensure 2-Step Verification is turned ON</p>
              <p>3. Go to &quot;App Passwords&quot; (myaccount.google.com/apppasswords)</p>
              <p>4. Generate an app password for &quot;R Mart&quot;</p>
              <p>5. Paste the 16-character password in the SMTP Password field above or into .env</p>
            </div>
          </div>

          {/* Anti-Spam & Primary Inbox Deliverability Card */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Primary Inbox Deliverability Guide (ইমেইল স্প্যামে যাওয়া রোধ করার উপায়)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                CAN-SPAM & RFC 8058 READY
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              গুগল (Gmail) ও ইয়াহু (Yahoo) ২০২৪ সালের নতুন নিরাপত্তা নিয়ম অনুযায়ী যেসকল ইমেইলে সঠিক <strong>SPF</strong>, <strong>DKIM</strong>, <strong>DMARC</strong> রেকর্ড থাকে না অথবা যেগুলোতে <strong>One-Click Unsubscribe</strong> হেডার থাকে না, সেগুলোকে সরাসরি Spam ফোল্ডারে পাঠিয়ে দেয়। R Mart-এর ইমেইল ইঞ্জিন এখন স্বয়ংক্রিয়ভাবে ইনবক্স অপটিমাইজড।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-black/40 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-emerald-400">1. SPF DNS Record (TXT):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('v=spf1 include:_spf.google.com ~all', 'spf')}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'spf' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'spf' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-1.5 rounded bg-white/5 text-slate-300 select-all overflow-x-auto text-[10px]">
                  v=spf1 include:_spf.google.com ~all
                </div>
                <span className="text-[10px] text-slate-500 block">cPanel ডোমেইন DNS Zone-এ Host: @ দিয়ে TXT রেকর্ড যোগ করুন।</span>
              </div>

              <div className="p-3 bg-black/40 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-bold text-emerald-400">2. DMARC DNS Record (TXT):</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('v=DMARC1; p=none; sp=none;', 'dmarc')}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'dmarc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'dmarc' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-1.5 rounded bg-white/5 text-slate-300 select-all overflow-x-auto text-[10px]">
                  v=DMARC1; p=none; sp=none;
                </div>
                <span className="text-[10px] text-slate-500 block">Host: _dmarc দিয়ে TXT রেকর্ড হিসেবে সেভ করুন।</span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400 space-y-1">
              <p>✓ <strong>From Header Alignment:</strong> আপনার প্রেরিত ইমেইল ফ্রম অ্যাড্রেসের সাথে অনুমোদিত SMTP ইউজার হুবহু মিল রেখে পাঠানো হয়।</p>
              <p>✓ <strong>RFC 8058 One-Click Unsubscribe:</strong> জিমেইল ও ইয়াহু ইনবক্সের উপরে ও নিচে ক্লিকযোগ্য আনসাবস্ক্রাইব বোতাম যুক্ত থাকে।</p>
              <p>✓ <strong>MIME Multipart (HTML + Plain Text):</strong> স্প্যাম স্কোর কমাতে প্লেইন টেক্সট ও অফিসিয়াল বিজনেস অ্যাড্রেস যুক্ত থাকে।</p>
            </div>
          </div>

          {/* Preferences checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.06]">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
              <input
                type="checkbox"
                checked={settings.notifyAdminOnNewOrder !== false}
                onChange={(e) => handleChange('notifyAdminOnNewOrder', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-white/10 border-white/20 mt-0.5"
              />
              <span className="text-slate-300 text-xs">
                Send instant notification to store admin for every new customer order
              </span>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-colors">
              <input
                type="checkbox"
                checked={settings.notifyCustomerOnOrder !== false}
                onChange={(e) => handleChange('notifyCustomerOnOrder', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-white/10 border-white/20 mt-0.5"
              />
              <span className="text-slate-300 text-xs">
                Send order confirmation email copy to customer's email address
              </span>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 cursor-pointer hover:bg-emerald-500/20 transition-colors">
              <input
                type="checkbox"
                checked={!!settings.autoBroadcastNewProducts}
                onChange={(e) => handleChange('autoBroadcastNewProducts', e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-white/10 border-white/20 mt-0.5"
              />
              <div>
                <span className="text-emerald-300 text-xs font-semibold block">
                  Auto-Broadcast New Products
                </span>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  Automatically email all users with product links and AI copy whenever a new product is published
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* UI Style & Layout Selection (Daraz / Amazon / Aesthetic) */}
        <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.06] space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>Storefront UI Layout Style (Daraz / Amazon / Aesthetic)</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Switch the customer homepage and storefront layout between 3 professional e-commerce styles.
              </p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold self-start sm:self-auto uppercase">
              Active: {settings.uiStyle || 'marketplace'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* Style 1: Daraz / Alibaba Mega Marketplace */}
            <div
              onClick={() => handleChange('uiStyle', 'marketplace')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                (settings.uiStyle || 'marketplace') === 'marketplace'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Daraz / Alibaba Marketplace</span>
                {(settings.uiStyle || 'marketplace') === 'marketplace' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                High-density marketplace featuring side category directory, countdown flash sale ticker, rapid discount cards, and courier trust strip.
              </p>
            </div>

            {/* Style 2: Amazon / Flipkart Clean Compact */}
            <div
              onClick={() => handleChange('uiStyle', 'compact')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                settings.uiStyle === 'compact'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Amazon / Flipkart Grid</span>
                {settings.uiStyle === 'compact' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Card-centric departmental showcases ("Top Deals in Fashion", "Up to 60% off Electronics"), prime-speed delivery badges, and bank offers.
              </p>
            </div>

            {/* Style 3: Modern Aesthetic Boutique */}
            <div
              onClick={() => handleChange('uiStyle', 'aesthetic')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                settings.uiStyle === 'aesthetic'
                  ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Minimal Luxury Boutique</span>
                {settings.uiStyle === 'aesthetic' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Airy layout with generous whitespace, subtle hairline dividers, editorial typography, and floating quick-preview details.
              </p>
            </div>
          </div>
        </div>

        {/* Theme Color Settings */}
        <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.06] space-y-5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>Website Theme & Accent Color (Red Theme Available)</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Admin-controlled website palette. The chosen theme color applies consistently across all buttons, badges, highlights, and active elements.
              </p>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-semibold self-start sm:self-auto">
              Current: {(settings.themeName || 'EMERALD').toUpperCase()}
            </span>
          </div>

          {/* Color Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected =
                (settings.themeName || 'emerald') === preset.id ||
                settings.themeColor === preset.hex;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    handleChange('themeName', preset.id);
                    handleChange('themeColor', preset.hex);
                    applyThemeToDom(preset.id);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-white/40 bg-white/[0.08] ring-2 ring-white/20'
                      : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="w-6 h-6 rounded-full shadow-lg border border-white/20 flex items-center justify-center shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </span>
                    {preset.isRed && (
                      <span className="text-[9px] bg-red-500/20 text-red-300 font-bold px-1.5 py-0.5 rounded">
                        Red Option
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-white text-[11px] truncate">{preset.name}</div>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    {preset.hex}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-semibold">Theme Live Preview:</span>
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-slate-950 font-bold text-xs shadow-md transition-all"
                style={{ backgroundColor: settings.themeColor || '#10B981' }}
              >
                Primary Button
              </button>
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-bold border"
                style={{
                  color: settings.themeColor || '#10B981',
                  borderColor: `${settings.themeColor || '#10B981'}40`,
                  backgroundColor: `${settings.themeColor || '#10B981'}15`,
                }}
              >
                Active Badge
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-[11px]">Custom Hex Color:</label>
              <input
                type="text"
                value={settings.themeColor || '#10B981'}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange('themeColor', val);
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    handleChange('themeName', 'custom');
                    applyThemeToDom(val);
                  }
                }}
                placeholder="#EF4444"
                className="w-24 h-8 px-2.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-white"
              />
              <input
                type="color"
                value={settings.themeColor?.startsWith('#') ? settings.themeColor : '#10B981'}
                onChange={(e) => {
                  handleChange('themeColor', e.target.value);
                  handleChange('themeName', 'custom');
                  applyThemeToDom(e.target.value);
                }}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                title="Pick Custom Color"
              />
            </div>
          </div>
        </div>

        {/* Currency & Thresholds */}
        <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.06] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            Currency & Checkout Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currencySymbol || '৳'}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Currency Code
              </label>
              <input
                type="text"
                value={settings.currencyCode || 'BDT'}
                onChange={(e) => handleChange('currencyCode', e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Free Delivery Spend (৳)
              </label>
              <input
                type="number"
                value={settings.freeDeliveryThreshold ?? 2500}
                onChange={(e) => handleChange('freeDeliveryThreshold', Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="p-6 rounded-3xl bg-[#0F141A] border border-white/[0.06] space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
            Top Announcement Bar
          </h3>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Ticker Announcement Message
            </label>
            <input
              type="text"
              value={settings.announcementBarText || ''}
              onChange={(e) => handleChange('announcementBarText', e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="annBar"
              checked={!!settings.announcementBarActive}
              onChange={(e) => handleChange('announcementBarActive', e.target.checked)}
              className="w-4 h-4 text-emerald-500 rounded"
            />
            <label htmlFor="annBar" className="text-slate-300 cursor-pointer">
              Enable Announcement Bar at top of customer website
            </label>
          </div>
        </div>

        {/* Security PIN & Store Reset Management Section */}
        <div className="p-6 rounded-3xl bg-[#0F141A] border border-rose-500/20 space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Security PIN & Dashboard Reset (অ্যাডমিন সিকিউরিটি পিন ও ডেটা রিসেট)</span>
              </h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Manage the Admin Security PIN required to reset dashboard revenue, total orders, and order history back to 0.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 font-bold">
                PIN PROTECTED
              </span>
            </div>
          </div>

          {/* Change PIN Form */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
            <h4 className="font-bold text-slate-200 text-xs flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Admin Reset PIN (নতুন সিকিউরিটি পিন সেট করুন)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Default system PIN is <code className="text-emerald-400 bg-white/5 px-1 py-0.5 rounded font-mono font-bold">1234</code>. You can update this PIN below anytime.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Current PIN (বর্তমান পিন)
                </label>
                <input
                  type="password"
                  maxLength={8}
                  placeholder="e.g. 1234"
                  value={currentPinInput || ''}
                  onChange={(e) => setCurrentPinInput(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-center tracking-widest focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  New Security PIN (নতুন ৪-৮ ডিজিটের পিন) *
                </label>
                <input
                  type="password"
                  maxLength={8}
                  placeholder="••••"
                  value={newPinInput || ''}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono text-center tracking-widest focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {pinChangeMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  pinChangeMsg.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                {pinChangeMsg.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{pinChangeMsg.text}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleUpdatePin}
              disabled={pinChanging || !newPinInput}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{pinChanging ? 'Updating PIN...' : 'Save New Security PIN'}</span>
            </button>
          </div>

          {/* Danger Zone: Reset Orders & Analytics */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Reset Store Analytics & Orders to 0 (ড্যাশবোর্ড ও অর্ডার রিসেট)</span>
              </span>
              <p className="text-[11px] text-slate-400 max-w-xl">
                Reset total revenue to ৳0, total order count to 0, and wipe all order histories. Requires Admin Security PIN.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setResetModalOpen(true);
                setResetInputPin('');
                setResetStatus(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Store Data (০ করুন)</span>
            </button>
          </div>
        </div>

        {/* Sticky/Bottom Save Bar */}
        <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-[#0F141A]/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Save Site Configuration &amp; Contact Info</p>
              <p className="text-[11px] text-slate-400">Updates will reflect immediately on customer storefront and homepage</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {savedMessage && (
              <span className="text-xs font-bold text-emerald-400 animate-pulse">
                ✅ {savedMessage}
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : saved ? 'Saved & Live!' : 'Save Store Settings (পরিবর্তন সেভ করুন)'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Store Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0F141A] border border-rose-500/40 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Confirm Store Analytics Reset
                </h3>
                <p className="text-xs text-rose-400 font-semibold">
                  Are you sure you want to reset everything to 0?
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-slate-300 space-y-2">
              <p>
                <strong>সাবধান:</strong> এটি নিশ্চিত করলে আপনার স্টোরের <strong>টোটাল রেভিনিউ ৳০</strong> হবে, <strong>অর্ডার সংখ্যা ০</strong> হবে এবং পূর্ববর্তী <strong>সকল অর্ডার হিস্টোরি মুছে যাবে</strong>।
              </p>
              <p className="text-[11px] text-slate-400">
                এই প্রক্রিয়াটি অপরিবর্তনীয় (Irreversible)। এগিয়ে যেতে আপনার অ্যাডমিন সিকিউরিটি পিন দিন।
              </p>
            </div>

            <form onSubmit={handleResetStore} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Enter Admin Security PIN (সিকিউরিটি পিন দিন) *
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  maxLength={8}
                  placeholder="••••"
                  value={resetInputPin || ''}
                  onChange={(e) => setResetInputPin(e.target.value)}
                  className="w-full h-11 px-4 text-center font-mono text-xl font-bold tracking-widest rounded-xl bg-white/[0.04] border border-white/20 text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                />
                <span className="text-[10px] text-slate-500 block text-center mt-1">
                  Default PIN is 1234 (যদি পরিবর্তন না করে থাকেন)
                </span>
              </div>

              {resetStatus && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    resetStatus.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {resetStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{resetStatus.text}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetModalOpen(false);
                    setResetInputPin('');
                    setResetStatus(null);
                  }}
                  className="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting || !resetInputPin}
                  className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md active:scale-98 disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{resetting ? 'Resetting...' : 'Verify & Reset to 0'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Smart Paste Firebase Config Snippet Modal */}
      {showSnippetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0F141A] border border-white/10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Smart Paste Firebase Snippet</h3>
                  <p className="text-[11px] text-slate-400">
                    Paste the raw config snippet from Firebase console or .env
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSnippetModal(false);
                  setSnippetFeedback(null);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Paste your firebaseConfig JS object or JSON:
              </label>
              <textarea
                rows={7}
                value={snippetInput || ''}
                onChange={(e) => setSnippetInput(e.target.value)}
                placeholder={`const firebaseConfig = {
  apiKey: "AIzaSyD-...",
  authDomain: "my-app.firebaseapp.com",
  projectId: "my-app",
  storageBucket: "my-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};`}
                className="w-full p-3 font-mono text-[11px] rounded-xl bg-black/50 border border-white/10 text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 block">
                Automatic regex parser will safely extract apiKey, authDomain, projectId, storageBucket, messagingSenderId, and appId.
              </span>
            </div>

            {snippetFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  snippetFeedback.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {snippetFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{snippetFeedback.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSnippetModal(false);
                  setSnippetFeedback(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplySnippet}
                disabled={!snippetInput.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-Extract &amp; Fill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
