import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Gem, Heart, Loader2, MapPin, GraduationCap, Briefcase, Star, Filter, SlidersHorizontal, X, ZoomIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  onViewProfile?: (profileId: string) => void;
}

type SortOption = 'score' | 'age' | 'recent';

const MatchesSection = ({ userId, userGender, onViewProfile }: MatchesSectionProps) => {
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingInterest, setSendingInterest] = useState<string | null>(null);
  const [sentInterests, setSentInterests] = useState<string[]>([]);
  const { toast } = useToast();

  // Filter states
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('score');
  const [filterReligion, setFilterReligion] = useState<string>('all');
  const [filterEducation, setFilterEducation] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [showFilters, setShowFilters] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<{ url: string; name: string } | null>(null);

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
        .select('id, name, photo_url, profile_id, date_of_birth, height, city, state, education, occupation, religion, caste, mother_tongue, marital_status, annual_income, gender')
        .eq('is_complete', true)
        .neq('gender', userGender)
        .limit(50);

      if (profilesError) throw profilesError;

      if (!prefs || !profiles) {
        setMatches([]);
        setFilteredMatches([]);
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
      const filteredResults = matchedProfiles.filter(m => m.compatibilityScore > 0);

      setMatches(filteredResults);
      setFilteredMatches(filteredResults);
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

  // Apply filters when filter state changes
  useEffect(() => {
    let result = [...matches];

    // Filter by minimum score
    if (minScore > 0) {
      result = result.filter(m => m.compatibilityScore >= minScore);
    }

    // Filter by religion
    if (filterReligion && filterReligion !== 'all') {
      result = result.filter(m => m.religion === filterReligion);
    }

    // Filter by education
    if (filterEducation && filterEducation !== 'all') {
      result = result.filter(m => m.education === filterEducation);
    }

    // Filter by city
    if (filterCity && filterCity !== 'all') {
      result = result.filter(m => m.city === filterCity);
    }

    // Filter by age range
    result = result.filter(m => {
      const age = calculateAge(m.date_of_birth);
      if (age === null) return true; // Include profiles without DOB
      return age >= ageRange[0] && age <= ageRange[1];
    });

    // Sort
    if (sortBy === 'score') {
      result.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    } else if (sortBy === 'age') {
      result.sort((a, b) => {
        const ageA = calculateAge(a.date_of_birth) || 0;
        const ageB = calculateAge(b.date_of_birth) || 0;
        return ageA - ageB;
      });
    }

    setFilteredMatches(result);
  }, [matches, minScore, sortBy, filterReligion, filterEducation, filterCity, ageRange]);

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

  const getPlaceholderImage = (gender?: string) => {
    return gender?.toLowerCase() === 'male' ? placeholderMale : placeholderFemale;
  };

  const clearFilters = () => {
    setMinScore(0);
    setSortBy('score');
    setFilterReligion('all');
    setFilterEducation('all');
    setFilterCity('all');
    setAgeRange([18, 60]);
  };

  const hasActiveFilters = minScore > 0 || (filterReligion && filterReligion !== 'all') || (filterEducation && filterEducation !== 'all') || (filterCity && filterCity !== 'all') || ageRange[0] !== 18 || ageRange[1] !== 60;

  // Get unique values for filters
  const uniqueReligions = [...new Set(matches.map(m => m.religion).filter(Boolean))] as string[];
  const uniqueEducations = [...new Set(matches.map(m => m.education).filter(Boolean))] as string[];
  const uniqueCities = [...new Set(matches.map(m => m.city).filter(Boolean))].sort() as string[];

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2">
            <Gem className="h-5 w-5 text-primary" />
            Your Matches
            {matches.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredMatches.length} of {matches.length} profiles
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Best Match</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>

            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button 
                  variant={hasActiveFilters ? "default" : "outline"} 
                  size="sm" 
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filter Matches</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>

                  {/* Minimum Score Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">Minimum Match Score: {minScore}%</Label>
                    <Slider
                      value={[minScore]}
                      onValueChange={(v) => setMinScore(v[0])}
                      max={100}
                      step={10}
                      className="py-2"
                    />
                  </div>

                  {/* Religion Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">Religion</Label>
                    <Select value={filterReligion} onValueChange={setFilterReligion}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All religions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All religions</SelectItem>
                        {uniqueReligions.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Education Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">Education</Label>
                    <Select value={filterEducation} onValueChange={setFilterEducation}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All education</SelectItem>
                        {uniqueEducations.map(e => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">City</Label>
                    <Select value={filterCity} onValueChange={setFilterCity}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="All cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All cities</SelectItem>
                        {uniqueCities.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Age Range Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">Age Range: {ageRange[0]} - {ageRange[1]} years</Label>
                    <div className="pt-2">
                      <Slider
                        value={ageRange}
                        onValueChange={(v) => setAgeRange(v as [number, number])}
                        min={18}
                        max={60}
                        step={1}
                        className="py-2"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Gem className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              {matches.length === 0 ? 'No matches found' : 'No matches with current filters'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {matches.length === 0 
                ? 'Update your partner preferences to find compatible matches.'
                : 'Try adjusting your filters to see more profiles.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile: Horizontal scroll - compact cards */}
            <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin">
              <div className="flex gap-2" style={{ width: 'max-content' }}>
                {filteredMatches.map((match) => {
                  const age = calculateAge(match.date_of_birth);
                  const hasSentInterest = sentInterests.includes(match.id);
                  
                  return (
                    <Card key={match.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer w-28 flex-shrink-0" onClick={() => onViewProfile?.(match.id)}>
                      {/* Profile Image */}
                      <div className="relative group/photo">
                        <AspectRatio ratio={1}>
                          <img
                            src={match.photo_url || getPlaceholderImage(match.gender)}
                            alt={match.name}
                            className="w-full h-full object-cover"
                          />
                        </AspectRatio>
                        
                        {/* Compatibility Badge */}
                        <div className="absolute top-0.5 right-0.5">
                          <Badge 
                            className={`text-[8px] px-1 py-0 ${
                              match.compatibilityScore >= 80 ? 'bg-green-500' :
                              match.compatibilityScore >= 60 ? 'bg-blue-500' :
                              match.compatibilityScore >= 40 ? 'bg-yellow-500' :
                              'bg-orange-500'
                            } text-white font-semibold`}
                          >
                            {match.compatibilityScore}%
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-1">
                        <div className="space-y-0.5">
                          <div>
                            <h3 className="font-medium text-[10px] text-foreground truncate">{match.name}</h3>
                            {age && (
                              <p className="text-[8px] text-muted-foreground truncate">{age} yrs{match.height ? `, ${match.height}` : ''}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className={`w-full h-5 text-[8px] ${hasSentInterest ? 'bg-green-500 hover:bg-green-500' : ''}`}
                            disabled={hasSentInterest || sendingInterest === match.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!hasSentInterest) {
                                sendInterest(match.id);
                              }
                            }}
                          >
                            {sendingInterest === match.id ? (
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                            ) : hasSentInterest ? (
                              '✓ Sent'
                            ) : (
                              <>
                                <Heart className="h-2 w-2 mr-0.5" />
                                Interest
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden lg:grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredMatches.map((match) => {
                const age = calculateAge(match.date_of_birth);
                const hasSentInterest = sentInterests.includes(match.id);
                
                return (
                  <Card key={match.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewProfile?.(match.id)}>
                    {/* Profile Image */}
                    <div className="relative group/photo">
                      <AspectRatio ratio={1}>
                        <img
                          src={match.photo_url || getPlaceholderImage(match.gender)}
                          alt={match.name}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                      
                      {/* Photo Zoom Button */}
                      {match.photo_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoomedPhoto({ url: match.photo_url!, name: match.name });
                          }}
                          className="absolute bottom-1 left-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity hover:bg-black/70"
                          aria-label="Zoom photo"
                        >
                          <ZoomIn className="h-2.5 w-2.5" />
                        </button>
                      )}
                      
                      {/* Compatibility Badge */}
                      <div className="absolute top-1 right-1">
                        <Badge 
                          className={`text-[10px] px-1 py-0 ${
                            match.compatibilityScore >= 80 ? 'bg-green-500' :
                            match.compatibilityScore >= 60 ? 'bg-blue-500' :
                            match.compatibilityScore >= 40 ? 'bg-yellow-500' :
                            'bg-orange-500'
                          } text-white font-semibold`}
                        >
                          {match.compatibilityScore}%
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-1.5">
                      <div className="space-y-1">
                        {/* Name and Profile ID */}
                        <div>
                          <h3 className="font-medium text-xs text-foreground truncate">{match.name}</h3>
                          {match.profile_id && (
                            <p className="text-[9px] text-muted-foreground">{match.profile_id}</p>
                          )}
                        </div>

                        {/* Details */}
                        <div className="text-[10px] text-muted-foreground">
                          {age && <p className="truncate">{age} yrs{match.height ? `, ${match.height}` : ''}</p>}
                        </div>

                        {/* Matched Criteria */}
                        {match.matchedCriteria.length > 0 && (
                          <div className="flex flex-wrap gap-0.5">
                            {match.matchedCriteria.slice(0, 1).map((criteria) => (
                              <Badge key={criteria} variant="secondary" className="text-[9px] px-1 py-0">
                                {criteria}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Send Interest Button */}
                        <Button
                          size="sm"
                          className="w-full h-6 text-[10px]"
                          disabled={hasSentInterest || sendingInterest === match.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            sendInterest(match.id);
                          }}
                        >
                          {sendingInterest === match.id ? (
                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          ) : (
                            <Heart className={`h-2.5 w-2.5 ${hasSentInterest ? 'fill-current' : ''}`} />
                          )}
                          <span className="ml-0.5">{hasSentInterest ? 'Sent' : 'Interest'}</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </CardContent>

      {/* Photo Zoom Dialog */}
      <Dialog open={!!zoomedPhoto} onOpenChange={() => setZoomedPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/95 border-none">
          <div className="relative">
            {zoomedPhoto && (
              <>
                <img
                  src={zoomedPhoto.url}
                  alt={zoomedPhoto.name}
                  className="w-full h-auto max-h-[80vh] object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-medium text-lg">{zoomedPhoto.name}</p>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MatchesSection;
