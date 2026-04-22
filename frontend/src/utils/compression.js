/**
 * Media compression utilities for frontend
 * Reduces file sizes before upload to optimize network usage
 */

/**
 * Compress image before upload
 * @param {File} file - Image file
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<Blob>}
 */
export async function compressImage(file, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Limit max dimensions while maintaining aspect ratio
        const maxDim = 1280;
        if (width > maxDim || height > maxDim) {
          const ratio = width / height;
          if (width > height) {
            width = maxDim;
            height = Math.round(maxDim / ratio);
          } else {
            height = maxDim;
            width = Math.round(maxDim * ratio);
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
    };
  });
}

/**
 * Compress video by re-encoding it (requires server-side processing)
 * For now, just limit file size client-side
 * @param {File} file - Video file
 * @param {number} maxSize - Max size in MB
 * @returns {boolean} - Whether file is within limit
 */
export function validateVideoSize(file, maxSize = 50) {
  const fileSizeMB = file.size / (1024 * 1024);
  return fileSizeMB <= maxSize;
}

/**
 * Get file size in MB
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
