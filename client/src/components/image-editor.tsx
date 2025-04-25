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
      // Create a FormData object to properly upload the file
      const formData = new FormData();
      formData.append('image', image.file);
      formData.append('text', watermarkSettings.text);
      formData.append('position', watermarkSettings.position);
      formData.append('opacity', watermarkSettings.opacity.toString());
      formData.append('fontSize', watermarkSettings.fontSize.toString());
      formData.append('exifProtection', exifProtection ? 'true' : 'false');
      
      // Send the form data to the server
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process image');
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
      if (error instanceof Error) {
        alert(`Failed to process image: ${error.message}`);
      } else {
        alert('Failed to process image. An unknown error occurred.');
      }
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
