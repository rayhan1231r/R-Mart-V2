/**
 * R Mart Client-Side Video Storage & Processing Helper
 * Supports:
 * - Direct video file uploads (MP4, WebM, MOV, etc.)
 * - Validates maximum duration of 4 minutes (240 seconds)
 * - Persists binary video blobs safely in IndexedDB to avoid localStorage quota limits
 * - YouTube, Vimeo, and direct MP4/WebM URL parsing and embedding
 */

const DB_NAME = 'rmart_media_db';
const STORE_NAME = 'product_videos';
const DB_VERSION = 1;
export const MAX_VIDEO_DURATION_SECONDS = 240; // 4 Minutes
export const MAX_VIDEOS_PER_PRODUCT = 3; // 2-3 videos per product

// In-memory cache for active blob URLs so we don't recreate them continuously
const blobUrlCache = new Map<string, string>();

/**
 * Open or upgrade IndexedDB database
 */
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB is not available in this browser environment.'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Extract YouTube Video ID from any YouTube URL format:
 * - standard watch: youtube.com/watch?v=ID
 * - shorts: youtube.com/shorts/ID
 * - shortlink: youtu.be/ID
 * - embed: youtube.com/embed/ID
 * - mobile: m.youtube.com/...
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();

  // YouTube Shorts: youtube.com/shorts/<id>
  const shortsMatch = clean.match(/(?:youtube\.com|youtu\.be)\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Short URL: youtu.be/<id>
  const youtuBeMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch && youtuBeMatch[1]) return youtuBeMatch[1];

  // Embed URL: youtube.com/embed/<id>
  const embedMatch = clean.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // Watch URL param: ?v=<id> or &v=<id>
  const vParamMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vParamMatch && vParamMatch[1]) return vParamMatch[1];

  // Path /v/<id>
  const vPathMatch = clean.match(/youtube(?:-nocookie)?\.com\/v\/([a-zA-Z0-9_-]{11})/i);
  if (vPathMatch && vPathMatch[1]) return vPathMatch[1];

  return null;
}

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/(?:\d+\/)?video\/|video\/|))(\d+)/i);
  return match && match[1] ? match[1] : null;
}

/**
 * Extract Google Drive file ID from sharing URL
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const match = url.trim().match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i);
  return match && match[1] ? match[1] : null;
}

/**
 * Read the duration of a video file in seconds
 */
export function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute('src');
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (!duration || isNaN(duration)) {
        // Fallback for some encoded videos
        resolve(0);
      } else {
        resolve(duration);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(
        new Error(
          'Failed to load video metadata. Please make sure the file is a valid video format (MP4, WebM, MOV).'
        )
      );
    };

    video.src = objectUrl;
  });
}

/**
 * Format seconds to MM:SS string (e.g. 03:45)
 */
export function formatVideoDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validate and save a video file into IndexedDB
 * Returns a persistent video identifier (e.g. `idb://video_16999999`)
 */
export async function saveVideoFile(file: File): Promise<{
  url: string;
  duration: number;
  sizeFormatted: string;
  name: string;
}> {
  // 1. Validate file type
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|mkv|m4v)$/i.test(file.name);
  if (!isVideo) {
    throw new Error('Please select a valid video file (MP4, WebM, MOV, etc.).');
  }

  // 2. Validate duration (Max 4 minutes = 240 seconds)
  const duration = await getVideoDuration(file);
  if (duration > MAX_VIDEO_DURATION_SECONDS) {
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    throw new Error(
      `Video length (${mins}m ${secs}s) exceeds the 4-minute maximum limit. Maximum allowed is 4 minutes (240s).`
    );
  }

  // 3. Format file size
  const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
  const sizeFormatted = `${sizeMb} MB`;

  // 4. Save blob in IndexedDB
  const id = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const db = await openDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item = {
      id,
      name: file.name,
      type: file.type || 'video/mp4',
      size: file.size,
      duration,
      blob: file,
      createdAt: new Date().toISOString(),
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  const customUrl = `idb://${id}`;
  // Cache live object URL for instant playback
  const liveUrl = URL.createObjectURL(file);
  blobUrlCache.set(customUrl, liveUrl);

  return {
    url: customUrl,
    duration,
    sizeFormatted,
    name: file.name,
  };
}

/**
 * Resolve any video URL for playback:
 * - If it is an `idb://` link, loads the Blob from IndexedDB and returns a playable ObjectURL
 * - If it is YouTube (including Shorts, Watch, youtu.be), transforms to responsive embed link with autoplay/mute flags
 * - If it is Vimeo, transforms to embed link
 * - If it is Google Drive, transforms to preview embed link
 * - Otherwise returns the direct URL (MP4, WebM, CDN, etc.)
 */
export async function resolvePlayableVideoUrl(rawUrl: string, autoPlay = true): Promise<string> {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

  // 1. Check in-memory active cache
  if (blobUrlCache.has(trimmed)) {
    return blobUrlCache.get(trimmed)!;
  }

  // 2. IndexedDB stored video
  if (trimmed.startsWith('idb://')) {
    const id = trimmed.replace('idb://', '');
    try {
      const db = await openDb();
      const record = await new Promise<any>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      if (record && record.blob) {
        const blob = record.blob instanceof Blob ? record.blob : new Blob([record.blob], { type: record.type || 'video/mp4' });
        const url = URL.createObjectURL(blob);
        blobUrlCache.set(trimmed, url);
        return url;
      }
    } catch (err) {
      console.warn('Error loading video from IndexedDB:', err);
    }
    // If not found in IndexedDB (e.g. cross-device or cleared storage), return empty
    return '';
  }

  // 3. YouTube link detection & transformation (covers Shorts, Watch, youtu.be, mobile)
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    const autoplayParam = autoPlay ? 'autoplay=1&mute=1' : 'autoplay=0';
    return `https://www.youtube-nocookie.com/embed/${ytId}?${autoplayParam}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
  }

  // 4. Vimeo link detection & transformation
  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    const autoplayParam = autoPlay ? 'autoplay=1&muted=1' : 'autoplay=0';
    return `https://player.vimeo.com/video/${vimeoId}?${autoplayParam}&playsinline=1`;
  }

  // 5. Google Drive video preview link
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // 6. Direct standard URL (MP4, WebM, CDN, etc.)
  return trimmed;
}

/**
 * Check if a URL is an embeddable iframe (e.g. YouTube, Vimeo, Google Drive)
 */
export function isEmbedVideo(url: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.includes('youtube.com/embed') ||
    clean.includes('youtube-nocookie.com/embed') ||
    clean.includes('player.vimeo.com') ||
    clean.includes('drive.google.com/file/d/')
  );
}

/**
 * Get video poster image or thumbnail if available (e.g. YouTube HQ thumbnail)
 */
export function getVideoPosterUrl(url: string): string | null {
  if (!url) return null;
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return null;
}

/**
 * Remove a video from IndexedDB by custom URL
 */
export async function deleteVideoFromStorage(rawUrl: string): Promise<void> {
  if (!rawUrl.startsWith('idb://')) return;
  const id = rawUrl.replace('idb://', '');

  // Revoke in-memory blob url
  if (blobUrlCache.has(rawUrl)) {
    try {
      URL.revokeObjectURL(blobUrlCache.get(rawUrl)!);
    } catch {
      // ignore
    }
    blobUrlCache.delete(rawUrl);
  }

  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Error deleting video from IndexedDB:', err);
  }
}
