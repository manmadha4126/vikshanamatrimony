import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { 
  Bookmark, 
  Heart, 
  X, 
  Phone, 
  MessageCircle,
  Loader2 
} from 'lucide-react';
import placeholderMale from '@/assets/placeholder-male.png';
import placeholderFemale from '@/assets/placeholder-female.png';

interface Profile {
  id: string;
  name: string;
  photo_url: string | null;
  profile_id: string | null;
  date_of_birth: string | null;
  height: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  occupation: string | null;
  religion: string | null;
  caste: string | null;
  mother_tongue: string | null;
  marital_status: string | null;
  annual_income: string | null;
  gender?: string;
  updated_at?: string;
}

interface MatchProfileCardProps {
  profile: Profile;
  compatibilityScore?: number;
  matchedCriteria?: string[];
  hasSentInterest?: boolean;
  isShortlisted?: boolean;
  isSendingInterest?: boolean;
  onSendInterest?: () => void;
  onShortlist?: () => void;
  onDontShow?: () => void;
  showCallButtons?: boolean;
}

const MatchProfileCard = ({
  profile,
  compatibilityScore,
  matchedCriteria = [],
  hasSentInterest = false,
  isShortlisted = false,
  isSendingInterest = false,
  onSendInterest,
  onShortlist,
  onDontShow,
  showCallButtons = false,
}: MatchProfileCardProps) => {
  const navigate = useNavigate();

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getLastSeen = () => {
    if (!profile.updated_at) return null;
    const date = new Date(profile.updated_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getPlaceholderImage = () => {
    return profile.gender?.toLowerCase() === 'male' ? placeholderMale : placeholderFemale;
  };

  const handleCardClick = () => {
    navigate(`/profile/${profile.id}`, { state: { fromMatches: true } });
  };

  const age = calculateAge(profile.date_of_birth);
  const lastSeen = getLastSeen();
  const location = profile.city || profile.state;

  // Build details string like "20 yrs • 5'8" • Church of Christ • B.Tech. • Not Working • Location"
  const detailParts = [];
  if (age) detailParts.push(`${age} yrs`);
  if (profile.height) detailParts.push(profile.height.split(' ')[0]);
  if (profile.religion) detailParts.push(profile.religion);
  if (profile.education) detailParts.push(profile.education);
  if (profile.occupation) detailParts.push(profile.occupation);
  if (location) detailParts.push(location);

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer border"
      onClick={handleCardClick}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Left: Profile Image */}
        <div className="relative w-full sm:w-48 md:w-56 flex-shrink-0">
          <AspectRatio ratio={1} className="sm:aspect-auto sm:h-full">
            <img
              src={profile.photo_url || getPlaceholderImage()}
              alt={profile.name}
              className="w-full h-full object-cover sm:h-48 md:h-56"
            />
          </AspectRatio>
          
          {/* Shortlist Button on image */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShortlist?.();
            }}
            className={`absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
              isShortlisted 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background/90 text-foreground hover:bg-background'
            }`}
          >
            <Bookmark className={`h-3 w-3 ${isShortlisted ? 'fill-current' : ''}`} />
            Shortlist
          </button>

          {/* Compatibility Badge */}
          {compatibilityScore !== undefined && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <Badge 
                className={`text-xs ${
                  compatibilityScore >= 80 ? 'bg-green-500' :
                  compatibilityScore >= 60 ? 'bg-blue-500' :
                  compatibilityScore >= 40 ? 'bg-yellow-500' :
                  'bg-orange-500'
                } text-white`}
              >
                {compatibilityScore}% Match
              </Badge>
            </div>
          )}
        </div>

        {/* Right: Profile Details */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
          {/* Top Section: Name, ID, Last Seen, Call Icons */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-foreground truncate">
                  {profile.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profile.profile_id}
                  {lastSeen && (
                    <span className="ml-2">• Last seen {lastSeen}</span>
                  )}
                </p>
              </div>
              
              {/* Call buttons - visible for Prime */}
              {showCallButtons && (
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Details String */}
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {detailParts.join(' • ')}
            </p>

            {/* Annual Income if available */}
            {profile.annual_income && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">{profile.annual_income}</span>
              </p>
            )}

            {/* Matched Criteria badges */}
            {matchedCriteria.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {matchedCriteria.slice(0, 4).map((criteria) => (
                  <Badge 
                    key={criteria} 
                    variant="secondary" 
                    className="text-xs bg-green-50 text-green-700 border-green-200"
                  >
                    ✓ {criteria}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Section: Action Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t">
            {onDontShow && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-9"
                onClick={(e) => {
                  e.stopPropagation();
                  onDontShow();
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Don't Show
              </Button>
            )}
            <Button
              size="sm"
              className={`flex-1 h-9 ${
                hasSentInterest 
                  ? 'bg-green-500 hover:bg-green-500 text-white' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
              disabled={hasSentInterest || isSendingInterest}
              onClick={(e) => {
                e.stopPropagation();
                onSendInterest?.();
              }}
            >
              {isSendingInterest ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 mr-1 ${hasSentInterest ? 'fill-current' : ''}`} />
              )}
              {hasSentInterest ? 'Interest Sent' : 'Send Interest'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MatchProfileCard;
