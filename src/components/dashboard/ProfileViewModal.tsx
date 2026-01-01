import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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
  X,
  Loader2,
} from 'lucide-react';

interface ProfileViewModalProps {
  profileId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FullProfile {
  id: string;
  name: string;
  profile_id: string | null;
  photo_url: string | null;
  gender: string;
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
  about_me: string | null;
  hobbies: string[] | null;
  is_prime: boolean | null;
}

const ProfileViewModal = ({ profileId, isOpen, onClose }: ProfileViewModalProps) => {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profileId && isOpen) {
      fetchProfile();
    }
  }, [profileId, isOpen]);

  const fetchProfile = async () => {
    if (!profileId) return;
    
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
        onClose();
        return;
      }

      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Failed to load profile",
        description: error.message,
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
    if (!profile) return;
    
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
          toast({
            title: "Already sent",
            description: "You have already sent interest to this profile.",
          });
        } else {
          throw error;
        }
      } else {
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

      const { error } = await supabase
        .from('shortlisted_profiles')
        .insert({
          user_id: user.id,
          profile_id: profile.id,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already shortlisted",
            description: "This profile is already in your shortlist.",
          });
        } else {
          throw error;
        }
      } else {
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

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-3 py-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profile ? (
          <>
            {/* Header with photo */}
            <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 pb-16">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profile.photo_url || undefined} alt={profile.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-display font-bold">{profile.name}</h2>
                    {profile.is_prime && (
                      <Badge className="bg-amber-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Prime
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.profile_id}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {calculateAge(profile.date_of_birth) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {calculateAge(profile.date_of_birth)} yrs
                      </span>
                    )}
                    {profile.height && (
                      <span className="flex items-center gap-1">
                        <Ruler className="h-3 w-3" />
                        {profile.height}
                      </span>
                    )}
                    {profile.city && profile.state && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {profile.city}, {profile.state}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 px-6 -mt-6 relative z-10">
              <Button onClick={handleSendInterest} className="flex-1">
                <Heart className="h-4 w-4 mr-2" />
                Send Interest
              </Button>
              <Button variant="outline" onClick={handleShortlist} className="flex-1">
                <Star className="h-4 w-4 mr-2" />
                Shortlist
              </Button>
            </div>

            {/* Profile Details */}
            <ScrollArea className="h-[400px] px-6 py-4">
              {/* About Me */}
              {profile.about_me && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    About Me
                  </h3>
                  <p className="text-sm text-muted-foreground">{profile.about_me}</p>
                </div>
              )}

              {/* Hobbies */}
              {profile.hobbies && profile.hobbies.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Hobbies & Interests
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {profile.hobbies.map((hobby, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {hobby}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-x-6">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Basic Details</h3>
                  <InfoRow icon={User} label="Gender" value={profile.gender} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : null} />
                  <InfoRow icon={Ruler} label="Height" value={profile.height} />
                  <InfoRow icon={Heart} label="Marital Status" value={profile.marital_status} />
                  <InfoRow icon={User} label="Mother Tongue" value={profile.mother_tongue} />
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Religious Background</h3>
                  <InfoRow icon={Star} label="Religion" value={profile.religion} />
                  <InfoRow icon={Star} label="Caste" value={profile.caste} />
                  <InfoRow icon={Star} label="Sub Caste" value={profile.sub_caste} />
                  <InfoRow icon={Star} label="Star / Rashi" value={profile.star} />
                  <InfoRow icon={Star} label="Gothram" value={profile.gothram} />
                  <InfoRow icon={Star} label="Dosham" value={profile.dosham} />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-2 gap-x-6">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Education & Career</h3>
                  <InfoRow icon={GraduationCap} label="Education" value={profile.education} />
                  <InfoRow icon={GraduationCap} label="Education Details" value={profile.education_detail} />
                  <InfoRow icon={Briefcase} label="Occupation" value={profile.occupation} />
                  <InfoRow icon={Briefcase} label="Employment Type" value={profile.employment_type} />
                  <InfoRow icon={Briefcase} label="Company" value={profile.company_name} />
                  <InfoRow icon={Briefcase} label="Annual Income" value={profile.annual_income} />
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Location & Family</h3>
                  <InfoRow icon={MapPin} label="Country" value={profile.country} />
                  <InfoRow icon={MapPin} label="State" value={profile.state} />
                  <InfoRow icon={MapPin} label="City" value={profile.city} />
                  <InfoRow icon={User} label="Family Status" value={profile.family_status} />
                  <InfoRow icon={User} label="Family Type" value={profile.family_type} />
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Profile not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileViewModal;
