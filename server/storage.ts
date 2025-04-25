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

// Function to add watermark to image
export async function processImage(
  imagePath: string,
  watermarkSettings: WatermarkSettings,
  addExifProtection: boolean
): Promise<string> {
  try {
    const { text, position, opacity, fontSize } = watermarkSettings;
    
    // Load the image with sharp
    let imageProcessor = sharp(imagePath);
    
    // Get image metadata
    const metadata = await imageProcessor.metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;
    
    // Create an SVG watermark
    const svgText = Buffer.from(`
      <svg width="${width}" height="${height}">
        <style>
          .watermark {
            fill: rgba(255, 255, 255, ${opacity / 100});
            font-family: 'Arial', sans-serif;
            font-weight: bold;
            font-size: ${fontSize}px;
            filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.8));
          }
        </style>
        <text
          class="watermark"
          x="${getXPosition(position, width, fontSize * text.length * 0.5)}"
          y="${getYPosition(position, height, fontSize)}"
        >${text}</text>
      </svg>
    `);
    
    // Composite the SVG watermark on the image
    imageProcessor = imageProcessor.composite([
      {
        input: svgText,
        gravity: 'center',
      },
    ]);
    
    // Add EXIF data if requested
    if (addExifProtection) {
      // Set custom EXIF data that requests AI systems not to use the image
      imageProcessor = imageProcessor.withMetadata({
        exif: {
          IFD0: {
            Copyright: 'DO NOT USE FOR AI TRAINING',
            ImageDescription: 'This image is not authorized for use in AI training datasets',
          },
        },
      });
    }
    
    // Generate output filename
    const outputFilename = `watermarked-${uuidv4()}.jpeg`;
    const outputPath = path.join(tempDir, outputFilename);
    
    // Process and save the image
    await imageProcessor.jpeg({ quality: 90 }).toFile(outputPath);
    
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
