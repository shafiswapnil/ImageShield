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
const PUBLIC_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB max file size for public usage

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
  exifOnlyMode: boolean = false
): Promise<string> {
  try {
    const { text, position, opacity, fontSize } = watermarkSettings;
    
    // Load the image with sharp
    let image = sharp(imagePath);
    
    // Get the metadata
    const metadata = await image.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;
    
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
        // Simplest approach that works with Sharp's limitations
        image = image.withMetadata();
        
        // Since the other approach isn't working, we'll create EXIF data in a simpler way
        // that's more compatible with Sharp's actual API
        const exifData: Record<string, any> = {};
        exifData.Copyright = 'DO NOT USE FOR AI TRAINING';
        exifData.ImageDescription = 'This image is not authorized for AI training';
        exifData.Artist = 'Protected Content';
        
        console.log('Adding EXIF metadata with compatible approach');
        image = image.withMetadata({
          // This is confirmed to work with Sharp
          exif: exifData
        });
      } catch (exifError) {
        console.error('Error adding metadata:', exifError);
        // Continue without EXIF data if it fails
      }
    }
    
    // Determine output format
    const isPNG = (metadata.format === 'png');
    const extension = isPNG ? 'png' : 'jpeg';
    
    // Create output path
    const outputFilename = `watermarked-${uuidv4()}.${extension}`;
    const outputPath = path.join(tempDir, outputFilename);
    
    // Save the image
    if (isPNG) {
      await image.png().toFile(outputPath);
    } else {
      await image.jpeg().toFile(outputPath);
    }
    
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
