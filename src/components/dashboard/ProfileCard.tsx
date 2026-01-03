import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Bookmark, Eye, MapPin, Briefcase, GraduationCap, Shield } from 'lucide-react';

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const age = calculateAge(profile.date_of_birth);
  const location = [profile.city, profile.state].filter(Boolean).join(', ');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        {/* Profile Image */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          {profile.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Verification Badge */}
          {profile.verification_status === 'verified' && (
            <Badge className="absolute top-2 left-2 bg-green-500/90 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}

          {/* Profile ID */}
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
            {profile.profile_id}
          </Badge>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={onViewProfile}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={onSendInterest}
              >
                <Heart className="h-4 w-4 mr-1" />
                Interest
              </Button>
              <Button
                size="icon"
                variant={isShortlisted ? 'default' : 'outline'}
                onClick={onShortlist}
                className="shrink-0"
              >
                <Bookmark className={`h-4 w-4 ${isShortlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
        
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          {(age || profile.height) && (
            <p className="flex items-center gap-2">
              {age && <span>{age} yrs</span>}
              {age && profile.height && <span>•</span>}
              {profile.height && <span>{profile.height.split(' ')[0]}</span>}
            </p>
          )}
          
          {location && (
            <p className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{location}</span>
            </p>
          )}
          
          {profile.education && (
            <p className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" />
              <span className="truncate">{profile.education}</span>
            </p>
          )}
          
          {profile.occupation && (
            <p className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              <span className="truncate">{profile.occupation}</span>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
