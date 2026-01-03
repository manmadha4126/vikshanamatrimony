import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Briefcase, MapPin, Heart, GraduationCap, Save, Loader2, Camera } from 'lucide-react';
import { ProfilePhotosManager } from './ProfilePhotosManager';
import {
  motherTongueOptions,
  heightOptions,
  maritalStatusOptions,
  religionOptions,
  doshamOptions,
  familyStatusOptions,
  familyTypeOptions,
  educationOptions,
  employmentOptions,
  incomeOptions,
  stateOptions,
  starOptions,
} from '@/data/registrationOptions';
import { castesByReligion } from '@/data/casteOptions';

interface EditProfileSectionProps {
  userId: string;
  profile: {
    id: string;
    name: string;
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
    about_me: string | null;
  };
  onProfileUpdate: () => void;
}

interface ProfileFormData {
  name: string;
  date_of_birth: string;
  height: string;
  marital_status: string;
  mother_tongue: string;
  religion: string;
  caste: string;
  sub_caste: string;
  gothram: string;
  star: string;
  dosham: string;
  education: string;
  education_detail: string;
  employment_type: string;
  occupation: string;
  company_name: string;
  annual_income: string;
  country: string;
  state: string;
  city: string;
  family_status: string;
  family_type: string;
  about_me: string;
}

