import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight, MapPin, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import placeholderMale from '@/assets/placeholder-male.png';
import placeholderFemale from '@/assets/placeholder-female.png';

interface Profile {
  id: string;
  name: string;
  photo_url: string | null;
  profile_id: string | null;
  date_of_birth: string | null;
  city: string | null;
  state: string | null;
  education: string | null;
  height: string | null;
  religion: string | null;
  caste: string | null;
  mother_tongue: string | null;
  marital_status: string | null;
  gender?: string;
}

interface PartnerPreferences {
  age_from: number | null;
  age_to: number | null;
  height_from: string | null;
  height_to: string | null;
  marital_status: string[] | null;
  religion: string[] | null;
  caste: string[] | null;
  education: string[] | null;
  mother_tongue: string[] | null;
  residing_state: string[] | null;
}

interface MatchedProfile extends Profile {
  compatibilityScore: number;
  matchedCriteria: string[];
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

  const parseHeight = (height: string | null): number | null => {
    if (!height) return null;
    const match = height.match(/(\d+)'(\d+)"/);
    if (match) {
      return parseInt(match[1]) * 12 + parseInt(match[2]);
    }
    return null;
  };

  const calculateCompatibility = (profile: Profile, prefs: PartnerPreferences): { score: number; matched: string[] } => {
    const matched: string[] = [];
    let totalCriteria = 0;
    let matchedCriteria = 0;

    // Age check
    if (prefs.age_from || prefs.age_to) {
      totalCriteria++;
      const age = calculateAge(profile.date_of_birth);
      if (age) {
        const fromOk = !prefs.age_from || age >= prefs.age_from;
        const toOk = !prefs.age_to || age <= prefs.age_to;
        if (fromOk && toOk) {
          matchedCriteria++;
          matched.push('Age');
        }
      }
    }

    // Height check
    if (prefs.height_from || prefs.height_to) {
      totalCriteria++;
      const profileHeight = parseHeight(profile.height);
      const fromHeight = parseHeight(prefs.height_from);
      const toHeight = parseHeight(prefs.height_to);
      if (profileHeight) {
        const fromOk = !fromHeight || profileHeight >= fromHeight;
        const toOk = !toHeight || profileHeight <= toHeight;
        if (fromOk && toOk) {
          matchedCriteria++;
          matched.push('Height');
        }
      }
    }

    // Religion check
    if (prefs.religion && prefs.religion.length > 0 && !prefs.religion.includes('Any')) {
      totalCriteria++;
      if (profile.religion && prefs.religion.includes(profile.religion)) {
        matchedCriteria++;
        matched.push('Religion');
      }
    }

    // Caste check
    if (prefs.caste && prefs.caste.length > 0 && !prefs.caste.includes('Any')) {
      totalCriteria++;
      if (profile.caste && prefs.caste.includes(profile.caste)) {
        matchedCriteria++;
        matched.push('Caste');
      }
    }

    // Marital status check
    if (prefs.marital_status && prefs.marital_status.length > 0) {
      totalCriteria++;
      if (profile.marital_status && prefs.marital_status.includes(profile.marital_status)) {
        matchedCriteria++;
        matched.push('Marital Status');
      }
    }

    // Mother tongue check
    if (prefs.mother_tongue && prefs.mother_tongue.length > 0) {
      totalCriteria++;
      if (profile.mother_tongue && prefs.mother_tongue.includes(profile.mother_tongue)) {
        matchedCriteria++;
        matched.push('Mother Tongue');
      }
    }

    // Education check
    if (prefs.education && prefs.education.length > 0) {
      totalCriteria++;
      if (profile.education && prefs.education.includes(profile.education)) {
        matchedCriteria++;
        matched.push('Education');
      }
    }

    // State check
    if (prefs.residing_state && prefs.residing_state.length > 0) {
      totalCriteria++;
      if (profile.state && prefs.residing_state.includes(profile.state)) {
        matchedCriteria++;
        matched.push('Location');
      }
    }

    const score = totalCriteria > 0 ? Math.round((matchedCriteria / totalCriteria) * 100) : 0;
    return { score, matched };
  };

  useEffect(() => {
    const fetchTopMatches = async () => {
      try {
        const targetGender = userGender === 'Male' ? 'Female' : 'Male';
        
        // Fetch user's partner preferences
        const { data: prefs, error: prefsError } = await supabase
          .from('partner_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (prefsError) throw prefsError;

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, name, photo_url, profile_id, date_of_birth, city, state, education, gender, height, religion, caste, mother_tongue, marital_status')
          .eq('is_complete', true)
          .eq('gender', targetGender)
          .neq('id', userId)
          .limit(20);

        if (error) throw error;

        if (!prefs || !profiles) {
          setMatches([]);
          return;
        }

        // Calculate compatibility scores based on actual preferences
        const matchedProfiles: MatchedProfile[] = profiles.map(profile => {
          const { score, matched } = calculateCompatibility(profile, prefs);
          return {
            ...profile,
            compatibilityScore: score,
            matchedCriteria: matched,
          };
        });

        // Sort by score and filter out 0% matches, take top 4
        const sortedMatches = matchedProfiles
          .filter(m => m.compatibilityScore > 0)
          .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
          .slice(0, 4);

        setMatches(sortedMatches);
      } catch (error) {
        console.error('Error fetching matches preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMatches();
  }, [userId, userGender]);

  const getPlaceholderImage = (gender?: string) => {
    return gender?.toLowerCase() === 'male' ? placeholderMale : placeholderFemale;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
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
                    <img
                      src={match.photo_url || getPlaceholderImage(match.gender)}
                      alt={match.name}
                      className="w-full h-full object-cover"
                    />
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
