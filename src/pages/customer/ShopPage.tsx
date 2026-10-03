import React, { useState, useEffect, useMemo } from 'react';
import {
  SlidersHorizontal,
  X,
  Search,
  ArrowUpDown,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { ProductCard } from '../../components/customer/ProductCard';
import { QuickViewModal } from '../../components/customer/QuickViewModal';
import { EmptyState } from '../../components/common/EmptyState';
import { getProducts, getCategories } from '../../lib/store';
import type { Product, Category } from '../../types';

interface ShopPageProps {
  navigate: (path: string) => void;
  initialCategory?: string;
  initialSearch?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  navigate,
  initialCategory,
  initialSearch,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'popular'>('newest');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Quick View modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [prodList, catList] = await Promise.all([
        getProducts({ activeOnly: true }),
        getCategories(),
      ]);
      setProducts(prodList);
      setCategories(catList.filter((c) => c.isActive));

      // Find max price to calibrate range
      const maxP = prodList.reduce((max, p) => Math.max(max, p.salePrice ?? p.price), 5000);
      setPriceRange([0, Math.ceil(maxP / 500) * 500]);
    } catch (err) {
      console.warn('Error loading shop catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Update when props change
  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch !== undefined) setSearchQuery(initialSearch);
  }, [initialCategory, initialSearch]);

  // Extract all unique sizes and colors available across loaded products
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => set.add(s));
      p.variants?.forEach((v) => {
        if (v.size) set.add(v.size);
      });
    });
    return Array.from(set);
  }, [products]);

  const availableColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      p.colors?.forEach((c) => map.set(c.name, c.code || ''));
      p.variants?.forEach((v) => {
        if (v.color) map.set(v.color, v.colorCode || '');
      });
    });
    return Array.from(map.entries()).map(([name, code]) => ({ name, code }));
  }, [products]);

  // Filter & sort logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchedCategoryObj = categories.find(
          (c) =>
            c.slug.toLowerCase() === selectedCategory.toLowerCase() ||
            c.id.toLowerCase() === selectedCategory.toLowerCase() ||
            c.name.toLowerCase() === selectedCategory.toLowerCase()
        );

        const targetCatName = (matchedCategoryObj ? matchedCategoryObj.name : selectedCategory).toLowerCase();
        const targetCatId = (matchedCategoryObj ? matchedCategoryObj.id : '').toLowerCase();
        const targetCatSlug = (matchedCategoryObj ? matchedCategoryObj.slug : selectedCategory).toLowerCase();

        const pCat = (p.category || '').toLowerCase();
        const pCatId = (p.categoryId || '').toLowerCase();
        const pSubcat = (p.subcategory || '').toLowerCase();

        const matchCat =
          pCat === targetCatName ||
          pCat === targetCatSlug ||
          (targetCatId && pCatId === targetCatId) ||
          pSubcat === targetCatName ||
          pSubcat === targetCatSlug;

        if (!matchCat) return false;
      }

      // Stock filter
      if (onlyInStock && p.totalStock <= 0) {
        return false;
      }

      // Price filter
      const pPrice = p.salePrice ?? p.price;
      if (pPrice < priceRange[0] || pPrice > priceRange[1]) {
        return false;
      }

      // Size filter
      if (selectedSize !== 'all') {
        const hasSize =
          p.sizes?.includes(selectedSize) ||
          p.variants?.some((v) => v.size === selectedSize && v.stock > 0);
        if (!hasSize) return false;
      }

      // Color filter
      if (selectedColor !== 'all') {
        const hasColor =
          p.colors?.some((c) => c.name.toLowerCase() === selectedColor.toLowerCase()) ||
          p.variants?.some((v) => v.color?.toLowerCase() === selectedColor.toLowerCase());
        if (!hasColor) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku?.toLowerCase().includes(q);
        const matchesCat = p.category?.toLowerCase().includes(q);
        const matchesBrand = p.brand?.toLowerCase().includes(q);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesSku && !matchesCat && !matchesBrand && !matchesTags) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
      }
      if (sortBy === 'price-desc') {
        return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
      }
      if (sortBy === 'popular') {
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    products,
    selectedCategory,
    onlyInStock,
    priceRange,
    selectedSize,
    selectedColor,
    searchQuery,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedSize('all');
    setSelectedColor('all');
    setOnlyInStock(false);
    setSortBy('newest');
  };

  const isAnyFilterActive =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    selectedSize !== 'all' ||
    selectedColor !== 'all' ||
    onlyInStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            {selectedCategory === 'all'
              ? 'Catalog & Shop'
              : categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <span className="font-mono text-emerald-700 font-bold">{filteredProducts.length}</span> verified products with nationwide Cash on Delivery
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          {/* Quick search input */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search in catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="h-10 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden h-10 px-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1.5 text-xs font-bold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>Filters</span>
              </div>
              {isAnyFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-slate-400 hover:text-emerald-700 flex items-center gap-1 transition-colors font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Categories
              </h3>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="font-mono text-[10px] text-slate-400">{products.length}</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>In Stock Items Only</span>
              </label>
            </div>

            {/* Size Filter */}
            {availableSizes.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Size
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedSize('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                      selectedSize === 'all'
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors border ${
                        selectedSize === size
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Filter */}
            {availableColors.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Color
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedColor('all')}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors border ${
                      selectedColor === 'all'
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  {availableColors.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors border ${
                        selectedColor === col.name
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {col.code && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: col.code }}
                        />
                      )}
                      <span>{col.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="lg:col-span-9">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  navigate={navigate}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={isAnyFilterActive ? 'search' : 'products'}
              title={isAnyFilterActive ? 'No products match your criteria' : 'Catalog Loading'}
              description={
                isAnyFilterActive
                  ? 'Try relaxing or resetting your active filters to discover more items.'
                  : 'We are loading products from the R Mart collection. Please wait a moment.'
              }
              actionLabel={isAnyFilterActive ? 'Reset Filters' : 'Refresh Catalog'}
              onAction={isAnyFilterActive ? clearAllFilters : () => loadCatalog()}
            />
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                  <h3 className="text-base font-extrabold text-slate-900">Filter Catalog</h3>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Categories</h4>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                        selectedCategory === 'all'
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedCategory(c.slug);
                          setMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs ${
                          selectedCategory === c.slug
                            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* In Stock */}
                <div className="pt-4 border-t border-slate-100 mb-6">
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileFilterOpen(false);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
        navigate={navigate}
      />
    </div>
  );
};
