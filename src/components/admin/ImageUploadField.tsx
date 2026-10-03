import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { processImageFile, processMultipleImageFiles } from '../../lib/imageUpload';

interface ImageUploadFieldProps {
  label?: string;
  helperText?: string;
  value?: string; // For single image mode
  onChange?: (url: string) => void;
  // For multi-image mode
  multiple?: boolean;
  values?: string[];
  onAddMultiple?: (urls: string[]) => void;
  onRemoveIndex?: (index: number) => void;
  selectedIndex?: number;
  onSelectIndex?: (index: number) => void;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Image',
  helperText,
  value = '',
  onChange,
  multiple = false,
  values = [],
  onAddMultiple,
  onRemoveIndex,
  selectedIndex,
  onSelectIndex,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setUploadError(null);
    try {
      if (multiple && onAddMultiple) {
        const processed = await processMultipleImageFiles(files);
        if (processed.length > 0) {
          onAddMultiple(processed);
        }
      } else if (onChange) {
        const processed = await processImageFile(files[0]);
        onChange(processed);
      }
    } catch (err: any) {
      console.warn('Image processing error:', err);
      setUploadError('Failed to process image: ' + (err?.message || 'Unknown error'));
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    if (multiple && onAddMultiple) {
      onAddMultiple([urlInput.trim()]);
    } else if (onChange) {
      onChange(urlInput.trim());
    }
    setUrlInput('');
  };

  return (
    <div className="space-y-2.5">
      {uploadError && (
        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
          {uploadError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          {label} {helperText && <span className="text-[11px] text-slate-500 font-normal">({helperText})</span>}
        </label>
        <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/10 text-[11px]">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
              mode === 'upload' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
              mode === 'url' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>URL</span>
          </button>
        </div>
      </div>

      {mode === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-white/15 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-2 text-emerald-400">
              <Loader2 className="w-6 h-6 animate-spin mb-1.5" />
              <span className="text-xs font-semibold">Processing image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-white">
                Click or drag & drop to upload {multiple ? 'images' : 'image'}
              </p>
              <p className="text-[10px] text-slate-400">
                Supports JPG, PNG, WEBP, SVG directly from phone or computer
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlAdd();
              }
            }}
            placeholder="Paste image URL (e.g. https://... or /logo.png)"
            className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleUrlAdd}
            className="px-3.5 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shrink-0"
          >
            {multiple ? 'Add' : 'Set'}
          </button>
        </div>
      )}

      {/* Preview for Single Image */}
      {!multiple && value && (
        <div className="relative w-28 h-28 rounded-xl border border-white/15 overflow-hidden group bg-slate-950 mt-2">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          {onChange && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-all"
              title="Remove"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Preview for Multiple Images */}
      {multiple && values && values.length > 0 && (
        <div className="flex flex-wrap gap-2.5 pt-1">
          {values.map((img, i) => (
            <div
              key={i}
              onClick={() => onSelectIndex && onSelectIndex(i)}
              className={`relative w-20 h-24 rounded-xl border overflow-hidden cursor-pointer group bg-slate-950 transition-all ${
                selectedIndex === i
                  ? 'border-emerald-400 ring-2 ring-emerald-500/40 shadow-md shadow-emerald-500/10'
                  : 'border-white/15 hover:border-white/30'
              }`}
            >
              <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
              {selectedIndex === i && (
                <span className="absolute bottom-0 inset-x-0 bg-emerald-500 text-slate-950 font-bold text-[9px] text-center py-0.5">
                  Main Thumbnail
                </span>
              )}
              {onRemoveIndex && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveIndex(i);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition-all"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
