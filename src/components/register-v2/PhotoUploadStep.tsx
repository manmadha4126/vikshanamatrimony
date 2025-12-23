import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, ArrowRight, SkipForward } from "lucide-react";

interface PhotoUploadStepProps {
  onComplete: (photoUrl: string | null) => void;
  onSkip: () => void;
}

const PhotoUploadStep = ({ onComplete, onSkip }: PhotoUploadStepProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Camera className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">Add Your Photo</h2>
        <p className="text-muted-foreground">A profile photo helps you get more responses</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-40 h-40 rounded-full object-cover border-4 border-primary/20" />
            <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 rounded-full" onClick={() => setPreview(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div onClick={() => fileInputRef.current?.click()} className="w-40 h-40 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Upload Photo</span>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="space-y-2">
        <Button onClick={() => onComplete(preview)} disabled={!preview} className="w-full h-12" variant="primary">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button onClick={onSkip} variant="ghost" className="w-full">
          <SkipForward className="mr-2 h-4 w-4" /> Skip for now
        </Button>
      </div>
    </div>
  );
};

export default PhotoUploadStep;
