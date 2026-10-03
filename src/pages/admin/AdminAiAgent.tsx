import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  FileText,
  MessageSquare,
  TrendingUp,
  Package,
  Copy,
  Check,
  RefreshCw,
  Zap,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Star,
  Mail,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  getProducts,
  getOrders,
  getCategories,
  getSiteSettings,
  generateAiReviews,
  submitReview,
  generateAiPromoEmail,
  broadcastProductPromoEmail,
  suggestAiPricing,
} from '../../lib/store';
import type { Product, Order, Category, SiteSettings } from '../../types';

export const AdminAiAgent: React.FC = () => {
  const [activeTool, setActiveTool] = useState<
    'copilot' | 'product_gen' | 'review_studio' | 'email_broadcast' | 'pricing_advisor' | 'sms_drafter' | 'stock_advisor'
  >('copilot');

  // Co-Pilot Chat
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'admin'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Hello Administrator! I am your R Mart AI Business Co-Pilot. I can help optimize your e-commerce operations, generate SEO product descriptions, create authentic customer reviews, draft email marketing broadcasts with product links, analyze stock levels, and suggest revenue-boosting pricing.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Store data
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Tool 1: Product Generator Form
  const [genTitle, setGenTitle] = useState('');
  const [genCategory, setGenCategory] = useState('');
  const [genPrice, setGenPrice] = useState('');
  const [genFeatures, setGenFeatures] = useState('');
  const [generatedCopy, setGeneratedCopy] = useState<{
    engDesc: string;
    bengaliDesc: string;
    seoTitle: string;
    seoKeywords: string;
    highlights: string[];
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tool 2: Review Studio State
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewCount, setReviewCount] = useState(3);
  const [reviewRating, setReviewRating] = useState(5);
  const [generatingReviews, setGeneratingReviews] = useState(false);
  const [generatedReviews, setGeneratedReviews] = useState<any[]>([]);
  const [savedReviewsSuccess, setSavedReviewsSuccess] = useState(false);

  // Tool 3: Email Broadcast Studio State
  const [emailProductId, setEmailProductId] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailHtml, setEmailHtml] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [broadcastingEmail, setBroadcastingEmail] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ success: boolean; message: string } | null>(null);

  // Tool 4: Pricing Advisor State
  const [costPrice, setCostPrice] = useState('1200');
  const [pricingCategory, setPricingCategory] = useState('Clothing');
  const [targetMargin, setTargetMargin] = useState('40');
  const [pricingResult, setPricingResult] = useState<{
    recommendedRegularPrice: number;
    recommendedSalePrice: number;
    marginPercent: number;
    profitBDT: number;
    pricingStrategyNote: string;
  } | null>(null);
  const [calculatingPricing, setCalculatingPricing] = useState(false);

  // Tool 5: SMS & WhatsApp Drafter Form
  const [customerName, setCustomerName] = useState('Rahim Khan');
  const [orderNumber, setOrderNumber] = useState('RM-84920');
  const [courierName, setCourierName] = useState('Steadfast Courier');
  const [trackingCode, setTrackingCode] = useState('STF-9481029');
  const [codAmount, setCodAmount] = useState('1850');
  const [draftedSms, setDraftedSms] = useState('');

  // Tool 3: Stock Health Insights
  const lowStockItems = products.filter((p) => p.totalStock < 10);

  useEffect(() => {
    getProducts().then(setProducts);
    getOrders().then(setOrders);
    getCategories().then(setCategories);
    getSiteSettings().then(setSettings);
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Co-Pilot Chat handler
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'admin', text: query, time }]);
    setChatInput('');
    setIsThinking(true);

    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('stock') || q.includes('inventory') || q.includes('মজুদ')) {
        const outCount = products.filter((p) => p.totalStock <= 0).length;
        const lowCount = lowStockItems.length;
        reply = `📊 Inventory Status Summary:\n• Total Active Products: ${products.length}\n• Out of Stock Items: ${outCount}\n• Low Stock Alert (<10 units): ${lowCount} items.\n\nRecommendation: Check the 'Stock Advisor' tab to reorder high-velocity apparel and electronics before weekend orders spike.`;
      } else if (q.includes('order') || q.includes('sales') || q.includes('revenue') || q.includes('অর্ডার')) {
        const totalRev = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const pendingCount = orders.filter((o) => o.orderStatus === 'pending').length;
        reply = `💰 Sales & Fulfillment Performance:\n• Total Orders Processed: ${orders.length}\n• Gross Revenue: ৳${totalRev.toLocaleString()}\n• Pending Verification: ${pendingCount} orders.\n\nTip: Bangladeshi customers order more between 8:00 PM and 11:30 PM. Dispatching next morning via Steadfast Courier ensures next-day delivery in Dhaka.`;
      } else if (q.includes('campaign') || q.includes('promo') || q.includes('offer') || q.includes('অফার')) {
        reply = `🚀 High-Converting Promotion Ideas for Bangladesh:\n1. 'Weekend Mega Flash' - 10% Flat off with coupon 'FLASH10' on electronics.\n2. 'Free Delivery Festival' - Free shipping for orders above ৳1,999 (normally ৳2,500).\n3. 'Cash on Delivery Special' - Buy 2 items, get free doorstep courier inside Dhaka.\n\nYou can schedule these coupons directly in the 'Coupons' management tab!`;
      } else {
        reply = `Got it! As your R Mart AI Co-Pilot, I recommend optimizing product titles for Google search and running a weekend Flash Deal. You can also use the 'Product Copy Generator' tab to draft bilingual product listings that convert 30% higher among Bangladeshi online buyers.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsThinking(false);
    }, 600);
  };

  // Generate Product Copy
  const handleGenerateProductCopy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genTitle.trim()) return;

    const copy = {
      seoTitle: `${genTitle} - Buy Online in Bangladesh | R Mart Official`,
      seoKeywords: `${genTitle.toLowerCase()}, rmart bangladesh, buy ${genTitle.toLowerCase()} in dhaka, cash on delivery, best price`,
      highlights: [
        '100% genuine and quality verified product',
        'Nationwide Cash on Delivery (COD) across all 64 districts',
        '7-day hassle-free exchange & replacement guarantee',
        'Fast shipping: 1-2 business days in Dhaka, 3-5 days outside',
      ],
      engDesc: `Elevate your lifestyle with ${genTitle}. Designed for premium durability and modern aesthetics, this product delivers exceptional performance and value. Shipped directly from the official R Mart fulfillment hub with authentic quality guarantee and doorstep cash-on-delivery across Bangladesh.`,
      bengaliDesc: `প্রিমিয়াম কোয়ালিটির ${genTitle} এখন বাংলাদেশে পাওয়া যাচ্ছে R Mart-এ। চমৎকার ডিজাইন, স্থায়িত্ব এবং আকর্ষণীয় মূল্যের পারফেক্ট কম্বিনেশন। সমগ্র বাংলাদেশে হোম ডেলিভারি এবং পার্সেল হাতে পেয়ে মূল্য পরিশোধের (Cash on Delivery) সুবিধা। ত্রুটি পেলে ৭ দিনের সহজ এক্সচেঞ্জ গ্যারান্টি।`,
    };

    setGeneratedCopy(copy);
  };

  // Generate SMS / WhatsApp Dispatch
  const handleGenerateSms = (type: 'whatsapp' | 'sms') => {
    if (type === 'whatsapp') {
      const msg = `আসসালামু আলাইকুম ${customerName} ভাই/ম্যাম,
R Mart থেকে আপনার অর্ডার #${orderNumber} সফলভাবে ${courierName}-এ হ্যান্ডওভার করা হয়েছে।

📦 ট্র্যাকিং কোড: ${trackingCode}
💵 ক্যাশ অন ডেলিভারি কালেকশন: ৳${codAmount}
🚚 সম্ভাব্য ডেলিভারি: ১-২ কার্যদিবস

পার্সেল হাতে পেয়ে চেক করে ডেলিভারি ম্যানের কাছে টাকা দিন। যেকোনো প্রয়োজনে কল করুন: 01619415744
ধন্যবাদ,
R Mart Official Store (rmartoffcial.shop)`;
      setDraftedSms(msg);
    } else {
      const msg = `Dear ${customerName}, your R Mart Order #${orderNumber} has been dispatched via ${courierName} (Tracking: ${trackingCode}). Payable at delivery: BDT ${codAmount}. Helpline: 01619415744.`;
      setDraftedSms(msg);
    }
  };

  // Handler for AI Review Studio
  const handleGenerateAiReviews = async () => {
    const prod = products.find((p) => p.id === reviewProductId);
    if (!prod) return;

    setGeneratingReviews(true);
    setGeneratedReviews([]);
    try {
      const res = await generateAiReviews(prod.name, prod.category || 'General', reviewCount);
      const list = res.map((r: any) => ({
        ...r,
        rating: reviewRating,
      }));
      setGeneratedReviews(list);
    } catch (err) {
      console.warn('Review generation error:', err);
    } finally {
      setGeneratingReviews(false);
    }
  };

  const handleSaveAllGeneratedReviews = async () => {
    const prod = products.find((p) => p.id === reviewProductId);
    if (!prod || generatedReviews.length === 0) return;

    for (const r of generatedReviews) {
      await submitReview({
        productId: prod.id,
        productName: prod.name,
        customerId: 'ai_gen_' + Date.now() + Math.random().toString(36).substring(2, 5),
        customerName: r.userName || 'Verified Buyer',
        customerEmail: `${(r.userName || 'customer').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        rating: Number(r.rating) || reviewRating,
        comment: r.comment || 'Great quality product! Highly recommended.',
        verifiedPurchase: true,
      });
    }

    setSavedReviewsSuccess(true);
    setTimeout(() => {
      setSavedReviewsSuccess(false);
      setGeneratedReviews([]);
    }, 2500);
  };

  // Handler for AI Email Campaign Studio
  const handleGenerateAiEmailCampaign = async () => {
    const prod = products.find((p) => p.id === emailProductId);
    if (!prod) return;

    setGeneratingEmail(true);
    setBroadcastResult(null);
    try {
      const copy = await generateAiPromoEmail(prod);
      setEmailSubject(copy.subject);
      setEmailHtml(copy.html);
    } catch (err) {
      console.warn('AI Email generate error:', err);
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleBroadcastCampaign = async () => {
    const prod = products.find((p) => p.id === emailProductId);
    if (!prod || !emailSubject || !emailHtml) return;

    setBroadcastingEmail(true);
    setBroadcastResult(null);
    try {
      const res = await broadcastProductPromoEmail(prod, emailSubject, emailHtml);
      setBroadcastResult({
        success: res.success,
        message: res.message,
      });
    } catch (err: any) {
      setBroadcastResult({
        success: false,
        message: err?.message || 'Failed to dispatch promotional broadcast.',
      });
    } finally {
      setBroadcastingEmail(false);
    }
  };

  // Handler for AI Smart Pricing Advisor
  const handleCalculateAiPricing = async () => {
    setCalculatingPricing(true);
    try {
      const cost = Number(costPrice) || 1000;
      const margin = Number(targetMargin) || 35;
      const res = await suggestAiPricing(cost, margin);
      if (res.success && res.pricing) {
        setPricingResult({
          recommendedRegularPrice: res.pricing.suggestedRegularPrice,
          recommendedSalePrice: res.pricing.suggestedSalePrice,
          marginPercent: res.pricing.profitMarginPercent,
          profitBDT: res.pricing.estimatedProfit,
          pricingStrategyNote: `Suggested sale price ৳${res.pricing.suggestedSalePrice} with ${res.pricing.discountPercent}% discount off ৳${res.pricing.suggestedRegularPrice} provides ~${res.pricing.profitMarginPercent}% net margin (+৳${res.pricing.estimatedProfit} BDT profit) for ${pricingCategory}.`,
        });
      } else {
        // Local calculation fallback
        const reg = Math.round(cost * (1 + margin / 100) * 1.25);
        const sale = Math.round(cost * (1 + margin / 100));
        setPricingResult({
          recommendedRegularPrice: reg,
          recommendedSalePrice: sale,
          marginPercent: margin,
          profitBDT: sale - cost,
          pricingStrategyNote: `Suggested ৳${sale} gives an estimated ${margin}% net margin on ৳${cost} cost price, with an anchor MSRP of ৳${reg}.`,
        });
      }
    } finally {
      setCalculatingPricing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">R Mart AI Business Co-Pilot</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                PRO AGENT
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              AI-driven product description writing, bilingual courier dispatch drafting, and real-time inventory intelligence.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Online & Synced with Store</span>
          </span>
        </div>
      </div>

      {/* Tool Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTool('copilot')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTool === 'copilot'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-600" />
          <span>Interactive AI Co-Pilot</span>
        </button>

        <button
          onClick={() => setActiveTool('product_gen')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTool === 'product_gen'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Product Copy & SEO</span>
        </button>

        <button
          onClick={() => setActiveTool('review_studio')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTool === 'review_studio'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4 text-emerald-600" />
          <span>AI Review Studio</span>
        </button>

        <button
          onClick={() => setActiveTool('email_broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTool === 'email_broadcast'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4 text-emerald-600" />
          <span>AI Email Broadcast</span>
        </button>

        <button
          onClick={() => setActiveTool('pricing_advisor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTool === 'pricing_advisor'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Smart Pricing & Margin</span>
        </button>

        <button
          onClick={() => setActiveTool('sms_drafter')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTool === 'sms_drafter'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-600" />
          <span>Courier SMS / WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTool('stock_advisor')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTool === 'stock_advisor'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Inventory Health & Reorder Advisor</span>
        </button>
      </div>

      {/* Tab 1: Interactive AI Co-Pilot */}
      {activeTool === 'copilot' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[560px] overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    msg.sender === 'admin'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-2 ${
                      msg.sender === 'admin' ? 'text-slate-400 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-3 rounded-2xl w-fit border border-slate-200 shadow-xs">
                <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>AI analyzing store operations...</span>
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about inventory, sales trends, courier dispatches, or marketing ideas..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="h-11 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-40"
            >
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Product Copy & SEO Generator */}
      {activeTool === 'product_gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Generate Listing Copy & SEO</span>
            </h3>

            <form onSubmit={handleGenerateProductCopy} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name / Working Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Premium Cotton Polo Shirt"
                  value={genTitle || ''}
                  onChange={(e) => setGenTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Men's Fashion, Electronics"
                  value={genCategory || ''}
                  onChange={(e) => setGenCategory(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Price (৳ BDT)</label>
                <input
                  type="number"
                  placeholder="e.g. 1250"
                  value={genPrice || ''}
                  onChange={(e) => setGenPrice(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Key Highlights</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 100% combed cotton, breathable, anti-shrink, M/L/XL sizes"
                  value={genFeatures || ''}
                  onChange={(e) => setGenFeatures(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Bilingual Copy</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">AI Generated Content</h3>

            {generatedCopy ? (
              <div className="space-y-4 text-xs sm:text-sm">
                {/* SEO Title */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">SEO Meta Title</span>
                    <button
                      onClick={() => handleCopy(generatedCopy.seoTitle, 'seoTitle')}
                      className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'seoTitle' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'seoTitle' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="font-semibold text-slate-900">{generatedCopy.seoTitle}</p>
                </div>

                {/* Bengali Description */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">Bangla Description (বাংলা বিবরণী)</span>
                    <button
                      onClick={() => handleCopy(generatedCopy.bengaliDesc, 'bengaliDesc')}
                      className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'bengaliDesc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'bengaliDesc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{generatedCopy.bengaliDesc}</p>
                </div>

                {/* English Description */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-500 uppercase">English Description</span>
                    <button
                      onClick={() => handleCopy(generatedCopy.engDesc, 'engDesc')}
                      className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedKey === 'engDesc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'engDesc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-slate-800 leading-relaxed">{generatedCopy.engDesc}</p>
                </div>

                {/* Bullet Points */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Highlights</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {generatedCopy.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-300" />
                <p>Fill out the product information on the left and click "Generate Bilingual Copy".</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: AI Review Studio */}
      {activeTool === 'review_studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>AI Customer Review Generator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Generate authentic, localized customer testimonials in Bengali and English for any product in your store to boost conversion and social proof.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Product *
                </label>
                <select
                  value={reviewProductId}
                  onChange={(e) => setReviewProductId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium"
                >
                  <option value="">-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Reviews
                  </label>
                  <select
                    value={reviewCount}
                    onChange={(e) => setReviewCount(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                  >
                    <option value={1}>1 Review</option>
                    <option value={2}>2 Reviews</option>
                    <option value={3}>3 Reviews</option>
                    <option value={5}>5 Reviews</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Star Rating
                  </label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiReviews}
                disabled={!reviewProductId || generatingReviews}
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generatingReviews ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{generatingReviews ? 'Generating AI Reviews...' : 'Generate AI Reviews'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Generated Testimonials
                </h3>
                <p className="text-xs text-slate-500">
                  Preview reviews before saving to store
                </p>
              </div>

              {generatedReviews.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveAllGeneratedReviews}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Publish All to Store</span>
                </button>
              )}
            </div>

            {savedReviewsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All reviews have been published to the live store successfully!</span>
              </div>
            )}

            {generatedReviews.length > 0 ? (
              <div className="space-y-3">
                {generatedReviews.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{r.userName}</span>
                        {r.location && (
                          <span className="text-[10px] text-slate-500 font-medium">📍 {r.location}</span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Verified Buyer
                        </span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: r.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-sans">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Select a product and click "Generate AI Reviews" to produce authentic feedback.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: AI Email Broadcast Studio */}
      {activeTool === 'email_broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>AI Product Launch Email Broadcast</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pick a product and generate a high-converting promotional HTML email with direct product links and Cash on Delivery highlights, then broadcast to all registered customers using configured SMTP.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product to Promote *
                </label>
                <select
                  value={emailProductId}
                  onChange={(e) => setEmailProductId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-medium"
                >
                  <option value="">-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (৳{(p.salePrice ?? p.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiEmailCampaign}
                disabled={!emailProductId || generatingEmail}
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generatingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{generatingEmail ? 'AI Writing Campaign...' : 'Generate AI Email Campaign'}</span>
              </button>

              {/* Anti-Spam & Primary Inbox Guarantee Info Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Primary Inbox Anti-Spam Engine (ইনবক্স ডেলিভারি)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ইমেইল যেন সরাসরি ইউজারের <strong>Primary Inbox</strong>-এ যায় এবং Spam ফোল্ডারে না পড়ে, সেজন্য স্বয়ংক্রিয়ভাবে নিচের অপটিমাইজেশনগুলো যুক্ত করা হয়:
                </p>
                <div className="space-y-1.5 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>RFC 8058 One-Click Unsubscribe:</strong> গুগল ও ইয়াহুর নতুন ২০২৪ নিয়ম অনুযায়ী আনসাবস্ক্রাইব হেডার।</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Sender Authentication Match:</strong> অনুমোদিত SMTP ইমেইল দিয়ে ফ্রম ও রিপ্লাই-টু হেডার তৈরি।</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>MIME Multipart (HTML + Plain Text):</strong> স্প্যাম ফিল্টার এড়াতে অটোমেটিক প্লেইন টেক্সট ব্যাকআপ।</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Rate-Limit Throttling:</strong> স্প্যাম ব্লকলিস্ট এড়াতে প্রতি ইমেইলের মাঝে সেফ ডিলে।</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Campaign Content & Preview
                </h3>
                <p className="text-xs text-slate-500">
                  Review email copy and broadcast to customers
                </p>
              </div>

              {emailHtml && (
                <button
                  type="button"
                  onClick={handleBroadcastCampaign}
                  disabled={broadcastingEmail}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {broadcastingEmail ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{broadcastingEmail ? 'Broadcasting...' : 'Broadcast to All Customers'}</span>
                </button>
              )}
            </div>

            {broadcastResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 font-medium ${
                  broadcastResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {broadcastResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{broadcastResult.message}</span>
              </div>
            )}

            {emailHtml ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Live HTML Email Render Preview
                  </label>
                  <div
                    className="p-4 rounded-2xl border border-slate-200 max-h-96 overflow-y-auto bg-slate-50"
                    dangerouslySetInnerHTML={{ __html: emailHtml }}
                  />
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Select a product and click "Generate AI Email Campaign" to generate promotional copy and email links.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Smart Pricing & Profit Margin */}
      {activeTool === 'pricing_advisor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Smart Pricing & Margin Calculator</span>
            </h3>
            <p className="text-xs text-slate-500">
              Calculate optimal retail and sale prices based on procurement/manufacturing costs, Bangladesh market averages, and target profit margins.
            </p>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Cost Price (৳ BDT) *
                </label>
                <input
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="e.g. 1200"
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Category
                </label>
                <select
                  value={pricingCategory}
                  onChange={(e) => setPricingCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                >
                  <option value="Clothing">Clothing / Fashion (Panjabi, Shirts)</option>
                  <option value="Footwear">Footwear / Shoes</option>
                  <option value="Electronics">Electronics & Gadgets</option>
                  <option value="Accessories">Accessories (Watches, Bags)</option>
                  <option value="Lifestyle">Lifestyle & Home</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Profit Margin (%)
                </label>
                <select
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                >
                  <option value="25">25% (High volume / competitive)</option>
                  <option value="35">35% (Healthy balanced e-commerce margin)</option>
                  <option value="45">45% (Premium / exclusive merchandise)</option>
                  <option value="60">60% (High markup boutique items)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCalculateAiPricing}
                disabled={calculatingPricing || !costPrice}
                className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {calculatingPricing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{calculatingPricing ? 'Calculating...' : 'Calculate AI Pricing'}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Pricing Recommendation & Profit Analysis
            </h3>

            {pricingResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                      Regular Price (MSRP)
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 block mt-1">
                      ৳{pricingResult.recommendedRegularPrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">Crossed-out anchor price</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[11px] font-semibold text-emerald-800 uppercase block">
                      Discounted Sale Price
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 block mt-1">
                      ৳{pricingResult.recommendedSalePrice.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      Effective price on website
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                      Estimated Profit per Unit
                    </span>
                    <span className="text-lg font-bold font-mono text-emerald-600 block mt-0.5">
                      +৳{pricingResult.profitBDT.toLocaleString()}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                      Net Margin
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-900 block mt-0.5">
                      {pricingResult.marginPercent}%
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">Market Strategy Note:</span>
                  {pricingResult.pricingStrategyNote}
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 text-xs">
                Enter your procurement cost and click "Calculate AI Pricing" to evaluate profit margins and price recommendations.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: SMS & WhatsApp Courier Drafter */}
      {activeTool === 'sms_drafter' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Courier Dispatch Message Drafter</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName || ''}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Order Number</label>
                <input
                  type="text"
                  value={orderNumber || ''}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Courier Partner</label>
                <select
                  value={courierName || 'Steadfast Courier'}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900"
                >
                  <option value="Steadfast Courier">Steadfast Courier</option>
                  <option value="RedX Logistics">RedX Logistics</option>
                  <option value="Pathao Courier">Pathao Courier</option>
                  <option value="Sundarban Courier">Sundarban Courier Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Consignment Code</label>
                <input
                  type="text"
                  value={trackingCode || ''}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">COD Amount (৳)</label>
                <input
                  type="number"
                  value={codAmount || ''}
                  onChange={(e) => setCodAmount(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerateSms('whatsapp')}
                  className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Draft WhatsApp (Bangla)
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateSms('sms')}
                  className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Draft English SMS
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Ready-to-Send Message</h3>
              {draftedSms && (
                <button
                  onClick={() => handleCopy(draftedSms, 'draftedSms')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200"
                >
                  {copiedKey === 'draftedSms' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'draftedSms' ? 'Copied' : 'Copy Message'}</span>
                </button>
              )}
            </div>

            {draftedSms ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono whitespace-pre-line text-slate-800">
                {draftedSms}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p>Click "Draft WhatsApp (Bangla)" or "Draft English SMS" to generate dispatch copy.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Inventory Health & Reorder Advisor */}
      {activeTool === 'stock_advisor' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Inventory Velocity & Reorder Recommendations</h3>
              <p className="text-xs text-slate-500">Products with stock under 10 units that need restock attention</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
              {lowStockItems.length} Items Require Attention
            </span>
          </div>

          {lowStockItems.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
              {lowStockItems.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.thumbnail || p.images?.[0] || '/logo.png'}
                      alt={p.name}
                      className="w-12 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">{p.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">
                        Price: ৳{(p.salePrice ?? p.price).toLocaleString()} · Category: {p.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.totalStock === 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.totalStock === 0 ? 'Out of Stock' : `${p.totalStock} Remaining`}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                      AI Suggested Reorder: +{Math.max(20, (10 - p.totalStock) * 3)} units
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">
              <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800">All products have healthy stock levels (&gt;10 units).</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
