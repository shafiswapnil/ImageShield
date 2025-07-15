import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import sharp from 'sharp';

// Create temp directory for storing uploaded files
const tempDir = path.join(os.tmpdir(), 'ai-defense-watermarker');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, tempDir);
  },
  filename: function (_req, file, cb) {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

// Configure upload middleware with strict size limits for public usage
const PUBLIC_MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB max file size for public usage

export const upload = multer({
  storage,
  limits: {
    fileSize: PUBLIC_MAX_FILE_SIZE, // 5MB max file size for public safety
    files: 1 // Only allow one file at a time
  },
  fileFilter: (_req, file, cb) => {
    // 1. Check file type - accept only jpg and png
    if (
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload a JPG or PNG file.'));
    }
  },
});

// Run initial cleanup when server starts
console.log('Running initial cleanup of expired files...');
cleanupTempFiles();

interface WatermarkSettings {
  text: string;
  position: string;
  opacity: number;
  fontSize: number;
}

interface AdversarialSettings {
  enabled: boolean;
  intensity: number; // 1-10 scale
  method: 'gaussian' | 'uniform' | 'perlin'; // Different noise types
}

/**
 * Generate adversarial noise to protect images from AI training
 * This adds imperceptible perturbations that disrupt neural network training
 */
async function generateAdversarialNoise(
  imageBuffer: Buffer, 
  settings: AdversarialSettings
): Promise<Buffer> {
  if (!settings.enabled) {
    return imageBuffer;
  }

  try {
    const image = sharp(imageBuffer);
    const { width, height, channels } = await image.metadata();
    
    if (!width || !height) {
      console.warn('Could not get image dimensions for adversarial noise');
      return imageBuffer;
    }

    // Convert intensity (1-10) to noise amplitude (0.001-0.02)
    // Higher values are more effective but risk being visible
    const noiseAmplitude = (settings.intensity / 10) * 0.019 + 0.001;
    
    console.log(`Applying adversarial noise: method=${settings.method}, intensity=${settings.intensity}, amplitude=${noiseAmplitude.toFixed(4)}`);

    // Generate noise pattern based on method
    let noiseBuffer: Buffer;
    
    switch (settings.method) {
      case 'gaussian':
        noiseBuffer = generateGaussianNoise(width, height, channels || 3, noiseAmplitude);
        break;
      case 'uniform':
        noiseBuffer = generateUniformNoise(width, height, channels || 3, noiseAmplitude);
        break;
      case 'perlin':
        noiseBuffer = generatePerlinNoise(width, height, channels || 3, noiseAmplitude);
        break;
      default:
        noiseBuffer = generateGaussianNoise(width, height, channels || 3, noiseAmplitude);
    }

    // Apply noise to image using Sharp's composite with blend mode
    const noisedImage = await image
      .composite([{
        input: noiseBuffer,
        blend: 'add', // Add noise to original image
        raw: {
          width,
          height,
          channels: channels || 3
        }
      }])
      .toBuffer();

    return noisedImage;
  } catch (error) {
    console.error('Error applying adversarial noise:', error);
    // Return original image if noise application fails
    return imageBuffer;
  }
}

/**
 * Generate Gaussian (normal distribution) noise
 * Most effective against CNN-based models
 */
function generateGaussianNoise(width: number, height: number, channels: number, amplitude: number): Buffer {
  const pixelCount = width * height * channels;
  const noiseArray = new Uint8Array(pixelCount);
  
  for (let i = 0; i < pixelCount; i++) {
    // Box-Muller transform for Gaussian distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Scale and clamp to valid pixel range
    const noiseValue = Math.round(gaussian * amplitude * 255);
    noiseArray[i] = Math.max(-128, Math.min(127, noiseValue)) + 128;
  }
  
  return Buffer.from(noiseArray);
}

/**
 * Generate uniform random noise
 * Good general-purpose adversarial protection
 */
function generateUniformNoise(width: number, height: number, channels: number, amplitude: number): Buffer {
  const pixelCount = width * height * channels;
  const noiseArray = new Uint8Array(pixelCount);
  
  for (let i = 0; i < pixelCount; i++) {
    // Uniform distribution between -amplitude and +amplitude
    const noiseValue = (Math.random() - 0.5) * 2 * amplitude * 255;
    noiseArray[i] = Math.max(-128, Math.min(127, Math.round(noiseValue))) + 128;
  }
  
  return Buffer.from(noiseArray);
}

/**
 * Generate Perlin-like structured noise
 * Creates patterns that are harder for AI to filter out
 */
function generatePerlinNoise(width: number, height: number, channels: number, amplitude: number): Buffer {
  const pixelCount = width * height * channels;
  const noiseArray = new Uint8Array(pixelCount);
  
  // Simple pseudo-Perlin noise using multiple octaves
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let noiseValue = 0;
      
      // Multiple octaves for more complex patterns
      for (let octave = 1; octave <= 4; octave++) {
        const freq = octave * 0.01;
        const amp = 1 / octave;
        noiseValue += Math.sin(x * freq) * Math.cos(y * freq) * amp;
      }
      
      // Apply to all channels
      for (let c = 0; c < channels; c++) {
        const index = (y * width + x) * channels + c;
        const scaledNoise = noiseValue * amplitude * 255;
        noiseArray[index] = Math.max(-128, Math.min(127, Math.round(scaledNoise))) + 128;
      }
    }
  }
  
  return Buffer.from(noiseArray);
}

