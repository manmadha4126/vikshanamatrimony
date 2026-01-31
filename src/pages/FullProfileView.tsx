import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Phone,
  Mail,
  Sparkles,
  ArrowLeft,
  Loader2,
  Lock,
  Crown,
  FileText,
  Check,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  X,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import placeholderMale from '@/assets/placeholder-male.png';
import placeholderFemale from '@/assets/placeholder-female.png';

interface FullProfile {
  id: string;
  name: string;
  profile_id: string | null;
  profile_for: string | null;
  photo_url: string | null;
  gender: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  height: string | null;
  marital_status: string | null;
  mother_tongue: string | null;
  religion: string | null;
  caste: string | null;
  sub_caste: string | null;
  star: string | null;
  gothram: string | null;
  dosham: string | null;
  education: string | null;
  education_detail: string | null;
  occupation: string | null;
  employment_type: string | null;
  company_name: string | null;
  annual_income: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  family_status: string | null;
  family_type: string | null;
  father_name: string | null;
  father_occupation: string | null;
  mother_name: string | null;
  mother_occupation: string | null;
  siblings: string | null;
  siblings_details: string | null;
  about_me: string | null;
  hobbies: string[] | null;
  is_prime: boolean | null;
  horoscope_url: string | null;
  time_of_birth: string | null;
  birth_country: string | null;
  birth_state: string | null;
  birth_city: string | null;
  chart_style: string | null;
  horoscope_language: string | null;
  phone_verified: boolean | null;
  email_verified: boolean | null;
  verification_status: string | null;
  profile_completion_percentage: number | null;
  updated_at: string;
  created_at: string;
}

