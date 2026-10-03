import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, X, Check, ArrowRight } from 'lucide-react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../lib/store';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { useAuth } from '../../context/AuthContext';
import type { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [subcatInput, setSubcatInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const list = await getCategories();
      setCategories(list);
    } finally {
      setLoading(false);
    }
  }

  const openAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setIsActive(true);
    setSortOrder(categories.length);
    setSubcategories([]);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setImageUrl(c.image || '');
    setIsActive(c.isActive);
    setSortOrder(c.sortOrder);
    setSubcategories(c.subcategories || []);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
      );
    }
  };

  const handleAddSubcat = () => {
    if (subcatInput.trim() && !subcategories.includes(subcatInput.trim())) {
      setSubcategories([...subcategories, subcatInput.trim()]);
      setSubcatInput('');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/\s+/g, '-'),
      description: description.trim() || undefined,
      image: imageUrl.trim() || undefined,
      isActive,
      sortOrder: Number(sortOrder) || 0,
      subcategories,
    };

    if (editingCategory) {
      await updateCategory(editingCategory.id, payload, user?.email);
    } else {
      await createCategory(payload, user?.email);
    }

    setModalOpen(false);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id, user?.email);
    loadCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-400" />
            <span>Category & Department Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage product classifications, slugs and subcategories dynamically
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Category</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-[#0F141A] border border-white/[0.06] hover:border-white/15 transition-all space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{cat.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    cat.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Draft'}
                </span>
              </div>

              {cat.description && (
                <p className="text-xs text-slate-400 line-clamp-2 mt-2">{cat.description}</p>
              )}

              {/* Subcategories */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {cat.subcategories.map((sc) => (
                    <span
                      key={sc}
                      className="px-2 py-0.5 rounded bg-white/[0.04] text-[10px] text-slate-300"
                    >
                      {sc}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-xs">
              <span className="text-[11px] text-slate-500 font-mono">Order: {cat.sortOrder}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0E1318] border border-white/10 p-6 space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Traditional Panjabi"
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={slug || ''}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <ImageUploadField
                label="Category Image"
                helperText="Upload image file or paste URL"
                value={imageUrl || ''}
                onChange={setImageUrl}
              />

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Subcategories</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={subcatInput || ''}
                    onChange={(e) => setSubcatInput(e.target.value)}
                    placeholder="e.g. Cotton, Silk, Embroidered"
                    className="flex-1 h-8 px-2.5 rounded bg-white/[0.04] border border-white/10 text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcat}
                    className="px-3 h-8 rounded bg-white/10 text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {subcategories.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-white/[0.05] text-[11px] text-slate-300 flex items-center gap-1"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => setSubcategories(subcategories.filter((x) => x !== s))}
                        className="text-slate-500 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={!!isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded"
                />
                <label htmlFor="catActive" className="text-slate-300">
                  Active and visible in store catalog
                </label>
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
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