// Extract EXIF data from an image
export async function extractExifData(imagePath: string): Promise<any> {
  try {
    // Use sharp to extract metadata
    const metadata = await sharp(imagePath).metadata();
    
    // Return EXIF data or a simplified metadata object
    return metadata.exif ? {
      // If we have proper EXIF data, parse it
      ...metadata,
      exifParsed: metadata.exif ? true : false,
    } : {
      // Return basic metadata as a fallback
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      isProgressive: metadata.isProgressive,
      // Add note that no EXIF data was found
      exifParsed: false,
      note: "No EXIF data found in original image"
    };
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    // Return a basic object if extraction fails
    return {
      error: "Failed to extract EXIF data",
      exifParsed: false
    };
  }
}

// Function to add watermark to image
export async function processImage(
  imagePath: string,
  watermarkSettings: WatermarkSettings,
  addExifProtection: boolean,
  exifOnlyMode: boolean = false,
  adversarialSettings?: AdversarialSettings
): Promise<string> {
  try {
    const { text, position, opacity, fontSize } = watermarkSettings;
    
    // Load the image with sharp
    let image = sharp(imagePath);
    
    // Get the initial metadata
    const initialMetadata = await image.metadata();
    console.log('Initial image metadata:', {
      format: initialMetadata.format,
      width: initialMetadata.width,
      height: initialMetadata.height,
      copyright: initialMetadata.copyright,
      artist: initialMetadata.artist,
      exif: initialMetadata.exif ? 'Present' : 'None'
    });
    
    const width = initialMetadata.width || 800;
    const height = initialMetadata.height || 600;
    
    // Skip watermarking if in EXIF-only mode
    if (!exifOnlyMode && text) {
      // Create SVG for watermark
      const svgContent = `
        <svg width="${width}" height="${height}">
          <style>
            .watermark {
              fill: rgba(255, 255, 255, ${opacity / 100});
              font-family: 'Arial', sans-serif;
              font-weight: bold;
              font-size: ${fontSize}px;
              filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.8));
            }
            .info {
              fill: rgba(255, 255, 255, 0.7);
              font-family: 'Arial', sans-serif;
              font-size: 10px;
            }
          </style>
          <text
            class="watermark"
            x="${getXPosition(position, width, fontSize * text.length * 0.5)}"
            y="${getYPosition(position, height, fontSize)}"
          >${text}</text>
          ${addExifProtection ? 
            `<text class="info" x="${width - 10}" y="${height - 10}" text-anchor="end">Protected with EXIF metadata</text>` 
            : ''}
        </svg>
      `;
      
      // Add watermark to image
      image = image.composite([
        { input: Buffer.from(svgContent), gravity: 'center' }
      ]);
    }
    
    // Add metadata for EXIF protection
    if (addExifProtection) {
      console.log('Adding EXIF protection metadata');
      
      try {
        // Use Sharp's metadata API correctly
        image = image.withMetadata()  // First preserve existing metadata
          .withExifMerge({  // Then merge our custom EXIF data
            IFD0: {
              Copyright: 'DO NOT USE FOR AI TRAINING',
              Artist: 'Protected Content',
              ImageDescription: 'This image is protected against AI training usage'
            }
          });
        
        console.log('Added metadata protection');
      } catch (exifError) {
        console.error('Error adding metadata:', exifError);
        // Continue without metadata if it fails
      }
    }
    
    // Determine output format
    const isPNG = (initialMetadata.format === 'png');
    const extension = isPNG ? 'png' : 'jpeg';
    
    // Apply adversarial noise if enabled
    let finalImageBuffer: Buffer;
    if (adversarialSettings?.enabled) {
      console.log('Applying adversarial noise protection...');
      
      // Get the current image as buffer
      const currentBuffer = isPNG ? await image.png().toBuffer() : await image.jpeg().toBuffer();
      
      // Apply adversarial noise
      finalImageBuffer = await generateAdversarialNoise(currentBuffer, adversarialSettings);
    } else {
      // No adversarial noise, get buffer normally
      finalImageBuffer = isPNG ? await image.png().toBuffer() : await image.jpeg().toBuffer();
    }
    
    // Create output path
    const outputFilename = `watermarked-${uuidv4()}.${extension}`;
    const outputPath = path.join(tempDir, outputFilename);
    
    // Write the final buffer to file
    fs.writeFileSync(outputPath, finalImageBuffer);
    
    return outputPath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

// Helper to get X position based on watermark position
function getXPosition(position: string, width: number, textWidth: number): string {
  switch (position) {
    case 'top-left':
    case 'middle-left':
    case 'bottom-left':
      return '30';
    case 'top-center':
    case 'middle-center':
    case 'bottom-center':
      return `${width / 2}`;
    case 'top-right':
    case 'middle-right':
    case 'bottom-right':
    default:
      return `${width - textWidth - 30}`;
  }
}

// Helper to get Y position based on watermark position
function getYPosition(position: string, height: number, fontSize: number): string {
  switch (position) {
    case 'top-left':
    case 'top-center':
    case 'top-right':
      return `${30 + fontSize}`;
    case 'middle-left':
    case 'middle-center':
    case 'middle-right':
      return `${height / 2}`;
    case 'bottom-left':
    case 'bottom-center':
    case 'bottom-right':
    default:
      return `${height - 30}`;
  }
}

// Clean up temporary files
export function cleanupTempFiles(): void {
  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temp directory:', err);
      return;
    }
    
    // Get current time
    const now = Date.now();
    
    // Delete files older than 12 hours (12 * 60 * 60 * 1000 = 43200000 ms)
    const expirationTime = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    
    console.log(`Checking for files older than ${expirationTime/3600000} hours...`);
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error(`Error getting stats for file ${file}:`, statErr);
          return;
        }
        
        const fileAge = now - stats.mtime.getTime();
        
        // Check if file is older than expiration time
        if (fileAge > expirationTime) {
          console.log(`Deleting expired file ${file} (age: ${(fileAge/3600000).toFixed(2)} hours)`);
          
          fs.unlink(filePath, unlinkErr => {
            if (unlinkErr) {
              console.error(`Error deleting file ${file}:`, unlinkErr);
            } else {
              console.log(`Deleted expired file: ${file}`);
            }
          });
        }
      });
    });
  });
}

// Run cleanup every hour
const cleanupInterval = 60 * 60 * 1000; // 1 hour in milliseconds
console.log(`Scheduled file cleanup to run every ${cleanupInterval/60000} minutes`);
setInterval(cleanupTempFiles, cleanupInterval);
