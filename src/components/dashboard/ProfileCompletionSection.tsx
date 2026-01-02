import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Phone,
  FileText,
  Sparkles,
  User,
  Check,
  Upload,
  X,
} from 'lucide-react';

interface ProfileCompletionSectionProps {
  profile: {
    id: string;
    phone: string;
    phone_verified: boolean | null;
    about_me: string | null;
    hobbies: string[] | null;
    horoscope_url: string | null;
    profile_completion_percentage: number | null;
  };
  onProfileUpdate: () => void;
}

const SUGGESTED_HOBBIES = [
  'Music', 'Travel', 'Reading', 'Sports', 'Cooking', 'Dancing',
  'Photography', 'Gardening', 'Movies', 'Art', 'Gaming', 'Fitness',
  'Yoga', 'Writing', 'Shopping', 'Meditation'
];

const ProfileCompletionSection = ({ profile, onProfileUpdate }: ProfileCompletionSectionProps) => {
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isHoroscopeOpen, setIsHoroscopeOpen] = useState(false);
  const [isHobbiesOpen, setIsHobbiesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  const [aboutMe, setAboutMe] = useState(profile.about_me || '');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(profile.hobbies || []);
  const [customHobby, setCustomHobby] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [verificationRequested, setVerificationRequested] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  const completionPercentage = profile.profile_completion_percentage || 0;

  // Check if verification request exists
  const checkVerificationStatus = async () => {
    setCheckingVerification(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('verification_requests')
        .select('status')
        .eq('profile_id', profile.id)
        .eq('status', 'pending')
        .maybeSingle();

      setVerificationRequested(!!data);
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setCheckingVerification(false);
    }
  };

  // Check on mount
  useState(() => {
    checkVerificationStatus();
  });

  const handleVerifyPhone = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create verification request in backend
      const { error } = await supabase
        .from('verification_requests')
        .insert({
          profile_id: profile.id,
          user_id: user.id,
          status: 'pending',
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Request Already Submitted",
            description: "Your verification request is already pending.",
          });
        } else {
          throw error;
        }
      } else {
        // Create notification for the user
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'verification',
            title: 'Verification Request Submitted',
            message: `Your profile verification request has been submitted. Our team will call you on ${profile.phone} shortly.`,
          });

        toast({
          title: "Verification Request Submitted",
          description: `Our team will call you on ${profile.phone} shortly.`,
        });
        setVerificationRequested(true);
      }
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsVerifyOpen(false);
  };

  const handleHoroscopeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/horoscope-${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage
        .from('horoscopes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('horoscopes')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ horoscope_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Horoscope Uploaded",
        description: "Your horoscope has been saved successfully.",
      });
      setIsHoroscopeOpen(false);
      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies(prev =>
      prev.includes(hobby)
        ? prev.filter(h => h !== hobby)
        : [...prev, hobby]
    );
  };

  const addCustomHobby = () => {
    if (customHobby.trim() && !selectedHobbies.includes(customHobby.trim())) {
      setSelectedHobbies(prev => [...prev, customHobby.trim()]);
      setCustomHobby('');
    }
  };

  const saveHobbies = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ hobbies: selectedHobbies })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Hobbies Updated",
        description: "Your hobbies have been saved successfully.",
      });
      setIsHobbiesOpen(false);
      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveAboutMe = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ about_me: aboutMe })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "About Me Updated",
        description: "Your description has been saved successfully.",
      });
      setIsAboutOpen(false);
      onProfileUpdate();
    } catch (error: any) {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const completionCards = [
    {
      icon: Phone,
      title: 'Verify Profile',
      description: profile.phone,
      action: profile.phone_verified ? 'Verified' : 'Call & Verify',
      isComplete: profile.phone_verified,
      onClick: () => !profile.phone_verified && setIsVerifyOpen(true),
    },
    {
      icon: FileText,
      title: 'Add Horoscope',
      description: 'Upload your horoscope',
      action: profile.horoscope_url ? 'View/Update' : 'Upload PDF',
      isComplete: !!profile.horoscope_url,
      onClick: () => setIsHoroscopeOpen(true),
    },
    {
      icon: Sparkles,
      title: 'Add Hobbies',
      description: profile.hobbies?.length ? `${profile.hobbies.length} hobbies added` : 'Share your interests',
      action: profile.hobbies?.length ? 'Edit' : 'Add',
      isComplete: !!(profile.hobbies && profile.hobbies.length > 0),
      onClick: () => setIsHobbiesOpen(true),
    },
    {
      icon: User,
      title: 'Add About You',
      description: profile.about_me ? 'Description added' : 'Tell about yourself',
      action: profile.about_me ? 'Edit' : 'Add',
      isComplete: !!profile.about_me,
      onClick: () => setIsAboutOpen(true),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-3">
      <Card className="shadow-card">
        <CardHeader className="py-3 px-4">
          <CardTitle className="font-display text-base flex items-center gap-2">
            Complete Your Profile <span className="text-lg font-bold text-primary">{completionPercentage}%</span>
          </CardTitle>
          <Progress value={completionPercentage} className="h-2 mt-1.5" />
        </CardHeader>
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {completionCards.map((card, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  card.isComplete ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={card.onClick}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded-full ${
                      card.isComplete ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs">{card.title}</h3>
                      <p className="text-[10px] text-muted-foreground truncate">{card.description}</p>
                      <Button
                        variant={card.isComplete ? 'outline' : 'default'}
                        size="sm"
                        className="mt-1.5 w-full text-[10px] h-7"
                      >
                        {card.isComplete && <Check className="h-3 w-3 mr-1" />}
                        {card.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verify Phone Dialog */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Your Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Registered Phone Number</p>
              <p className="text-lg font-semibold">{profile.phone}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Our verification team will call you on this number to verify your profile.
              Please keep your phone handy.
            </p>
            <Button onClick={handleVerifyPhone} className="w-full">
              <Phone className="h-4 w-4 mr-2" />
              Call & Verify
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Horoscope Upload Dialog */}
      <Dialog open={isHoroscopeOpen} onOpenChange={setIsHoroscopeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Horoscope</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-2">Upload your horoscope</p>
              <p className="text-xs text-muted-foreground mb-4">PDF format only, max 5MB</p>
              <Input
                type="file"
                accept="application/pdf"
                onChange={handleHoroscopeUpload}
                disabled={isUploading}
                className="max-w-xs mx-auto"
              />
            </div>
            {profile.horoscope_url && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm flex-1">Current horoscope uploaded</span>
                <Check className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Hobbies Dialog */}
      <Dialog open={isHobbiesOpen} onOpenChange={setIsHobbiesOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Your Hobbies</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_HOBBIES.map((hobby) => (
                <Badge
                  key={hobby}
                  variant={selectedHobbies.includes(hobby) ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleHobby(hobby)}
                >
                  {hobby}
                  {selectedHobbies.includes(hobby) && <Check className="h-3 w-3 ml-1" />}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Add custom hobby"
                value={customHobby}
                onChange={(e) => setCustomHobby(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomHobby()}
              />
              <Button onClick={addCustomHobby} variant="outline" size="icon">
                <Check className="h-4 w-4" />
              </Button>
            </div>

            {selectedHobbies.filter(h => !SUGGESTED_HOBBIES.includes(h)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedHobbies.filter(h => !SUGGESTED_HOBBIES.includes(h)).map((hobby) => (
                  <Badge key={hobby} variant="secondary" className="cursor-pointer" onClick={() => toggleHobby(hobby)}>
                    {hobby}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}

            <Button onClick={saveHobbies} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Hobbies'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Me Dialog */}
      <Dialog open={isAboutOpen} onOpenChange={setIsAboutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About You</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Tell us about yourself, your interests, values, and what you're looking for in a life partner..."
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {aboutMe.length}/1000 characters
            </p>
            <Button onClick={saveAboutMe} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Save Description'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileCompletionSection;
