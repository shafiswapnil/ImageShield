import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageInfo } from '@/pages/home';
import { 
  AlertCircle, 
  Upload, 
  Lock, 
  FileImage, 
  Sliders 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface UploadZoneProps {
  onFileUpload: (imageInfo: ImageInfo) => void;
}

export default function UploadZone({ onFileUpload }: UploadZoneProps) {
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Format file size
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
        
        const imageInfo: ImageInfo = {
          file,
          url: URL.createObjectURL(file),
          name: file.name,
          dimensions: `${img.width}x${img.height}`,
          size: `${sizeInMB}MB`
        };
        
        onFileUpload(imageInfo);
      };
      
      img.src = reader.result as string;
    };
    
    reader.readAsDataURL(file);
  }, [onFileUpload]);
  
  const onDropRejected = useCallback((fileRejections: any[]) => {
    // Check if it's a file size issue
    const isSizeIssue = fileRejections.some(rejection => 
      rejection.errors.some(error => error.code === 'file-too-large')
    );
    
    if (isSizeIssue) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB. Please upload a smaller image.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Unsupported file format",
        description: "Please upload a JPG or PNG image.",
        variant: "destructive"
      });
    }
  }, [toast]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB size limit (same as server)
  });
  
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[500px]">
      <div 
        {...getRootProps()} 
        className={`w-full max-w-xl p-12 border-2 border-dashed border-gray-300 rounded-lg 
          flex flex-col items-center justify-center cursor-pointer 
          hover:border-accent hover:bg-accent/5 transition-colors
          ${isDragActive ? 'drag-active' : ''}`}
      >
        <FileImage className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">Upload an Image</h3>
        <p className="text-gray-500 text-center mb-6">Drag and drop your image here, or click to browse</p>
        
        <input {...getInputProps()} />
        
        <Button 
          type="button"
          className="inline-flex items-center"
        >
          <Upload className="h-5 w-5 mr-2" />
          Select Image
        </Button>
        
        <div className="mt-4 text-sm text-gray-500">
          Supported formats: JPG, PNG
        </div>
      </div>
      
      <div className="mt-12 text-center max-w-2xl">
        <h2 className="text-2xl font-bold text-primary mb-4">Protect Your Images from AI Training</h2>
        <p className="text-gray-600 mb-6">
          Our tool helps you safeguard your images by adding visible watermarks and embedding EXIF metadata that explicitly requests AI systems not to use your content for training purposes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold text-primary mb-2">Visible Watermarks</h3>
              <p className="text-gray-600 text-sm">Add customized text watermarks with adjustable opacity and positioning</p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileImage className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold text-primary mb-2">EXIF Protection</h3>
              <p className="text-gray-600 text-sm">Embed metadata that signals your image should not be used for AI training</p>
            </CardContent>
          </Card>
          
          <Card className="border border-gray-100">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sliders className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-bold text-primary mb-2">Full Customization</h3>
              <p className="text-gray-600 text-sm">Control every aspect of the watermarking process to suit your needs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
