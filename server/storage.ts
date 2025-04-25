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

// Configure upload middleware
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Accept only jpg and png
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
    let imageProcessor = sharp(imagePath);
    
    // Get image metadata
    const metadata = await imageProcessor.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;
    
    // Create SVG content based on whether we're in EXIF-only mode
    let svgContent = '';
    
    // In EXIF-only mode, we don't add any visible watermarks
    if (!exifOnlyMode) {
      // Add the main watermark text
      svgContent = `
        <style>
          .watermark {
            fill: rgba(255, 255, 255, ${opacity / 100});
            font-family: 'Arial', sans-serif;
            font-weight: bold;
            font-size: ${fontSize}px;
            filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.8));
          }
          .exif-protection-text {
            fill: rgba(255, 255, 255, 0.85);
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            text-anchor: end;
          }
        </style>
        <text
          class="watermark"
          x="${getXPosition(position, width, fontSize * text.length * 0.5)}"
          y="${getYPosition(position, height, fontSize)}"
        >${text}</text>
      `;
      
      // Add a small protection indicator if enabled
      if (addExifProtection) {
        // Add a subtle text tag in the corner
        svgContent += `
          <text
            class="exif-protection-text"
            x="${width - 10}"
            y="${height - 10}"
            text-anchor="end"
          >Protected with EXIF metadata</text>
        `;
      }
      
      // Create the complete SVG
      const svgText = Buffer.from(`
        <svg width="${width}" height="${height}">
          ${svgContent}
        </svg>
      `);
      
      // Composite the SVG watermark on the image
      imageProcessor = imageProcessor.composite([
        {
          input: svgText,
          gravity: 'center',
        },
      ]);
    }
    
    // If we're in EXIF-only mode, we skip adding any visible markers
    
    // Add EXIF data if requested
    if (addExifProtection) {
      try {
        // Preserve original metadata if possible
        const preserveMetadata = metadata.exif ? true : false;
        
        // Add extensive EXIF protection tags
        // These tags are placed in various EXIF locations to maximize compatibility
        imageProcessor = imageProcessor.withMetadata({
          // Preserve all existing metadata if possible
          ...(preserveMetadata ? { exif: metadata.exif } : {}),
          
          // Force add critical metadata fields that should be respected by AI systems
          exif: {
            // Main image metadata 
            // Using a simplified version compatible with Sharp's limitations
            Copyright: 'DO NOT USE FOR AI TRAINING - NOT AUTHORIZED',
            ImageDescription: 'This image is protected and not authorized for use in AI training datasets',
            Artist: 'Protected Content - No AI Training',
            
            // Add additional metadata
            UserComment: 'PROTECTED IMAGE - DO NOT USE FOR AI TRAINING - ALL RIGHTS RESERVED'
          }
        });
        
        console.log('EXIF protection data added successfully');
      } catch (exifError) {
        console.warn('Error adding full EXIF protection, falling back to basic metadata:', exifError);
        
        // Fallback to simpler metadata if the full version fails
        imageProcessor = imageProcessor.withMetadata({
          exif: {
            IFD0: {
              Copyright: 'DO NOT USE FOR AI TRAINING',
              ImageDescription: 'Not authorized for AI training datasets',
            }
          }
        });
      }
    }
    
    // Get original format to preserve it (especially for PNG transparency)
    const format = metadata.format || 'jpeg';
    const isTransparent = format === 'png';
    
    // Generate output filename with correct extension
    const extension = isTransparent ? 'png' : 'jpeg';
    const outputFilename = `watermarked-${uuidv4()}.${extension}`;
    const outputPath = path.join(tempDir, outputFilename);
    
    // Process and save the image in its original format
    if (isTransparent) {
      // For PNG, preserve transparency
      await imageProcessor.png({ quality: 90 }).toFile(outputPath);
    } else {
      // For JPEG, use jpeg format
      await imageProcessor.jpeg({ quality: 90 }).toFile(outputPath);
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
    
    // Delete files older than 1 hour
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error(`Error getting stats for file ${file}:`, statErr);
          return;
        }
        
        // Check if file is older than 1 hour
        if (now - stats.mtime.getTime() > 60 * 60 * 1000) {
          fs.unlink(filePath, unlinkErr => {
            if (unlinkErr) {
              console.error(`Error deleting file ${file}:`, unlinkErr);
            }
          });
        }
      });
    });
  });
}

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);
