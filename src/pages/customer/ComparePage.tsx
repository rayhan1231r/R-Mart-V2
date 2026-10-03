import React from 'react';
import { Layers, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface ComparePageProps {
  navigate: (path: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ navigate }) => {
  const { compareList, toggleCompare, clearCompare, addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="pb-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Product Comparison</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare attributes, specifications, pricing, and stock side-by-side
          </p>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={clearCompare}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {compareList.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm">
            <tbody>
              {/* Product Preview Row */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-4 w-36 font-bold text-slate-500">Product</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4 min-w-[200px] align-top">
                    <div className="space-y-2">
                      <img
                        src={p.thumbnail || p.images?.[0] || '/logo.png'}
                        alt={p.name}
                        className="w-full aspect-[3/4] rounded-2xl object-cover bg-slate-100 border border-slate-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/logo.png';
                        }}
                      />
                      <h4
                        onClick={() => navigate(`/product/${p.slug || p.id}`)}
                        className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer"
                      >
                        {p.name}
                      </h4>
                      <button
                        onClick={() => toggleCompare(p)}
                        className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Price Row */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-slate-500">Price</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4 font-mono font-extrabold text-slate-900 text-sm">
                    ৳{(p.salePrice ?? p.price).toLocaleString()}
                    {p.salePrice && p.salePrice < p.price && (
                      <span className="text-xs text-slate-400 line-through ml-2">
                        ৳{p.price.toLocaleString()}
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Department / Category */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-4 font-bold text-slate-500">Department</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4 text-slate-800 font-semibold">
                    {p.category || 'General'}
                  </td>
                ))}
              </tr>

              {/* Availability */}
              <tr className="border-b border-slate-100">
                <td className="p-4 font-bold text-slate-500">Stock Status</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.totalStock > 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        In Stock ({p.totalStock})
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Out of Stock
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Material */}
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <td className="p-4 font-bold text-slate-500">Material</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4 text-slate-700 font-medium">
                    {p.fabricMaterial || 'Standard Quality'}
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr>
                <td className="p-4 font-bold text-slate-500">Action</td>
                {compareList.map((p) => (
                  <td key={p.id} className="p-4">
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.totalStock <= 0}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-xs">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Products to Compare</h3>
          <p className="text-xs text-slate-500 mb-6">
            Compare up to 4 items simultaneously to compare features, sizes, specs, and pricing side-by-side.
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            Explore Catalog
          </button>
        </div>
      )}
    </div>
  );
};
