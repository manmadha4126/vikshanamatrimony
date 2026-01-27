import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Calendar,
  Ruler,
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
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface FullProfile {
  id: string;
  name: string;
  profile_id: string | null;
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
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserIsPrime, setCurrentUserIsPrime] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [interestSent, setInterestSent] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);

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
          // Check interest and shortlist status
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

          // Record profile view
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
        navigate('/dashboard');
        return;
      }

      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Failed to load profile",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
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
    if (!profile || interestSent) return;
    
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
    }
  };

  const handleShortlist = async () => {
    if (!profile || isShortlisted) return;
    
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
    } catch (error: any) {
      toast({
        title: "Failed to shortlist",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const InfoRow = ({ label, value, isRestricted = false }: { label: string; value: string | null | undefined; isRestricted?: boolean }) => (
    <div className="flex justify-between py-2.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      {isRestricted && !currentUserIsPrime && !isOwnProfile ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs gap-1"
          onClick={() => navigate('/dashboard')}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-semibold text-lg truncate">{profile.name}</h1>
            <p className="text-xs text-muted-foreground">{profile.profile_id}</p>
          </div>
          {!isOwnProfile && (
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={handleSendInterest}
                disabled={interestSent}
                className={interestSent ? 'bg-green-500 hover:bg-green-500' : ''}
              >
                {interestSent ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                <span className="hidden sm:inline ml-2">{interestSent ? 'Sent' : 'Interest'}</span>
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleShortlist}
                disabled={isShortlisted}
                className={isShortlisted ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-500' : ''}
              >
                {isShortlisted ? <Check className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                <span className="hidden sm:inline ml-2">{isShortlisted ? 'Saved' : 'Save'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="container py-6 space-y-6">
        {/* Last Updated Banner */}
        <Card className="shadow-soft bg-primary/5 border-primary/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(profile.updated_at), { addSuffix: true })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Member since {format(new Date(profile.created_at), 'MMM yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Header Card */}
        <Card className="shadow-card overflow-hidden">
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                <AvatarImage src={profile.photo_url || undefined} alt={profile.name} />
                <AvatarFallback className="text-3xl font-display bg-primary text-primary-foreground">
                  {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-2xl font-display font-semibold">{profile.name}</h2>
                  {profile.is_prime && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white gap-1 w-fit mx-auto sm:mx-0">
                      <Star className="h-3 w-3" /> Prime
                    </Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground">
                  {profile.profile_id && <span className="font-mono text-primary">{profile.profile_id}</span>}
                  {age && <span className="mx-2">•</span>}
                  {age && <span>{age} years</span>}
                  {profile.height && <span className="mx-2">•</span>}
                  {profile.height && <span>{profile.height}</span>}
                </p>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                  <Badge variant={profile.phone_verified ? 'default' : 'secondary'} className="gap-1">
                    {profile.phone_verified ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    Phone {profile.phone_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant={profile.email_verified ? 'default' : 'secondary'} className="gap-1">
                    {profile.email_verified ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    Email {profile.email_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {profile.profile_completion_percentage || 0}% Complete
                  </Badge>
                </div>
              </div>
            </div>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Information */}
          <Card className="shadow-soft">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Basic Information
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Email" value={isOwnProfile ? profile.email : (currentUserIsPrime ? profile.email : '***')} isRestricted={!isOwnProfile} />
              <InfoRow label="Phone" value={profile.phone} isRestricted={!isOwnProfile} />
              <InfoRow label="Country" value={profile.country} />
              <InfoRow label="State" value={profile.state} />
              <InfoRow label="City" value={profile.city} />
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Time of Birth" value={profile.time_of_birth} />
              <InfoRow label="Birth Country" value={profile.birth_country} />
              <InfoRow label="Birth State" value={profile.birth_state} />
              <InfoRow label="Birth City" value={profile.birth_city} />
              <InfoRow label="Chart Style" value={profile.chart_style} />
              <InfoRow label="Language" value={profile.horoscope_language} />
              {profile.horoscope_url ? (
                currentUserIsPrime || isOwnProfile ? (
                  <div className="mt-3 pt-3 border-t">
                    <Button size="sm" variant="outline" asChild>
                      <a href={profile.horoscope_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-4 w-4 mr-2" />
                        View Horoscope Document
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mt-3">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Horoscope available</span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => navigate('/dashboard')}
                    >
                      <Crown className="h-3 w-3 text-amber-500" />
                      Upgrade
                    </Button>
                  </div>
                )
              ) : (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-sm text-muted-foreground">No horoscope uploaded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Family Information */}
          <Card className="shadow-soft md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Family Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoRow label="Family Status" value={profile.family_status} />
                <InfoRow label="Family Type" value={profile.family_type} />
                <InfoRow label="Father's Name" value={profile.father_name} />
                <InfoRow label="Father's Occupation" value={profile.father_occupation} />
                <InfoRow label="Mother's Name" value={profile.mother_name} />
                <InfoRow label="Mother's Occupation" value={profile.mother_occupation} />
                <InfoRow label="Siblings" value={profile.siblings} />
                <InfoRow label="Siblings Details" value={profile.siblings_details} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FullProfileView;
