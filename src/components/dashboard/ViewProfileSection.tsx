import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  User,
  Heart,
  Briefcase,
  MapPin,
  GraduationCap,
  Calendar,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  Lock,
  Crown,
  FileText,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface ViewProfileSectionProps {
  profile: {
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
    gothram: string | null;
    star: string | null;
    dosham: string | null;
    education: string | null;
    education_detail: string | null;
    employment_type: string | null;
    occupation: string | null;
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
    horoscope_url: string | null;
    is_prime: boolean | null;
    phone_verified: boolean | null;
    email_verified: boolean | null;
    verification_status: string | null;
    profile_completion_percentage: number | null;
    updated_at: string;
    created_at: string;
  };
  currentUserIsPrime?: boolean;
  onUpgradeToPrime?: () => void;
}

const ViewProfileSection = ({ profile, currentUserIsPrime = false, onUpgradeToPrime }: ViewProfileSectionProps) => {
  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(profile.date_of_birth);

  const InfoRow = ({ label, value, isRestricted = false }: { label: string; value: string | null | undefined; isRestricted?: boolean }) => (
    <div className="flex justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      {isRestricted && !currentUserIsPrime ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-6 text-xs gap-1"
          onClick={onUpgradeToPrime}
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

  return (
    <div className="space-y-4">
      {/* Last Updated Banner */}
      <Card className="shadow-card bg-primary/5 border-primary/20">
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
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-28 w-28 border-4 border-primary/20">
              <AvatarImage src={profile.photo_url || undefined} alt={profile.name} />
              <AvatarFallback className="text-3xl font-display bg-primary/10 text-primary">
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
        </CardContent>
      </Card>

      {/* About Me */}
      {profile.about_me && (
        <Card className="shadow-card">
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
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
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
        <Card className="shadow-card">
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
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Phone" value={profile.phone} isRestricted={true} />
            <InfoRow label="Country" value={profile.country} />
            <InfoRow label="State" value={profile.state} />
            <InfoRow label="City" value={profile.city} />
          </CardContent>
        </Card>

        {/* Horoscope Section */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Horoscope
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.horoscope_url ? (
              currentUserIsPrime ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Horoscope document is available</p>
                  <Button size="sm" variant="outline" asChild>
                    <a href={profile.horoscope_url} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-4 w-4 mr-2" />
                      View Horoscope
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Horoscope available</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1"
                    onClick={onUpgradeToPrime}
                  >
                    <Crown className="h-3 w-3 text-amber-500" />
                    Upgrade to View
                  </Button>
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">No horoscope uploaded</p>
            )}
          </CardContent>
        </Card>

        {/* Religious Information */}
        <Card className="shadow-card">
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
        <Card className="shadow-card">
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

        {/* Family Information */}
        <Card className="shadow-card md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
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
  );
};

export default ViewProfileSection;
