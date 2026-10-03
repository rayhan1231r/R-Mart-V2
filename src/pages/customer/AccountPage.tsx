import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Package,
  Clock,
  Phone,
  Mail,
  MapPin,
  LogOut,
  ChevronRight,
  AlertCircle,
  Truck,
  Heart,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  CheckCircle,
  MessageCircle,
  KeyRound,
  ArrowRight,
  RotateCcw,
  Lock,
  Eye,
  EyeOff,
  Trophy,
  Medal,
  Award,
  Crown,
  Edit3,
  Camera,
  Check,
  Shield,
  Star,
  Flame,
  Gift,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  getOrders,
  getCustomers,
  getDeliveredLeaderboard,
  calculateCustomerTier,
  type LeaderboardEntry,
} from '../../lib/store';
import type { Order, Customer } from '../../types';

interface AccountPageProps {
  navigate: (path: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ navigate }) => {
  const {
    user,
    isAdmin,
    loginCustomer,
    loginCustomerWithPhone,
    registerCustomer,
    registerCustomerWithPhone,
    loginWithGoogle,
    sendOtp,
    verifyOtp,
    checkEmailExists,
    resetPasswordWithOtp,
    logout,
    updateUserPhone,
    updateUserProfile,
  } = useAuth();
  const { wishlist } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'leaderboard' | 'tier'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);

  // Profile Edit States
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAltPhone, setEditAltPhone] = useState('');
  const [editStreet, setEditStreet] = useState('');
  const [editDistrict, setEditDistrict] = useState('Dhaka');
  const [editArea, setEditArea] = useState('');
  const [editPostalCode, setEditPostalCode] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Leaderboard States
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'weekly' | 'monthly' | 'lifetime'>('weekly');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Auth form states if not logged in
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Forgot Password flow states
  const [forgotStep, setForgotStep] = useState<'email' | 'verify_and_reset'>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotSuccessNotice, setForgotSuccessNotice] = useState<string | null>(null);

  // OTP Verification Step State
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [activeTarget, setActiveTarget] = useState('');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [testOtpCode, setTestOtpCode] = useState<string | null>(null);

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Edit phone state
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    if (user) {
      setLoadingOrders(true);
      getOrders(user.uid).then((list) => {
        setOrders(list);
        setLoadingOrders(false);
      });
      setNewPhone(user.phone || '');

      // Load customer profile record for complete profile details
      getCustomers().then((custs) => {
        const found = custs.find(
          (c) =>
            (c.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
            (user.phone && c.phone === user.phone)
        );
        if (found) {
          setCustomerProfile(found);
          setEditName(found.name || user.name || '');
          setEditPhone(found.phone || user.phone || '');
          setEditAltPhone(found.alternativePhone || '');
          setEditStreet(found.streetAddress || found.defaultAddress?.streetAddress || '');
          setEditDistrict(found.district || found.defaultAddress?.district || 'Dhaka');
          setEditArea(found.upazilaOrArea || found.defaultAddress?.upazilaOrArea || '');
          setEditPostalCode(found.postalCode || found.defaultAddress?.postalCode || '');
          setEditBio(found.bio || '');
          setEditDob(found.dateOfBirth || '');
          setEditAvatar(found.avatarUrl || user.avatarUrl || '');
        } else {
          setEditName(user.name || '');
          setEditPhone(user.phone || '');
          setEditAvatar(user.avatarUrl || '');
        }
      });
    }
  }, [user]);

  // Load leaderboard when active tab is leaderboard or period changes
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      setLoadingLeaderboard(true);
      getDeliveredLeaderboard(leaderboardPeriod)
        .then((data) => {
          setLeaderboard(data);
        })
        .finally(() => {
          setLoadingLeaderboard(false);
        });
    }
  }, [activeTab, leaderboardPeriod]);

  const handleSaveFullProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    try {
      const updates: Partial<Customer> = {
        name: editName.trim() || user.name,
        phone: editPhone.trim(),
        alternativePhone: editAltPhone.trim(),
        streetAddress: editStreet.trim(),
        district: editDistrict.trim(),
        upazilaOrArea: editArea.trim(),
        postalCode: editPostalCode.trim(),
        bio: editBio.trim(),
        dateOfBirth: editDob,
        avatarUrl: editAvatar.trim(),
      };

      const res = await updateUserProfile(updates);
      if (res.success) {
        setProfileSuccessMsg('আপনার প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে! (Profile saved successfully)');
        setTimeout(() => setProfileSuccessMsg(null), 4000);
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success) {
        setAuthError(res.error || 'Google Sign-In was cancelled.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendRegistrationOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        const res = await loginCustomer(email, password);
        if (!res.success) setAuthError(res.error || 'Failed to sign in.');
        return;
      }

      // Registration Flow with Email OTP Verification
      if (!name.trim()) {
        setAuthError('Your full name is required.');
        return;
      }

      if (!phone.trim()) {
        setAuthError('Your mobile phone number is required for delivery.');
        return;
      }

      if (!email.trim() || !password.trim()) {
        setAuthError('Please enter a valid email address and password.');
        return;
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }

      const target = email.trim().toLowerCase();

      // Enforce: only one registration per email
      const alreadyRegistered = await checkEmailExists(target);
      if (alreadyRegistered) {
        setAuthError(
          'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা আছে। দয়া করে Sign In করুন অথবা পাসওয়ার্ড ভুলে গেলে Forgot Password ব্যবহার করুন।'
        );
        return;
      }

      setActiveTarget(target);
      const res = await sendOtp(target, name.trim(), 'verification');
      if (res.success) {
        if (!res.smtpConfigured && res.code) {
          setTestOtpCode(res.code);
          setOtpCode(res.code);
          setOtpNotice(
            `⚠️ Live email sending requires GMAIL_APP_PASSWORD in server environment. For development/testing, your 6-digit verification code is: ${res.code} (auto-filled below).`
          );
        } else {
          setTestOtpCode(null);
          setOtpNotice(
            `We have sent a 6-digit verification code to your email (${target}). Please check your inbox or spam folder and enter the code below.`
          );
        }
        setOtpStep(true);
        setResendCooldown(60);
      } else {
        setAuthError('Failed to send verification code to your email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtpAndCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (!otpCode.trim() || otpCode.trim().length < 6) {
        setAuthError('Please enter the complete 6-digit verification code.');
        return;
      }

      const verifyRes = await verifyOtp(activeTarget, otpCode.trim());
      if (!verifyRes.success) {
        setAuthError(verifyRes.error || 'Invalid verification code. Please check your email and try again.');
        return;
      }

      // Verification successful! Finalize account creation
      const createRes = await registerCustomer(email, password, name, phone || '');
      if (!createRes.success) {
        setAuthError(createRes.error || 'Failed to finalize account creation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setForgotSuccessNotice(null);
    setIsSubmitting(true);

    try {
      const target = forgotEmail.trim().toLowerCase();
      if (!target || !target.includes('@')) {
        setAuthError('দয়া করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন। (Please enter a valid email address)');
        return;
      }

      const exists = await checkEmailExists(target);
      if (!exists) {
        setAuthError('এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। সঠিক ইমেইল দিন অথবা নতুন অ্যাকাউন্ট তৈরি করুন।');
        return;
      }

      setActiveTarget(target);
      const res = await sendOtp(target, undefined, 'reset');
      if (res.success) {
        if (!res.smtpConfigured && res.code) {
          setTestOtpCode(res.code);
          setForgotOtp(res.code);
          setOtpNotice(`⚡ Dev Test Mode OTP: ${res.code} (auto-filled).`);
        } else {
          setTestOtpCode(null);
          setOtpNotice(`একটি ৬ ডিজিটের পাসওয়ার্ড রিসেট কোড আপনার ইমেইলে (${target}) পাঠানো হয়েছে।`);
        }
        setForgotStep('verify_and_reset');
        setResendCooldown(60);
      } else {
        setAuthError('পাসওয়ার্ড রিসেট কোড পাঠানো যায়নি। দয়া করে আবার চেষ্টা করুন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);

    try {
      if (!forgotOtp.trim() || forgotOtp.trim().length < 6) {
        setAuthError('দয়া করে ইমেইলে পাঠানো ৬ ডিজিটের সম্পূর্ণ কোডটি লিখুন।');
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        setAuthError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে। (Minimum 6 characters)');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setAuthError('উভয় পাসওয়ার্ড হুবহু একই হতে হবে। (Passwords do not match)');
        return;
      }

      const res = await resetPasswordWithOtp(activeTarget, forgotOtp.trim(), newPassword);
      if (!res.success) {
        setAuthError(res.error || 'পাসওয়ার্ড পরিবর্তন করা যায়নি। কোডটি পুনরায় চেক করুন।');
        return;
      }

      // Success! Prepopulate login fields and navigate to login
      setEmail(activeTarget);
      setPassword(newPassword);
      setForgotSuccessNotice('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! এখন লগইন করুন। (Password reset successfully!)');
      setAuthMode('login');
      setForgotStep('email');
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTestOtpCode(null);
      setAuthError(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setAuthError(null);
    const isReset = authMode === 'forgot_password';
    const res = await sendOtp(activeTarget, isReset ? undefined : name, isReset ? 'reset' : 'verification');
    if (res.success) {
      setResendCooldown(60);
      if (!res.smtpConfigured && res.code) {
        setTestOtpCode(res.code);
        if (isReset) {
          setForgotOtp(res.code);
        } else {
          setOtpCode(res.code);
        }
        setOtpNotice(`Fresh test verification code: ${res.code} (auto-filled).`);
      } else {
        setTestOtpCode(null);
        setOtpNotice(`A fresh verification code has been dispatched to your email: ${activeTarget}.`);
      }
    }
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhone.trim()) {
      updateUserPhone(newPhone.trim());
      setEditingPhone(false);
    }
  };

  // If customer is not authenticated, show sleek Login / Register / Forgot Password view
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
              {authMode === 'forgot_password' ? (
                <KeyRound className="w-7 h-7" />
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <h1 className="text-xl font-bold font-display text-slate-900">
              {authMode === 'login'
                ? 'Customer Sign In'
                : authMode === 'register'
                ? 'Create Customer Account'
                : 'Reset Your Password'}
            </h1>
            <p className="text-xs text-slate-500">
              {authMode === 'forgot_password'
                ? 'Enter your registered email to receive a 6-digit code and set a new password.'
                : 'Access your order history, delivery addresses, and track real shipments across Bangladesh.'}
            </p>
          </div>

          {/* Success notice (e.g. after password reset) */}
          {forgotSuccessNotice && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{forgotSuccessNotice}</span>
            </div>
          )}

          {/* FORGOT PASSWORD FLOW */}
          {authMode === 'forgot_password' ? (
            <div className="space-y-4">
              {forgotStep === 'email' ? (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Registered Email Address *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={forgotEmail || ''}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full h-11 pl-9 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      A 6-digit verification code will be sent to this email address.
                    </span>
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>{isSubmitting ? 'Sending Code...' : 'Send Reset Code (কোড পাঠান)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setAuthError(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      &larr; Remembered your password? Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: ENTER CODE & SET NEW PASSWORD */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Password Reset Code Sent</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {otpNotice || `A 6-digit reset code has been sent to ${activeTarget}.`}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Please check your inbox or spam folder for the verification code.
                    </p>
                  </div>

                  {testOtpCode && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-amber-700 block">
                          ⚡ Dev Test Code:
                        </span>
                        <span className="font-mono text-base font-extrabold tracking-widest text-amber-950">
                          {testOtpCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(testOtpCode)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-all shadow-xs shrink-0"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter 6-Digit Email Code *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotOtp || ''}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full h-11 px-3.5 text-center font-mono text-xl font-bold tracking-widest rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password * (কমপক্ষে ৬ অক্ষর)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={newPassword || ''}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-9 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmNewPassword || ''}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-9 pr-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || forgotOtp.length < 6 || newPassword.length < 6}
                    className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isSubmitting ? 'Updating Password...' : 'Verify Code & Set New Password'}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                      className="font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotStep('email')}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* STANDARD LOGIN / REGISTER FLOW */
            <>
              {/* Mode switch */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setOtpStep(false);
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setOtpStep(false);
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* 1. Direct Google Sign-In Option */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-xs active:scale-98 disabled:opacity-50"
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
                  <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 shrink-0">
                    Or with Email & Password
                  </span>
                </div>
              </div>

              {/* STEP 2: EMAIL OTP VERIFICATION VIEW FOR REGISTRATION */}
              {otpStep ? (
                <form onSubmit={handleVerifyOtpAndCreateAccount} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Email Verification Sent</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {otpNotice || `A 6-digit verification code has been dispatched to your email: ${activeTarget}.`}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Please open your email inbox to find your verification code. If not found in primary inbox, check your <strong>Spam / Junk</strong> folder and click <strong>&quot;Report Not Spam&quot;</strong> so all future emails arrive directly in your primary inbox.
                    </p>
                  </div>

                  {testOtpCode && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-amber-700 block">
                          ⚡ Dev Mode OTP (SMTP Password not in .env):
                        </span>
                        <span className="font-mono text-base font-extrabold tracking-widest text-amber-950">
                          {testOtpCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpCode(testOtpCode)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-all shadow-xs shrink-0"
                      >
                        Auto-Fill Code
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter 6-Digit Email Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode || ''}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full h-12 px-3.5 text-center font-mono text-xl font-bold tracking-widest rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-300 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length < 6}
                    className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isSubmitting ? 'Verifying...' : 'Verify Code & Activate Account'}</span>
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-500">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                      className="font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Email Code'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpStep(false)}
                      className="text-slate-500 hover:text-slate-800"
                    >
                      Change Email
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 1: INITIAL CREDENTIALS FORM */
                <form onSubmit={handleSendRegistrationOtp} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={name || ''}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Tanvir Ahmed"
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone || ''}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01619415744"
                          className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                        />
                      </div>
                    </>
                  )}

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email || ''}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {authMode === 'register' && (
                      <span className="text-[11px] text-slate-400 block mt-1">
                        🔒 Note: One email can only register one account.
                      </span>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password *
                      </label>
                      {authMode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('forgot_password');
                            setForgotStep('email');
                            setForgotEmail(email || '');
                            setAuthError(null);
                            setForgotSuccessNotice(null);
                          }}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password || ''}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full h-11 pl-3.5 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1.5 bg-rose-50 p-3 rounded-xl border border-rose-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <span>
                      {isSubmitting
                        ? 'Processing...'
                        : authMode === 'login'
                        ? 'Sign In to Account'
                        : 'Create Account & Send Code'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  const userDeliveredOrders = orders.filter((o) => o.orderStatus === 'delivered');
  const userTotalDeliveredSpent = userDeliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const effectiveSpent = userTotalDeliveredSpent || customerProfile?.totalSpent || 0;
  const tierInfo = calculateCustomerTier(effectiveSpent);
  const loyaltyPoints = Math.floor(effectiveSpent / 10);

  // My current standing in the leaderboard
  const myRankEntry = leaderboard.find(
    (l) =>
      l.customerId === user?.uid ||
      (l.email && l.email.toLowerCase() === user?.email.toLowerCase()) ||
      (user?.phone && l.phoneMasked.includes(user.phone.slice(-3)))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      {/* Top Banner with Professional Profile Info & VIP Tier Badge */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Avatar with Tier Ring */}
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-500/30 flex items-center justify-center font-display font-extrabold text-2xl shadow-xs shrink-0">
                {user.avatarUrl || customerProfile?.avatarUrl ? (
                  <img
                    src={user.avatarUrl || customerProfile?.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold shadow-xs uppercase tracking-wider text-white bg-slate-900 border border-white">
                {tierInfo.tier}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${tierInfo.badgeColor}`}>
                  {tierInfo.label}
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              {user.phone && <p className="text-xs text-slate-600 font-mono mt-0.5">{user.phone}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => navigate('/wishlist')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Wishlist ({wishlist.length})</span>
            </button>

            <button
              onClick={() => logout()}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-600 border border-rose-200 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Level Progress Strip & Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Progress to Next Level */}
          <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Tier Standing: <strong className="text-emerald-700">{tierInfo.label}</strong></span>
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {tierInfo.nextTier ? (
                  <>৳{effectiveSpent.toLocaleString()} / ৳{tierInfo.targetAmount.toLocaleString()} to {tierInfo.nextTier}</>
                ) : (
                  <span className="text-amber-600 font-bold">★ Highest VIP Rank Achieved!</span>
                )}
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                style={{ width: `${tierInfo.progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Current Spending: <strong>৳{effectiveSpent.toLocaleString()}</strong></span>
              <button
                onClick={() => setActiveTab('tier')}
                className="text-emerald-700 hover:underline font-semibold"
              >
                View Tier Perks & Rewards &rarr;
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Orders</span>
              <span className="text-base font-mono font-bold text-slate-900">{orders.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Delivered</span>
              <span className="text-base font-mono font-bold text-emerald-700">{userDeliveredOrders.length}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Points</span>
              <span className="text-base font-mono font-bold text-amber-600">{loyaltyPoints}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SPECIAL REQUIREMENT: If Admin logs in, ONLY on their profile is the Admin Panel option shown */}
      {isAdmin && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  R Mart Official Management Console
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                You have administrative clearance. Access order fulfillment, Steadfast & RedX courier dispatch, product catalog, customer management, store themes, and the Admin AI Co-Pilot.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <span>Enter Admin Panel</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-8 text-xs sm:text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile & Details</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`pb-3 font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'leaderboard'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>VIP Leaderboard (সেরা ক্রেতাদের র‍্যাঙ্কিং)</span>
        </button>

        <button
          onClick={() => setActiveTab('tier')}
          className={`pb-3 font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'tier'
              ? 'border-b-2 border-emerald-600 text-emerald-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Member Levels & Perks</span>
        </button>
      </div>

      {/* Tab 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Loading your orders...
            </div>
          ) : orders.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
              {orders.map((o) => (
                <div key={o.id} className="p-5 sm:p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                        {o.orderNumber}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {new Date(o.createdAt).toLocaleString()} · {o.items.length} items · Payment:{' '}
                        <span className="font-semibold text-slate-700 uppercase">{o.paymentMethod}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold capitalize">
                        {o.orderStatus}
                      </span>
                      <span className="font-mono font-extrabold text-slate-900 text-base">
                        ৳{o.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Items miniature */}
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {o.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                        <img
                          src={it.productImage}
                          alt={it.productName}
                          title={it.productName}
                          className="w-12 h-14 rounded-lg object-cover bg-white shrink-0 border border-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.png';
                          }}
                        />
                        <div className="text-xs pr-2">
                          <p className="font-semibold text-slate-800 line-clamp-1 max-w-[140px]">{it.productName}</p>
                          <p className="text-[11px] text-slate-500 font-mono">Qty: {it.quantity} · ৳{it.unitPrice}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 gap-2">
                    <span>
                      Delivery: <strong className="text-slate-800">{o.shippingAddress.upazilaOrArea}, {o.shippingAddress.district}</strong>
                    </span>
                    <button
                      onClick={() =>
                        navigate(`/track-order?orderId=${o.orderNumber}&phone=${o.customerInfo.phone}`)
                      }
                      className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Track Shipment Status →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                Explore our catalog to find top-trending fashion, electronics, and essentials with Cash on Delivery across Bangladesh.
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all"
              >
                Browse Catalog
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Edit Profile & Details (Professional Customer Profile Customizer) */}
      {activeTab === 'profile' && (
        <div className="max-w-3xl p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Customer Profile & Delivery Information
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your contact numbers, address, and profile details for faster checkout.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs">
              {tierInfo.label}
            </span>
          </div>

          <form onSubmit={handleSaveFullProfile} className="space-y-6 text-xs sm:text-sm">
            {/* Avatar Selector */}
            <div className="space-y-3">
              <label className="block font-semibold text-slate-800">
                Choose Profile Avatar or Custom Photo
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
                  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
                ].map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEditAvatar(imgUrl)}
                    className={`w-12 h-12 rounded-2xl overflow-hidden border-2 transition-all ${
                      editAvatar === imgUrl ? 'border-emerald-600 scale-105 shadow-md' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Or paste custom image URL (e.g. https://...)"
                  value={editAvatar || ''}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName || ''}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address (Login ID)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Primary Mobile Phone (ডেলিভারি ফোন) *
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone || ''}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="01711000000"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alternative Phone (বিকল্প/জরুরী নম্বর)
                </label>
                <input
                  type="tel"
                  value={editAltPhone || ''}
                  onChange={(e) => setEditAltPhone(e.target.value)}
                  placeholder="01811000000"
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Location & Address */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-emerald-800">
                Default Shipping Address (ঠিকানা)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    District / City (জেলা)
                  </label>
                  <input
                    type="text"
                    value={editDistrict || 'Dhaka'}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    placeholder="e.g. Dhaka, Chittagong"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Upazila / Area (এলাকা / থানা)
                  </label>
                  <input
                    type="text"
                    value={editArea || ''}
                    onChange={(e) => setEditArea(e.target.value)}
                    placeholder="e.g. Mirpur, Uttara, Dhanmondi"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Postal Code (পোস্ট কোড)
                  </label>
                  <input
                    type="text"
                    value={editPostalCode || ''}
                    onChange={(e) => setEditPostalCode(e.target.value)}
                    placeholder="e.g. 1216"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Street Address (বাসা, রোড, ব্লক / ফ্ল্যাট নম্বর)
                </label>
                <input
                  type="text"
                  value={editStreet || ''}
                  onChange={(e) => setEditStreet(e.target.value)}
                  placeholder="House #12, Road #4, Block C"
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Date of Birth (জন্মদিন - স্পেশাল ভাউচারের জন্য)
                  </label>
                  <input
                    type="date"
                    value={editDob || ''}
                    onChange={(e) => setEditDob(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Special Delivery Note / Instructions
                  </label>
                  <input
                    type="text"
                    value={editBio || ''}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="e.g. Call before arriving, leave with security"
                    className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {profileSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-40 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes (সংরক্ষণ করুন)'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: VIP Leaderboard (Weekly, Monthly, Lifetime for Delivered Orders) */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>R Mart VIP Shoppers Ranking (সেরা ক্রেতাদের তালিকা)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Rankings calculated strictly from completed, successfully <strong>Delivered</strong> orders across Bangladesh.
                </p>
              </div>

              {/* Timeframe Filter Buttons */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setLeaderboardPeriod('weekly')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    leaderboardPeriod === 'weekly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  This Week (সাপ্তাহিক)
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardPeriod('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    leaderboardPeriod === 'monthly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  This Month (মাসিক)
                </button>
                <button
                  type="button"
                  onClick={() => setLeaderboardPeriod('lifetime')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    leaderboardPeriod === 'lifetime'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Lifetime (সর্বকালীন)
                </button>
              </div>
            </div>

            {/* My Position Highlight Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 border border-amber-200 flex items-center justify-center font-black text-lg shadow-xs">
                  {myRankEntry ? `#${myRankEntry.rank}` : '—'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Your Standing ({user.name})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tierInfo.badgeColor}`}>
                      {tierInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {myRankEntry
                      ? `Delivered Spend: ৳${myRankEntry.totalSpent.toLocaleString()} across ${myRankEntry.deliveredOrdersCount} delivered orders.`
                      : 'Complete your first order delivery to earn points and claim a top spot on the leaderboard!'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/shop')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all self-start sm:self-auto shrink-0"
              >
                Shop Now to Rank Up &rarr;
              </button>
            </div>

            {/* Top Shoppers Table */}
            {loadingLeaderboard ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading rankings...
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 text-center">Rank</th>
                      <th className="py-3 px-4">VIP Shopper</th>
                      <th className="py-3 px-4 text-center">Delivered Orders</th>
                      <th className="py-3 px-4 text-center">Loyalty Tier</th>
                      <th className="py-3 px-4 text-right">Total Delivered Spend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderboard.slice(0, 10).map((entry) => {
                      const isMe =
                        entry.customerId === user?.uid ||
                        (entry.email && entry.email.toLowerCase() === user?.email.toLowerCase());

                      return (
                        <tr
                          key={entry.rank}
                          className={`transition-colors ${
                            isMe ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            {entry.rank === 1 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-xs">
                                🥇
                              </span>
                            ) : entry.rank === 2 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow-xs">
                                🥈
                              </span>
                            ) : entry.rank === 3 ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow-xs">
                                🥉
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-slate-600">
                                #{entry.rank}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                                {entry.avatarUrl ? (
                                  <img src={entry.avatarUrl} alt={entry.name} className="w-full h-full object-cover" />
                                ) : (
                                  entry.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {entry.name} {isMe && <span className="text-[10px] text-emerald-700 font-bold">(You)</span>}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {entry.phoneMasked}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-bold">
                              {entry.deliveredOrdersCount}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${entry.tierColor}`}>
                              {entry.tierLabel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                            ৳{entry.totalSpent.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                <p className="font-bold text-slate-700">No Delivered Orders Recorded Yet for this Period</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  When orders are dispatched and marked "Delivered", top spenders will appear here in the ranking.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Member Levels & Perks (Loyalty Tier System) */}
      {activeTab === 'tier' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>R Mart Member Tiers & Exclusive Privileges</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unlock higher discount vouchers, free delivery thresholds, and VIP services as your delivered order volume increases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Bronze */}
            <div className={`p-5 rounded-2xl border transition-all ${
              tierInfo.tier === 'bronze' ? 'border-amber-700/60 bg-amber-50/30 ring-2 ring-amber-700/20' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">🥉 Bronze Member</span>
                {tierInfo.tier === 'bronze' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-800 text-white text-[10px] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500 block mb-3">৳0 – ৳5,000 Spend</span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Cash on Delivery Nationwide</li>
                <li>7-Day Easy Return & Exchange</li>
                <li>Order Tracking on Website</li>
              </ul>
            </div>

            {/* Silver */}
            <div className={`p-5 rounded-2xl border transition-all ${
              tierInfo.tier === 'silver' ? 'border-slate-400 bg-slate-50 ring-2 ring-slate-300' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">🥈 Silver Member</span>
                {tierInfo.tier === 'silver' && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-700 text-white text-[10px] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500 block mb-3">৳5,001 – ৳15,000 Spend</span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Welcome Silver Voucher ৳150 Off</li>
                <li>SMS / WhatsApp Dispatch Alerts</li>
                <li>Priority Customer Helpline Support</li>
              </ul>
            </div>

            {/* Gold */}
            <div className={`p-5 rounded-2xl border transition-all ${
              tierInfo.tier === 'gold' ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-400/40' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">🥇 Gold Elite VIP</span>
                {tierInfo.tier === 'gold' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500 block mb-3">৳15,001 – ৳40,000 Spend</span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>5% Special Member Discount Code</li>
                <li>Free Shipping on orders above ৳2,000</li>
                <li>Early Access to Flash Sales & New Arrivals</li>
              </ul>
            </div>

            {/* Platinum */}
            <div className={`p-5 rounded-2xl border transition-all ${
              tierInfo.tier === 'platinum' ? 'border-purple-400 bg-purple-50/40 ring-2 ring-purple-400/40' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">💎 Platinum Royal</span>
                {tierInfo.tier === 'platinum' && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold text-[10px]">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500 block mb-3">৳40,001 – ৳100,000 Spend</span>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>Free Delivery on orders above ৳1,500</li>
                <li>7% Member Voucher Discounts</li>
                <li>Priority Same-Day Warehouse Dispatch</li>
              </ul>
            </div>

            {/* Diamond */}
            <div className={`p-5 rounded-2xl border transition-all md:col-span-2 lg:col-span-2 ${
              tierInfo.tier === 'diamond' ? 'border-cyan-500 bg-cyan-50/40 ring-2 ring-cyan-500/40' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-900">👑 Diamond VIP King</span>
                {tierInfo.tier === 'diamond' && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-600 text-white font-bold text-[10px]">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500 block mb-3">৳100,000+ Lifetime Spend</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Dedicated VIP Concierge Hotline Manager</li>
                  <li>Free Nationwide Delivery on ALL orders (Zero Fee)</li>
                </ul>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>10% Lifetime VIP Cash Discount</li>
                  <li>Special Annual Birthday Surprise Gift Box</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