const FullProfileView = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserIsPrime, setCurrentUserIsPrime] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isSendingInterest, setIsSendingInterest] = useState(false);

  // Check if coming from matches section
  const fromMatches = location.state?.fromMatches || false;

  useEffect(() => {
    if (profileId) {
      fetchProfile();
      checkCurrentUser();
    }
  }, [profileId]);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('id, is_prime')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (currentProfile) {
        setCurrentUserIsPrime(currentProfile.is_prime || false);
        setIsOwnProfile(currentProfile.id === profileId);
        
        if (currentProfile.id !== profileId) {
          const { data: interestData } = await supabase
            .from('interests')
            .select('id')
            .eq('from_user_id', user.id)
            .eq('to_profile_id', profileId)
            .maybeSingle();
          setInterestSent(!!interestData);

          const { data: shortlistData } = await supabase
            .from('shortlisted_profiles')
            .select('id')
            .eq('user_id', user.id)
            .eq('profile_id', profileId)
            .maybeSingle();
          setIsShortlisted(!!shortlistData);

          await supabase
            .from('profile_views')
            .insert({
              viewer_id: user.id,
              viewed_profile_id: profileId,
            });
        }
      }
    }
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Profile not found",
          description: "The profile you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/my-dashboard');
        return;
      }

      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Failed to load profile",
        description: error.message,
        variant: "destructive",
      });
      navigate('/my-dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSendInterest = async () => {
    if (!profile || interestSent || isSendingInterest) return;
    
    setIsSendingInterest(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to be logged in to send interest.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('interests')
        .insert({
          from_user_id: user.id,
          to_profile_id: profile.id,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          setInterestSent(true);
        } else {
          throw error;
        }
      } else {
        setInterestSent(true);
        toast({
          title: "Interest sent!",
          description: `Your interest has been sent to ${profile.name}.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Failed to send interest",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSendingInterest(false);
    }
  };

  const handleShortlist = async () => {
    if (!profile) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to be logged in to shortlist profiles.",
          variant: "destructive",
        });
        return;
      }

      if (isShortlisted) {
        // Remove from shortlist
        await supabase
          .from('shortlisted_profiles')
          .delete()
          .eq('user_id', user.id)
          .eq('profile_id', profile.id);
        
        setIsShortlisted(false);
        toast({
          title: "Removed from shortlist",
          description: `${profile.name} has been removed from your shortlist.`,
        });
      } else {
        const { error } = await supabase
          .from('shortlisted_profiles')
          .insert({
            user_id: user.id,
            profile_id: profile.id,
          });

        if (error) {
          if (error.code === '23505') {
            setIsShortlisted(true);
          } else {
            throw error;
          }
        } else {
          setIsShortlisted(true);
          toast({
            title: "Profile shortlisted!",
            description: `${profile.name} has been added to your shortlist.`,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Failed to update shortlist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (fromMatches) {
      navigate('/my-dashboard', { state: { activeSection: 'matches' } });
    } else {
      navigate(-1);
    }
  };

  const getPlaceholderImage = () => {
    return profile?.gender?.toLowerCase() === 'male' ? placeholderMale : placeholderFemale;
  };

  const getLastSeen = () => {
    if (!profile?.updated_at) return null;
    return formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true });
  };

  const isNewlyJoined = () => {
    if (!profile?.created_at) return false;
    const createdDate = new Date(profile.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  };

  const InfoRow = ({ label, value, isRestricted = false }: { label: string; value: string | null | undefined; isRestricted?: boolean }) => (
    <div className="flex justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      {isRestricted && !currentUserIsPrime && !isOwnProfile ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs gap-1"
          onClick={() => navigate('/my-dashboard')}
        >
          <Lock className="h-3 w-3" />
          <Crown className="h-3 w-3 text-amber-500" />
          Upgrade
        </Button>
      ) : (
        <span className="font-medium text-sm text-right max-w-[60%]">{value || 'Not specified'}</span>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const age = calculateAge(profile.date_of_birth);
  const lastSeen = getLastSeen();
  const newlyJoined = isNewlyJoined();

  // Build quick info parts
  const quickInfoParts: string[] = [];
  if (profile.marital_status) quickInfoParts.push(profile.marital_status);
  if (profile.profile_for) quickInfoParts.push(`Profile created by ${profile.profile_for}`);
  if (age) quickInfoParts.push(`${age} yrs`);
  if (profile.height) quickInfoParts.push(profile.height.split(' ')[0]);
  if (profile.religion) {
    let religionCaste = profile.religion;
    if (profile.caste) religionCaste += `(${profile.caste})`;
    quickInfoParts.push(religionCaste);
  }

  const professionalParts: string[] = [];
  if (profile.education) professionalParts.push(profile.education);
  if (profile.occupation) professionalParts.push(profile.occupation);
  if (profile.annual_income) professionalParts.push(profile.annual_income);
  if (profile.city) professionalParts.push(profile.city);

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Sticky Header with Back Navigation */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b shadow-sm">
        <div className="container py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Matches</span>
          </Button>
          <div className="flex-1" />
          {!isOwnProfile && currentUserIsPrime && (
            <Button variant="outline" size="sm" className="gap-2">
              <ChevronRight className="h-4 w-4" />
              <span className="hidden sm:inline">Next Profile</span>
            </Button>
          )}
        </div>
      </div>

      <div className="container py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        
        {/* Hero Profile Card - Telugu Matrimony Style */}
        <Card className="overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row">
            {/* Left: Profile Image */}
            <div className="relative w-full md:w-80 lg:w-96 flex-shrink-0">
              <div className="aspect-square md:aspect-auto md:h-full relative bg-muted">
                <img
                  src={profile.photo_url || getPlaceholderImage()}
                  alt={profile.name}
                  className="w-full h-full object-cover md:h-80 lg:h-96"
                />
                
                {/* Newly Joined Badge */}
                {newlyJoined && (
                  <div className="absolute top-0 left-0">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1 transform -rotate-0 origin-top-left rounded-br-lg">
                      NEWLY JOINED
                    </div>
                  </div>
                )}

                {/* Photo counter */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                  <div className="w-6 h-1 bg-white rounded-full" />
                  1/1
                </div>
              </div>
            </div>

            {/* Right: Profile Details */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col">
              {/* Top Row: Name section with Shortlist */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                      {profile.name}
                    </h1>
                    {profile.verification_status === 'verified' && (
                      <Badge className="bg-green-500 text-white text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {profile.is_prime && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Prime
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.profile_id}
                    {lastSeen && <span> | Last seen {lastSeen}</span>}
                  </p>
                </div>
                
                {/* Shortlist & Actions */}
                {!isOwnProfile && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShortlist}
                      className={`flex items-center gap-1 px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                        isShortlisted 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                    >
                      <Bookmark className={`h-4 w-4 ${isShortlisted ? 'fill-current' : ''}`} />
                      Shortlist
                    </button>
                    
                    {/* Call buttons for Prime */}
                    {currentUserIsPrime && (
                      <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors">
                          <Phone className="h-4 w-4" />
                        </button>
                        <button className="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Info Line 1 */}
              <p className="text-sm text-foreground mt-4 leading-relaxed">
                {quickInfoParts.map((part, idx) => (
                  <span key={idx}>
                    {idx > 0 && <span className="text-muted-foreground mx-1">•</span>}
                    {part}
                  </span>
                ))}
              </p>

              {/* Quick Info Line 2 - Professional */}
              {professionalParts.length > 0 && (
                <p className="text-sm text-foreground mt-2 leading-relaxed">
                  {professionalParts.map((part, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="text-muted-foreground mx-1">•</span>}
                      {part}
                    </span>
                  ))}
                </p>
              )}

              {/* Verification Status */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant={profile.phone_verified ? 'default' : 'secondary'} className="gap-1 text-xs">
                  {profile.phone_verified ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Phone {profile.phone_verified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge variant={profile.email_verified ? 'default' : 'secondary'} className="gap-1 text-xs">
                  {profile.email_verified ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  Email {profile.email_verified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge variant="outline" className="gap-1 text-xs">
                  {profile.profile_completion_percentage || 0}% Complete
                </Badge>
              </div>

              {/* Spacer */}
              <div className="flex-1 min-h-4" />

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none h-9"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Don't Show
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none h-9 text-orange-500 border-orange-500 hover:bg-orange-50"
                  >
                    <ChevronRight className="h-4 w-4 mr-1" />
                    Skip
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 sm:flex-none h-9 ${
                      interestSent 
                        ? 'bg-green-500 hover:bg-green-500 text-white' 
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                    disabled={interestSent || isSendingInterest}
                    onClick={handleSendInterest}
                  >
                    {isSendingInterest ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 mr-1 ${interestSent ? 'fill-current' : ''}`} />
                    )}
                    {interestSent ? 'Interest Sent' : 'Send Interest'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Member Info */}
        <Card className="shadow-soft bg-primary/5 border-primary/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Updated:</span>
                <span className="font-medium">{lastSeen}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Member since {format(new Date(profile.created_at), 'MMM yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* About Me */}
        {profile.about_me && (
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                About Me
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{profile.about_me}</p>
            </CardContent>
          </Card>
        )}

        {/* Hobbies */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Hobbies & Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby, idx) => (
                  <Badge key={idx} variant="outline">{hobby}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Full Name" value={profile.name} />
            <InfoRow label="Gender" value={profile.gender} />
            <InfoRow 
              label="Date of Birth" 
              value={profile.date_of_birth ? format(new Date(profile.date_of_birth), 'dd MMM yyyy') : null} 
            />
            <InfoRow label="Age" value={age ? `${age} years` : null} />
            <InfoRow label="Height" value={profile.height} />
            <InfoRow label="Marital Status" value={profile.marital_status} />
            <InfoRow label="Mother Tongue" value={profile.mother_tongue} />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contact Information
              {!isOwnProfile && !currentUserIsPrime && (
                <Badge variant="outline" className="ml-auto gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  Prime Only
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isOwnProfile || currentUserIsPrime ? (
              <>
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Phone" value={profile.phone} />
                <InfoRow label="Country" value={profile.country} />
                <InfoRow label="State" value={profile.state} />
                <InfoRow label="City" value={profile.city} />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-muted-foreground text-sm">Phone</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span className="text-sm">Hidden for free users</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-muted-foreground text-sm">Email</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span className="text-sm">Hidden for free users</span>
                  </div>
                </div>
                <InfoRow label="Country" value={profile.country} />
                <InfoRow label="State" value={profile.state} />
                <InfoRow label="City" value={profile.city} />
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-foreground gap-2"
                    onClick={() => navigate('/my-dashboard')}
                  >
                    <Crown className="h-4 w-4" />
                    Upgrade to Prime to View Contact Details
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Religious Information */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Religious Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Religion" value={profile.religion} />
            <InfoRow label="Caste" value={profile.caste} />
            <InfoRow label="Sub Caste" value={profile.sub_caste} />
            <InfoRow label="Gothram" value={profile.gothram} />
            <InfoRow label="Star (Nakshatra)" value={profile.star} />
            <InfoRow label="Dosham" value={profile.dosham} />
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Education" value={profile.education} />
            <InfoRow label="Education Details" value={profile.education_detail} />
            <InfoRow label="Employment Type" value={profile.employment_type} />
            <InfoRow label="Occupation" value={profile.occupation} />
            <InfoRow label="Company" value={profile.company_name} />
            <InfoRow label="Annual Income" value={profile.annual_income} />
          </CardContent>
        </Card>

        {/* Horoscope Details */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Horoscope Details
              {!isOwnProfile && !currentUserIsPrime && (
                <Badge variant="outline" className="ml-auto gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  Prime Only
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isOwnProfile || currentUserIsPrime ? (
              <>
                <InfoRow label="Time of Birth" value={profile.time_of_birth} />
                <InfoRow label="Birth Country" value={profile.birth_country} />
                <InfoRow label="Birth State" value={profile.birth_state} />
                <InfoRow label="Birth City" value={profile.birth_city} />
                <InfoRow label="Chart Style" value={profile.chart_style} />
                <InfoRow label="Language" value={profile.horoscope_language} />
                {profile.horoscope_url ? (
                  <div className="mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" asChild>
                      <a href={profile.horoscope_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View Horoscope Document
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">No horoscope uploaded</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                  <Lock className="h-8 w-8 text-amber-500" />
                </div>
                <h4 className="font-semibold text-lg mb-2">Horoscope Details Locked</h4>
                <p className="text-muted-foreground text-sm mb-4 max-w-xs">
                  Upgrade to Prime to view horoscope details including birth time, location, and horoscope document.
                </p>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-foreground gap-2"
                  onClick={() => navigate('/my-dashboard')}
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Prime
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Family Information */}
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Family Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Family Status" value={profile.family_status} />
            <InfoRow label="Family Type" value={profile.family_type} />
            <InfoRow label="Father's Name" value={profile.father_name} />
            <InfoRow label="Father's Occupation" value={profile.father_occupation} />
            <InfoRow label="Mother's Name" value={profile.mother_name} />
            <InfoRow label="Mother's Occupation" value={profile.mother_occupation} />
            <InfoRow label="Siblings" value={profile.siblings} />
            <InfoRow label="Siblings Details" value={profile.siblings_details} />
          </CardContent>
        </Card>

        {/* Bottom spacing for mobile */}
        <div className="h-8" />
      </div>
    </div>
  );
};

export default FullProfileView;
