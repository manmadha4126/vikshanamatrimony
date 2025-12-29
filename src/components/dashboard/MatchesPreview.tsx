import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, ArrowRight, MapPin, GraduationCap } from 'lucide-react';
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
              <div 
                key={match.id} 
                className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={onViewAllClick}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src={match.photo_url || ''} alt={match.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(match.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground truncate max-w-full">
                      {match.name}
                    </h4>
                    {match.date_of_birth && (
                      <p className="text-sm text-muted-foreground">
                        {calculateAge(match.date_of_birth)} yrs
                      </p>
                    )}
                  </div>

                  <div className="w-full space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Match</span>
                      <span className={`font-semibold ${getScoreColor(match.compatibilityScore)}`}>
                        {match.compatibilityScore}%
                      </span>
                    </div>
                    <Progress 
                      value={match.compatibilityScore} 
                      className="h-1.5" 
                    />
                  </div>

                  <div className="flex flex-wrap gap-1 justify-center">
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchesPreview;
