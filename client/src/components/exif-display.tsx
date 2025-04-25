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

        // Import the image processor to get the EXIF protection data
        const imageProcessor = await import('@/lib/image-processor');
        const exifProtectionData = imageProcessor.getExifProtectionData();

        // For original image, attempt to extract EXIF from the server
        // but fall back to client-side metadata if server extraction fails
        try {
          const formData = new FormData();
          formData.append('image', imageFile);
          
          const response = await fetch('/api/extract-exif', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to extract EXIF data from server');
          }
          
          const data = await response.json();
          setOriginalExif(data.originalExif || {});
        } catch (serverError) {
          console.warn('Server EXIF extraction failed, using client metadata:', serverError);
          
          // Extract basic metadata from the image file on the client
          const imageMetadata = {
            "fileName": imageFile.name,
            "fileSize": `${(imageFile.size / 1024).toFixed(2)} KB`,
            "fileType": imageFile.type,
            "lastModified": new Date(imageFile.lastModified).toISOString()
          };
          
          setOriginalExif(imageMetadata);
        }
        
        // For protected image data
        if (exifProtectionEnabled) {
          // Create a simulated version of the metadata with EXIF protection added
          setProtectedExif((prev: any) => {
            const baseMetadata = prev || originalExif || {};
            return {
              ...baseMetadata,
              // Add the EXIF protection fields
              ...exifProtectionData,
              "ExifMetadataNote": "These fields would be added to the image EXIF data",
              "ExifProtection": "Enabled",
              "_notes": "The changes shown here would be embedded in the actual image file"
            };
          });
        } else {
          // If protection is disabled, the processed image would have the same metadata
          setProtectedExif(originalExif);
        }
      } catch (err) {
        console.error('Error extracting EXIF data:', err);
        setError('Failed to extract EXIF data. Using simulated metadata for demonstration.');
        
        // Provide fallback EXIF data for demonstration
        const simulatedMetadata = { 
          "fileName": imageFile.name,
          "fileSize": `${(imageFile.size / 1024).toFixed(2)} KB`,
          "fileType": imageFile.type,
          "lastModified": new Date(imageFile.lastModified).toISOString(),
          "_note": "Simulated metadata for demonstration purposes"
        };
        
        setOriginalExif(simulatedMetadata);
        
        if (exifProtectionEnabled) {
          const imageProcessor = await import('@/lib/image-processor');
          const exifProtectionData = imageProcessor.getExifProtectionData();
          
          setProtectedExif({
            ...simulatedMetadata,
            ...exifProtectionData,
            "ExifProtection": "Enabled",
            "_notes": "The changes shown here would be embedded in the actual image file"
          });
        } else {
          setProtectedExif(simulatedMetadata);
        }
      } finally {
        setLoading(false);
      }
    };

    extractExifData();
  }, [imageFile, exifProtectionEnabled, originalExif]);

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