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
      // Process the image on the client side using our utility
      import('@/lib/image-processor').then(async (module) => {
        try {
          // Show processing indicator
          const processingMessage = 'Processing your image...';
          alert(processingMessage);
          
          // Process the image client-side
          const processedBlob = await module.createDownloadableImage(
            image.file,
            watermarkSettings,
            exifProtection
          );
          
          // Create a URL from the blob
          const url = URL.createObjectURL(processedBlob);
          
          // Create an anchor element to trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = `watermarked-${image.file.name}`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          
          // Clean up the blob URL
          URL.revokeObjectURL(url);
          
          // Provide feedback
          alert('Image processed successfully! Download should begin automatically.');
        } catch (innerError) {
          console.error('Error in client-side processing:', innerError);
          if (innerError instanceof Error) {
            alert(`Error processing image: ${innerError.message}`);
          } else {
            alert('An unknown error occurred during image processing.');
          }
        }
      }).catch(err => {
        console.error('Failed to load image processor module:', err);
        alert('Failed to load image processing module.');
      });
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
