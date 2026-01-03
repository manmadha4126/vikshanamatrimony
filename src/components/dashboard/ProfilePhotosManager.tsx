import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Plus, Trash2, Loader2, X } from 'lucide-react';

interface ProfilePhotosManagerProps {
  profileId: string;
  onPhotosChange?: () => void;
}

interface ProfilePhoto {
  id: string;
  photo_url: string;
  display_order: number;
}

export const ProfilePhotosManager = ({ profileId, onPhotosChange }: ProfilePhotosManagerProps) => {
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_photos')
        .select('*')
        .eq('profile_id', profileId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [profileId]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profileId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      const nextOrder = photos.length > 0 ? Math.max(...photos.map(p => p.display_order)) + 1 : 0;

      const { error: insertError } = await supabase
        .from('profile_photos')
        .insert({
          profile_id: profileId,
          photo_url: publicUrl,
          display_order: nextOrder,
        });

      if (insertError) throw insertError;

      toast({
        title: "Photo uploaded",
        description: "Your photo has been added successfully",
      });

      fetchPhotos();
      onPhotosChange?.();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photo: ProfilePhoto) => {
    try {
      // Extract file path from URL
      const urlParts = photo.photo_url.split('/profile-photos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('profile-photos').remove([filePath]);
      }

      const { error } = await supabase
        .from('profile_photos')
        .delete()
        .eq('id', photo.id);

      if (error) throw error;

      toast({
        title: "Photo deleted",
        description: "Photo has been removed",
      });

      fetchPhotos();
      onPhotosChange?.();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-lg flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          Additional Photos
          <span className="text-xs font-normal text-muted-foreground ml-2">(Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add more photos to your profile. This is optional but can help you get more matches.
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.photo_url}
                  alt="Profile photo"
                  className="w-full h-full object-cover rounded-lg border"
                />
                <button
                  onClick={() => handleDeletePhoto(photo)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            
            {/* Add Photo Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Add</span>
                </>
              )}
            </button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Max file size: 5MB. Supported formats: JPG, PNG, WebP
        </p>
      </CardContent>
    </Card>
  );
};
