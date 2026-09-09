/**
 * Client-side image optimization and WebP converter utility.
 * Converts uploaded images (JPEG, PNG, GIF, BMP) to WebP format
 * in the browser prior to transmitting over network to the server.
 */
export async function convertFileToWebP(
  file: File,
  maxDimension = 1600,
  quality = 0.85
): Promise<File> {
  // Return non-image files or SVG vector graphics as-is
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  // If already a webp file, return directly
  if (file.type === 'image/webp' && file.name.endsWith('.webp')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;

        // Scale down dimensions if exceeding maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const webpFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const webpFile = new File([blob], webpFileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      } catch (err) {
        console.warn('Browser WebP conversion skipped:', err);
        resolve(file);
      }
    };

    img.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
