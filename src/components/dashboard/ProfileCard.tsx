import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Bookmark, Eye, MapPin, Briefcase, GraduationCap, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import placeholderMale from '@/assets/placeholder-male.png';
import placeholderFemale from '@/assets/placeholder-female.png';

interface ProfileCardProps {
  profile: {
    id: string;
    profile_id: string | null;
    name: string;
    photo_url: string | null;
    date_of_birth: string | null;
    height: string | null;
    city: string | null;
    state: string | null;
    education: string | null;
    occupation: string | null;
    verification_status: string | null;
    gender?: string;
  };
  onViewProfile?: () => void;
  onSendInterest?: () => void;
  onShortlist?: () => void;
  isShortlisted?: boolean;
}

const ProfileCard = ({
  profile,
  onViewProfile,
  onSendInterest,
  onShortlist,
  isShortlisted = false,
}: ProfileCardProps) => {
  const [allPhotos, setAllPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchAdditionalPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('profile_photos')
          .select('photo_url')
          .eq('profile_id', profile.id)
          .order('display_order', { ascending: true });

        if (error) throw error;

        const photos: string[] = [];
        if (profile.photo_url) {
          photos.push(profile.photo_url);
        }
        if (data) {
          photos.push(...data.map(p => p.photo_url));
        }
        setAllPhotos(photos);
      } catch (error) {
        // Fallback to main photo only
        if (profile.photo_url) {
          setAllPhotos([profile.photo_url]);
        }
      }
    };

    fetchAdditionalPhotos();
  }, [profile.id, profile.photo_url]);

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getPlaceholderImage = () => {
    const gender = profile.gender?.toLowerCase();
    return gender === 'male' ? placeholderMale : placeholderFemale;
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1));
  };

  const age = calculateAge(profile.date_of_birth);
  const location = [profile.city, profile.state].filter(Boolean).join(', ');
  const hasMultiplePhotos = allPhotos.length > 1;
  const currentPhoto = allPhotos[currentPhotoIndex] || profile.photo_url;

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-pointer hover:-translate-y-1 active:scale-[0.98]"
      onClick={onViewProfile}
    >
      <div className="relative">
        {/* Profile Image */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          <img
            src={currentPhoto || getPlaceholderImage()}
            alt={profile.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
          />

          {/* Photo Navigation Arrows - Always visible on mobile */}
          {hasMultiplePhotos && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 sm:p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 sm:p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              {/* Photo Indicators */}
              <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 sm:gap-1 z-10">
                {allPhotos.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex(index);
                    }}
                    className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-colors ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Verification Badge */}
          {profile.verification_status === 'verified' && (
            <Badge className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-green-500/90 text-white text-[10px] sm:text-xs px-1 sm:px-2 py-0.5">
              <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
              <span className="hidden xs:inline">Verified</span>
            </Badge>
          )}

          {/* Profile ID */}
          <Badge variant="secondary" className="absolute top-1 sm:top-2 right-1 sm:right-2 text-[10px] sm:text-xs px-1 sm:px-2">
            {profile.profile_id}
          </Badge>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 h-7 sm:h-9 text-xs sm:text-sm px-1 sm:px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile?.();
                }}
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden xs:inline">View</span>
              </Button>
              <Button
                size="sm"
                variant="default"
                className="flex-1 h-7 sm:h-9 text-xs sm:text-sm px-1 sm:px-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onSendInterest?.();
                }}
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden xs:inline">Interest</span>
              </Button>
              <Button
                size="icon"
                variant={isShortlisted ? 'default' : 'outline'}
                onClick={(e) => {
                  e.stopPropagation();
                  onShortlist?.();
                }}
                className="shrink-0 h-7 w-7 sm:h-9 sm:w-9"
              >
                <Bookmark className={`h-3 w-3 sm:h-4 sm:w-4 ${isShortlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-2 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-lg truncate">{profile.name}</h3>
        
        <div className="mt-1 sm:mt-2 space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground">
          {(age || profile.height) && (
            <p className="flex items-center gap-1 sm:gap-2">
              {age && <span>{age} yrs</span>}
              {age && profile.height && <span>•</span>}
              {profile.height && <span>{profile.height.split(' ')[0]}</span>}
            </p>
          )}
          
          {location && (
            <p className="flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          )}
          
          {profile.education && (
            <p className="flex items-center gap-1 hidden sm:flex">
              <GraduationCap className="h-3 w-3 shrink-0" />
              <span className="truncate">{profile.education}</span>
            </p>
          )}
          
          {profile.occupation && (
            <p className="flex items-center gap-1 hidden sm:flex">
              <Briefcase className="h-3 w-3 shrink-0" />
              <span className="truncate">{profile.occupation}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
