import React, { useState, useEffect } from 'react';
import { Image, Plus, Trash2, X, ExternalLink } from 'lucide-react';
import { getBanners, createBanner, deleteBanner } from '../../lib/store';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { useAuth } from '../../context/AuthContext';
import type { Banner } from '../../types';

export const AdminBanners: React.FC = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Explore Collection');
  const [buttonLink, setButtonLink] = useState('/shop');
  const [imageUrl, setImageUrl] = useState('/logo.png');

  useEffect(() => {
    loadBanners();
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

  const handleCreate = async (e: React.FormEvent) => {
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2.5">
            <Image className="w-6 h-6 text-emerald-400" />
            <span>Homepage Hero & Promotional Banners</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure custom promotional sliders and seasonal campaigns
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl bg-[#0F141A] border border-white/[0.06] overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <h3 className="text-base font-bold text-white leading-tight">{b.title}</h3>
                {b.subtitle && <p className="text-xs text-slate-300 mt-1">{b.subtitle}</p>}
              </div>
            </div>

            <div className="p-4 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Action: <span className="text-emerald-400">{b.buttonText}</span> ({b.buttonLink})
              </span>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                title="Delete banner"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {banners.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No custom promotional banners configured. Storefront uses default brand styling.
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-2xl bg-[#0E1318] border border-white/10 p-6 space-y-4 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Create Banner</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
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
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold"
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
