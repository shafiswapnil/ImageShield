# AI Defense Watermarker 🛡️

Protect your images from AI training with visible watermarks and EXIF metadata tags! This tool helps content creators and photographers safeguard their work from being used in AI model training.

## Version

1.0.0

## Features

- Image upload and preview
- Customizable watermark text
- Watermark position selection
- EXIF metadata protection
- Automatic file cleanup (12-hour retention)
- Responsive UI
- Real-time preview

## Tech Stack

- Frontend:
  - React 18
  - TypeScript
  - Tailwind CSS
  - Shadcn/ui components
  - Vite
- Backend:
  - Express.js
  - Sharp (image processing)
  - Multer (file uploads)

## Directory Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   └── pages/       # Page components
├── server/              # Backend Express application
│   ├── routes.ts       # API routes
│   ├── storage.ts      # File storage logic
│   └── index.ts        # Server entry point
└── shared/             # Shared types
```

## Installation Guide

### Step 1: Clone and Install Dependencies

```bash
# Clone your repository
git clone <your-repo-url>

# Install dependencies
npm install
```

### Step 2: Environment Setup

Create a new file `.env` in the root directory:

```
NODE_ENV=development
PORT=5000
```

### Step 3: Development

To run the development server:

```bash
npm run dev
```

This will start:

- Frontend dev server with Vite
- Backend Express server
- File cleanup service (12-hour retention)

### Step 4: Building for Production

```bash
npm run build
```

This builds:

- Frontend static files (in dist/public)
- Backend server code (in dist/)

### Step 5: Production Start

```bash
npm run start
```

## Image Cleanup System

- Images are automatically deleted after 12 hours
- Cleanup service runs every 60 minutes
- Located in `server/storage.ts`
- No configuration needed, works automatically

## API Endpoints

### POST /api/process-image

- Uploads and processes image with watermark
- Accepts multipart form data
- Returns processed image

### POST /api/extract-exif

- Extracts EXIF data from image
- Accepts image file
- Returns EXIF metadata

### POST /api/add-exif

- Adds protection metadata to image
- Accepts image file
- Returns protected image

## Deployment Guide

### Preparing for Railway Deployment

1. **Verify package.json scripts**

   - "build": Builds both frontend and backend
   - "start": Starts production server

2. **Environment Variables**

   - PORT: Railway will provide this
   - NODE_ENV: Set to "production"

3. **Port Configuration**

   - Server listens on `process.env.PORT || 5000`
   - Already configured in server/index.ts

4. **Railway Specific**
   - Add `engines` to package.json:
   ```json
   "engines": {
     "node": ">=20.0.0"
   }
   ```

### Required Environment Variables for Railway

1. `NODE_ENV`: Set this to "production"

   - Value: `production`

2. `PORT`: Set this to match your Railway configuration
   - Value: `5000` (default)

### Railway Deployment Steps

1. Create Railway account (railway.app)
2. Install Railway CLI:

   ```bash
   npm i -g @railway/cli
   ```

3. From Railway Dashboard:

   - Create new project
   - Connect your repository
   - Add environment variables if needed

4. Deploy Settings:
   - Build Command: `npm run build`
   - Start Command: `npm run start`

The application handles file cleanup automatically, deleting uploaded images after 12 hours. This is managed by the cleanup service in the server code.

## Common Issues & Solutions

1. **Image Upload Fails**

   - Check file size (max 10MB)
   - Verify file type (JPG/PNG supported)

2. **Watermark Not Visible**

   - Ensure text is entered
   - Check opacity settings

3. **EXIF Protection Issues**
   - Verify image format supports EXIF
   - Check server logs for details

## Support

For issues or questions, please open a GitHub issue with:

- Description of problem
- Steps to reproduce
- Expected vs actual behavior

## License
This project is licensed under the GNU Affero General Public License v3.0 or later - see the [LICENSE](LICENSE) file for details.
