import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
  Wand2,
  Tag,
  Percent,
  ShoppingBag,
  Ticket,
  Copy,
  Check,
  RefreshCw,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle2,
  Sliders,
  Palette,
  FileText,
  Loader2,
  Download,
  Flame,
  Clock,
  Package,
} from 'lucide-react';
import {
  getBanners,
  createBanner,
  deleteBanner,
  getProducts,
  generateAiBannerPrompt,
  generateAiBannerImage,
  uploadImage,
} from '../../lib/store';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { useAuth } from '../../context/AuthContext';
import type { Banner, Product } from '../../types';

// Preset High-Quality 16:9 AI Banners for the 5 categories
const AI_CATEGORY_PRESETS = {
  offers: {
    id: 'offers',
    name: 'Offers & Mega Sale',
    icon: Tag,
    badgeText: 'Special Offers',
    imageUrl: '/src/assets/images/banner_offers_1791026801994.jpg',
    defaultTheme: 'Eid Mega Bazaar 2026',
    defaultDiscount: 'Special Mega Deals',
    defaultLink: '/shop?offer=mega',
  },
  percentage: {
    id: 'percentage',
    name: 'Percentage Discount',
    icon: Percent,
    badgeText: 'Percentage Off',
    imageUrl: '/src/assets/images/banner_percentage_1791026813286.jpg',
    defaultTheme: 'Mid-Season Flash Discount',
    defaultDiscount: 'Flat 50% OFF',
    defaultLink: '/shop?discount=50',
  },
  products_offer: {
    id: 'products_offer',
    name: 'Some Products Offers',
    icon: ShoppingBag,
    badgeText: 'Combo & Bundle Offers',
    imageUrl: '/src/assets/images/banner_products_offer_1791026826624.jpg',
    defaultTheme: 'Panjabi & Smartwatch Combo Deal',
    defaultDiscount: 'Buy Combo & Save 35%',
    defaultLink: '/shop?category=bundles',
  },
  product_details: {
    id: 'product_details',
    name: 'Product Details & Specs',
    icon: Layers,
    badgeText: 'Featured Product Spotlight',
    imageUrl: '/src/assets/images/banner_product_details_1791026836250.jpg',
    defaultTheme: 'Exclusive Premium Collection',
    defaultDiscount: 'Original Guarantee',
    defaultLink: '/shop',
  },
  coupon_card: {
    id: 'coupon_card',
    name: 'Coupon Card Special Offers',
    icon: Ticket,
    badgeText: 'VIP Coupon Voucher',
    imageUrl: '/src/assets/images/banner_coupon_card_1791026849128.jpg',
    defaultTheme: 'VIP Celebration Voucher',
    defaultDiscount: '৳500 Instant Cashback',
    defaultLink: '/shop?coupon=EID2026',
  },
} as const;

type BannerCategoryType = keyof typeof AI_CATEGORY_PRESETS;

