import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Layers,
  Sparkles,
  Eye,
  Mail,
  Send,
  Wand2,
  Calculator,
  Loader2,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  generateAiDescription,
  suggestAiProductTitles,
  suggestAiPricing,
  broadcastProductPromoEmail,
  getCustomers,
  getSiteSettings,
  getPaymentMethods,
} from '../../lib/store';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { VideoUploadField } from '../../components/admin/VideoUploadField';
import { useAuth } from '../../context/AuthContext';
import type { Product, Category, ProductVariant, PaymentMethodConfig } from '../../types';

interface AdminProductsProps {
  navigate: (path: string) => void;
  openCreateImmediately?: boolean;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  navigate,
  openCreateImmediately = false,
}) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(openCreateImmediately);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [brand, setBrand] = useState('');
  const [fabricMaterial, setFabricMaterial] = useState('');
  const [gender, setGender] = useState<'all' | 'men' | 'women' | 'unisex' | 'kids'>('all');
  const [price, setPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number | undefined>(undefined);
  const [costPrice, setCostPrice] = useState<number | undefined>(undefined);
  const [totalStock, setTotalStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');

  // Images list
  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  // Videos list (max 3 videos, max 4 mins)
  const [videos, setVideos] = useState<string[]>([]);

  // Sizes & Colors
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [colors, setColors] = useState<{ name: string; code: string }[]>([
    { name: 'Black', code: '#000000' },
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorCode, setNewColorCode] = useState('#10B981');

  // Variants Matrix
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Flags
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Payment Methods Configuration State
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [paymentMethodMode, setPaymentMethodMode] = useState<'all' | 'custom'>('all');
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);

  // AI & Transactional Broadcast state
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [broadcastOnCreate, setBroadcastOnCreate] = useState<boolean>(true);
  const [generatingAiDesc, setGeneratingAiDesc] = useState<boolean>(false);
  const [aiTitleModalOpen, setAiTitleModalOpen] = useState<boolean>(false);
  const [aiTitlesList, setAiTitlesList] = useState<string[]>([]);
  const [aiTagsList, setAiTagsList] = useState<string[]>([]);
  const [generatingAiTitles, setGeneratingAiTitles] = useState<boolean>(false);
  const [aiPricingModalOpen, setAiPricingModalOpen] = useState<boolean>(false);
  const [targetMarginInput, setTargetMarginInput] = useState<number>(35);
  const [suggestedPricingData, setSuggestedPricingData] = useState<any>(null);

  // Broadcast to customer modal state
  const [broadcastModalProduct, setBroadcastModalProduct] = useState<Product | null>(null);
  const [broadcastSubject, setBroadcastSubject] = useState<string>('');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastSuccessMsg, setBroadcastSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    getCustomers().then((c) => setCustomerCount(c.length));
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [prodList, catList, payMethods] = await Promise.all([
        getProducts({ activeOnly: false }),
        getCategories(),
        getPaymentMethods(),
      ]);
      setProducts(prodList);
      setCategories(catList);
      const activePay = payMethods.filter((m) => m.isActive);
      const effectivePay = activePay.length > 0 ? activePay : payMethods;
      setAvailablePaymentMethods(effectivePay);
      if (catList.length > 0 && !category) {
        setCategory(catList[0].name);
      }
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setName('');
    setSku('RM-' + Math.floor(1000 + Math.random() * 9000));
    setCategory(categories[0]?.name || 'Apparel');
    setSubcategory('');
    setBrand('');
    setFabricMaterial('');
    setGender('all');
    setPrice(1200);
    setSalePrice(undefined);
    setCostPrice(undefined);
    setTotalStock(20);
    setDescription('');
    setShortDescription('');
    setImages(['/logo.png']);
    setThumbnailIndex(0);
    setVideos([]);
    setSizes(['S', 'M', 'L', 'XL']);
    setColors([{ name: 'Black', code: '#000000' }]);
    setVariants([]);
    setIsActive(true);
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsBestSeller(false);
    setTags([]);
    setPaymentMethodMode('all');
    setSelectedPaymentMethods(availablePaymentMethods.map((m) => m.code));
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setCategory(p.category);
    setSubcategory(p.subcategory || '');
    setBrand(p.brand || '');
    setFabricMaterial(p.fabricMaterial || '');
    setGender(p.gender || 'all');
    setPrice(p.price);
    setSalePrice(p.salePrice);
    setCostPrice(p.costPrice);
    setTotalStock(p.totalStock);
    setDescription(p.description);
    setShortDescription(p.shortDescription || '');
    setImages(p.images?.length > 0 ? p.images : ['/logo.png']);
    setThumbnailIndex(0);
    setVideos(p.videos || []);
    setSizes(p.sizes || []);
    setColors(p.colors?.map((c) => ({ name: c.name, code: c.code || '#000000' })) || []);
    setVariants(p.variants || []);
    setIsActive(p.isActive);
    setIsFeatured(p.isFeatured || false);
    setIsNewArrival(p.isNewArrival || false);
    setIsBestSeller(p.isBestSeller || false);
    setTags(p.tags || []);

    // Payment methods setup for editing product
    if (
      p.allowedPaymentMethods &&
      p.allowedPaymentMethods.length > 0 &&
      !p.allowedPaymentMethods.includes('all')
    ) {
      setPaymentMethodMode('custom');
      setSelectedPaymentMethods(p.allowedPaymentMethods);
    } else {
      setPaymentMethodMode('all');
      setSelectedPaymentMethods(availablePaymentMethods.map((m) => m.code));
    }

    setModalOpen(true);
  };

  // Generate slug
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Add / Remove Image
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const filtered = images.filter((_, i) => i !== index);
    setImages(filtered);
    if (thumbnailIndex >= filtered.length) {
      setThumbnailIndex(0);
    }
  };

  // Add / Remove Size
  const handleAddSize = () => {
    if (newSizeInput.trim() && !sizes.includes(newSizeInput.trim())) {
      setSizes([...sizes, newSizeInput.trim()]);
      setNewSizeInput('');
    }
  };

  // Add / Remove Color
  const handleAddColor = () => {
    if (newColorName.trim()) {
      setColors([...colors, { name: newColorName.trim(), code: newColorCode }]);
      setNewColorName('');
    }
  };

  // Build variants matrix automatically from sizes & colors
  const handleAutoGenerateVariants = () => {
    const list: ProductVariant[] = [];
    if (sizes.length > 0 && colors.length > 0) {
      sizes.forEach((s) => {
        colors.forEach((c) => {
          list.push({
            id: `var_${s}_${c.name}`.toLowerCase(),
            sku: `${sku}-${s}-${c.name.slice(0, 3)}`.toUpperCase(),
            size: s,
            color: c.name,
            colorCode: c.code,
            stock: Math.floor(totalStock / (sizes.length * colors.length)) || 5,
          });
        });
      });
    } else if (sizes.length > 0) {
      sizes.forEach((s) => {
        list.push({
          id: `var_${s}`.toLowerCase(),
          sku: `${sku}-${s}`.toUpperCase(),
          size: s,
          stock: Math.floor(totalStock / sizes.length) || 5,
        });
      });
    }
    setVariants(list);
  };

  // AI Description Generator
  const handleGenerateAiDescription = async () => {
    if (!name.trim()) {
      setToastMessage('Please enter a Product Name first so AI can tailor the description.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setGeneratingAiDesc(true);
    try {
      const desc = await generateAiDescription(
        name,
        category || 'Apparel',
        brand || 'R Mart Originals',
        fabricMaterial || 'Premium quality, durable, stylish',
        salePrice || price || 1200
      );
      if (desc) {
        setDescription(desc);
      }
    } finally {
      setGeneratingAiDesc(false);
    }
  };

  // AI Title Optimizer
  const handleOpenAiTitles = async () => {
    const query = name.trim() || category || 'Panjabi';
    setGeneratingAiTitles(true);
    setAiTitleModalOpen(true);
    try {
      const res = await suggestAiProductTitles(query, category, brand);
      setAiTitlesList(res.titles || []);
      setAiTagsList(res.tags || []);
    } finally {
      setGeneratingAiTitles(false);
    }
  };

  // AI Pricing Assistant
  const handleOpenAiPricing = async () => {
    setAiPricingModalOpen(true);
    const baseCost = Number(costPrice) || (Number(price) ? Number(price) * 0.6 : 800);
    const res = await suggestAiPricing(baseCost, targetMarginInput);
    if (res.pricing) {
      setSuggestedPricingData(res.pricing);
    }
  };

  const handleApplyAiPricing = () => {
    if (suggestedPricingData) {
      setPrice(suggestedPricingData.suggestedRegularPrice);
      setSalePrice(suggestedPricingData.suggestedSalePrice);
      setCostPrice(suggestedPricingData.costPrice);
      setAiPricingModalOpen(false);
    }
  };

  // Broadcast Promo Email
  const handleOpenBroadcastModal = (p: Product) => {
    setBroadcastModalProduct(p);
    setBroadcastSubject(`🔥 New Arrival: ${p.name} is now live on R Mart!`);
    setBroadcastSuccessMsg(null);
  };

  const handleSendBroadcast = async () => {
    if (!broadcastModalProduct) return;
    setIsBroadcasting(true);
    try {
      const res = await broadcastProductPromoEmail(broadcastModalProduct, broadcastSubject);
      setBroadcastSuccessMsg(res.message);
      setTimeout(() => {
        setBroadcastModalProduct(null);
        setBroadcastSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setToastMessage('Broadcast notice: ' + (err?.message || 'Failed'));
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Submitting state and toast
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      let finalImages = [...images];
      if (newImageUrl.trim() && !finalImages.includes(newImageUrl.trim())) {
        finalImages.push(newImageUrl.trim());
      }
      if (finalImages.length === 0) {
        finalImages = ['/logo.png'];
      }

      const slug = generateSlug(name) + '-' + (sku || Date.now());
      const thumbnail = finalImages[thumbnailIndex] || finalImages[0] || '/logo.png';

      // Calculate total stock from variants if variants exist
      const calculatedStock =
        variants.length > 0
          ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
          : Number(totalStock);

      const finalAllowedPayments =
        paymentMethodMode === 'custom' && selectedPaymentMethods.length > 0
          ? selectedPaymentMethods
          : ['all'];

      const productPayload = {
        name: name.trim(),
        sku: sku.trim() || 'SKU-' + Date.now(),
        slug,
        category: category.trim() || (categories[0]?.name || 'Apparel'),
        subcategory: subcategory.trim() || undefined,
        brand: brand.trim() || undefined,
        fabricMaterial: fabricMaterial.trim() || undefined,
        gender,
        price: Number(price) || 0,
        salePrice: salePrice ? Number(salePrice) : undefined,
        costPrice: costPrice ? Number(costPrice) : undefined,
        totalStock: calculatedStock,
        description: description.trim() || `${name.trim()} - Official R Mart collection.`,
        shortDescription: shortDescription.trim() || undefined,
        images: finalImages,
        thumbnail,
        videos: videos || [],
        sizes,
        colors,
        variants,
        isActive,
        isFeatured,
        isNewArrival,
        isBestSeller,
        tags,
        allowedPaymentMethods: finalAllowedPayments,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload, user?.email);
        setToastMessage(`Product "${name}" updated successfully.`);
      } else {
        await createProduct(productPayload, user?.email, broadcastOnCreate);
        if (broadcastOnCreate) {
          setToastMessage(`Product "${name}" published & AI promo email broadcasted to customers!`);
        } else {
          setToastMessage(`Product "${name}" published to store successfully.`);
        }
      }

      setModalOpen(false);
      setTimeout(() => setToastMessage(null), 3500);
      await loadData();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setToastMessage('Could not save product: ' + (err?.message || 'Unknown error occurred.'));
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id, user?.email);
    setDeleteConfirmId(null);
    setToastMessage('Product deleted.');
    setTimeout(() => setToastMessage(null), 3000);
    loadData();
  };

  const handleToggleActive = async (p: Product) => {
    await updateProduct(p.id, { isActive: !p.isActive }, user?.email);
    setToastMessage(`Product "${p.name}" is now ${!p.isActive ? 'Active' : 'Hidden'}.`);
    setTimeout(() => setToastMessage(null), 2500);
    loadData();
  };

  // Filtered Products
  const filtered = products.filter((p) => {
    if (selectedCatFilter !== 'all' && p.category !== selectedCatFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            <span>Product Catalog Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Total {products.length} products registered in database
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name, SKU, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-[#080B0E] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
        >
          <option value="all">All Categories ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading catalog...</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map((p) => {
                  const hasDiscount = Boolean(p.salePrice && p.salePrice < p.price);
                  const isLow = p.totalStock <= 5;
                  const isOut = p.totalStock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || p.images?.[0] || '/logo.png'}
                            alt={p.name}
                            className="w-10 h-12 rounded object-cover bg-slate-900 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <div className="font-semibold text-white truncate">{p.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.isFeatured && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded">
                                  Featured
                                </span>
                              )}
                              {p.isNewArrival && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded">
                                  New
                                </span>
                              )}
                              {p.videos && p.videos.length > 0 && (
                                <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                  📹 {p.videos.length} {p.videos.length === 1 ? 'Video' : 'Videos'}
                                </span>
                              )}
                              {p.allowedPaymentMethods &&
                              p.allowedPaymentMethods.length > 0 &&
                              !p.allowedPaymentMethods.includes('all') ? (
                                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-medium">
                                  {p.allowedPaymentMethods.join(', ')}
                                </span>
                              ) : (
                                <span className="text-[9px] text-slate-500">
                                  All Payments
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-300">{p.category}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-white">
                          ৳{(p.salePrice ?? p.price).toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] font-mono text-slate-500 line-through block">
                            ৳{p.price.toLocaleString()}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 uppercase">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                            {p.totalStock} left
                          </span>
                        ) : (
                          <span className="font-mono text-slate-300">{p.totalStock} units</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(p)}
                          className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                            p.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                          }`}
                          title="Click to toggle store visibility"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.isActive ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          />
                          <span>{p.isActive ? 'Active' : 'Hidden'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handleOpenBroadcastModal(p)}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/25 transition-colors flex items-center gap-1"
                            title="Broadcast AI Launch Email to All Registered Customers"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline text-[10px] font-semibold">AI Email</span>
                          </button>
                          <button
                            onClick={() => navigate(`/product/${p.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="View in Customer Store"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-3">
            <Package className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No products found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedCatFilter !== 'all'
                ? 'Try adjusting your search criteria.'
                : 'Click the "Add New Product" button above to populate your catalog.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteConfirmId(null)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0E1318] border border-white/10 p-6 space-y-4 z-10">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Delete Product?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to delete this product? This will remove it from the online store and customer catalog.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-[#0E1318] border border-white/10 shadow-2xl p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-slate-400 text-[11px]">
                  Fill out details to publish to the R Mart live store
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              {/* Product Basic Info */}
              <div className="space-y-4">
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400">
                  1. Identification & Classification
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-semibold text-slate-300">
                        Product Name *
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenAiTitles}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
                        title="Generate catchy high-converting titles with AI"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>AI Titles</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={name || ''}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Premium Cotton Panjabi / Wireless Earbuds"
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={sku || ''}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="RM-XXXX"
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Department / Category *
                    </label>
                    <select
                      value={category || 'Clothing'}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#080B0E] border border-white/10 text-white focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                      <option value="Clothing">Clothing</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Lifestyle">Lifestyle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Subcategory (Optional)
                    </label>
                    <input
                      type="text"
                      value={subcategory || ''}
                      onChange={(e) => setSubcategory(e.target.value)}
                      placeholder="e.g. Polo / Panjabi"
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={brand || ''}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. R Mart Originals"
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400">
                    2. Pricing & Base Inventory
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAiPricing}
                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors"
                    title="Calculate optimal price, discounts & profit margins"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>AI Price Calculator</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Regular Price (৳ BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={price ?? 0}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Sale Discount Price (৳ BDT)
                    </label>
                    <input
                      type="number"
                      value={salePrice ?? ''}
                      onChange={(e) =>
                        setSalePrice(e.target.value ? Number(e.target.value) : undefined)
                      }
                      placeholder="Leave empty if no discount"
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Total Initial Stock Units *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={totalStock ?? 0}
                      onChange={(e) => setTotalStock(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Images with Device Upload & URL Options */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <ImageUploadField
                  label="3. Product Images"
                  helperText="Upload files directly from device or paste image URL"
                  multiple
                  values={images}
                  selectedIndex={thumbnailIndex}
                  onSelectIndex={(i) => setThumbnailIndex(i)}
                  onAddMultiple={(newUrls) => setImages([...images, ...newUrls])}
                  onRemoveIndex={(i) => handleRemoveImage(i)}
                />
              </div>

              {/* Product Videos */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <VideoUploadField
                  label="3.1 Product Videos (Optional)"
                  helperText="Upload up to 3 videos (max 4 minutes per video) or add direct MP4/YouTube links"
                  videos={videos}
                  onChange={setVideos}
                />
              </div>

              {/* Sizes and Colors */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400">
                  4. Sizes, Colors & Variants
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sizes */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-300 block">Available Sizes</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add size (e.g. S, M, L, 42)"
                        value={newSizeInput || ''}
                        onChange={(e) => setNewSizeInput(e.target.value)}
                        className="flex-1 h-8 px-2.5 rounded bg-white/[0.04] border border-white/10 text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="px-3 h-8 rounded bg-white/10 text-white font-medium"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sizes.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-slate-200 flex items-center gap-1.5"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() => setSizes(sizes.filter((x) => x !== s))}
                            className="text-slate-500 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-300 block">Available Colors</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Color name (e.g. Navy Blue)"
                        value={newColorName || ''}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="flex-1 h-8 px-2.5 rounded bg-white/[0.04] border border-white/10 text-white"
                      />
                      <input
                        type="color"
                        value={newColorCode || '#10B981'}
                        onChange={(e) => setNewColorCode(e.target.value)}
                        className="w-8 h-8 rounded bg-transparent border border-white/10 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        className="px-3 h-8 rounded bg-white/10 text-white font-medium"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {colors.map((c) => (
                        <span
                          key={c.name}
                          className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-slate-200 flex items-center gap-1.5"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: c.code }}
                          />
                          <span>{c.name}</span>
                          <button
                            type="button"
                            onClick={() => setColors(colors.filter((x) => x.name !== c.name))}
                            className="text-slate-500 hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAutoGenerateVariants}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]"
                  >
                    Generate Variant Combinations ({sizes.length * Math.max(1, colors.length)} items)
                  </button>
                </div>

                {variants.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-white/10 rounded-xl p-2 divide-y divide-white/5 bg-black/20">
                    {variants.map((v, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-slate-300">
                          {v.size && `Size: ${v.size}`} {v.color && `· ${v.color}`} ({v.sku})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Stock:</span>
                          <input
                            type="number"
                            min={0}
                            value={v.stock ?? 0}
                            onChange={(e) => {
                              const updated = [...variants];
                              updated[idx].stock = Number(e.target.value);
                              setVariants(updated);
                            }}
                            className="w-16 h-6 px-1 text-center bg-white/[0.05] border border-white/10 rounded text-white font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400">
                    5. Product Description & Details
                  </h3>
                  <button
                    type="button"
                    onClick={handleGenerateAiDescription}
                    disabled={generatingAiDesc}
                    className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                    title="Generate persuasive Bangla + English copy with AI"
                  >
                    {generatingAiDesc ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>{generatingAiDesc ? 'AI Writing Copy...' : 'Generate with AI'}</span>
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Full Description *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={description || ''}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter detailed fabric, styling and care instructions..."
                    className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Fabric / Material
                    </label>
                    <input
                      type="text"
                      value={fabricMaterial || ''}
                      onChange={(e) => setFabricMaterial(e.target.value)}
                      placeholder="e.g. 100% Pure Combed Cotton"
                      className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Gender Segment
                    </label>
                    <select
                      value={gender || 'all'}
                      onChange={(e: any) => setGender(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#080B0E] border border-white/10 text-white"
                    >
                      <option value="all">All / General</option>
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="unisex">Unisex</option>
                      <option value="kids">Kids</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Visibility and Badges */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400">
                  6. Visibility & Badges
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <span>Active in Store</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <span>Featured Item</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!isNewArrival}
                      onChange={(e) => setIsNewArrival(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <span>New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 rounded"
                    />
                    <span>Best Seller</span>
                  </label>
                </div>
              </div>

              {/* 7. Accepted Payment Methods Configuration */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-wider text-[11px] text-emerald-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>7. Accepted Payment Methods / পেমেন্ট মেথড সুবিধা</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      এই প্রোডাক্ট কেনার সময় কাস্টমার কোন কোন মেথডে পেমেন্ট করতে পারবে তা নির্দিষ্ট করুন। (সব প্রোডাক্টে ডিফল্টভাবে সব মেথড সক্রিয় থাকে)।
                    </p>
                  </div>
                </div>

                {/* Option Selector: All vs Custom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setPaymentMethodMode('all');
                      setSelectedPaymentMethods(availablePaymentMethods.map((m) => m.code));
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethodMode === 'all'
                        ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30 text-white'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="paymentMethodMode"
                        checked={paymentMethodMode === 'all'}
                        onChange={() => {
                          setPaymentMethodMode('all');
                          setSelectedPaymentMethods(availablePaymentMethods.map((m) => m.code));
                        }}
                        className="mt-0.5 text-emerald-500 focus:ring-0"
                      />
                      <div>
                        <span className="font-bold text-xs text-white block">
                          All Payment Methods (Default) · সব মেথড প্রযোজ্য
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                          স্টোরের সব সচল পেমেন্ট মেথড (Cash on Delivery, bKash, Nagad, Rocket ইত্যাদি) স্বয়ংক্রিয়ভাবে সক্রিয় থাকবে।
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethodMode('custom')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethodMode === 'custom'
                        ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30 text-white'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="paymentMethodMode"
                        checked={paymentMethodMode === 'custom'}
                        onChange={() => setPaymentMethodMode('custom')}
                        className="mt-0.5 text-emerald-500 focus:ring-0"
                      />
                      <div>
                        <span className="font-bold text-xs text-white block">
                          Custom Payment Methods · কাস্টম মেথড নির্বাচন
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                          এই নির্দিষ্ট প্রোডাক্টের জন্য শুধু বাছাইকৃত মেথড সক্রিয় থাকবে (যেমন: শুধু অনলাইন পেমেন্ট বা COD বন্ধ)।
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Checkbox Grid */}
                {paymentMethodMode === 'custom' && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-[11px] font-semibold text-slate-300">
                        Select Allowed Methods ({selectedPaymentMethods.length} of {availablePaymentMethods.length} selected):
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethods(availablePaymentMethods.map((m) => m.code))}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                        >
                          Select All
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentMethods([])}
                          className="text-[10px] text-slate-400 hover:text-slate-200"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {availablePaymentMethods.map((method) => {
                        const isChecked = selectedPaymentMethods.includes(method.code);
                        const isCOD = method.code.toLowerCase() === 'cod';
                        const isMobile = ['bkash', 'nagad', 'rocket', 'upay'].some((m) =>
                          method.code.toLowerCase().includes(m)
                        );

                        return (
                          <label
                            key={method.id || method.code}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-2xs'
                                : 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPaymentMethods([...selectedPaymentMethods, method.code]);
                                } else {
                                  setSelectedPaymentMethods(
                                    selectedPaymentMethods.filter((c) => c !== method.code)
                                  );
                                }
                              }}
                              className="w-4 h-4 rounded text-emerald-500 border-white/20 bg-slate-900"
                            />
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {isMobile ? (
                                <Smartphone className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              ) : isCOD ? (
                                <Banknote className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="font-bold text-xs block text-slate-200 truncate">
                                  {method.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {method.code}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {selectedPaymentMethods.length === 0 && (
                      <p className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Warning: No payment method selected. If left empty, all store payment methods will be allowed by default.</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Automated AI Launch Email to Customers Toggle */}
              {!editingProduct && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Broadcast AI Launch Email to All Customers</span>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-normal">
                          {customerCount} recipient(s)
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-300">
                        নতুন প্রোডাক্ট পাবলিশ হওয়ার সাথে সাথে ডিরেক্ট লিংক সহ সব কাস্টমারদের কাছে প্রমোশনাল ইমেইল চলে যাবে।
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={broadcastOnCreate}
                      onChange={(e) => setBroadcastOnCreate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting
                    ? 'Publishing Product...'
                    : editingProduct
                    ? 'Save Product Changes'
                    : 'Publish Product to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: MANUAL BROADCAST PROMO EMAIL TO CUSTOMERS */}
      {broadcastModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setBroadcastModalProduct(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0E1318] border border-white/10 p-6 space-y-5 z-10 text-white text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Broadcast AI Product Email</h3>
                  <p className="text-[11px] text-slate-400">
                    Send promotional email with direct link to all registered users
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBroadcastModalProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {broadcastSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 space-y-2 text-center py-6">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <h4 className="font-bold text-sm">Dispatched Successfully!</h4>
                <p className="text-xs text-slate-300">{broadcastSuccessMsg}</p>
              </div>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                  <img
                    src={broadcastModalProduct.thumbnail || '/logo.png'}
                    alt={broadcastModalProduct.name}
                    className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-slate-900 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-xs truncate">
                      {broadcastModalProduct.name}
                    </h4>
                    <p className="text-[11px] text-emerald-400 font-mono font-bold">
                      ৳{(broadcastModalProduct.salePrice || broadcastModalProduct.price).toLocaleString()} BDT
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      Direct Link: /product/{broadcastModalProduct.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">Email Subject</label>
                  <input
                    type="text"
                    value={broadcastSubject || ''}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-[11px] text-slate-400">
                  <p>
                    • <strong>Recipients:</strong> All registered customer accounts + store admin
                  </p>
                  <p>
                    • <strong>Template:</strong> Includes high-res image, price, discount badge, Cash on Delivery highlights, and one-click purchase button.
                  </p>
                  <p>• <strong>Sender:</strong> Configured store SMTP service</p>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastModalProduct(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isBroadcasting}
                    onClick={handleSendBroadcast}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isBroadcasting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isBroadcasting ? 'Broadcasting via SMTP...' : 'Send to All Customers'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: AI TITLE OPTIMIZER */}
      {aiTitleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setAiTitleModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-[#0E1318] border border-white/10 p-6 space-y-4 z-10 text-white text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">AI Product Title Suggestions</h3>
              </div>
              <button onClick={() => setAiTitleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Select any of the AI-optimized titles to immediately apply to your product:
            </p>

            {generatingAiTitles ? (
              <div className="py-8 text-center text-emerald-400 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>AI generating high-converting titles...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {aiTitlesList.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setName(t);
                      setAiTitleModalOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-white transition-all text-xs font-semibold"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            {aiTagsList.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block mb-1">Recommended SEO Tags:</span>
                <div className="flex flex-wrap gap-1.5">
                  {aiTagsList.map((tg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!tags.includes(tg)) setTags([...tags, tg]);
                      }}
                      className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-slate-300 hover:text-emerald-400 text-[10px]"
                    >
                      +{tg}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: AI PRICING CALCULATOR */}
      {aiPricingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setAiPricingModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-3xl bg-[#0E1318] border border-white/10 p-6 space-y-4 z-10 text-white text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">AI Smart Pricing Calculator</h3>
              </div>
              <button onClick={() => setAiPricingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Profit Margin (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={15}
                    max={70}
                    value={targetMarginInput ?? 35}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTargetMarginInput(val);
                      const baseCost = Number(costPrice) || (Number(price) ? Number(price) * 0.6 : 800);
                      suggestAiPricing(baseCost, val).then((r) => {
                        if (r.pricing) setSuggestedPricingData(r.pricing);
                      });
                    }}
                    className="flex-1 accent-emerald-500"
                  />
                  <span className="font-mono font-bold text-emerald-400 w-10">{targetMarginInput}%</span>
                </div>
              </div>

              {suggestedPricingData && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Cost Price:</span>
                    <span className="font-mono text-white">৳{suggestedPricingData.costPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Regular Showcase Price:</span>
                    <span className="font-mono text-slate-400 line-through">৳{suggestedPricingData.suggestedRegularPrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
                    <span className="text-emerald-400 font-bold">Suggested Selling Price:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ৳{suggestedPricingData.suggestedSalePrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Discount Presented to Buyer:</span>
                    <span className="text-amber-400 font-semibold">{suggestedPricingData.discountPercent}% OFF</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Est. Net Profit per Unit:</span>
                    <span className="text-emerald-400 font-mono font-bold">৳{suggestedPricingData.estimatedProfit}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAiPricingModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyAiPricing}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
              >
                Apply to Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
