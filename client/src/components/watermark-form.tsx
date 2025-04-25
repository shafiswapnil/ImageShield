import React from 'react';
import { WatermarkSettings } from '@/pages/home';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Download } from 'lucide-react';

interface WatermarkFormProps {
  watermarkSettings: WatermarkSettings;
  exifProtection: boolean;
  onUpdateSettings: (settings: Partial<WatermarkSettings>) => void;
  onExifToggle: (enabled: boolean) => void;
  onProcessImage: () => void;
}

export default function WatermarkForm({ 
  watermarkSettings, 
  exifProtection,
  onUpdateSettings,
  onExifToggle,
  onProcessImage
}: WatermarkFormProps) {
  const positions = [
    { id: 'bottom-right', label: 'Bottom Right' },
    { id: 'bottom-left', label: 'Bottom Left' },
    { id: 'top-right', label: 'Top Right' },
    { id: 'top-left', label: 'Top Left' },
    { id: 'bottom-center', label: 'Bottom Center' },
    { id: 'top-center', label: 'Top Center' },
    { id: 'middle-left', label: 'Middle Left' },
    { id: 'middle-right', label: 'Middle Right' },
    { id: 'middle-center', label: 'Center' },
  ];
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-primary mb-6">Watermark Settings</h2>
      
      <form className="space-y-6">
        {/* Watermark Text */}
        <div>
          <Label htmlFor="watermark-text" className="mb-1">Watermark Text</Label>
          <Input 
            type="text" 
            id="watermark-text"
            value={watermarkSettings.text}
            onChange={(e) => onUpdateSettings({ text: e.target.value })}
            className="w-full"
          />
        </div>
        
        {/* Font Size */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="font-size">Font Size</Label>
            <span className="text-sm text-gray-500">{watermarkSettings.fontSize}px</span>
          </div>
          <Slider 
            id="font-size"
            min={12} 
            max={72} 
            step={1}
            value={[watermarkSettings.fontSize]}
            onValueChange={(value) => onUpdateSettings({ fontSize: value[0] })}
          />
        </div>
        
        {/* Opacity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="opacity">Opacity</Label>
            <span className="text-sm text-gray-500">{watermarkSettings.opacity}%</span>
          </div>
          <Slider 
            id="opacity"
            min={10} 
            max={100} 
            step={1}
            value={[watermarkSettings.opacity]}
            onValueChange={(value) => onUpdateSettings({ opacity: value[0] })}
          />
        </div>
        
        {/* Position */}
        <div>
          <Label className="mb-2">Position</Label>
          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
            {positions.slice(0, 9).map((position) => (
              <Button
                key={position.id}
                type="button"
                size="sm"
                variant={watermarkSettings.position === position.id ? "default" : "outline"}
                className={`text-xs ${watermarkSettings.position === position.id ? 'bg-accent text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => onUpdateSettings({ position: position.id })}
              >
                {position.label}
              </Button>
            ))}
          </div>
        </div>
        
        {/* EXIF Metadata */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>EXIF Metadata Protection</Label>
            <Switch 
              id="exif-toggle" 
              checked={exifProtection}
              onCheckedChange={onExifToggle}
            />
          </div>
          <p className="text-sm text-gray-500">
            Add metadata tags that request AI systems not to use this image for training purposes.
          </p>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            onClick={onProcessImage}
            className="w-full h-12"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Protected Image
          </Button>
        </div>
      </form>
    </div>
  );
}
