import React, { useMemo } from 'react';
import { ImageInfo, WatermarkSettings } from '@/pages/home';
import PositionSelector from '@/components/position-selector';

interface ImagePreviewProps {
  image: ImageInfo;
  watermarkSettings: WatermarkSettings;
  onPositionChange: (position: string) => void;
}

export default function ImagePreview({ 
  image, 
  watermarkSettings,
  onPositionChange
}: ImagePreviewProps) {
  // Calculate watermark position styles based on the selected position
  const watermarkStyle = useMemo(() => {
    const style: React.CSSProperties = {
      opacity: watermarkSettings.opacity / 100,
      fontSize: `${watermarkSettings.fontSize}px`,
      color: 'white',
      fontWeight: 'bold',
    };
    
    // Reset all positions
    style.top = 'auto';
    style.right = 'auto';
    style.bottom = 'auto';
    style.left = 'auto';
    style.transform = 'none';
    
    // Set position based on selection
    switch (watermarkSettings.position) {
      case 'top-left':
        style.top = '30px';
        style.left = '30px';
        break;
      case 'top-center':
        style.top = '30px';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        break;
      case 'top-right':
        style.top = '30px';
        style.right = '30px';
        break;
      case 'middle-left':
        style.top = '50%';
        style.left = '30px';
        style.transform = 'translateY(-50%)';
        break;
      case 'middle-center':
        style.top = '50%';
        style.left = '50%';
        style.transform = 'translate(-50%, -50%)';
        break;
      case 'middle-right':
        style.top = '50%';
        style.right = '30px';
        style.transform = 'translateY(-50%)';
        break;
      case 'bottom-left':
        style.bottom = '30px';
        style.left = '30px';
        break;
      case 'bottom-center':
        style.bottom = '30px';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
      default:
        style.bottom = '30px';
        style.right = '30px';
        break;
    }
    
    return style;
  }, [watermarkSettings]);
  
  return (
    <div className="lg:col-span-2 bg-gray-50 flex items-center justify-center relative p-4 border-b lg:border-b-0 lg:border-r border-gray-200">
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative max-w-full max-h-[500px] overflow-hidden">
          {/* Main image */}
          <img 
            src={image.url} 
            alt="Preview of uploaded image" 
            className="max-w-full max-h-[500px] object-contain"
          />
          
          {/* Watermark overlay */}
          <div 
            className="absolute watermark-preview"
            style={watermarkStyle}
          >
            {watermarkSettings.text}
          </div>
        </div>
        
        {/* Position selector */}
        <PositionSelector 
          selectedPosition={watermarkSettings.position} 
          onPositionChange={onPositionChange} 
        />
      </div>
      
      {/* Image info overlay */}
      <div className="absolute top-4 left-4 bg-white/90 rounded-md shadow px-3 py-2 text-sm text-gray-700">
        <div className="font-medium">{image.name}</div>
        <div className="text-gray-500">{image.dimensions} · {image.size}</div>
      </div>
    </div>
  );
}