export const AdminBanners: React.FC = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Explore Collection');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [imageUrl, setImageUrl] = useState('/logo.png');

  // AI Studio State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BannerCategoryType>('offers');

  // Category specific inputs
  const [offerHeadline, setOfferHeadline] = useState('Eid Mega Bazaar 2026');
  const [percentageValue, setPercentageValue] = useState('50% OFF');
  const [productOfferTitle, setProductOfferTitle] = useState('Panjabi & Smartwatch Combo Deal');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customProductName, setCustomProductName] = useState('');
  const [customProductPrice, setCustomProductPrice] = useState('1850');
  const [customProductFeatures, setCustomProductFeatures] = useState('100% Combed Cotton, Slim Fit, Hand Embroidery');
  const [couponCode, setCouponCode] = useState('EID2026');
  const [couponDiscount, setCouponDiscount] = useState('৳500 OFF');
  const [couponMinSpend, setCouponMinSpend] = useState('৳2,000');
  const [colorMood, setColorMood] = useState('emerald_gold');
  const [customPromptInput, setCustomPromptInput] = useState('');

  // Multi-product combo selection for "products_offer"
  const [selectedComboIds, setSelectedComboIds] = useState<string[]>([]);
  const [comboSavingsPercent, setComboSavingsPercent] = useState('35%');

  // Banner rendering style: 'composite' (all text & graphics baked in) or 'backdrop' (graphics on right, left clean for storefront text overlay)
  const [bannerStyleMode, setBannerStyleMode] = useState<'composite' | 'backdrop'>('composite');

  // AI Agent Output
  const [cachedCategoryPrompts, setCachedCategoryPrompts] = useState<
    Record<
      BannerCategoryType,
      {
        prompt: string;
        title: string;
        subtitle: string;
        buttonText: string;
        buttonLink: string;
        tagline: string;
        accentColor: string;
      }
    >
  >({
    offers: {
      prompt:
        'Ultra-luxurious 16:9 commercial promotional banner for R Mart Bangladesh. Celebratory atmosphere with floating glossy emerald and gold shopping bags, wrapped gift boxes, sparkling golden dust particles, soft cinematic studio volumetric lighting, deep dark slate background, generous clean space on left for advertising typography.',
      title: 'Eid Mega Bazaar 2026 - Exclusive Offers',
      subtitle: 'Enjoy nationwide Cash on Delivery and authentic brand quality across all departments.',
      buttonText: 'Explore Mega Deals',
      buttonLink: '/shop?offer=mega',
      tagline: 'Special Offers',
      accentColor: '#10B981',
    },
    percentage: {
      prompt:
        'An ultra-modern 16:9 wide commercial advertisement banner for percentage discount sales. Large floating 3D golden and emerald 50% percentage badges, glossy balloons, dynamic glowing trails, dark luxury backdrop, ample empty copy space on left, cinematic 4K studio lighting.',
      title: 'Flat 50% Off Everything!',
      subtitle: 'Massive discount savings on trendy apparel, electronics, and lifestyle goods.',
      buttonText: 'Shop 50% Off',
      buttonLink: '/shop?discount=50',
      tagline: 'Percentage Off',
      accentColor: '#F59E0B',
    },
    products_offer: {
      prompt:
        'A vibrant 16:9 wide multi-product promotional banner background. Sleek circular illuminated display podiums, floating discount tags, ambient studio neon and warm emerald lighting, minimalist futuristic showroom, empty negative space on left for text, commercial photography style.',
      title: 'Panjabi & Smartwatch Combo Deal',
      subtitle: 'Buy together and save extra 35%! Handpicked product combos with nationwide delivery.',
      buttonText: 'View Bundle Deals',
      buttonLink: '/shop?category=bundles',
      tagline: 'Combo Deals',
      accentColor: '#3B82F6',
    },
    product_details: {
      prompt:
        'A high-end 16:9 wide commercial product showcase banner. Elegant floating pedestals with soft spotlighting, luxury geometric shapes, clean deep dark background, modern e-commerce advertising aesthetic with spacious layout for product details and specifications.',
      title: 'Exclusive Premium Collection - Original Guarantee',
      subtitle: '100% authentic quality materials and bespoke design. Order with Cash on Delivery nationwide.',
      buttonText: 'Order Now',
      buttonLink: '/shop',
      tagline: 'Product Spotlight',
      accentColor: '#10B981',
    },
    coupon_card: {
      prompt:
        'A festive 16:9 wide VIP coupon and voucher promotional banner. Elegant floating golden voucher card with ornate ribbon, glowing sparkles, golden coins, celebratory festival atmosphere, clean left side for coupon code and discount details, cinematic 3D render.',
      title: 'Use Code EID2026 & Get ৳500 OFF!',
      subtitle: 'Apply voucher code EID2026 at checkout to unlock instant cashback and flat savings today.',
      buttonText: 'Claim Voucher Code',
      buttonLink: '/shop?coupon=EID2026',
      tagline: 'VIP Coupon Voucher',
      accentColor: '#E11D48',
    },
  });

  const [aiPrompt, setAiPrompt] = useState(
    'Ultra-luxurious 16:9 commercial promotional banner for R Mart Bangladesh. Celebratory atmosphere with floating glossy emerald and gold shopping bags, wrapped gift boxes, sparkling golden dust particles, soft cinematic studio volumetric lighting, deep dark slate background, generous clean space on left for advertising typography.'
  );
  const [aiTitle, setAiTitle] = useState('Eid Mega Bazaar 2026 - Exclusive Offers');
  const [aiSubtitle, setAiSubtitle] = useState('Enjoy nationwide Cash on Delivery and authentic brand quality across all departments.');
  const [aiButtonText, setAiButtonText] = useState('Explore Mega Deals');
  const [aiButtonLink, setAiButtonLink] = useState('/shop?offer=mega');
  const [aiTagline, setAiTagline] = useState('Special Offers');
  const [aiAccentColor, setAiAccentColor] = useState('#10B981');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const [agentStatusText, setAgentStatusText] = useState<string | null>(null);

  const [selectedBannerImage, setSelectedBannerImage] = useState<string>(
    AI_CATEGORY_PRESETS.offers.imageUrl
  );
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadBanners();
    getProducts({ activeOnly: true }).then((prods) => {
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProductId(prods[0].id);
        setCustomProductName(prods[0].name);
        setCustomProductPrice(String(prods[0].salePrice || prods[0].price));
        setCustomProductFeatures(prods[0].fabricMaterial || prods[0].category || 'Premium Authentic Quality');

        // Default combo items
        if (prods.length >= 2) {
          setSelectedComboIds([prods[0].id, prods[1].id]);
        } else {
          setSelectedComboIds([prods[0].id]);
        }
      }
    });
  }, []);

  async function loadBanners() {
    setLoading(true);
    try {
      const list = await getBanners();
      setBanners(list);
    } finally {
      setLoading(false);
    }
  }

  // When category changes in AI Studio, load cached category prompt instantly with 0 delay & 0 quota
  const handleSelectCategory = (cat: BannerCategoryType) => {
    setSelectedCategory(cat);
    const preset = AI_CATEGORY_PRESETS[cat];
    setSelectedBannerImage(preset.imageUrl);
    const cached = cachedCategoryPrompts[cat];
    if (cached) {
      setAiPrompt(cached.prompt);
      setAiTitle(cached.title);
      setAiSubtitle(cached.subtitle);
      setAiButtonText(cached.buttonText);
      setAiButtonLink(cached.buttonLink);
      setAiTagline(cached.tagline);
      setAiAccentColor(cached.accentColor);
    } else {
      setAiTagline(preset.badgeText);
      setAiButtonLink(preset.defaultLink);
    }
  };

  // Helper: Calculate combo products price & savings
  const comboProducts = products.filter((p) => selectedComboIds.includes(p.id));
  const comboOriginalTotal = comboProducts.reduce((sum, p) => sum + (p.price || 0), 0);
  const comboDiscountMultiplier = 1 - (parseInt(comboSavingsPercent) || 30) / 100;
  const comboFinalPrice = Math.round(comboOriginalTotal * comboDiscountMultiplier);

  // 1. Generate AI Prompt & Marketing Copy (Agent writes its own prompt)
  const handleGeneratePrompt = async (catOverride?: BannerCategoryType): Promise<{
    prompt: string;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    tagline: string;
    accentColor?: string;
  } | null> => {
    const cat = catOverride || selectedCategory;
    setIsGeneratingPrompt(true);
    setAgentStatusText('🧠 Agent writing prompt & strategy based on category...');

    try {
      let discountText = 'Special Offer';
      let themeText = offerHeadline;

      if (cat === 'percentage') {
        discountText = percentageValue;
        themeText = `Flash Percentage Discount - ${percentageValue}`;
      } else if (cat === 'products_offer') {
        discountText = `Save ${comboSavingsPercent} on Combo`;
        themeText = productOfferTitle;
      } else if (cat === 'product_details') {
        discountText = `Special ৳${customProductPrice}`;
        themeText = customProductName || 'Exclusive Product Showcase';
      } else if (cat === 'coupon_card') {
        discountText = couponDiscount;
        themeText = `VIP Coupon Voucher - ${couponCode}`;
      }

      const res = await generateAiBannerPrompt({
        bannerType: cat,
        couponCode,
        discountText,
        percentage: percentageValue,
        campaignTheme: themeText,
        productName: customProductName,
        productPrice: customProductPrice,
        productFeatures: customProductFeatures,
        productOfferTitle,
        category: cat,
        customPrompt: customPromptInput,
        colorMood,
      });

      if (res) {
        setAiPrompt(res.prompt);
        setAiTitle(res.title);
        setAiSubtitle(res.subtitle);
        setAiButtonText(res.buttonText);
        setAiButtonLink(res.buttonLink);
        setAiTagline(res.tagline);
        if (res.accentColor) setAiAccentColor(res.accentColor);
        setCachedCategoryPrompts((prev) => ({
          ...prev,
          [cat]: {
            prompt: res.prompt,
            title: res.title,
            subtitle: res.subtitle,
            buttonText: res.buttonText,
            buttonLink: res.buttonLink,
            tagline: res.tagline,
            accentColor: res.accentColor || '#10B981',
          },
        }));
        return res;
      }
      return null;
    } finally {
      setIsGeneratingPrompt(false);
      setAgentStatusText(null);
    }
  };

  // Helper to load image safely into HTMLImageElement
  const loadImageAsync = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  // 2. Synthesize High-Resolution 16:9 Banner Image (Agent creates own image)
  const handleCreateImage = async (
    promptOverride?: string,
    catOverride?: BannerCategoryType,
    titleOverride?: string,
    subtitleOverride?: string,
    taglineOverride?: string
  ) => {
    const prompt = promptOverride || aiPrompt;
    const cat = catOverride || selectedCategory;
    const bannerTitle = titleOverride || aiTitle || 'Special Offer';
    const bannerSub = subtitleOverride || aiSubtitle || 'Shop with nationwide Cash on Delivery.';
    const bannerTag = taglineOverride || aiTagline || 'PROMOTION';

    setIsGeneratingImage(true);
    setAgentStatusText('🎨 Agent synthesizing 16:9 commercial banner image...');

    try {
      // Step A: Attempt server-side Gemini image generation if configured
      if (prompt) {
        const geminiRes = await generateAiBannerImage({ prompt, category: cat });
        if (geminiRes.success && geminiRes.imageUrl && !geminiRes.fallbackRequired) {
          setSelectedBannerImage(geminiRes.imageUrl);
          setToastMessage('AI Agent created and saved banner image with Gemini!');
          setTimeout(() => setToastMessage(null), 3500);
          return;
        }
      }

      // Step B: Synthesize customized 16:9 graphical banner via Dynamic Canvas Renderer
      setAgentStatusText('✨ Agent rendering 16:9 composite banner graphics...');
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1280;
      canvas.height = 720;

      // Base background: Load category preset or dark luxury gradient
      const presetBg = AI_CATEGORY_PRESETS[cat].imageUrl;
      const bgImg = await loadImageAsync(presetBg);

      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, 1280, 720);
      } else {
        const grad = ctx.createLinearGradient(0, 0, 1280, 720);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(0.6, '#0B131E');
        grad.addColorStop(1, '#064E3B');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1280, 720);
      }

      // High contrast darkening scrim on left half for readable typography
      const scrim = ctx.createLinearGradient(0, 0, 1280, 0);
      scrim.addColorStop(0, 'rgba(11, 15, 25, 0.96)');
      scrim.addColorStop(0.48, 'rgba(11, 15, 25, 0.82)');
      scrim.addColorStop(0.75, 'rgba(11, 15, 25, 0.35)');
      scrim.addColorStop(1, 'rgba(11, 15, 25, 0.1)');
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, 1280, 720);

      // ==========================================
      // CATEGORY-SPECIFIC 3D GRAPHICS (RIGHT SIDE)
      // ==========================================

      if (cat === 'coupon_card') {
        // --- 1. Ornate Floating 3D VIP Voucher Ticket ---
        ctx.save();
        ctx.translate(850, 190);
        ctx.rotate((4 * Math.PI) / 180);

        // Drop shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 35;
        ctx.shadowOffsetY = 15;

        // Card body
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(0, 0, 360, 240, 24);
        ctx.fill();

        // Card header banner
        ctx.shadowColor = 'transparent';
        const headerGrad = ctx.createLinearGradient(0, 0, 360, 0);
        headerGrad.addColorStop(0, '#DC2626');
        headerGrad.addColorStop(1, '#991B1B');
        ctx.fillStyle = headerGrad;
        ctx.beginPath();
        ctx.roundRect(0, 0, 360, 64, [24, 24, 0, 0]);
        ctx.fill();

        // Voucher title
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('🎟️ VIP STORE VOUCHER', 24, 40);

        // Dashed perforation divider
        ctx.strokeStyle = '#CBD5E1';
        ctx.setLineDash([8, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, 80);
        ctx.lineTo(340, 80);
        ctx.stroke();
        ctx.setLineDash([]);

        // Coupon code container
        ctx.fillStyle = '#F1F5F9';
        ctx.beginPath();
        ctx.roundRect(24, 96, 312, 58, 12);
        ctx.fill();

        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Coupon code in bold monospace
        ctx.fillStyle = '#0F172A';
        ctx.font = '800 28px monospace';
        ctx.fillText(couponCode, 44, 136);

        // Copy pill
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(240, 108, 80, 34, 8);
        ctx.fill();
        ctx.fillStyle = '#052E16';
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('COPY', 262, 130);

        // Discount value
        ctx.fillStyle = '#16A34A';
        ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(couponDiscount, 24, 195);

        ctx.fillStyle = '#64748B';
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`Min spend: ${couponMinSpend} · Instant Cashback`, 24, 218);

        ctx.restore();
      } else if (cat === 'percentage') {
        // --- 2. 3D Floating Glowing Percentage Orb ---
        ctx.save();
        ctx.translate(960, 330);

        // Glowing outer aura
        const aura = ctx.createRadialGradient(0, 0, 50, 0, 0, 160);
        aura.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
        aura.addColorStop(0.6, 'rgba(245, 158, 11, 0.15)');
        aura.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, 160, 0, Math.PI * 2);
        ctx.fill();

        // 3D Amber Sphere Badge
        const sphereGrad = ctx.createRadialGradient(-30, -30, 10, 0, 0, 120);
        sphereGrad.addColorStop(0, '#FDE68A');
        sphereGrad.addColorStop(0.3, '#F59E0B');
        sphereGrad.addColorStop(0.85, '#D97706');
        sphereGrad.addColorStop(1, '#78350F');

        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 120, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing border
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = '#FEF3C7';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 114, 0, Math.PI * 2);
        ctx.stroke();

        // Percentage Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 46px "Syne", "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(percentageValue, 0, 12);

        // Limited time badge ribbon
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(-80, 42, 160, 32, 16);
        ctx.fill();

        ctx.fillStyle = '#FDE68A';
        ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('LIMITED TIME', 0, 63);

        ctx.restore();
      } else if (cat === 'products_offer') {
        // --- 3. Combo / Bundle Multi-Product Podium Showcase ---
        ctx.save();
        ctx.translate(880, 330);

        // Draw bundle pedestal
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 40;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.ellipse(0, 140, 240, 60, 0, 0, Math.PI * 2);
        ctx.fill();

        // If combo items exist, draw product thumbnails onto podium
        const combo1 = comboProducts[0];
        const combo2 = comboProducts[1] || comboProducts[0];

        if (combo1?.images?.[0]) {
          const img1 = await loadImageAsync(combo1.images[0]);
          if (img1) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(-80, -20, 90, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img1, -170, -110, 180, 180);
            ctx.restore();

            // Circle border
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(-80, -20, 90, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        if (combo2?.images?.[0]) {
          const img2 = await loadImageAsync(combo2.images[0]);
          if (img2) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(80, -20, 90, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img2, -10, -110, 180, 180);
            ctx.restore();

            // Circle border
            ctx.strokeStyle = '#38BDF8';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(80, -20, 90, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // Plus badge in center
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(0, -20, 28, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0F172A';
        ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', 0, -10);

        // Savings badge below
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(-110, 90, 220, 44, 22);
        ctx.fill();

        ctx.fillStyle = '#022C22';
        ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`COMBO SAVE ${comboSavingsPercent}`, 0, 118);

        ctx.restore();
      } else if (cat === 'product_details') {
        // --- 4. Product Spotlight with Real Image & Specs Callouts ---
        ctx.save();
        ctx.translate(940, 320);

        // Light beam gradient
        const beam = ctx.createRadialGradient(0, 0, 20, 0, 0, 220);
        beam.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
        beam.addColorStop(0.7, 'rgba(16, 185, 129, 0.08)');
        beam.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.arc(0, 0, 220, 0, Math.PI * 2);
        ctx.fill();

        // Spotlight pedestal
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#090D11';
        ctx.beginPath();
        ctx.ellipse(0, 150, 180, 45, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw product photo if available
        const currentProd = products.find((p) => p.id === selectedProductId);
        if (currentProd?.images?.[0]) {
          const pImg = await loadImageAsync(currentProd.images[0]);
          if (pImg) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(-130, -140, 260, 260, 24);
            ctx.clip();
            ctx.drawImage(pImg, -130, -140, 260, 260);
            ctx.restore();

            // Border
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(-130, -140, 260, 260, 24);
            ctx.stroke();
          }
        }

        // Floating Price Pill
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(-110, 120, 220, 48, 16);
        ctx.fill();

        ctx.fillStyle = '#052E16';
        ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`৳${Number(customProductPrice).toLocaleString()}`, 0, 152);

        // Floating Authentic Badge
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(-120, -165, 140, 32, 10);
        ctx.fill();
        ctx.fillStyle = '#38BDF8';
        ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('⭐ 100% ORIGINAL', -50, -144);

        ctx.restore();
      } else {
        // --- 5. Offers: Floating 3D Gift Bags & Sparkles ---
        ctx.save();
        ctx.translate(920, 320);

        // Celebratory sparkles
        ctx.fillStyle = '#FDE68A';
        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI) / 8;
          const dist = 120 + (i % 3) * 30;
          const sx = Math.cos(angle) * dist;
          const sy = Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(sx, sy, (i % 3) + 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Mega Deal Glowing Banner
        ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.roundRect(-130, 40, 260, 56, 18);
        ctx.fill();

        ctx.fillStyle = '#052E16';
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MEGA SALE 2026', 0, 75);

        ctx.restore();
      }

      // ==========================================
      // TYPOGRAPHY OVERLAY (LEFT SIDE)
      // ==========================================
      if (bannerStyleMode === 'composite') {
        ctx.textAlign = 'left';

        // Tagline Pill Badge
        ctx.fillStyle = aiAccentColor || '#10B981';
        ctx.beginPath();
        ctx.roundRect(80, 140, 250, 36, 18);
        ctx.fill();

        ctx.fillStyle = '#0F172A';
        ctx.font = '800 13px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(bannerTag.toUpperCase(), 98, 163);

        // Main Title (Multi-line word wrap)
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '800 54px "Syne", "Plus Jakarta Sans", sans-serif';
        const titleWords = bannerTitle.split(' ');
        let l1 = '';
        let l2 = '';
        titleWords.forEach((word, idx) => {
          if (idx < 4) l1 += word + ' ';
          else l2 += word + ' ';
        });

        ctx.fillText(l1.trim(), 80, 240);
        if (l2.trim()) {
          ctx.fillText(l2.trim(), 80, 305);
        }

        // Subtitle
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
        const subWords = bannerSub.split(' ');
        let s1 = '';
        let s2 = '';
        subWords.forEach((word, idx) => {
          if (idx < 8) s1 += word + ' ';
          else s2 += word + ' ';
        });
        ctx.fillText(s1.trim(), 80, 370);
        if (s2.trim()) {
          ctx.fillText(s2.trim(), 80, 400);
        }

        // CTA Button Pill
        ctx.fillStyle = aiAccentColor || '#10B981';
        ctx.beginPath();
        ctx.roundRect(80, 450, 260, 56, 16);
        ctx.fill();

        ctx.fillStyle = '#0F172A';
        ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`${aiButtonText || 'Explore Deals'} →`, 110, 485);
      }

      // Export canvas to high-quality JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.94);

      // Save to server /uploads so it is a permanent accessible URL
      const uploadRes = await uploadImage(dataUrl, `banner_${cat}_ai`);
      if (uploadRes.success && uploadRes.url) {
        setSelectedBannerImage(uploadRes.url);
      } else {
        setSelectedBannerImage(dataUrl);
      }

      setToastMessage('16:9 AI Banner created and saved successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsGeneratingImage(false);
      setAgentStatusText(null);
    }
  };

  // 3. ONE-CLICK "AUTO-CREATE AI BANNER" (Agent writes prompt AND creates image)
  const handleAutoCreateAiBanner = async () => {
    setIsAutoCreating(true);
    try {
      // Step 1: Agent writes prompt
      const promptResult = await handleGeneratePrompt();
      const p = promptResult?.prompt || aiPrompt;
      const t = promptResult?.title || aiTitle;
      const s = promptResult?.subtitle || aiSubtitle;
      const tag = promptResult?.tagline || aiTagline;

      // Step 2: Agent creates image
      await handleCreateImage(p, selectedCategory, t, s, tag);

      setToastMessage('✨ AI Agent finished writing prompt and creating the banner image!');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsAutoCreating(false);
    }
  };

  // Product selection handler
  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      setCustomProductName(prod.name);
      setCustomProductPrice(String(prod.salePrice || prod.price));
      setCustomProductFeatures(prod.fabricMaterial || prod.category || '100% Original');
      setAiButtonLink(`/product/${prod.slug || prod.id}`);
    }
  };

  // Toggle combo product in multi-product combo list
  const toggleComboProduct = (pId: string) => {
    setSelectedComboIds((prev) => {
      if (prev.includes(pId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((id) => id !== pId);
      } else {
        if (prev.length >= 3) return [...prev.slice(1), pId]; // Max 3
        return [...prev, pId];
      }
    });
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = () => {
    if (!aiPrompt) return;
    navigator.clipboard.writeText(aiPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // 1-Click Publish to Homepage Hero Slider
  const handlePublishAiBanner = async () => {
    if (!aiTitle.trim() || !selectedBannerImage.trim()) {
      setToastMessage('Please generate or provide a title and image first.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    await createBanner(
      {
        title: aiTitle.trim(),
        subtitle: aiSubtitle.trim() || undefined,
        buttonText: aiButtonText.trim() || 'Explore Now',
        buttonLink: aiButtonLink.trim() || '/shop',
        imageUrl: selectedBannerImage.trim(),
        sortOrder: 0, // Put at front of carousel
        isActive: true,
      },
      user?.email
    );

    setToastMessage(`Banner "${aiTitle}" published to Homepage Hero Slider!`);
    setAiModalOpen(false);
    loadBanners();
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manual banner create
  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    await createBanner(
      {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        buttonText: buttonText.trim() || undefined,
        buttonLink: buttonLink.trim() || undefined,
        imageUrl: imageUrl.trim(),
        sortOrder: banners.length,
        isActive: true,
      },
      user?.email
    );

    setModalOpen(false);
    setTitle('');
    setSubtitle('');
    loadBanners();
  };

  const handleDelete = async (id: string) => {
    await deleteBanner(id, user?.email);
    loadBanners();
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-emerald-400" />
            <span>Homepage Hero & Promotional Banners</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create high-converting hero sliders using AI image prompting or manual upload
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setAiModalOpen(true);
              if (!aiPrompt) {
                handleSelectCategory('offers');
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>AI Banner Studio</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Banner</span>
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-5 flex flex-col justify-end">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 font-bold text-[10px] w-fit mb-2">
                  Active Slide
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-slate-300 mt-1 line-clamp-2">{b.subtitle}</p>}
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[280px]">
                Button: <strong className="text-emerald-400">{b.buttonText}</strong> &bull; Link: {b.buttonLink}
              </span>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {banners.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 space-y-3">
            <Sparkles className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
            <p>No promotional hero banners added yet.</p>
            <button
              onClick={() => {
                setAiModalOpen(true);
                handleSelectCategory('offers');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
            >
              Generate First Banner with AI
            </button>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* AI BANNER STUDIO MODAL                                      */}
      {/* ============================================================ */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            onClick={() => setAiModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#0D1217] border border-white/10 shadow-2xl z-10 text-xs overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 bg-[#121921] border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-md">
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>AI Banner Studio</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      AI Agent & Image Generator
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    The AI Agent writes prompts and generates high-converting 16:9 banners by category
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoCreateAiBanner}
                  disabled={isAutoCreating || isGeneratingPrompt || isGeneratingImage}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  title="One-click full generation"
                >
                  {isAutoCreating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="w-3.5 h-3.5" />
                  )}
                  <span>{isAutoCreating ? 'Agent Creating...' : '✨ Auto-Create Banner'}</span>
                </button>

                <button
                  onClick={() => setAiModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Agent Live Status Banner */}
            {agentStatusText && (
              <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-5 py-2.5 flex items-center gap-2.5 text-emerald-300 text-xs font-semibold animate-pulse shrink-0">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{agentStatusText}</span>
              </div>
            )}

            {/* Modal Scrollable Body */}
            <div className="p-5 space-y-6 overflow-y-auto flex-1">
              {/* 1. Category Selector Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1. Select Banner Category</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Agent writes custom prompt & creates tailored image per category
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(AI_CATEGORY_PRESETS) as BannerCategoryType[]).map((catKey) => {
                    const preset = AI_CATEGORY_PRESETS[catKey];
                    const Icon = preset.icon;
                    const isActive = selectedCategory === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => handleSelectCategory(catKey)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-500/15 border-emerald-500 text-white ring-1 ring-emerald-500/40 shadow-md'
                            : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                            isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-tight">{preset.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{preset.badgeText}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dynamic Input Form According to Category */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Customize {AI_CATEGORY_PRESETS[selectedCategory].name}</span>
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    Category: {AI_CATEGORY_PRESETS[selectedCategory].name}
                  </span>
                </div>

                {/* CATEGORY 1: OFFERS */}
                {selectedCategory === 'offers' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Campaign Event / Headline</label>
                      <input
                        type="text"
                        value={offerHeadline}
                        onChange={(e) => setOfferHeadline(e.target.value)}
                        placeholder="e.g. Eid Mega Bazaar 2026 / Weekend Special"
                        className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Preset Campaign Events</label>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {['Eid Mega Bazaar', 'Clearance Sale', 'Flash Weekend', 'Seasonal Launch', 'Payday Special'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setOfferHeadline(opt)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-[10px] border border-white/10 cursor-pointer"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CATEGORY 2: PERCENTAGE */}
                {selectedCategory === 'percentage' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Percentage Offer</label>
                      <input
                        type="text"
                        value={percentageValue}
                        onChange={(e) => setPercentageValue(e.target.value)}
                        placeholder="e.g. Flat 50% OFF / Up to 70% Discount"
                        className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Quick Discount Slabs</label>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {['Flat 30% OFF', 'Flat 50% OFF', 'Up to 70% OFF', 'Save 25% Extra', 'Flat 40% OFF'].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPercentageValue(p)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] border cursor-pointer ${
                              percentageValue === p
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* CATEGORY 3: PRODUCTS OFFERS */}
                {selectedCategory === 'products_offer' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Bundle or Combo Title</label>
                        <input
                          type="text"
                          value={productOfferTitle}
                          onChange={(e) => setProductOfferTitle(e.target.value)}
                          placeholder="e.g. Panjabi & Smartwatch Combo Deal"
                          className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Combo Discount Savings</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={comboSavingsPercent}
                            onChange={(e) => setComboSavingsPercent(e.target.value)}
                            placeholder="e.g. 35%"
                            className="w-24 h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                          />
                          <div className="flex-1 flex items-center text-[11px] text-emerald-400 font-mono">
                            Combo Price: ৳{comboFinalPrice.toLocaleString()} (was ৳{comboOriginalTotal.toLocaleString()})
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">
                        Select 2 or 3 Catalog Products for Combo Showcase
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-[#090D11] rounded-xl border border-white/10">
                        {products.map((p) => {
                          const isSelected = selectedComboIds.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => toggleComboProduct(p.id)}
                              className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              {p.images?.[0] ? (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="w-8 h-8 rounded-md object-cover shrink-0"
                                />
                              ) : (
                                <Package className="w-8 h-8 p-1.5 rounded-md bg-white/5 text-slate-500 shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold truncate">{p.name}</p>
                                <p className="text-[9px] text-emerald-400 font-mono">৳{p.salePrice || p.price}</p>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* CATEGORY 4: PRODUCT DETAILS & SHOWCASE */}
                {selectedCategory === 'product_details' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Select Featured Product from Catalog</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => handleProductSelect(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl bg-[#090D11] border border-white/10 text-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ৳{p.salePrice || p.price} ({p.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Product Title</label>
                        <input
                          type="text"
                          value={customProductName}
                          onChange={(e) => setCustomProductName(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Price (৳ BDT)</label>
                        <input
                          type="text"
                          value={customProductPrice}
                          onChange={(e) => setCustomProductPrice(e.target.value)}
                          className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Key Specs / Material</label>
                        <input
                          type="text"
                          value={customProductFeatures}
                          onChange={(e) => setCustomProductFeatures(e.target.value)}
                          placeholder="e.g. 100% Combed Cotton"
                          className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* CATEGORY 5: COUPON CARD SPECIAL OFFERS */}
                {selectedCategory === 'coupon_card' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Coupon Voucher Code</label>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="e.g. EID2026 / SAVE500"
                        className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono tracking-wider font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Cashback / Savings</label>
                      <input
                        type="text"
                        value={couponDiscount}
                        onChange={(e) => setCouponDiscount(e.target.value)}
                        placeholder="e.g. ৳500 Flat Savings"
                        className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Minimum Spend</label>
                      <input
                        type="text"
                        value={couponMinSpend}
                        onChange={(e) => setCouponMinSpend(e.target.value)}
                        placeholder="e.g. ৳2,000"
                        className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Vibe & Custom Guidance */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/10">
                  <div>
                    <label className="block text-slate-400 mb-1 flex items-center gap-1">
                      <Palette className="w-3 h-3 text-emerald-400" />
                      <span>Color Palette & Mood</span>
                    </label>
                    <select
                      value={colorMood}
                      onChange={(e) => setColorMood(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-[#090D11] border border-white/10 text-white"
                    >
                      <option value="emerald_gold">Emerald & Golden Luxury (R Mart)</option>
                      <option value="festive_eid">Festive Eid Crescent & Ornate Gold</option>
                      <option value="cyber_neon">Cyberpunk Neon Cyan & Purple</option>
                      <option value="luxury_dark">Minimalist High-Contrast Slate</option>
                      <option value="vibrant_coral">Vibrant Summer Coral & Gold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Banner Typography Mode</label>
                    <select
                      value={bannerStyleMode}
                      onChange={(e) => setBannerStyleMode(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-xl bg-[#090D11] border border-white/10 text-white"
                    >
                      <option value="composite">Composite (Text & Badges in image)</option>
                      <option value="backdrop">Backdrop (Storefront overlays text)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">
                      Custom Guidance (Optional)
                    </label>
                    <input
                      type="text"
                      value={customPromptInput}
                      onChange={(e) => setCustomPromptInput(e.target.value)}
                      placeholder="e.g. Add 3D floating gift boxes"
                      className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-600"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    The Agent will write the prompt and compose the banner image automatically.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGeneratePrompt()}
                      disabled={isGeneratingPrompt}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingPrompt ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isGeneratingPrompt ? 'Writing...' : '1. Write Prompt'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCreateImage()}
                      disabled={isGeneratingImage}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingImage ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                      <span>{isGeneratingImage ? 'Synthesizing...' : '2. Create AI Image'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Generated AI Prompt Box (Agent writes its own prompt) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>3. Agent Generated AI Image Prompt</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'Copied Prompt' : 'Copy Prompt'}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="AI prompt written by the agent will appear here..."
                  className="w-full p-3 rounded-2xl bg-[#090D11] border border-cyan-500/30 text-cyan-100 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* 4. Live 16:9 Banner Image & Artwork */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>4. Generated 16:9 Banner Artwork & Preview</span>
                  </label>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    16:9 Widescreen E-Commerce Standard
                  </span>
                </div>

                {/* Banner 16:9 Image Preview Box */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-white/10 group">
                  <img
                    src={selectedBannerImage || '/logo.png'}
                    alt="AI Generated Banner"
                    className="w-full h-full object-cover transition-transform duration-700"
                  />

                  {/* If backdrop mode is active, show the live simulated overlay */}
                  {bannerStyleMode === 'backdrop' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent p-6 sm:p-10 flex flex-col justify-center max-w-lg z-10 pointer-events-none">
                      <span
                        className="px-3 py-1 rounded-full text-slate-950 font-extrabold text-[11px] w-fit mb-3 shadow-md"
                        style={{ backgroundColor: aiAccentColor || '#10B981' }}
                      >
                        {aiTagline || 'LIMITED PROMO'}
                      </span>
                      <h2 className="text-xl sm:text-3xl font-display font-extrabold text-white leading-tight mb-2 drop-shadow-md">
                        {aiTitle || 'Banner Title'}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mb-4 leading-relaxed opacity-90">
                        {aiSubtitle || 'Banner subtitle and promotional description will appear here.'}
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg text-slate-950 w-fit"
                        style={{ backgroundColor: aiAccentColor || '#10B981' }}
                      >
                        <span>{aiButtonText || 'Shop Collection'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Presets Picker */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
                  {(Object.keys(AI_CATEGORY_PRESETS) as BannerCategoryType[]).map((catKey) => {
                    const preset = AI_CATEGORY_PRESETS[catKey];
                    const isSelected = selectedBannerImage === preset.imageUrl;
                    return (
                      <div
                        key={catKey}
                        onClick={() => setSelectedBannerImage(preset.imageUrl)}
                        className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                            : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                        }`}
                      >
                        <div className="aspect-[16/9] w-full bg-slate-900">
                          <img
                            src={preset.imageUrl}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="p-1.5 bg-[#0A0E13] text-[10px] font-bold text-slate-200 truncate">
                          {preset.name}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Hidden canvas for off-screen rendering */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* 5. Editable Banner Copy Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Banner Headline</label>
                  <input
                    type="text"
                    value={aiTitle}
                    onChange={(e) => setAiTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subtitle / Deal Details</label>
                  <input
                    type="text"
                    value={aiSubtitle}
                    onChange={(e) => setAiSubtitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={aiButtonText}
                    onChange={(e) => setAiButtonText(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Store Link</label>
                  <input
                    type="text"
                    value={aiButtonLink}
                    onChange={(e) => setAiButtonLink(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 bg-[#121921] border-t border-white/10 shrink-0">
              <span className="text-[11px] text-slate-400">
                Published banners appear at the front of the homepage hero slider.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublishAiBanner}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Publish Banner to Store</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MANUAL BANNER CREATE MODAL                                   */}
      {/* ============================================================ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0E1318] border border-white/10 p-6 space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create Banner Manually</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eid Mega Collection 2026"
                  value={title || ''}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted Fabrics & Premium Tailoring"
                  value={subtitle || ''}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white"
                />
              </div>

              <ImageUploadField
                label="Banner Image *"
                helperText="Upload banner from device or enter URL"
                value={imageUrl || ''}
                onChange={setImageUrl}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Button Text</label>
                  <input
                    type="text"
                    value={buttonText || ''}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Button Target Link</label>
                  <input
                    type="text"
                    value={buttonLink || ''}
                    onChange={(e) => setButtonLink(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold cursor-pointer"
                >
                  Create Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
