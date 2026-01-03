import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Progress } from '@/components/ui/progress';
import { Users, ArrowRight, MapPin, GraduationCap, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  photo_url: string | null;
  profile_id: string | null;
  date_of_birth: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
}

interface MatchedProfile extends Profile {
  compatibilityScore: number;
}

interface MatchesPreviewProps {
  userId: string;
  userGender: string;
  onViewAllClick: () => void;
}

const MatchesPreview = ({ userId, userGender, onViewAllClick }: MatchesPreviewProps) => {
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchTopMatches = async () => {
      try {
        const targetGender = userGender === 'Male' ? 'Female' : 'Male';
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, name, photo_url, profile_id, date_of_birth, city, state, education')
          .eq('is_complete', true)
          .eq('gender', targetGender)
          .neq('id', userId)
          .limit(4);

        if (error) throw error;

        // Add mock compatibility scores for preview
        const matchedProfiles = (profiles || []).map(profile => ({
          ...profile,
          compatibilityScore: Math.floor(Math.random() * 30) + 70 // 70-100%
        }));

        setMatches(matchedProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore));
      } catch (error) {
        console.error('Error fetching matches preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMatches();
  }, [userId, userGender]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Your Matches</CardTitle>
          </div>
          <Button 
            onClick={onViewAllClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse hover:animate-none"
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No matches found yet. Update your preferences to find matches.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {matches.map((match) => (
              <Card 
                key={match.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={onViewAllClick}
              >
                {/* Square Profile Image */}
                <div className="relative">
                  <AspectRatio ratio={1}>
                    {match.photo_url ? (
                      <img
                        src={match.photo_url}
                        alt={match.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </AspectRatio>
                  
                  {/* Compatibility Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-background/90 ${getScoreColor(match.compatibilityScore)}`}>
                      {match.compatibilityScore}% Match
                    </span>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="p-3 space-y-2">
                  <div>
                    <h4 className="font-semibold text-foreground truncate">
                      {match.name}
                      {match.date_of_birth && (
                        <span className="text-muted-foreground font-normal">, {calculateAge(match.date_of_birth)}</span>
                      )}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {match.city && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        <MapPin className="h-3 w-3" />
                        {match.city}
                      </span>
                    )}
                    {match.education && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        <GraduationCap className="h-3 w-3" />
                        {match.education.length > 10 ? match.education.slice(0, 10) + '...' : match.education}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchesPreview;
