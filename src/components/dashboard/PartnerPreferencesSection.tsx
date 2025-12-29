import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Heart,
  GraduationCap,
  MapPin,
  Check,
  Save,
  Loader2,
  Info,
} from 'lucide-react';
import {
  heightOptions,
  maritalStatusOptions,
  motherTongueOptions,
  religionOptions,
  doshamOptions,
  starOptions,
  educationOptions,
  incomeOptions,
  stateOptions,
} from '@/data/registrationOptions';
import { castesByReligion } from '@/data/casteOptions';

interface PartnerPreferences {
  id?: string;
  age_from: number;
  age_to: number;
  height_from: string;
  height_to: string;
  marital_status: string[];
  mother_tongue: string[];
  physical_status: string;
  eating_habits: string[];
  drinking_habits: string;
  smoking_habits: string;
  religion: string[];
  caste: string[];
  dosham: string;
  star: string[];
  education: string[];
  employed_in: string;
  occupation: string;
  annual_income: string;
  country: string[];
  residing_state: string[];
  is_compulsory: boolean;
}

const defaultPreferences: PartnerPreferences = {
  age_from: 22,
  age_to: 29,
  height_from: '',
  height_to: '',
  marital_status: [],
  mother_tongue: [],
  physical_status: '',
  eating_habits: [],
  drinking_habits: '',
  smoking_habits: '',
  religion: [],
  caste: [],
  dosham: '',
  star: [],
  education: [],
  employed_in: '',
  occupation: '',
  annual_income: '',
  country: [],
  residing_state: [],
  is_compulsory: false,
};

const COUNTRIES = ['India', 'USA', 'UK', 'Australia', 'Canada', 'Singapore', 'Germany', 'UAE', 'Other'];
const EATING_HABITS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'];
const DRINKING_OPTIONS = ['Never drinks', 'Drinks socially', 'Drinks regularly', "Doesn't matter"];
const SMOKING_OPTIONS = ['Never smokes', 'Smokes occasionally', 'Smokes regularly', "Doesn't matter"];
const PHYSICAL_STATUS_OPTIONS = ['Normal', 'Physically Challenged', "Doesn't matter"];
const EMPLOYED_IN_OPTIONS = ['Government / PSU', 'Private', 'Business', 'Defence', 'Self Employed', 'Not Working', 'Any'];

interface PartnerPreferencesSectionProps {
  userId: string;
}

