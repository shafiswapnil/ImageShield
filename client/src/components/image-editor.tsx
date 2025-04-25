import React from 'react';
import { ImageInfo, WatermarkSettings } from '@/pages/home';
import ImagePreview from '@/components/image-preview';
import WatermarkForm from '@/components/watermark-form';

interface ImageEditorProps {
  image: ImageInfo;
  watermarkSettings: WatermarkSettings;
  exifProtection: boolean;
  onUpdateSettings: (settings: Partial<WatermarkSettings>) => void;
  onExifToggle: (enabled: boolean) => void;
}

export default function ImageEditor({ 
  image, 
  watermarkSettings, 
  exifProtection,
  onUpdateSettings,
  onExifToggle
}: ImageEditorProps) {
  const handleProcessImage = async () => {
    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: image.file.name, // Use a temporary ID based on filename
          watermarkSettings,
          exifProtection,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process image');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create an anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `watermarked-${image.file.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error processing image:', error);
      // In a real app, you would show an error message
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
      <ImagePreview 
        image={image} 
        watermarkSettings={watermarkSettings}
        onPositionChange={(position) => onUpdateSettings({ position })}
      />
      
      <WatermarkForm 
        watermarkSettings={watermarkSettings}
        exifProtection={exifProtection}
        onUpdateSettings={onUpdateSettings}
        onExifToggle={onExifToggle}
        onProcessImage={handleProcessImage}
      />
    </div>
  );
}
