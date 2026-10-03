import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  Film,
  AlertCircle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import {
  resolvePlayableVideoUrl,
  isEmbedVideo,
  getVideoPosterUrl,
} from '../../lib/videoStorage';

interface ProductVideoPlayerProps {
  videoUrl: string;
  autoPlay?: boolean;
  className?: string;
  poster?: string;
  title?: string;
}

export const ProductVideoPlayer: React.FC<ProductVideoPlayerProps> = ({
  videoUrl,
  autoPlay = false,
  className = '',
  poster,
  title,
}) => {
  const [playableUrl, setPlayableUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect YouTube poster if none supplied
  const effectivePoster = poster || getVideoPosterUrl(videoUrl) || undefined;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setHasError(false);
    setErrorMessage(null);

    resolvePlayableVideoUrl(videoUrl, autoPlay)
      .then((url) => {
        if (!isMounted) return;
        if (!url) {
          setHasError(true);
          setErrorMessage('Video source is not available or could not be loaded.');
          setLoading(false);
          return;
        }
        setPlayableUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Could not resolve video URL:', err);
        if (isMounted) {
          setPlayableUrl(videoUrl);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [videoUrl, autoPlay, retryKey]);

  // Handle Autoplay policy on HTML5 Video safely
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playableUrl || isEmbedVideo(playableUrl)) return;

    if (autoPlay) {
      // 1. Try playing unmuted
      video.muted = false;
      setIsMuted(false);

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // Browser autoplay policy prevented unmuted audio
            // Fall back immediately to muted autoplay which browsers allow
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch((err) => {
                console.info('Autoplay not allowed without interaction:', err);
                setIsPlaying(false);
              });
          });
      }
    }
  }, [playableUrl, autoPlay]);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Play error:', err);
          // Try playing muted if unmuted failed
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const elem = containerRef.current || videoRef.current;
    if (!elem) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
  };

  const handleVideoError = () => {
    setHasError(true);
    setErrorMessage('Failed to decode or play video. The file or format may not be supported.');
    setIsPlaying(false);
  };

  const handleRetry = () => {
    setRetryKey((prev) => prev + 1);
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div
        className={`w-full aspect-[4/5] sm:aspect-video rounded-3xl bg-slate-950 flex flex-col items-center justify-center text-slate-400 p-6 ${className}`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-xs font-semibold text-slate-300">Loading product video...</span>
        <span className="text-[10px] text-slate-500 mt-1">Preparing high definition stream</span>
      </div>
    );
  }

  // Error State
  if (hasError) {
    return (
      <div
        className={`w-full aspect-[4/5] sm:aspect-video rounded-3xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center text-center p-6 text-slate-300 ${className}`}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">Video Playback Notice</h4>
        <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
          {errorMessage || 'Unable to play this video stream in your browser.'}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRetry}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
          {videoUrl && !videoUrl.startsWith('idb://') && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Open Link</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // If YouTube / Vimeo / Google Drive Embed
  if (isEmbedVideo(playableUrl)) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full aspect-[4/5] sm:aspect-video rounded-3xl overflow-hidden bg-black shadow-lg ${className}`}
      >
        <iframe
          src={playableUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={title || 'Product Video'}
        />
        {title && (
          <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 pointer-events-none">
            <Film className="w-3.5 h-3.5 text-emerald-400" />
            <span>{title}</span>
          </div>
        )}
      </div>
    );
  }

  // HTML5 Video Player
  return (
    <div
      ref={containerRef}
      onClick={() => togglePlay()}
      className={`group relative w-full aspect-[4/5] sm:aspect-video rounded-3xl overflow-hidden bg-black shadow-lg flex items-center justify-center cursor-pointer select-none ${className}`}
    >
      <video
        ref={videoRef}
        src={playableUrl}
        poster={effectivePoster}
        controls={true}
        playsInline={true}
        preload="metadata"
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleVideoError}
        className="w-full h-full object-contain"
      />

      {/* Floating Title Tag */}
      {title && (
        <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 pointer-events-none">
          <Film className="w-3.5 h-3.5 text-emerald-400" />
          <span>{title}</span>
        </div>
      )}

      {/* Center Play Overlay Button when paused */}
      {!isPlaying && (
        <div
          onClick={(e) => togglePlay(e)}
          className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[2px] transition-all z-10"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-slate-950 ml-1" />
          </div>
        </div>
      )}

      {/* Unmute notice banner if autoplayed in muted state */}
      {isPlaying && isMuted && (
        <button
          type="button"
          onClick={(e) => toggleMute(e)}
          className="absolute bottom-14 right-4 z-20 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-1.5 transition-transform hover:scale-105 active:scale-95"
          title="Click to turn on sound"
        >
          <VolumeX className="w-4 h-4 text-amber-400" />
          <span>Tap for Sound</span>
        </button>
      )}

      {/* Floating Sound Button when playing unmuted */}
      {isPlaying && !isMuted && (
        <button
          type="button"
          onClick={(e) => toggleMute(e)}
          className="absolute bottom-14 right-4 z-20 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs backdrop-blur-md border border-white/20 shadow-lg transition-transform hover:scale-105"
          title="Mute video"
        >
          <Volume2 className="w-4 h-4 text-emerald-400" />
        </button>
      )}
    </div>
  );
};
