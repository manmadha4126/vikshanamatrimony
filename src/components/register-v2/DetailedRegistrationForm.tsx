import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2, User, MapPin, GraduationCap, Briefcase, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import locationsData from "@/data/locations.json";
import religionsData from "@/data/religions.json";
import formOptionsData from "@/data/formOptions.json";

interface RegistrationData {
  // Personal Details
  dateOfBirth: { day: string; month: string; year: string };
  motherTongue: string;
  height: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  subCaste: string;
  familyStatus: string;
  doshamKnown: string;
  doshamTypes: string[];
  // Location
  country: string;
  state: string;
  city: string;
  // Education
  educationLevel: string;
  educationOther: string;
  // Employment
  employmentType: string;
  occupation: string[];
  // Income
  incomeCurrency: string;
  incomeRange: string;
}

interface DetailedRegistrationFormProps {
  onComplete: (data: RegistrationData) => void;
}

const DetailedRegistrationForm = ({ onComplete }: DetailedRegistrationFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    dateOfBirth: { day: "", month: "", year: "" },
    motherTongue: "",
    height: "",
    maritalStatus: "",
    religion: "",
    caste: "",
    subCaste: "",
    familyStatus: "",
    doshamKnown: "",
    doshamTypes: [],
    country: "",
    state: "",
    city: "",
    educationLevel: "",
    educationOther: "",
    employmentType: "",
    occupation: [],
    incomeCurrency: "INR",
    incomeRange: "",
  });

  // Generate date options
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 - 17 }, (_, i) => String(currentYear - 18 - i));

  // Dynamic data loading
  const states = useMemo(() => {
    if (!formData.country) return [];
    return (locationsData.states as Record<string, { code: string; name: string }[]>)[formData.country] || [];
  }, [formData.country]);

  const cities = useMemo(() => {
    if (!formData.state) return [];
    return (locationsData.cities as Record<string, string[]>)[formData.state] || [];
  }, [formData.state]);

  const castes = useMemo(() => {
    if (!formData.religion) return [];
    return (religionsData.castes as Record<string, { id: string; name: string }[]>)[formData.religion] || [];
  }, [formData.religion]);

  const subcastes = useMemo(() => {
    if (!formData.caste) return [];
    return (religionsData.subcastes as Record<string, string[]>)[formData.caste] || [];
  }, [formData.caste]);

  const handleChange = (field: keyof RegistrationData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset dependent fields
      if (field === "country") {
        updated.state = "";
        updated.city = "";
      }
      if (field === "state") {
        updated.city = "";
      }
      if (field === "religion") {
        updated.caste = "";
        updated.subCaste = "";
      }
      if (field === "caste") {
        updated.subCaste = "";
      }
      if (field === "doshamKnown" && value !== "yes") {
        updated.doshamTypes = [];
      }
      if (field === "educationLevel" && value !== "other") {
        updated.educationOther = "";
      }
      return updated;
    });
  };

  const handleDOBChange = (field: "day" | "month" | "year", value: string) => {
    setFormData((prev) => ({
      ...prev,
      dateOfBirth: { ...prev.dateOfBirth, [field]: value },
    }));
  };

  const handleOccupationToggle = (occupation: string) => {
    setFormData((prev) => {
      const current = prev.occupation;
      if (current.includes(occupation)) {
        return { ...prev, occupation: current.filter((o) => o !== occupation) };
      }
      if (current.length >= 2) {
        toast({
          title: "Maximum 2 occupations",
          description: "You can select up to 2 occupations.",
          variant: "destructive",
        });
        return prev;
      }
      return { ...prev, occupation: [...current, occupation] };
    });
  };

  const handleDoshamToggle = (dosham: string) => {
    setFormData((prev) => {
      const current = prev.doshamTypes;
      if (current.includes(dosham)) {
        return { ...prev, doshamTypes: current.filter((d) => d !== dosham) };
      }
      return { ...prev, doshamTypes: [...current, dosham] };
    });
  };

  const validateAge = () => {
    const { day, month, year } = formData.dateOfBirth;
    if (!day || !month || !year) return false;
    const birthDate = new Date(
      parseInt(year),
      months.indexOf(month),
      parseInt(day)
    );
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
  };

  const validateForm = () => {
    const required = [
      { field: "dateOfBirth", valid: validateAge() },
      { field: "motherTongue", valid: !!formData.motherTongue },
      { field: "height", valid: !!formData.height },
      { field: "maritalStatus", valid: !!formData.maritalStatus },
      { field: "religion", valid: !!formData.religion },
      { field: "familyStatus", valid: !!formData.familyStatus },
      { field: "doshamKnown", valid: !!formData.doshamKnown },
      { field: "country", valid: !!formData.country },
      { field: "state", valid: !!formData.state },
      { field: "city", valid: !!formData.city },
      { field: "educationLevel", valid: !!formData.educationLevel },
      { field: "employmentType", valid: !!formData.employmentType },
      { field: "incomeCurrency", valid: !!formData.incomeCurrency },
      { field: "incomeRange", valid: !!formData.incomeRange },
    ];

    if (formData.educationLevel === "other" && !formData.educationOther) {
      return false;
    }

    return required.every((r) => r.valid);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Please fill all required fields",
        description: "Make sure you have completed all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate processing
    setTimeout(() => {
      setIsSubmitting(false);
      onComplete(formData);
    }, 500);
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="flex items-center gap-3 pb-2 border-b border-border mb-4">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-display font-bold text-foreground">
          Complete Your Profile
        </h2>
        <p className="text-muted-foreground">
          Tell us more about yourself to find your perfect match
        </p>
      </div>

      {/* Personal Details Section */}
      <section className="space-y-4">
        <SectionHeader icon={User} title="Personal Details" />

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label>Date of Birth *</Label>
          <div className="grid grid-cols-3 gap-2">
            <Select value={formData.dateOfBirth.day} onValueChange={(v) => handleDOBChange("day", v)}>
              <SelectTrigger><SelectValue placeholder="Day" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {days.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={formData.dateOfBirth.month} onValueChange={(v) => handleDOBChange("month", v)}>
              <SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {months.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={formData.dateOfBirth.year} onValueChange={(v) => handleDOBChange("year", v)}>
              <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {years.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mother Tongue */}
        <div className="space-y-2">
          <Label>Mother Tongue *</Label>
          <Select value={formData.motherTongue} onValueChange={(v) => handleChange("motherTongue", v)}>
            <SelectTrigger><SelectValue placeholder="Select mother tongue" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {formOptionsData.motherTongues.map((lang) => (
                <SelectItem key={lang} value={lang}>{lang}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label>Height *</Label>
          <Select value={formData.height} onValueChange={(v) => handleChange("height", v)}>
            <SelectTrigger><SelectValue placeholder="Select height" /></SelectTrigger>
            <SelectContent className="bg-popover z-50 max-h-60">
              {formOptionsData.heights.map((h) => (
                <SelectItem key={h.value} value={h.value}>
                  {h.value} ({h.cm} cm)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Marital Status */}
        <div className="space-y-2">
          <Label>Marital Status *</Label>
          <RadioGroup value={formData.maritalStatus} onValueChange={(v) => handleChange("maritalStatus", v)} className="grid grid-cols-2 gap-2">
            {formOptionsData.maritalStatuses.map((status) => (
              <div key={status.value} className="flex items-center space-x-2 border border-border rounded-lg p-3">
                <RadioGroupItem value={status.value} id={status.value} />
                <Label htmlFor={status.value} className="cursor-pointer text-sm">{status.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Religion & Caste */}
        <div className="space-y-2">
          <Label>Religion *</Label>
          <Select value={formData.religion} onValueChange={(v) => handleChange("religion", v)}>
            <SelectTrigger><SelectValue placeholder="Select religion" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {religionsData.religions.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.religion && castes.length > 0 && (
          <div className="space-y-2">
            <Label>Caste</Label>
            <Select value={formData.caste} onValueChange={(v) => handleChange("caste", v)}>
              <SelectTrigger><SelectValue placeholder="Select caste" /></SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                {castes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.caste && subcastes.length > 0 && (
          <div className="space-y-2">
            <Label>Sub-caste</Label>
            <Select value={formData.subCaste} onValueChange={(v) => handleChange("subCaste", v)}>
              <SelectTrigger><SelectValue placeholder="Select sub-caste" /></SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                {subcastes.map((sc) => (
                  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Family Status */}
        <div className="space-y-2">
          <Label>Family Status *</Label>
          <RadioGroup value={formData.familyStatus} onValueChange={(v) => handleChange("familyStatus", v)} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {formOptionsData.familyStatuses.map((status) => (
              <div key={status.value} className="flex items-center space-x-2 border border-border rounded-lg p-3">
                <RadioGroupItem value={status.value} id={`family-${status.value}`} />
                <Label htmlFor={`family-${status.value}`} className="cursor-pointer text-sm">{status.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Dosham */}
        <div className="space-y-2">
          <Label>Do you have any Dosham? *</Label>
          <RadioGroup value={formData.doshamKnown} onValueChange={(v) => handleChange("doshamKnown", v)} className="grid grid-cols-3 gap-2">
            {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "dont_know", label: "Don't Know" }].map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2 border border-border rounded-lg p-3">
                <RadioGroupItem value={opt.value} id={`dosham-${opt.value}`} />
                <Label htmlFor={`dosham-${opt.value}`} className="cursor-pointer text-sm">{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {formData.doshamKnown === "yes" && (
          <div className="space-y-2 pl-4 border-l-2 border-primary/30">
            <Label>Select Dosham Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {formOptionsData.doshamOptions.map((dosham) => (
                <div key={dosham.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={dosham.value}
                    checked={formData.doshamTypes.includes(dosham.value)}
                    onCheckedChange={() => handleDoshamToggle(dosham.value)}
                  />
                  <Label htmlFor={dosham.value} className="cursor-pointer text-sm">{dosham.label}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Location Section */}
      <section className="space-y-4">
        <SectionHeader icon={MapPin} title="Location" />

        <div className="space-y-2">
          <Label>Country *</Label>
          <Select value={formData.country} onValueChange={(v) => handleChange("country", v)}>
            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {locationsData.countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.country && states.length > 0 && (
          <div className="space-y-2">
            <Label>State *</Label>
            <Select value={formData.state} onValueChange={(v) => handleChange("state", v)}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {states.map((s) => (
                  <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {formData.state && cities.length > 0 && (
          <div className="space-y-2">
            <Label>City *</Label>
            <Select value={formData.city} onValueChange={(v) => handleChange("city", v)}>
              <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </section>

      {/* Education Section */}
      <section className="space-y-4">
        <SectionHeader icon={GraduationCap} title="Education" />

        <div className="space-y-2">
          <Label>Highest Education *</Label>
          <Select value={formData.educationLevel} onValueChange={(v) => handleChange("educationLevel", v)}>
            <SelectTrigger><SelectValue placeholder="Select education level" /></SelectTrigger>
            <SelectContent className="bg-popover z-50 max-h-60">
              {formOptionsData.educationLevels.map((edu) => (
                <SelectItem key={edu.value} value={edu.value}>{edu.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.educationLevel === "other" && (
          <div className="space-y-2">
            <Label>Please specify *</Label>
            <Input
              placeholder="Enter your education"
              value={formData.educationOther}
              onChange={(e) => handleChange("educationOther", e.target.value)}
            />
          </div>
        )}
      </section>

      {/* Employment Section */}
      <section className="space-y-4">
        <SectionHeader icon={Briefcase} title="Employment" />

        <div className="space-y-2">
          <Label>Employment Type *</Label>
          <Select value={formData.employmentType} onValueChange={(v) => handleChange("employmentType", v)}>
            <SelectTrigger><SelectValue placeholder="Select employment type" /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {formOptionsData.employmentTypes.map((emp) => (
                <SelectItem key={emp.value} value={emp.value}>{emp.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Occupation (Select up to 2)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
            {formOptionsData.occupations.map((occ) => (
              <div key={occ} className="flex items-center space-x-2">
                <Checkbox
                  id={`occ-${occ}`}
                  checked={formData.occupation.includes(occ)}
                  onCheckedChange={() => handleOccupationToggle(occ)}
                />
                <Label htmlFor={`occ-${occ}`} className="cursor-pointer text-xs">{occ}</Label>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Income Section */}
      <section className="space-y-4">
        <SectionHeader icon={DollarSign} title="Annual Income" />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Currency *</Label>
            <Select value={formData.incomeCurrency} onValueChange={(v) => handleChange("incomeCurrency", v)}>
              <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {formOptionsData.currencies.map((cur) => (
                  <SelectItem key={cur.code} value={cur.code}>
                    {cur.symbol} {cur.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Income Range *</Label>
            <Select value={formData.incomeRange} onValueChange={(v) => handleChange("incomeRange", v)}>
              <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {formOptionsData.incomeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full h-12"
        variant="primary"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            Continue to Photo Upload
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
};

export default DetailedRegistrationForm;
