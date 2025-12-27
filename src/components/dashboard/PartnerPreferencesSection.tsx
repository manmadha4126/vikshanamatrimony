import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  User,
  Heart,
  GraduationCap,
  MapPin,
  Edit2,
  Check,
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
  height_from: '5\'3" (160 cm)',
  height_to: '6\'0" (183 cm)',
  marital_status: ['Never Married'],
  mother_tongue: [],
  physical_status: 'Normal',
  eating_habits: ['Vegetarian', 'Non-Vegetarian'],
  drinking_habits: 'Never drinks',
  smoking_habits: 'Never smokes',
  religion: ['Hindu'],
  caste: ['Any'],
  dosham: "Doesn't matter",
  star: ['Any'],
  education: [],
  employed_in: 'Any',
  occupation: 'Any',
  annual_income: 'Any',
  country: ['India'],
  residing_state: [],
  is_compulsory: false,
};

const COUNTRIES = ['India', 'USA', 'UK', 'Australia', 'Canada', 'Singapore', 'Germany', 'UAE', 'Other'];
const EATING_HABITS = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'];
const DRINKING_OPTIONS = ['Never drinks', 'Drinks socially', 'Drinks regularly'];
const SMOKING_OPTIONS = ['Never smokes', 'Smokes occasionally', 'Smokes regularly'];
const PHYSICAL_STATUS_OPTIONS = ['Normal', 'Physically Challenged'];
const EDUCATION_CATEGORIES = [
  'Engineering / Computer Science',
  'Arts / Science / Commerce',
  'Medicine / Pharmacy / Nursing',
  'Management (MBA/PGDM)',
  'Law',
  'Finance (CA / CS / ICWAI / CFA)',
  'Civil Services (IAS/IPS/IFS)',
  'Doctorates (PhD)',
  'Diploma',
  'High School',
  'Other',
];

interface PartnerPreferencesSectionProps {
  userId: string;
}

