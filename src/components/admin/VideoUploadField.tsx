import React, { useState, useRef } from 'react';
import {
  Video,
  Upload,
  Link as LinkIcon,
  X,
  Play,
  Pause,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Film,
} from 'lucide-react';
import {
  saveVideoFile,
  formatVideoDuration,
  MAX_VIDEO_DURATION_SECONDS,
  MAX_VIDEOS_PER_PRODUCT,
  resolvePlayableVideoUrl,
  isEmbedVideo,
} from '../../lib/videoStorage';
import { ProductVideoPlayer } from '../customer/ProductVideoPlayer';

interface VideoUploadFieldProps {
  label?: string;
  helperText?: string;
  videos: string[];
  onChange: (videos: string[]) => void;
  maxVideos?: number;
}

export const VideoUploadField: React.FC<VideoUploadFieldProps> = ({
  label = 'Product Videos',
  helperText = 'Upload up to 3 product videos (max 4 minutes per video)',
  videos = [],
  onChange,
  maxVideos = MAX_VIDEOS_PER_PRODUCT,
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = videos.length < maxVideos;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!canAddMore) {
      setErrorMessage(`Maximum ${maxVideos} videos allowed per product.`);
      return;
    }

    setErrorMessage(null);
    setSuccessNotice(null);
    setIsProcessing(true);

    const availableSlots = maxVideos - videos.length;
    const filesToProcess = Array.from(files).slice(0, availableSlots);
    const addedUrls: string[] = [];

    for (const file of filesToProcess) {
      try {
        const result = await saveVideoFile(file);
        addedUrls.push(result.url);
        const durationText = formatVideoDuration(result.duration);
        setSuccessNotice(
          `Video "${file.name}" added successfully (${durationText}, ${result.sizeFormatted}).`
        );
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to process video file.');
        break;
      }
    }

    if (addedUrls.length > 0) {
      // Put newly uploaded videos at index 0 so they immediately become the Primary Video
      onChange([...addedUrls, ...videos].slice(0, maxVideos));
      setSuccessNotice(
        `Video uploaded and set as Primary Video (#1). Previous video(s) moved to secondary.`
      );
      setTimeout(() => setSuccessNotice(null), 4000);
    }

    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlAdd = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!canAddMore) {
      setErrorMessage(`Maximum ${maxVideos} videos allowed per product.`);
      return;
    }

    setErrorMessage(null);
    // Put new URL at index 0 so it becomes the Primary Video
    onChange([trimmed, ...videos].slice(0, maxVideos));
    setUrlInput('');
    setSuccessNotice('Video link added as Primary Video (#1).');
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0 || index >= videos.length) return;
    const selected = videos[index];
    const rest = videos.filter((_, i) => i !== index);
    onChange([selected, ...rest]);
    setSuccessNotice(`Video #${index + 1} is now set as the Primary Video.`);
    setTimeout(() => setSuccessNotice(null), 3000);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all videos from this product?')) {
      onChange([]);
      setErrorMessage(null);
      setSuccessNotice('All videos removed from product.');
      setTimeout(() => setSuccessNotice(null), 3000);
    }
  };

  const handleRemove = (index: number) => {
    const updated = videos.filter((_, i) => i !== index);
    onChange(updated);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300 text-xs flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-emerald-400" />
              {label}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                videos.length >= maxVideos
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {videos.length}/{maxVideos} Added
            </span>
          </div>
          {helperText && (
            <p className="text-[11px] text-slate-400 mt-0.5">{helperText}</p>
          )}
        </div>

        {/* Mode Switcher */}
        {canAddMore && (
          <div className="flex rounded-lg bg-white/[0.04] p-0.5 border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setMode('upload');
                setErrorMessage(null);
              }}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                mode === 'upload'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload Video</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('url');
                setErrorMessage(null);
              }}
              className={`px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors ${
                mode === 'url'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Video Link</span>
            </button>
          </div>
        )}
      </div>

      {/* Error or Success Notice */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Upload notice: </span>
            {errorMessage}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successNotice && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Upload Box / Input */}
      {canAddMore ? (
        mode === 'upload' ? (
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
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/ogg,video/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
              disabled={isProcessing}
            />
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-2 space-y-2 text-emerald-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-medium">Validating video length & saving...</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Video className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  Click or drag & drop video file here
                </p>
                <p className="text-[11px] text-slate-400">
                  MP4, WebM, MOV supported • <strong className="text-emerald-400">Max 4 min</strong> duration per video
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Paste direct MP4 link, YouTube, or Vimeo URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlAdd())}
              className="flex-1 h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleUrlAdd}
              disabled={!urlInput.trim()}
              className="h-9 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-bold text-xs transition-colors shrink-0"
            >
              Add Video
            </button>
          </div>
        )
      ) : (
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-center text-xs text-slate-400">
          ✓ Maximum {maxVideos} videos reached for this product. Remove a video to add a different one.
        </div>
      )}

      {/* Uploaded Videos List */}
      {videos.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>Added Videos ({videos.length}/{maxVideos})</span>
              <span className="text-[10px] text-emerald-400 font-normal">Video #1 plays first on store</span>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              Clear All ({videos.length})
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {videos.map((vidUrl, index) => (
              <VideoPreviewCard
                key={index}
                url={vidUrl}
                index={index}
                isPrimary={index === 0}
                onSetPrimary={() => handleSetPrimary(index)}
                onRemove={() => handleRemove(index)}
                onPreview={() => setPreviewVideoUrl(vidUrl)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Video Modal Player Preview */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3.5 bg-slate-800 border-b border-slate-700">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                Video Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewVideoUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black flex items-center justify-center">
              <ActivePlayer url={previewVideoUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component to render miniature video card
const VideoPreviewCard: React.FC<{
  url: string;
  index: number;
  isPrimary: boolean;
  onSetPrimary: () => void;
  onRemove: () => void;
  onPreview: () => void;
}> = ({ url, index, isPrimary, onSetPrimary, onRemove, onPreview }) => {
  const isEmbed = isEmbedVideo(url);

  return (
    <div
      className={`relative group rounded-xl overflow-hidden border p-2 flex flex-col justify-between transition-colors ${
        isPrimary
          ? 'border-emerald-500/60 bg-emerald-500/[0.06] ring-1 ring-emerald-500/30'
          : 'border-white/10 bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isPrimary ? (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1">
              ★ Main (Plays 1st)
            </span>
          ) : (
            <button
              type="button"
              onClick={onSetPrimary}
              className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-[10px] font-semibold transition-colors"
              title="Make this the first video customers see"
            >
              Set as Main
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-mono">#{index + 1}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Remove video"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        onClick={onPreview}
        className="relative aspect-video rounded-lg overflow-hidden bg-slate-950/80 flex items-center justify-center cursor-pointer border border-white/5 hover:border-emerald-500/40 transition-colors group/thumb"
      >
        <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
          <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
        </div>
        <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-white font-mono">
          {isEmbed ? 'External' : url.startsWith('/uploads/') ? 'Server' : 'Upload'}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
        <span className="truncate max-w-[130px] font-mono text-[10px]" title={url}>
          {url.startsWith('idb://') ? 'Uploaded Local' : url.startsWith('/uploads/') ? url.split('/').pop() : url}
        </span>
        <button
          type="button"
          onClick={onPreview}
          className="text-emerald-400 hover:text-emerald-300 font-semibold shrink-0 ml-1"
        >
          Preview
        </button>
      </div>
    </div>
  );
};

// Player component that resolves custom or external URLs
const ActivePlayer: React.FC<{ url: string }> = ({ url }) => {
  return <ProductVideoPlayer videoUrl={url} autoPlay={true} className="w-full h-full" />;
};
