import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Gem, Heart, Loader2, MapPin, GraduationCap, Briefcase, Star, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

interface MatchedProfile extends Profile {
  compatibilityScore: number;
  matchedCriteria: string[];
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
  country: string[] | null;
}

interface MatchesSectionProps {
  userId: string;
  userGender: string;
}

const MatchesSection = ({ userId, userGender }: MatchesSectionProps) => {
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);
  const [sentInterests, setSentInterests] = useState<string[]>([]);
  const { toast } = useToast();

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

  const fetchMatches = async () => {
    setLoading(true);
    try {
      // Fetch user's partner preferences
      const { data: prefs, error: prefsError } = await supabase
        .from('partner_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (prefsError) throw prefsError;

      // Fetch all sent interests
      const { data: interests } = await supabase
        .from('interests')
        .select('to_profile_id')
        .eq('from_user_id', userId);

      setSentInterests(interests?.map(i => i.to_profile_id) || []);

      // Fetch profiles of opposite gender
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, photo_url, profile_id, date_of_birth, height, city, state, education, occupation, religion, caste, mother_tongue, marital_status, annual_income')
        .eq('is_complete', true)
        .neq('gender', userGender)
        .limit(50);

      if (profilesError) throw profilesError;

      if (!prefs || !profiles) {
        setMatches([]);
        return;
      }

      // Calculate compatibility and sort
      const matchedProfiles: MatchedProfile[] = profiles.map(profile => {
        const { score, matched } = calculateCompatibility(profile, prefs);
        return {
          ...profile,
          compatibilityScore: score,
          matchedCriteria: matched,
        };
      });

      // Sort by compatibility score
      matchedProfiles.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      // Filter out profiles with 0% match
      const filteredMatches = matchedProfiles.filter(m => m.compatibilityScore > 0);

      setMatches(filteredMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInterest = async (profileId: string) => {
    setSendingInterest(profileId);
    try {
      const { error } = await supabase
        .from('interests')
        .insert({
          from_user_id: userId,
          to_profile_id: profileId,
          status: 'pending',
        });

      if (error) throw error;

      setSentInterests(prev => [...prev, profileId]);
      toast({
        title: "Interest Sent",
        description: "Your interest has been sent successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send interest",
        variant: "destructive",
      });
    } finally {
      setSendingInterest(null);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [userId, userGender]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          Your Matches
          {matches.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {matches.length} profiles
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Gem className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No matches found</h3>
            <p className="text-muted-foreground text-sm">
              Update your partner preferences to find compatible matches.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => {
              const age = calculateAge(match.date_of_birth);
              const hasSentInterest = sentInterests.includes(match.id);
              
              return (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <User className="h-16 w-16 text-primary/40" />
                        </div>
                      )}
                    </AspectRatio>
                    
                    {/* Compatibility Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge 
                        className={`${
                          match.compatibilityScore >= 80 ? 'bg-green-500' :
                          match.compatibilityScore >= 60 ? 'bg-blue-500' :
                          match.compatibilityScore >= 40 ? 'bg-yellow-500' :
                          'bg-orange-500'
                        } text-white font-bold`}
                      >
                        {match.compatibilityScore}% Match
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Name and Profile ID */}
                      <div>
                        <h3 className="font-semibold text-lg text-foreground truncate">{match.name}</h3>
                        {match.profile_id && (
                          <p className="text-xs text-muted-foreground">{match.profile_id}</p>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <Progress value={match.compatibilityScore} className="h-1.5" />

                      {/* Details */}
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        {age && <p>{age} years{match.height ? `, ${match.height}` : ''}</p>}
                        {(match.city || match.state) && (
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{[match.city, match.state].filter(Boolean).join(', ')}</span>
                          </p>
                        )}
                        {match.education && (
                          <p className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{match.education}</span>
                          </p>
                        )}
                        {match.occupation && (
                          <p className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{match.occupation}</span>
                          </p>
                        )}
                      </div>

                      {/* Matched Criteria */}
                      {match.matchedCriteria.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {match.matchedCriteria.slice(0, 3).map((criteria) => (
                            <Badge key={criteria} variant="secondary" className="text-xs px-1.5 py-0">
                              <Star className="h-2.5 w-2.5 mr-0.5" />
                              {criteria}
                            </Badge>
                          ))}
                          {match.matchedCriteria.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              +{match.matchedCriteria.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Send Interest Button */}
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={hasSentInterest || sendingInterest === match.id}
                        onClick={() => sendInterest(match.id)}
                      >
                        {sendingInterest === match.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Heart className={`h-4 w-4 mr-1 ${hasSentInterest ? 'fill-current' : ''}`} />
                        )}
                        {hasSentInterest ? 'Interest Sent' : 'Send Interest'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MatchesSection;
