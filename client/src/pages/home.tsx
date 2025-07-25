import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import UploadZone from '@/components/upload-zone';
import ImageEditor from '@/components/image-editor';
import ExifDisplay from '@/components/exif-display-new';

export interface ImageInfo {
  file: File;
  url: string;
  name: string;
  dimensions: string;
  size: string;
}

export interface WatermarkSettings {
  text: string;
  position: string;
  opacity: number;
  fontSize: number;
}

export interface AdversarialSettings {
  enabled: boolean;
  intensity: number; // 1-10 scale
  method: 'gaussian' | 'uniform' | 'perlin';
}

export default function Home() {
  const [image, setImage] = React.useState<ImageInfo | null>(null);
  const [watermarkSettings, setWatermarkSettings] = React.useState<WatermarkSettings>({
    text: "Not for AI training",
    position: "bottom-right",
    opacity: 70,
    fontSize: 24
  });
  const [exifProtection, setExifProtection] = React.useState(true);
  const [adversarialSettings, setAdversarialSettings] = React.useState<AdversarialSettings>({
    enabled: true, // Enable by default for better protection
    intensity: 5, // Medium intensity
    method: 'gaussian' // Most effective against CNNs
  });

  const handleFileUpload = (imageInfo: ImageInfo) => {
    setImage(imageInfo);
  };

  const handleUpdateSettings = (newSettings: Partial<WatermarkSettings>) => {
    setWatermarkSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleExifToggle = (enabled: boolean) => {
    setExifProtection(enabled);
  };

  const handleAdversarialUpdate = (newSettings: Partial<AdversarialSettings>) => {
    setAdversarialSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {!image ? (
            <UploadZone onFileUpload={handleFileUpload} />
          ) : (
            <>
              <ImageEditor 
                image={image}
                watermarkSettings={watermarkSettings}
                exifProtection={exifProtection}
                adversarialSettings={adversarialSettings}
                onUpdateSettings={handleUpdateSettings}
                onExifToggle={handleExifToggle}
                onAdversarialUpdate={handleAdversarialUpdate}
              />
              <div className="p-6">
                <ExifDisplay 
                  imageFile={image.file}
                  exifProtectionEnabled={exifProtection}
                />
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
