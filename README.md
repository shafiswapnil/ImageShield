# AI Defense Watermarker 🛡️

Protect your images from AI training with visible watermarks and EXIF metadata tags! This tool helps content creators and photographers safeguard their work from being used in AI model training.

## Features

✨ **Core Features**

- Upload & preview images (supports JPG/PNG)
- Customizable watermark text and positioning
- EXIF metadata protection
- Real-time watermark preview
- Responsive, modern UI
- Automatic file cleanup

🔒 **Protection Methods**

- **Adversarial Noise Protection** - Imperceptible perturbations that disrupt AI training
- Visible watermarking with customizable positioning
- EXIF metadata injection with copyright protection
- Copyright tags and artist attribution
- Multi-layer defense strategy

## Tech Stack

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS
- Shadcn/ui components
- Modern React Hooks

### Backend

- Express.js
- Sharp for image processing
- Multer for file handling
- Auto-cleanup system

## Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn

### Installation

1. Clone & Install:

   ```bash
   git clone <repository-url>
   cd ImageShield
   npm install
   ```

2. Create `.env`:

   ```
   NODE_ENV=development
   PORT=5002
   ```

3. Start Development Server:
   ```bash
   npm run dev
   ```

Your app will be running at:

- Frontend: http://localhost:5002
- API Endpoints: http://localhost:5002/api/\*

## API Documentation

### POST /api/process-image

Process images with watermark, EXIF protection, and adversarial noise.

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - image: File (JPG/PNG)
  - text: string
  - position: string
  - opacity: number
  - fontSize: number
  - exifProtection: boolean
  - adversarialEnabled: boolean
  - adversarialIntensity: number (1-10)
  - adversarialMethod: string ('gaussian' | 'uniform' | 'perlin')

### POST /api/extract-exif

Extract EXIF metadata from images.

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - image: File (JPG/PNG)

### POST /api/add-exif

Add protection metadata and adversarial noise to images.

- Method: POST
- Content-Type: multipart/form-data
- Body:
  - image: File (JPG/PNG)
  - exifData: Object (optional)
  - adversarialEnabled: boolean
  - adversarialIntensity: number (1-10)
  - adversarialMethod: string ('gaussian' | 'uniform' | 'perlin')

## Production Deployment

### Build

```bash
npm run build
```

Generates:

- Frontend: ./dist/public/
- Backend: ./dist/

### Production Start

```bash
NODE_ENV=production npm start
```

### Environment Variables

- NODE_ENV: 'development' or 'production'
- PORT: Server port (default: 5002)

## System Features

### Automatic Cleanup

- Files older than 12 hours are automatically removed
- Cleanup service runs every 60 minutes
- Zero configuration required
- Managed in server/storage.ts

### Image Processing

- Supports JPG and PNG formats
- Max file size: 30MB
- EXIF metadata preservation
- Copyright and artist tags
- Custom watermark positioning

### Adversarial Noise Protection

**Revolutionary AI Training Defense**

Our adversarial noise protection adds imperceptible mathematical perturbations to your images that disrupt neural network training while keeping images visually identical to humans.

**How It Works:**

- Applies carefully calculated noise patterns using advanced algorithms
- Three protection methods: Gaussian (recommended), Uniform, and Perlin noise
- Intensity levels 1-10 for customizable protection strength
- Noise amplitude automatically calculated for optimal effectiveness

**Protection Methods:**

- **Gaussian Noise**: Most effective against CNN-based AI models
- **Uniform Noise**: General-purpose protection for various AI architectures
- **Perlin Noise**: Structured patterns that resist filtering attempts

**Technical Details:**

- Noise amplitude: 0.001-0.02 (intensity-dependent)
- Applied at pixel level using Sharp image processing
- Survives common image operations (resize, compression)
- Mathematically designed to maximize AI training disruption

**Usage:**

- Enable via "AI Training Protection" toggle in the UI
- Select protection method and intensity
- Server-side processing ensures precise noise application
- Combined with watermarks and EXIF for multi-layer defense

## Troubleshooting

### Common Issues

1. **Upload Fails**

   - Verify file size (max 30MB)
   - Check file format (JPG/PNG only)
   - Ensure proper MIME type

2. **EXIF Protection**

   - Confirm image format supports EXIF
   - Check server logs for metadata errors
   - Verify Sharp library installation

3. **Server Port**
   - Default port is 5002
   - Can be changed via PORT env variable
   - Check for port conflicts

### Getting Help

For support:

1. Check server logs
2. Verify environment setup
3. Open an issue with:
   - Detailed description
   - Steps to reproduce
   - Environment details

## Deployment Guide

### Understanding the Application

Before deploying, it's important to understand how the app works:

1. **Frontend Processing:**

   - Initial watermark preview
   - Client-side image manipulation
   - Real-time UI updates

2. **Backend Processing:**
   - EXIF metadata injection
   - High-quality image processing
   - Temporary file handling during processing

### Railway Deployment Steps

1. **Prerequisites**

   ```bash
   # Make sure you have:
   - A Railway account (railway.app)
   - Railway CLI installed
   - Git installed
   ```

2. **Project Setup**

   ```bash
   # Initialize Railway project
   railway login
   railway init
   ```

3. **Environment Configuration**
   In Railway dashboard:

   - Add `NODE_ENV=production`
   - Add `PORT=5002` (or let Railway assign automatically)

4. **Deployment Process**

   ```bash
   # Push your code
   git add .
   git commit -m "Ready for deployment"
   railway up
   ```

5. **Verify Deployment**
   - Check Railway dashboard for build logs
   - Ensure all environment variables are set
   - Test the deployed application endpoints

### Important Railway-specific Notes

1. **Port Configuration**

   - Railway automatically assigns a PORT
   - Application already handles this via process.env.PORT

2. **Node.js Version**

   - Required: Node.js >= 20.0.0
   - Add to package.json:

   ```json
   "engines": {
     "node": ">=20.0.0"
   }
   ```

3. **Memory Management**

   - Temporary files are automatically cleaned up
   - Files are stored briefly during processing only
   - No persistent storage needed
   - Railway's ephemeral filesystem is sufficient

4. **Monitoring**
   - Use Railway's built-in logs
   - Monitor memory usage
   - Check application logs for cleanup service

### Troubleshooting Railway Deployment

1. **Build Fails**

   - Check Node.js version in package.json
   - Verify all dependencies are listed
   - Review Railway build logs

2. **Runtime Errors**

   - Check environment variables
   - Verify PORT configuration
   - Review application logs

3. **Performance Issues**
   - Monitor memory usage
   - Check file processing times
   - Verify cleanup service is running

### Getting Help with Railway

1. Railway Dashboard:

   - https://railway.app/dashboard
   - Check project metrics
   - View application logs

2. Support Resources:
   - Railway Documentation: https://docs.railway.app
   - GitHub Issues
   - Railway Discord community

## License

GNU Affero General Public License v3.0 or later

---

Made with ❤️ for protecting creative works from AI training
