import React, { useState, useEffect } from 'react';
import {
  Star,
  Check,
  X,
  Trash2,
  MessageSquare,
  Sparkles,
  Loader2,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react';
import {
  getReviews,
  moderateReview,
  deleteReview,
  getProducts,
  generateAiReviews,
  submitReview,
} from '../../lib/store';
import { useAuth } from '../../context/AuthContext';
import type { Review, Product } from '../../types';

export const AdminReviews: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Review Generator Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [reviewCount, setReviewCount] = useState<number>(3);
  const [generating, setGenerating] = useState(false);
  const [generatedReviews, setGeneratedReviews] = useState<any[]>([]);
  const [savingSuccess, setSavingSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [revList, prodList] = await Promise.all([
        getReviews(undefined, false),
        getProducts({ activeOnly: false }),
      ]);
      setReviews(revList);
      setProducts(prodList);
      if (prodList.length > 0 && !selectedProductId) {
        setSelectedProductId(prodList[0].id);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: string, approve: boolean) => {
    await moderateReview(id, approve, user?.email);
    const list = await getReviews(undefined, false);
    setReviews(list);
  };

  const handleDelete = async (id: string) => {
    await deleteReview(id, user?.email);
    const list = await getReviews(undefined, false);
    setReviews(list);
  };

  const handleGenerateAiReviews = async () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;
    setGenerating(true);
    setGeneratedReviews([]);
    try {
      const list = await generateAiReviews(prod.name, prod.category, reviewCount);
      setGeneratedReviews(list);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAllGeneratedReviews = async () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod || generatedReviews.length === 0) return;

    for (const r of generatedReviews) {
      await submitReview({
        productId: prod.id,
        productName: prod.name,
        customerId: 'ai_gen_' + Date.now(),
        customerName: r.userName || 'Verified Buyer',
        customerEmail: `${(r.userName || 'buyer').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        rating: Number(r.rating) || 5,
        comment: r.comment || 'Excellent quality and service!',
        verifiedPurchase: true,
      });
    }

    setSavingSuccess(true);
    setTimeout(() => {
      setSavingSuccess(false);
      setAiModalOpen(false);
      setGeneratedReviews([]);
      loadData();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-emerald-400" />
            <span>Product Reviews & Moderation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review, approve, or generate authentic Bangladeshi buyer testimonials using AI
          </p>
        </div>

        <button
          onClick={() => {
            setAiModalOpen(true);
            setGeneratedReviews([]);
          }}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Reviews</span>
        </button>
      </div>

      {/* Reviews Table / List */}
      <div className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-white/[0.04]">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-xs">{r.customerName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.isApproved
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {r.isApproved ? 'Approved' : 'Pending Approval'}
                    </span>
                    {r.verifiedPurchase && (
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.2 rounded font-medium">
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400' : 'text-slate-700'}`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{r.comment}"
                  </p>

                  <div className="text-[11px] text-slate-400">
                    Product: <span className="text-slate-200">{r.productName || r.productId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {!r.isApproved ? (
                    <button
                      onClick={() => handleApprove(r.id, true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprove(r.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400 space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No Reviews in Store Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Real product reviews submitted by customers or generated via AI will appear here for your moderation.
            </p>
            <button
              onClick={() => setAiModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate First AI Reviews</span>
            </button>
          </div>
        )}
      </div>

      {/* AI REVIEW GENERATOR MODAL */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setAiModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-xl rounded-3xl bg-[#0E1318] border border-white/10 p-6 sm:p-7 space-y-5 z-10 text-white text-xs max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Customer Review Generator</h3>
                  <p className="text-[11px] text-slate-400">
                    Generate realistic verified buyer reviews in Bengali and English for any product
                  </p>
                </div>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Selector */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Select Catalog Product *</label>
              <select
                value={selectedProductId || ''}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#080B0E] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (৳{(p.salePrice || p.price).toLocaleString()} - {p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 block">Number of Reviews to Generate</label>
              <div className="flex gap-2">
                {[1, 2, 3, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setReviewCount(num)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      reviewCount === num
                        ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400 shadow-sm'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                    }`}
                  >
                    {num} Reviews
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div>
              <button
                type="button"
                disabled={generating || !selectedProductId}
                onClick={handleGenerateAiReviews}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Creating Authentic Bangladeshi Reviews...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Reviews with AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Preview */}
            {generatedReviews.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-white/10">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  Generated Reviews ({generatedReviews.length})
                </span>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {generatedReviews.map((rev, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{rev.userName}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, st) => (
                            <Star
                              key={st}
                              className={`w-3 h-3 ${st < (rev.rating || 5) ? 'fill-amber-400' : 'text-slate-700'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300 italic text-[11px]">"{rev.comment}"</p>
                      {rev.location && (
                        <span className="text-[10px] text-slate-500 font-mono">📍 {rev.location}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setGeneratedReviews([])}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white font-medium text-xs"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllGeneratedReviews}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Publish All to Product</span>
                  </button>
                </div>
              </div>
            )}

            {savingSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reviews added to product successfully!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
