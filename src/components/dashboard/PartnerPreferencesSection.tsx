import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Heart,
  GraduationCap,
  MapPin,
  Save,
  Loader2,
  Info,
  ChevronDown,
  ChevronRight,
  Check,
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
  annual_income_from: string;
  annual_income_to: string;
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
  annual_income_from: '',
  annual_income_to: '',
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

// Styled Select Dropdown component
const StyledSelect = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Select option"
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) => {
  return (
    <div>
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-10 mt-1 bg-primary/5 border-primary/20 hover:bg-primary/10 focus:ring-primary/30">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option}
              className="cursor-pointer hover:bg-primary/10"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Multi-select dropdown component with improved styling
const MultiSelectDropdown = ({
  label,
  options,
  selectedValues,
  onToggle,
  placeholder = "Select options"
}: {
  label: string;
  options: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const displayText = selectedValues.length === 0 
    ? placeholder 
    : selectedValues.length === 1 
      ? selectedValues[0] 
      : `${selectedValues.length} selected`;

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 mt-1 font-normal bg-primary/5 border-primary/20 hover:bg-primary/10"
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[250px] p-0" align="start">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-2 space-y-1">
              {filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedValues.includes(option) 
                      ? 'bg-primary/20 text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => onToggle(option)}
                >
                  <Checkbox
                    id={option}
                    checked={selectedValues.includes(option)}
                    onCheckedChange={() => onToggle(option)}
                    className="border-primary data-[state=checked]:bg-primary"
                  />
                  <label
                    htmlFor={option}
                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                  >
                    {option}
                  </label>
                  {selectedValues.includes(option) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((value) => (
            <Badge 
              key={value} 
              variant="secondary" 
              className="text-xs bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
              onClick={() => onToggle(value)}
            >
              {value} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

type PreferenceStep = 'basic' | 'religious' | 'professional_location';

const PartnerPreferencesSection = ({ userId }: PartnerPreferencesSectionProps) => {
  const [formData, setFormData] = useState<PartnerPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState<PreferenceStep>('basic');
  const [completedSteps, setCompletedSteps] = useState<PreferenceStep[]>([]);

  const steps: { id: PreferenceStep; label: string; icon: typeof User }[] = [
    { id: 'basic', label: 'Basic Details', icon: User },
    { id: 'religious', label: 'Religious', icon: Heart },
    { id: 'professional_location', label: 'Professional & Location', icon: GraduationCap },
  ];

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
          annual_income_from: data.annual_income?.split(' - ')[0] || '',
          annual_income_to: data.annual_income?.split(' - ')[1] || '',
        });
        // Mark all steps as completed if data exists
        setCompletedSteps(['basic', 'religious', 'professional_location']);
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const [showMatchingProfiles, setShowMatchingProfiles] = useState(false);
  const [matchingProfiles, setMatchingProfiles] = useState<any[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  const fetchMatchingProfiles = async () => {
    setLoadingMatches(true);
    try {
      // Get user's gender from their profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', userId)
        .single();

      if (!userProfile) return;

      // Fetch profiles of opposite gender
      let query = supabase
        .from('profiles')
        .select('id, name, photo_url, profile_id, date_of_birth, height, city, state, education, occupation, religion')
        .eq('is_complete', true)
        .neq('gender', userProfile.gender)
        .limit(10);

      // Apply filters based on preferences
      if (formData.religion.length > 0 && !formData.religion.includes('Any')) {
        query = query.in('religion', formData.religion);
      }
      if (formData.education.length > 0) {
        query = query.in('education', formData.education);
      }
      if (formData.residing_state.length > 0) {
        query = query.in('state', formData.residing_state);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMatchingProfiles(data || []);
      setShowMatchingProfiles(true);
    } catch (error) {
      console.error('Error fetching matching profiles:', error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const saveCurrentStep = async () => {
    setIsSaving(true);
    try {
      // Combine annual income range for storage
      const annualIncomeRange = formData.annual_income_from && formData.annual_income_to 
        ? `${formData.annual_income_from} - ${formData.annual_income_to}` 
        : formData.annual_income_from || formData.annual_income_to || null;

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
          annual_income: annualIncomeRange,
          country: formData.country,
          residing_state: formData.residing_state,
          is_compulsory: formData.is_compulsory,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      // Mark current step as completed
      if (!completedSteps.includes(activeStep)) {
        setCompletedSteps(prev => [...prev, activeStep]);
      }

      // Move to next step
      const currentIndex = steps.findIndex(s => s.id === activeStep);
      if (currentIndex < steps.length - 1) {
        setActiveStep(steps[currentIndex + 1].id);
        toast({
          title: "Saved!",
          description: `${steps[currentIndex].label} saved. Moving to ${steps[currentIndex + 1].label}...`,
        });
      } else {
        // Final step - show matching profiles
        toast({
          title: "All Preferences Saved!",
          description: "Finding matching profiles based on your preferences...",
        });
        fetchMatchingProfiles();
      }
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

      {/* Step Indicator */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = activeStep === step.id;
          const Icon = step.icon;
          
          return (
            <Button
              key={step.id}
              variant={isActive ? 'default' : isCompleted ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setActiveStep(step.id)}
              className={`flex-shrink-0 gap-2 ${isCompleted && !isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}`}
            >
              {isCompleted && !isActive ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {step.label}
              {index < steps.length - 1 && <ChevronRight className="h-3 w-3 ml-1 opacity-50" />}
            </Button>
          );
        })}
      </div>

      {/* Basic Details Section */}
      {activeStep === 'basic' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StyledSelect
                label="Age From"
                value={formData.age_from.toString()}
                onValueChange={(v) => handleInputChange('age_from', parseInt(v))}
                options={Array.from({ length: 43 }, (_, i) => `${18 + i}`)}
                placeholder="Select age"
              />
              <StyledSelect
                label="Age To"
                value={formData.age_to.toString()}
                onValueChange={(v) => handleInputChange('age_to', parseInt(v))}
                options={Array.from({ length: 43 }, (_, i) => `${18 + i}`)}
                placeholder="Select age"
              />
              <StyledSelect
                label="Height From"
                value={formData.height_from}
                onValueChange={(v) => handleInputChange('height_from', v)}
                options={heightOptions}
                placeholder="Select height"
              />
              <StyledSelect
                label="Height To"
                value={formData.height_to}
                onValueChange={(v) => handleInputChange('height_to', v)}
                options={heightOptions}
                placeholder="Select height"
              />
            </div>

            <MultiSelectDropdown
              label="Marital Status"
              options={maritalStatusOptions}
              selectedValues={formData.marital_status}
              onToggle={(v) => toggleArrayItem('marital_status', v)}
              placeholder="Select marital status"
            />

            <MultiSelectDropdown
              label="Mother Tongue"
              options={motherTongueOptions}
              selectedValues={formData.mother_tongue}
              onToggle={(v) => toggleArrayItem('mother_tongue', v)}
              placeholder="Select mother tongue"
            />

            <StyledSelect
              label="Physical Status"
              value={formData.physical_status}
              onValueChange={(v) => handleInputChange('physical_status', v)}
              options={PHYSICAL_STATUS_OPTIONS}
              placeholder="Select status"
            />

            <MultiSelectDropdown
              label="Eating Habits"
              options={EATING_HABITS}
              selectedValues={formData.eating_habits}
              onToggle={(v) => toggleArrayItem('eating_habits', v)}
              placeholder="Select eating habits"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StyledSelect
                label="Drinking Habits"
                value={formData.drinking_habits}
                onValueChange={(v) => handleInputChange('drinking_habits', v)}
                options={DRINKING_OPTIONS}
                placeholder="Select"
              />
              <StyledSelect
                label="Smoking Habits"
                value={formData.smoking_habits}
                onValueChange={(v) => handleInputChange('smoking_habits', v)}
                options={SMOKING_OPTIONS}
                placeholder="Select"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={saveCurrentStep} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Religious Preferences Section */}
      {activeStep === 'religious' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Religious Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MultiSelectDropdown
              label="Religion"
              options={religionOptions}
              selectedValues={formData.religion}
              onToggle={(v) => toggleArrayItem('religion', v)}
              placeholder="Select religion"
            />

            {availableCastes.length > 0 && (
              <MultiSelectDropdown
                label="Caste"
                options={availableCastes}
                selectedValues={formData.caste}
                onToggle={(v) => toggleArrayItem('caste', v)}
                placeholder="Select caste"
              />
            )}

            <StyledSelect
              label="Dosham"
              value={formData.dosham}
              onValueChange={(v) => handleInputChange('dosham', v)}
              options={["Doesn't matter", ...doshamOptions]}
              placeholder="Select dosham"
            />

            <MultiSelectDropdown
              label="Star / Nakshatra"
              options={starOptions}
              selectedValues={formData.star}
              onToggle={(v) => toggleArrayItem('star', v)}
              placeholder="Select star"
            />

            <div className="flex justify-end pt-4">
              <Button onClick={saveCurrentStep} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save & Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional & Location Preferences Section */}
      {activeStep === 'professional_location' && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Professional & Location Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Professional Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
                Professional Details
              </h3>
              
              <MultiSelectDropdown
                label="Education"
                options={educationOptions}
                selectedValues={formData.education}
                onToggle={(v) => toggleArrayItem('education', v)}
                placeholder="Select education"
              />

              <StyledSelect
                label="Employed In"
                value={formData.employed_in}
                onValueChange={(v) => handleInputChange('employed_in', v)}
                options={EMPLOYED_IN_OPTIONS}
                placeholder="Select employment type"
              />

              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Annual Income Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <StyledSelect
                    label="From"
                    value={formData.annual_income_from}
                    onValueChange={(v) => handleInputChange('annual_income_from', v)}
                    options={['Any', ...incomeOptions]}
                    placeholder="Minimum income"
                  />
                  <StyledSelect
                    label="To"
                    value={formData.annual_income_to}
                    onValueChange={(v) => handleInputChange('annual_income_to', v)}
                    options={['Any', ...incomeOptions]}
                    placeholder="Maximum income"
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Details
              </h3>

              <MultiSelectDropdown
                label="Country"
                options={COUNTRIES}
                selectedValues={formData.country}
                onToggle={(v) => toggleArrayItem('country', v)}
                placeholder="Select country"
              />

              <MultiSelectDropdown
                label="Residing State"
                options={stateOptions}
                selectedValues={formData.residing_state}
                onToggle={(v) => toggleArrayItem('residing_state', v)}
                placeholder="Select state"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={saveCurrentStep} disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matching Profiles Section */}
      {showMatchingProfiles && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Matching Profiles
              <Badge variant="secondary" className="ml-2">
                {matchingProfiles.length} found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMatches ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : matchingProfiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No matching profiles found. Try adjusting your preferences.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matchingProfiles.map((profile) => {
                  const age = profile.date_of_birth ? Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : null;
                  return (
                    <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {profile.photo_url ? (
                          <img
                            src={profile.photo_url}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <User className="h-12 w-12 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-semibold truncate">{profile.name}</h4>
                        <p className="text-xs text-muted-foreground">{profile.profile_id}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {[
                            age ? `${age} yrs` : null,
                            profile.height,
                            profile.religion,
                            profile.city
                          ].filter(Boolean).join(' • ')}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartnerPreferencesSection;
