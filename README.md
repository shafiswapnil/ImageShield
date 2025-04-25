
# AI Defense Watermarker 🛡️

A React + Express application that helps protect images from AI training by adding visible watermarks and EXIF metadata.

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
└── shared/             # Shared types/schemas
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

The following environment variables must be set in your Railway project:

1. `DATABASE_URL`: PostgreSQL connection string for your database

#### How to Set Up PostgreSQL in Railway (Baby Steps! 🍼)

1. **Create Database:**
   - Go to Railway Dashboard
   - Click "New Project" (big blue button!)
   - Choose "Database" (look for the blocks!)
   - Pick "PostgreSQL" (it has a cute elephant! 🐘)
   - Wait for it to finish (like waiting for cookies to bake! 🍪)

2. **Get Database URL:**
   - In your new PostgreSQL project
   - Find "Connect" button (usually on top)
   - Click dropdown and select "PostgreSQL Connection URL"
   - Click "Copy" button (looks like two squares 📋)
   - Your URL will look like: `postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway`

3. **Use the Database URL:**
   - Copy your URL from Railway
   - In your code, it will use this URL from `process.env.DATABASE_URL`
   - The code is already set up to use this in `db/index.ts`!

4. **Test Connection:**
   - Start your application
   - If you see "Connected to database" in logs, you did it! 🎉
   - If you see errors, double-check your URL! 

Remember: Keep your database URL secret! It's like your special treehouse password! 🌳

2. `NODE_ENV`: Set this to "production"
   - Value: `production`

3. `PORT`: Set this to match your Railway configuration
   - Value: `5000` (default)

### Setting Environment Variables in Railway

1. Go to your project settings in Railway
2. Navigate to the "Variables" tab
3. Add each environment variable:
   ```
   DATABASE_URL=<your-database-url>
   NODE_ENV=production
   PORT=5000
   ```

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
