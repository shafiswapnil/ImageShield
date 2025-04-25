import React, { useState } from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getExifProtectionData } from '@/lib/image-processor';

interface ExifDisplayProps {
  imageFile: File | null;
  exifProtectionEnabled: boolean;
}

export default function ExifDisplay({ imageFile, exifProtectionEnabled }: ExifDisplayProps) {
  if (!imageFile) {
    return null;
  }

  // Basic file metadata that we can extract without server
  const originalMetadata = {
    "filename": imageFile.name,
    "fileSize": `${(imageFile.size / 1024).toFixed(2)} KB`,
    "fileType": imageFile.type,
    "lastModified": new Date(imageFile.lastModified).toISOString().split('T')[0],
  };

  // Get the EXIF protection data that would be added
  const exifProtectionData = getExifProtectionData();
  
  // Create the protected metadata view (either identical to original or with additions)
  const protectedMetadata = exifProtectionEnabled 
    ? {
        ...originalMetadata,
        ...exifProtectionData,
        "ExifProtection": "Enabled"
      }
    : { ...originalMetadata };

  return (
    <div className="mt-8 space-y-4">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold text-primary">EXIF Metadata Information</CardTitle>
        <CardDescription>
          View the original metadata and how it changes when protected
        </CardDescription>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2 text-accent" />
              Original Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MetadataDisplay data={originalMetadata} />
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
            <MetadataDisplay 
              data={protectedMetadata} 
              highlightKeys={Object.keys(exifProtectionData)}
            />
          </CardContent>
        </Card>
      </div>

      {exifProtectionEnabled && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>About EXIF Protection</AlertTitle>
          <AlertDescription>
            Browser limitations prevent us from directly modifying EXIF data in downloads. 
            In a production environment, the server would add EXIF tags including 'Copyright: DO NOT USE FOR AI TRAINING'.
            The downloaded image has a watermark indicating the EXIF protection.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface MetadataDisplayProps {
  data: Record<string, string>;
  highlightKeys?: string[];
}

function MetadataDisplay({ data, highlightKeys = [] }: MetadataDisplayProps) {
  return (
    <div className="text-sm">
      <div className="space-y-2">
        {Object.entries(data).map(([key, value], index) => {
          const isHighlighted = highlightKeys.includes(key);
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
                {value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}