import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X, Camera, Plus, ImagePlus } from "lucide-react";

interface PhotoUploadStepProps {
  onUpload: (files: File[]) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

interface PhotoPreview {
  file: File;
  preview: string;
}

export const PhotoUploadStep = ({ onUpload, onBack, onSkip, isLoading }: PhotoUploadStepProps) => {
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: PhotoPreview[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" is larger than 5MB and was skipped`);
        return;
      }
      
      if (photos.length + newPhotos.length >= 5) {
        alert("Maximum 5 photos allowed");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPhotos((prev) => {
          if (prev.length >= 5) return prev;
          return [...prev, { file, preview: reader.result as string }];
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (photos.length > 0) {
      onUpload(photos.map((p) => p.file));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const newPhotos = [...prev];
      const [photo] = newPhotos.splice(index, 1);
      newPhotos.unshift(photo);
      return newPhotos;
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Upload Photos</h2>
        <p className="text-muted-foreground">Add up to 5 profile photos (optional)</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Primary Photo Slot */}
        {photos.length > 0 ? (
          <div className="relative col-span-2 sm:col-span-1 sm:row-span-2">
            <img
              src={photos[0].preview}
              alt="Primary photo"
              className="w-full h-48 sm:h-full object-cover rounded-lg border-4 border-primary/30"
            />
            <button
              onClick={() => removePhoto(0)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              Primary
            </span>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="col-span-2 sm:col-span-1 sm:row-span-2 h-48 sm:h-full min-h-[200px] rounded-lg border-4 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/50"
          >
            <Camera className="w-12 h-12 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground text-center px-4">
              Click to add primary photo
            </span>
          </div>
        )}

        {/* Additional Photos */}
        {photos.slice(1).map((photo, idx) => (
          <div key={idx + 1} className="relative">
            <img
              src={photo.preview}
              alt={`Photo ${idx + 2}`}
              className="w-full h-32 object-cover rounded-lg border-2 border-muted cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setPrimaryPhoto(idx + 1)}
              title="Click to set as primary"
            />
            <button
              onClick={() => removePhoto(idx + 1)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add More Button */}
        {photos.length > 0 && photos.length < 5 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/50"
          >
            <Plus className="w-8 h-8 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Add More</span>
          </div>
        )}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Upload clear photos of yourself</p>
        <p>Max file size: 5MB each • Up to 5 photos</p>
        <p className="text-xs mt-1">Click on a photo to set it as primary</p>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {photos.length > 0 ? (
          <Button onClick={handleUpload} disabled={isLoading} className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? "Uploading..." : `Upload ${photos.length} Photo${photos.length > 1 ? "s" : ""} & Continue`}
          </Button>
        ) : (
          <Button variant="secondary" onClick={onSkip} className="flex-1">
            Skip for Now
          </Button>
        )}
      </div>
    </div>
  );
};
