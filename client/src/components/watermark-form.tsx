import React from 'react';
import { WatermarkSettings, AdversarialSettings } from '@/pages/home';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Shield, AlertTriangle } from 'lucide-react';

interface WatermarkFormProps {
  watermarkSettings: WatermarkSettings;
  exifProtection: boolean;
  adversarialSettings: AdversarialSettings;
  onUpdateSettings: (settings: Partial<WatermarkSettings>) => void;
  onExifToggle: (enabled: boolean) => void;
  onAdversarialUpdate: (settings: Partial<AdversarialSettings>) => void;
  onProcessImage: () => void;
}

export default function WatermarkForm({ 
  watermarkSettings, 
  exifProtection,
  adversarialSettings,
  onUpdateSettings,
  onExifToggle,
  onAdversarialUpdate,
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

        {/* Adversarial Noise Protection */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <Label className="text-blue-900 font-medium">AI Training Protection</Label>
            </div>
            <Switch 
              id="adversarial-toggle" 
              checked={adversarialSettings.enabled}
              onCheckedChange={(enabled) => onAdversarialUpdate({ enabled })}
            />
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Add imperceptible noise that disrupts AI model training while keeping your image visually unchanged.
          </p>
          
          {adversarialSettings.enabled && (
            <div className="space-y-4">
              {/* Protection Intensity */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="adversarial-intensity" className="text-sm text-blue-900">
                    Protection Intensity
                  </Label>
                  <span className="text-sm text-blue-600 font-medium">
                    {adversarialSettings.intensity}/10
                  </span>
                </div>
                <Slider 
                  id="adversarial-intensity"
                  min={1} 
                  max={10} 
                  step={1}
                  value={[adversarialSettings.intensity]}
                  onValueChange={(value) => onAdversarialUpdate({ intensity: value[0] })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-blue-600 mt-1">
                  <span>Subtle</span>
                  <span>Strong</span>
                </div>
              </div>

              {/* Protection Method */}
              <div>
                <Label htmlFor="adversarial-method" className="text-sm text-blue-900 mb-2 block">
                  Protection Method
                </Label>
                <Select 
                  value={adversarialSettings.method} 
                  onValueChange={(method: 'gaussian' | 'uniform' | 'perlin') => 
                    onAdversarialUpdate({ method })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaussian">
                      <div className="flex flex-col">
                        <span className="font-medium">Gaussian (Recommended)</span>
                        <span className="text-xs text-gray-500">Most effective against CNN models</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="uniform">
                      <div className="flex flex-col">
                        <span className="font-medium">Uniform</span>
                        <span className="text-xs text-gray-500">General-purpose protection</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="perlin">
                      <div className="flex flex-col">
                        <span className="font-medium">Perlin</span>
                        <span className="text-xs text-gray-500">Structured patterns, harder to filter</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Warning for high intensity */}
              {adversarialSettings.intensity >= 8 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <strong>High intensity:</strong> May cause slight visual artifacts. 
                    Test with lower values if image quality is critical.
                  </div>
                </div>
              )}
            </div>
          )}
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
