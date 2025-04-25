import React, { useState, useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ExifDisplayProps {
  imageFile: File | null;
  exifProtectionEnabled: boolean;
}

export default function ExifDisplay({ imageFile, exifProtectionEnabled }: ExifDisplayProps) {
  const [originalExif, setOriginalExif] = useState<any>(null);
  const [protectedExif, setProtectedExif] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract EXIF data from the image
  useEffect(() => {
    if (!imageFile) {
      setOriginalExif(null);
      setProtectedExif(null);
      return;
    }

    const extractExifData = async () => {
      try {
        setLoading(true);
        setError(null);

        // For original image
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const response = await fetch('/api/extract-exif', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to extract EXIF data');
        }
        
        const data = await response.json();
        setOriginalExif(data.originalExif || {});
        
        // For protected image mock data
        if (exifProtectionEnabled) {
          setProtectedExif({
            ...data.originalExif,
            IFD0: {
              ...(data.originalExif?.IFD0 || {}),
              Copyright: 'DO NOT USE FOR AI TRAINING',
              ImageDescription: 'This image is not authorized for use in AI training datasets',
            }
          });
        } else {
          setProtectedExif(data.originalExif);
        }
      } catch (err) {
        console.error('Error extracting EXIF data:', err);
        setError('Failed to extract EXIF data. This feature may not be supported in this environment.');
        // Provide fallback EXIF data for demonstration in Replit
        setOriginalExif({ 
          "Make": "Example Camera",
          "Model": "Model XYZ",
          "Software": "Image Processing Software",
          "DateTime": new Date().toISOString()
        });
        
        if (exifProtectionEnabled) {
          setProtectedExif({
            "Make": "Example Camera",
            "Model": "Model XYZ",
            "Software": "Image Processing Software", 
            "DateTime": new Date().toISOString(),
            "IFD0": {
              "Copyright": "DO NOT USE FOR AI TRAINING",
              "ImageDescription": "This image is not authorized for use in AI training datasets"
            }
          });
        } else {
          setProtectedExif({ 
            "Make": "Example Camera",
            "Model": "Model XYZ",
            "Software": "Image Processing Software",
            "DateTime": new Date().toISOString()
          });
        }
      } finally {
        setLoading(false);
      }
    };

    extractExifData();
  }, [imageFile, exifProtectionEnabled]);

  if (!imageFile) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold text-primary">EXIF Metadata Information</CardTitle>
        <CardDescription>
          View the original metadata and how it changes when protected
        </CardDescription>
      </CardHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-accent" />
              Original Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : originalExif ? (
              <MetadataDisplay data={originalExif} />
            ) : (
              <div className="text-gray-500 italic">No metadata found in the original image</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-accent" />
              {exifProtectionEnabled ? 'Protected Metadata' : 'Processed Metadata (No Protection)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : protectedExif ? (
              <MetadataDisplay data={protectedExif} highlightKeys={['Copyright', 'ImageDescription']} />
            ) : (
              <div className="text-gray-500 italic">No metadata will be in the processed image</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetadataDisplayProps {
  data: any;
  highlightKeys?: string[];
}

function MetadataDisplay({ data, highlightKeys = [] }: MetadataDisplayProps) {
  // Flatten nested objects for display
  const flattenObject = (obj: any, prefix = '') => {
    return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }
      return acc;
    }, {});
  };
  
  const flattenedData = flattenObject(data);
  
  return (
    <div className="text-sm">
      {Object.entries(flattenedData).length > 0 ? (
        <div className="space-y-2">
          {Object.entries(flattenedData).map(([key, value], index) => {
            const isHighlighted = highlightKeys.some(highlightKey => key.includes(highlightKey));
            return (
              <div key={index} className={`flex ${index > 0 ? 'mt-2' : ''}`}>
                <div 
                  className={`flex-1 font-medium ${isHighlighted ? 'text-accent' : 'text-gray-700'}`}
                >
                  {key}:
                </div>
                <div 
                  className={`flex-1 ${isHighlighted ? 'text-accent font-medium' : 'text-gray-600'}`}
                >
                  {String(value)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-gray-500 italic">No metadata available</div>
      )}
    </div>
  );
}