const PartnerPreferencesSection = ({ userId }: PartnerPreferencesSectionProps) => {
  const [preferences, setPreferences] = useState<PartnerPreferences>(defaultPreferences);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<string>('');
  const [editPrefs, setEditPrefs] = useState<PartnerPreferences>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
        setPreferences(data as PartnerPreferences);
        setEditPrefs(data as PartnerPreferences);
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('partner_preferences')
        .upsert({
          user_id: userId,
          ...editPrefs,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      setPreferences(editPrefs);
      toast({
        title: "Preferences Saved",
        description: "Your partner preferences have been updated.",
      });
      setIsEditOpen(false);
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

  const openEdit = (category: string) => {
    setEditCategory(category);
    setEditPrefs({ ...preferences });
    setIsEditOpen(true);
  };

  const toggleArrayItem = (key: keyof PartnerPreferences, value: string) => {
    const current = editPrefs[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setEditPrefs({ ...editPrefs, [key]: updated });
  };

  const PreferenceCard = ({ 
    icon: Icon, 
    title, 
    items, 
    category 
  }: { 
    icon: any; 
    title: string; 
    items: { label: string; value: string | string[] }[];
    category: string;
  }) => (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-right max-w-[60%]">
                {Array.isArray(item.value) 
                  ? item.value.length > 0 
                    ? item.value.join(', ') 
                    : 'Any'
                  : item.value || 'Any'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card className="shadow-card animate-pulse">
          <CardContent className="h-64" />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="font-display text-xl">Partner Preferences</CardTitle>
              <CardDescription className="mt-2 text-sm max-w-2xl">
                Matches recommended by us are based on Acceptable matches criteria and at times might go slightly beyond your preferences.
                Turn on "Compulsory" to get matches exactly as per your preferences.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={preferences.is_compulsory}
                onCheckedChange={async (checked) => {
                  const updated = { ...preferences, is_compulsory: checked };
                  setPreferences(updated);
                  await supabase
                    .from('partner_preferences')
                    .upsert({ user_id: userId, is_compulsory: checked }, { onConflict: 'user_id' });
                }}
              />
              <Label className="text-sm font-medium">Compulsory</Label>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PreferenceCard
              icon={User}
              title="Basic Preferences"
              category="basic"
              items={[
                { label: "Partner's Age", value: `${preferences.age_from} - ${preferences.age_to} years` },
                { label: 'Height', value: `${preferences.height_from} - ${preferences.height_to}` },
                { label: 'Marital Status', value: preferences.marital_status },
                { label: 'Mother Tongue', value: preferences.mother_tongue },
                { label: 'Physical Status', value: preferences.physical_status },
                { label: 'Eating Habits', value: preferences.eating_habits },
                { label: 'Drinking Habits', value: preferences.drinking_habits },
                { label: 'Smoking Habits', value: preferences.smoking_habits },
              ]}
            />

            <PreferenceCard
              icon={Heart}
              title="Religious Preferences"
              category="religious"
              items={[
                { label: 'Religion', value: preferences.religion },
                { label: 'Caste', value: preferences.caste },
                { label: 'Dosham', value: preferences.dosham },
                { label: 'Star', value: preferences.star },
              ]}
            />

            <PreferenceCard
              icon={GraduationCap}
              title="Professional Preferences"
              category="professional"
              items={[
                { label: 'Education', value: preferences.education },
                { label: 'Employed In', value: preferences.employed_in },
                { label: 'Occupation', value: preferences.occupation },
                { label: 'Annual Income', value: preferences.annual_income },
              ]}
            />

            <PreferenceCard
              icon={MapPin}
              title="Location Preferences"
              category="location"
              items={[
                { label: 'Country', value: preferences.country },
                { label: 'Residing State', value: preferences.residing_state },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit {editCategory.charAt(0).toUpperCase() + editCategory.slice(1)} Preferences
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editCategory === 'basic' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Age From</Label>
                    <Select
                      value={editPrefs.age_from.toString()}
                      onValueChange={(v) => setEditPrefs({ ...editPrefs, age_from: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 43 }, (_, i) => 18 + i).map((age) => (
                          <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Age To</Label>
                    <Select
                      value={editPrefs.age_to.toString()}
                      onValueChange={(v) => setEditPrefs({ ...editPrefs, age_to: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 43 }, (_, i) => 18 + i).map((age) => (
                          <SelectItem key={age} value={age.toString()}>{age} years</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Height From</Label>
                    <Select
                      value={editPrefs.height_from}
                      onValueChange={(v) => setEditPrefs({ ...editPrefs, height_from: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {heightOptions.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Height To</Label>
                    <Select
                      value={editPrefs.height_to}
                      onValueChange={(v) => setEditPrefs({ ...editPrefs, height_to: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {heightOptions.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Marital Status</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {maritalStatusOptions.map((status) => (
                      <Badge
                        key={status}
                        variant={editPrefs.marital_status.includes(status) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('marital_status', status)}
                      >
                        {status}
                        {editPrefs.marital_status.includes(status) && <Check className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Mother Tongue</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {motherTongueOptions.map((lang) => (
                      <Badge
                        key={lang}
                        variant={editPrefs.mother_tongue.includes(lang) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('mother_tongue', lang)}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Physical Status</Label>
                  <Select
                    value={editPrefs.physical_status}
                    onValueChange={(v) => setEditPrefs({ ...editPrefs, physical_status: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PHYSICAL_STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Eating Habits</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {EATING_HABITS.map((habit) => (
                      <Badge
                        key={habit}
                        variant={editPrefs.eating_habits.includes(habit) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('eating_habits', habit)}
                      >
                        {habit}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Drinking Habits</Label>
                    <Select
                      value={editPrefs.drinking_habits}
                      onValueChange={(v) => setEditPrefs({ ...editPrefs, drinking_habits: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DRINKING_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Smoking Habits</Label>
                    <Select
                      value={editPrefs.smoking_habits}
                      onValueChange={(v) => setEditPrefs({ ...editPrefs, smoking_habits: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SMOKING_OPTIONS.map((o) => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {editCategory === 'religious' && (
              <>
                <div>
                  <Label>Religion</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {religionOptions.map((r) => (
                      <Badge
                        key={r}
                        variant={editPrefs.religion.includes(r) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('religion', r)}
                      >
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Caste</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant={editPrefs.caste.includes('Any') ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setEditPrefs({ ...editPrefs, caste: ['Any'] })}
                    >
                      Any
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>Dosham</Label>
                  <Select
                    value={editPrefs.dosham}
                    onValueChange={(v) => setEditPrefs({ ...editPrefs, dosham: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Doesn't matter">Doesn't matter</SelectItem>
                      {doshamOptions.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Star</Label>
                  <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                    <Badge
                      variant={editPrefs.star.includes('Any') ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setEditPrefs({ ...editPrefs, star: ['Any'] })}
                    >
                      Any
                    </Badge>
                    {starOptions.map((s) => (
                      <Badge
                        key={s}
                        variant={editPrefs.star.includes(s) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('star', s)}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {editCategory === 'professional' && (
              <>
                <div>
                  <Label>Education</Label>
                  <div className="space-y-2 mt-2">
                    {EDUCATION_CATEGORIES.map((edu) => (
                      <div key={edu} className="flex items-center space-x-2">
                        <Checkbox
                          checked={editPrefs.education.includes(edu)}
                          onCheckedChange={() => toggleArrayItem('education', edu)}
                        />
                        <Label className="text-sm font-normal">{edu}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Employed In</Label>
                  <Select
                    value={editPrefs.employed_in}
                    onValueChange={(v) => setEditPrefs({ ...editPrefs, employed_in: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any</SelectItem>
                      <SelectItem value="Government">Government</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Self Employed">Self Employed</SelectItem>
                      <SelectItem value="Not Working">Not Working</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Annual Income</Label>
                  <Select
                    value={editPrefs.annual_income}
                    onValueChange={(v) => setEditPrefs({ ...editPrefs, annual_income: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any</SelectItem>
                      {incomeOptions.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {editCategory === 'location' && (
              <>
                <div>
                  <Label>Country</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COUNTRIES.map((c) => (
                      <Badge
                        key={c}
                        variant={editPrefs.country.includes(c) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('country', c)}
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Residing State (for India)</Label>
                  <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto">
                    {stateOptions.map((s) => (
                      <Badge
                        key={s}
                        variant={editPrefs.residing_state.includes(s) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayItem('residing_state', s)}
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={savePreferences} disabled={isSaving} className="flex-1">
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerPreferencesSection;
