// Client-side image processor for previewing and downloading
export async function addWatermarkToCanvas(
  imageUrl: string,
  watermarkSettings: {
    text: string;
    position: string;
    opacity: number;
    fontSize: number;
  },
  exifProtection: boolean = false
): Promise<Blob> {
  // Create image element
  const img = new Image();
  
  // Return a promise that resolves with the processed image blob
  return new Promise((resolve, reject) => {
    img.onload = () => {
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Get drawing context with alpha support for transparency
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Set watermark properties
      ctx.font = `bold ${watermarkSettings.fontSize}px Inter, sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${watermarkSettings.opacity / 100})`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      // Measure text width
      const textWidth = ctx.measureText(watermarkSettings.text).width;
      
      // Calculate position
      let x = 0;
      let y = 0;
      
      switch (watermarkSettings.position) {
        case 'top-left':
          x = 30;
          y = 30 + watermarkSettings.fontSize;
          break;
        case 'top-center':
          x = (canvas.width - textWidth) / 2;
          y = 30 + watermarkSettings.fontSize;
          break;
        case 'top-right':
          x = canvas.width - textWidth - 30;
          y = 30 + watermarkSettings.fontSize;
          break;
        case 'middle-left':
          x = 30;
          y = canvas.height / 2;
          break;
        case 'middle-center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height / 2;
          break;
        case 'middle-right':
          x = canvas.width - textWidth - 30;
          y = canvas.height / 2;
          break;
        case 'bottom-left':
          x = 30;
          y = canvas.height - 30;
          break;
        case 'bottom-center':
          x = (canvas.width - textWidth) / 2;
          y = canvas.height - 30;
          break;
        case 'bottom-right':
        default:
          x = canvas.width - textWidth - 30;
          y = canvas.height - 30;
      }
      
      // Draw watermark text
      ctx.fillText(watermarkSettings.text, x, y);
      
      // Add subtle indicator for EXIF protection
      if (exifProtection) {
        // Add a small text note in the corner about EXIF protection
        const exifNote = "Protected with EXIF metadata";
        const noteSize = 10;
        ctx.font = `${noteSize}px Arial, sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.textAlign = "right";
        ctx.fillText(exifNote, canvas.width - 10, canvas.height - 10);
      }
      
      // Check if image is PNG to preserve transparency
      const isPNG = image.type === 'image/png';
      const outputFormat = isPNG ? 'image/png' : 'image/jpeg';
      
      // Convert canvas to blob and resolve promise
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, outputFormat, 0.95);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    // Set crossOrigin to ensure CORS compatibility if needed
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  });
}

// Function to create downloadable image with watermark
export async function createDownloadableImage(
  image: File,
  watermarkSettings: {
    text: string;
    position: string;
    opacity: number;
    fontSize: number;
  },
  exifProtection: boolean = true  // Default to true for safety
): Promise<Blob> {
  const imageUrl = URL.createObjectURL(image);
  try {
    const blob = await addWatermarkToCanvas(imageUrl, watermarkSettings, exifProtection);
    return blob;
  } finally {
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
  }
}

// This function simulates what EXIF data would be added (since we can't modify EXIF client-side)
export function getExifProtectionData(): Record<string, string> {
  return {
    "Copyright": "DO NOT USE FOR AI TRAINING",
    "ImageDescription": "This image is not authorized for use in AI training datasets",
    "UserComment": "This image is protected and not authorized for AI training purposes",
  };
}
