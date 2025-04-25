import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { upload, processImage } from "./storage";
import multer from "multer";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint for processing images
  app.post('/api/process-image', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const watermarkSettings = {
        text: req.body.text || 'Not for AI training',
        position: req.body.position || 'bottom-right',
        opacity: parseInt(req.body.opacity || '70', 10),
        fontSize: parseInt(req.body.fontSize || '24', 10),
      };

      const addExifProtection = req.body.exifProtection !== 'false';

      // Process the image
      const processedImagePath = await processImage(
        req.file.path,
        watermarkSettings,
        addExifProtection
      );

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="watermarked-${req.file.originalname}"`);
      res.setHeader('Content-Type', 'image/jpeg');

      // Stream the file to the client
      const fileStream = fs.createReadStream(processedImagePath);
      fileStream.pipe(res);

      // Clean up the processed file after sending
      fileStream.on('end', () => {
        fs.unlink(processedImagePath, (err) => {
          if (err) console.error('Error cleaning up processed file:', err);
        });
        
        // Clean up the original uploaded file
        fs.unlink(req.file!.path, (err) => {
          if (err) console.error('Error cleaning up uploaded file:', err);
        });
      });
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ message: 'Failed to process image' });
    }
  });

  // Handle direct base64 data submissions
  app.post('/api/process-image-base64', async (req, res) => {
    try {
      const { imageData, watermarkSettings, exifProtection } = req.body;
      
      if (!imageData || !imageData.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid image data' });
      }
      
      // Convert base64 to buffer
      const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ message: 'Invalid image data format' });
      }
      
      const buffer = Buffer.from(matches[2], 'base64');
      
      // Save buffer to temp file
      const tempFilePath = path.join(process.env.TEMP || '/tmp', `temp-${Date.now()}.jpg`);
      fs.writeFileSync(tempFilePath, buffer);
      
      // Process the image
      const processedImagePath = await processImage(
        tempFilePath,
        watermarkSettings,
        exifProtection
      );
      
      // Set headers for file download
      res.setHeader('Content-Disposition', 'attachment; filename="watermarked-image.jpg"');
      res.setHeader('Content-Type', 'image/jpeg');
      
      // Stream the file to the client
      const fileStream = fs.createReadStream(processedImagePath);
      fileStream.pipe(res);
      
      // Clean up files after sending
      fileStream.on('end', () => {
        fs.unlink(processedImagePath, (err) => {
          if (err) console.error('Error cleaning up processed file:', err);
        });
        
        fs.unlink(tempFilePath, (err) => {
          if (err) console.error('Error cleaning up temp file:', err);
        });
      });
    } catch (error) {
      console.error('Error processing base64 image:', error);
      res.status(500).json({ message: 'Failed to process image' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
