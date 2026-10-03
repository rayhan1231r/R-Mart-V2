import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Search, Check, Save, RotateCcw } from 'lucide-react';
import { getProducts, updateProduct } from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { Product } from '../../types';

export const AdminInventory: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low' | 'out'>('all');
  const [editingStock, setEditingStock] = useState<{ [productId: string]: number }>({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const list = await getProducts({ activeOnly: false });
      setProducts(list);
    } finally {
      setLoading(false);
    }
  }

  const handleStockChange = (productId: string, val: number) => {
    setEditingStock((prev) => ({ ...prev, [productId]: Math.max(0, val) }));
  };

  const handleSaveStock = async (product: Product) => {
    const newStock = editingStock[product.id];
    if (newStock === undefined) return;

    await updateProduct(
      product.id,
      { totalStock: newStock },
      user?.email
    );

    setSavedSuccessId(product.id);
    setTimeout(() => setSavedSuccessId(null), 1500);
    loadProducts();
  };

  const filteredProducts = products.filter((p) => {
    if (filterMode === 'low' && (p.totalStock > 5 || p.totalStock <= 0)) return false;
    if (filterMode === 'out' && p.totalStock > 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-emerald-400" />
            <span>Inventory & Stock Control</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time SKU quantities and automatic out-of-stock management
          </p>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-xl text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Products ({products.length})
          </button>
          <button
            onClick={() => setFilterMode('low')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterMode === 'low'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Low Stock (≤ 5 units)
          </button>
          <button
            onClick={() => setFilterMode('out')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterMode === 'out'
                ? 'bg-rose-500 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Out of Stock (0 units)
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by SKU or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading inventory...</div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400">
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Variants / Sizes</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Quick Adjust</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProducts.map((p) => {
                  const currentVal =
                    editingStock[p.id] !== undefined ? editingStock[p.id] : (p.totalStock ?? 0);
                  const isModified = editingStock[p.id] !== undefined && editingStock[p.id] !== p.totalStock;

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.thumbnail || p.images?.[0] || '/logo.png'}
                            alt={p.name}
                            className="w-9 h-11 rounded object-cover bg-slate-900 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                          <div className="font-semibold text-white truncate max-w-xs">{p.name}</div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                      <td className="py-3 px-4 text-slate-300">{p.category}</td>

                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {p.sizes && p.sizes.length > 0 ? p.sizes.join(', ') : 'Single Variant'}
                      </td>

                      <td className="py-3 px-4">
                        {p.totalStock <= 0 ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] uppercase">
                            Out of Stock
                          </span>
                        ) : p.totalStock <= 5 ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                            {p.totalStock} units (Low)
                          </span>
                        ) : (
                          <span className="font-mono text-emerald-400 font-bold">
                            {p.totalStock} units
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={currentVal ?? 0}
                            onChange={(e) => handleStockChange(p.id, Number(e.target.value))}
                            className="w-20 h-7 px-2 text-center rounded bg-white/[0.05] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            onClick={() => handleStockChange(p.id, currentVal + 10)}
                            className="px-2 h-7 rounded bg-white/10 hover:bg-white/20 text-[10px] text-slate-300 font-mono"
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {isModified ? (
                          <button
                            onClick={() => handleSaveStock(p)}
                            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors flex items-center gap-1 ml-auto"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save</span>
                          </button>
                        ) : savedSuccessId === p.id ? (
                          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 justify-end">
                            <Check className="w-3.5 h-3.5" />
                            <span>Updated!</span>
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[11px]">Synced</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No products match the selected inventory filter.
          </div>
        )}
      </div>
    </div>
  );
};
