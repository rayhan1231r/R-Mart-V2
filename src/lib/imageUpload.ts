/**
 * R Mart Client-Side Image Upload & Compression Helper
 * Converts uploaded local files (from Desktop or Mobile) to high-quality compressed Base64 data URLs
 * without needing external cloud buckets or backend upload endpoints.
 */

export interface ProcessImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function processImageFile(
  file: File,
  options: ProcessImageOptions = {}
): Promise<string> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.85 } = options;

  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) return reject(new Error('Image source is empty.'));

      // If SVG or small icon, don't re-compress on canvas
      if (file.type === 'image/svg+xml' || file.size < 40 * 1024) {
        return resolve(src);
      }

      const img = new Image();
      img.onerror = () => resolve(src); // fallback to original data url
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(src);

        // Fill background with white for pngs with transparency converting to jpeg
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}

export async function processMultipleImageFiles(
  files: FileList | File[],
  options?: ProcessImageOptions
): Promise<string[]> {
  const fileArray = Array.from(files);
  const results = await Promise.all(
    fileArray.map((file) => processImageFile(file, options).catch(() => null))
  );
  return results.filter((url): url is string => Boolean(url));
}