const EditProfileSection = ({ userId, profile, onProfileUpdate }: EditProfileSectionProps) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: profile.name || '',
    date_of_birth: profile.date_of_birth || '',
    height: profile.height || '',
    marital_status: profile.marital_status || '',
    mother_tongue: profile.mother_tongue || '',
    religion: profile.religion || '',
    caste: profile.caste || '',
    sub_caste: profile.sub_caste || '',
    gothram: profile.gothram || '',
    star: profile.star || '',
    dosham: profile.dosham || '',
    education: profile.education || '',
    education_detail: profile.education_detail || '',
    employment_type: profile.employment_type || '',
    occupation: profile.occupation || '',
    company_name: profile.company_name || '',
    annual_income: profile.annual_income || '',
    country: profile.country || 'India',
    state: profile.state || '',
    city: profile.city || '',
    family_status: profile.family_status || '',
    family_type: profile.family_type || '',
    about_me: profile.about_me || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'religious' | 'professional' | 'family' | 'about' | 'photos'>('basic');

  const availableCastes = formData.religion ? castesByReligion[formData.religion] || [] : [];

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset caste when religion changes
    if (field === 'religion') {
      setFormData(prev => ({ ...prev, [field]: value, caste: '', sub_caste: '' }));
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'religious', label: 'Religious', icon: Heart },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'family', label: 'Family', icon: MapPin },
    { id: 'about', label: 'About Me', icon: GraduationCap },
    { id: 'photos', label: 'Photos', icon: Camera },
  ] as const;

  const getNextSection = () => {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    if (currentIndex < sections.length - 1) {
      return sections[currentIndex + 1].id;
    }
    return null; // Already on last section
  };

  const isLastSection = activeSection === 'photos';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name.trim(),
          date_of_birth: formData.date_of_birth || null,
          height: formData.height || null,
          marital_status: formData.marital_status || null,
          mother_tongue: formData.mother_tongue || null,
          religion: formData.religion || null,
          caste: formData.caste || null,
          sub_caste: formData.sub_caste || null,
          gothram: formData.gothram || null,
          star: formData.star || null,
          dosham: formData.dosham || null,
          education: formData.education || null,
          education_detail: formData.education_detail || null,
          employment_type: formData.employment_type || null,
          occupation: formData.occupation || null,
          company_name: formData.company_name || null,
          annual_income: formData.annual_income || null,
          country: formData.country || null,
          state: formData.state || null,
          city: formData.city || null,
          family_status: formData.family_status || null,
          family_type: formData.family_type || null,
          about_me: formData.about_me || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      const nextSection = getNextSection();
      
      toast({
        title: "Profile Updated",
        description: nextSection 
          ? `Saved! Moving to ${sections.find(s => s.id === nextSection)?.label}...`
          : "All sections completed successfully!",
      });
      
      onProfileUpdate();
      
      // Auto-advance to next section if not on last
      if (nextSection) {
        setActiveSection(nextSection);
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className="flex-shrink-0 gap-2"
          >
            <section.icon className="h-4 w-4" />
            {section.label}
          </Button>
        ))}
      </div>

      {/* Basic Info Section */}
      {activeSection === 'basic' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Height</Label>
                <Select value={formData.height} onValueChange={(v) => handleInputChange('height', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select height" /></SelectTrigger>
                  <SelectContent>
                    {heightOptions.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Marital Status</Label>
                <Select value={formData.marital_status} onValueChange={(v) => handleInputChange('marital_status', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {maritalStatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Mother Tongue</Label>
                <Select value={formData.mother_tongue} onValueChange={(v) => handleInputChange('mother_tongue', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select language" /></SelectTrigger>
                  <SelectContent>
                    {motherTongueOptions.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Religious Section */}
      {activeSection === 'religious' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Religious Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Religion</Label>
                <Select value={formData.religion} onValueChange={(v) => handleInputChange('religion', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select religion" /></SelectTrigger>
                  <SelectContent>
                    {religionOptions.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Caste</Label>
                <Select value={formData.caste} onValueChange={(v) => handleInputChange('caste', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select caste" /></SelectTrigger>
                  <SelectContent>
                    {availableCastes.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Sub Caste</Label>
                <Input
                  value={formData.sub_caste}
                  onChange={(e) => handleInputChange('sub_caste', e.target.value)}
                  placeholder="Enter sub caste"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Gothram</Label>
                <Input
                  value={formData.gothram}
                  onChange={(e) => handleInputChange('gothram', e.target.value)}
                  placeholder="Enter gothram"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Star (Nakshatra)</Label>
                <Select value={formData.star} onValueChange={(v) => handleInputChange('star', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select star" /></SelectTrigger>
                  <SelectContent>
                    {starOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Dosham</Label>
                <Select value={formData.dosham} onValueChange={(v) => handleInputChange('dosham', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select dosham" /></SelectTrigger>
                  <SelectContent>
                    {doshamOptions.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Section */}
      {activeSection === 'professional' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Education</Label>
                <Select value={formData.education} onValueChange={(v) => handleInputChange('education', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select education" /></SelectTrigger>
                  <SelectContent>
                    {educationOptions.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Education Details</Label>
                <Input
                  value={formData.education_detail}
                  onChange={(e) => handleInputChange('education_detail', e.target.value)}
                  placeholder="e.g., B.Tech in Computer Science"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Employment Type</Label>
                <Select value={formData.employment_type} onValueChange={(v) => handleInputChange('employment_type', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {employmentOptions.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Occupation</Label>
                <Input
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Company Name</Label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Enter company name"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">Annual Income</Label>
                <Select value={formData.annual_income} onValueChange={(v) => handleInputChange('annual_income', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select income" /></SelectTrigger>
                  <SelectContent>
                    {incomeOptions.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family & Location Section */}
      {activeSection === 'family' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Family & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Family Status</Label>
                <Select value={formData.family_status} onValueChange={(v) => handleInputChange('family_status', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {familyStatusOptions.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Family Type</Label>
                <Select value={formData.family_type} onValueChange={(v) => handleInputChange('family_type', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {familyTypeOptions.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Country</Label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs">State</Label>
                <Select value={formData.state} onValueChange={(v) => handleInputChange('state', v)}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {stateOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  className="h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* About Me Section */}
      {activeSection === 'about' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Tell us about yourself</Label>
              <Textarea
                value={formData.about_me}
                onChange={(e) => handleInputChange('about_me', e.target.value)}
                placeholder="Write a brief description about yourself, your interests, hobbies, and what you're looking for..."
                className="min-h-[150px] resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">{formData.about_me.length}/1000 characters</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photos Section */}
      {activeSection === 'photos' && (
        <ProfilePhotosManager profileId={profile.id} onPhotosChange={onProfileUpdate} />
      )}

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Saving...' : isLastSection ? 'Save & Finish' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
};

export default EditProfileSection;