const PartnerPreferencesSection = ({ userId }: PartnerPreferencesSectionProps) => {
  const [formData, setFormData] = useState<PartnerPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'basic' | 'religious' | 'professional' | 'location'>('basic');

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partner_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData({
          ...defaultPreferences,
          ...data,
          marital_status: data.marital_status || [],
          mother_tongue: data.mother_tongue || [],
          eating_habits: data.eating_habits || [],
          religion: data.religion || [],
          caste: data.caste || [],
          star: data.star || [],
          education: data.education || [],
          country: data.country || [],
          residing_state: data.residing_state || [],
        });
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('partner_preferences')
        .upsert({
          user_id: userId,
          age_from: formData.age_from,
          age_to: formData.age_to,
          height_from: formData.height_from || null,
          height_to: formData.height_to || null,
          marital_status: formData.marital_status,
          mother_tongue: formData.mother_tongue,
          physical_status: formData.physical_status || null,
          eating_habits: formData.eating_habits,
          drinking_habits: formData.drinking_habits || null,
          smoking_habits: formData.smoking_habits || null,
          religion: formData.religion,
          caste: formData.caste,
          dosham: formData.dosham || null,
          star: formData.star,
          education: formData.education,
          employed_in: formData.employed_in || null,
          occupation: formData.occupation || null,
          annual_income: formData.annual_income || null,
          country: formData.country,
          residing_state: formData.residing_state,
          is_compulsory: formData.is_compulsory,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your partner preferences have been updated successfully.",
      });
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

  const toggleArrayItem = (key: keyof PartnerPreferences, value: string) => {
    const current = formData[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, [key]: updated });
  };

  const handleInputChange = (field: keyof PartnerPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get available castes based on selected religions
  const availableCastes = formData.religion.length > 0
    ? [...new Set(formData.religion.flatMap(r => castesByReligion[r] || []))]
    : [];

  const sections = [
    { id: 'basic', label: 'Basic', icon: User },
    { id: 'religious', label: 'Religious', icon: Heart },
    { id: 'professional', label: 'Professional', icon: GraduationCap },
    { id: 'location', label: 'Location', icon: MapPin },
  ] as const;

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="shadow-card animate-pulse">
          <CardContent className="h-64" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compulsory Toggle */}
      <Card className="shadow-card">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Turn on "Compulsory" to get matches exactly as per your preferences
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_compulsory}
                onCheckedChange={(checked) => handleInputChange('is_compulsory', checked)}
              />
              <Label className="text-sm font-medium">Compulsory</Label>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Basic Preferences Section */}
      {activeSection === 'basic' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Age From</Label>
                <Select
                  value={formData.age_from.toString()}
                  onValueChange={(v) => handleInputChange('age_from', parseInt(v))}
                >
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select age" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 43 }, (_, i) => 18 + i).map((age) => (
                      <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Age To</Label>
                <Select
                  value={formData.age_to.toString()}
                  onValueChange={(v) => handleInputChange('age_to', parseInt(v))}
                >
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select age" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 43 }, (_, i) => 18 + i).map((age) => (
                      <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Height From</Label>
                <Select
                  value={formData.height_from}
                  onValueChange={(v) => handleInputChange('height_from', v)}
                >
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select height" /></SelectTrigger>
                  <SelectContent>
                    {heightOptions.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Height To</Label>
                <Select
                  value={formData.height_to}
                  onValueChange={(v) => handleInputChange('height_to', v)}
                >
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select height" /></SelectTrigger>
                  <SelectContent>
                    {heightOptions.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Marital Status (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {maritalStatusOptions.map((status) => (
                  <Badge
                    key={status}
                    variant={formData.marital_status.includes(status) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('marital_status', status)}
                  >
                    {status}
                    {formData.marital_status.includes(status) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Mother Tongue (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {motherTongueOptions.map((lang) => (
                  <Badge
                    key={lang}
                    variant={formData.mother_tongue.includes(lang) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('mother_tongue', lang)}
                  >
                    {lang}
                    {formData.mother_tongue.includes(lang) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Physical Status</Label>
              <Select
                value={formData.physical_status}
                onValueChange={(v) => handleInputChange('physical_status', v)}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {PHYSICAL_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Eating Habits (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EATING_HABITS.map((habit) => (
                  <Badge
                    key={habit}
                    variant={formData.eating_habits.includes(habit) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('eating_habits', habit)}
                  >
                    {habit}
                    {formData.eating_habits.includes(habit) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Drinking Habits</Label>
                <Select
                  value={formData.drinking_habits}
                  onValueChange={(v) => handleInputChange('drinking_habits', v)}
                >
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {DRINKING_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Smoking Habits</Label>
                <Select
                  value={formData.smoking_habits}
                  onValueChange={(v) => handleInputChange('smoking_habits', v)}
                >
                  <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {SMOKING_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Religious Preferences Section */}
      {activeSection === 'religious' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Religious Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Religion (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {religionOptions.map((religion) => (
                  <Badge
                    key={religion}
                    variant={formData.religion.includes(religion) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('religion', religion)}
                  >
                    {religion}
                    {formData.religion.includes(religion) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {availableCastes.length > 0 && (
              <div>
                <Label className="text-xs">Caste (Select multiple)</Label>
                <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                  {availableCastes.map((caste) => (
                    <Badge
                      key={caste}
                      variant={formData.caste.includes(caste) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem('caste', caste)}
                    >
                      {caste}
                      {formData.caste.includes(caste) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-xs">Dosham</Label>
              <Select
                value={formData.dosham}
                onValueChange={(v) => handleInputChange('dosham', v)}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Select dosham" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doesn't matter">Doesn't matter</SelectItem>
                  {doshamOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Star / Nakshatra (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                {starOptions.map((star) => (
                  <Badge
                    key={star}
                    variant={formData.star.includes(star) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('star', star)}
                  >
                    {star}
                    {formData.star.includes(star) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Preferences Section */}
      {activeSection === 'professional' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Professional Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Education (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                {educationOptions.map((edu) => (
                  <Badge
                    key={edu}
                    variant={formData.education.includes(edu) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('education', edu)}
                  >
                    {edu}
                    {formData.education.includes(edu) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Employed In</Label>
              <Select
                value={formData.employed_in}
                onValueChange={(v) => handleInputChange('employed_in', v)}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Select employment type" /></SelectTrigger>
                <SelectContent>
                  {EMPLOYED_IN_OPTIONS.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Annual Income</Label>
              <Select
                value={formData.annual_income}
                onValueChange={(v) => handleInputChange('annual_income', v)}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="Select income range" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Any">Any</SelectItem>
                  {incomeOptions.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Preferences Section */}
      {activeSection === 'location' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Location Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Country (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COUNTRIES.map((country) => (
                  <Badge
                    key={country}
                    variant={formData.country.includes(country) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('country', country)}
                  >
                    {country}
                    {formData.country.includes(country) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Residing State (Select multiple)</Label>
              <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                {stateOptions.map((state) => (
                  <Badge
                    key={state}
                    variant={formData.residing_state.includes(state) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('residing_state', state)}
                  >
                    {state}
                    {formData.residing_state.includes(state) && <Check className="h-3 w-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default PartnerPreferencesSection;
