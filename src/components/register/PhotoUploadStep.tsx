import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, X, Camera } from "lucide-react";

interface PhotoUploadStepProps {
  onUpload: (file: File) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading: boolean;
}

export const PhotoUploadStep = ({ onUpload, onBack, onSkip, isLoading }: PhotoUploadStepProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const clearSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Upload Photo</h2>
        <p className="text-muted-foreground">Add a profile photo (optional)</p>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-48 h-48 object-cover rounded-full border-4 border-primary/20"
            />
            <button
              onClick={clearSelection}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-48 h-48 rounded-full border-4 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/50"
          >
            <Camera className="w-12 h-12 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload</span>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground">
          <p>Upload a clear photo of yourself</p>
          <p>Max file size: 5MB</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {selectedFile ? (
          <Button onClick={handleUpload} disabled={isLoading} className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? "Uploading..." : "Upload & Continue"}
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
