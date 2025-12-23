import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { RegistrationData } from "@/hooks/useRegistration";
import { profileForOptions, genderOptions } from "@/data/registrationOptions";

interface BasicDetailsStepProps {
  formData: RegistrationData;
  updateFormData: (data: Partial<RegistrationData>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const BasicDetailsStep = ({ formData, updateFormData, onSubmit, isLoading }: BasicDetailsStepProps) => {
  const isValid = formData.name && formData.profileFor && formData.gender && formData.email && formData.phone;

  const profileForSelectOptions = profileForOptions.map((option) => ({ value: option, label: option }));
  const genderSelectOptions = genderOptions.map((option) => ({ value: option, label: option }));

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Basic Details</h2>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profileFor">Profile For *</Label>
          <SearchableSelect
            options={profileForSelectOptions}
            value={formData.profileFor}
            onValueChange={(value) => updateFormData({ profileFor: value })}
            placeholder="Select profile for"
            searchPlaceholder="Search..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <SearchableSelect
            options={genderSelectOptions}
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value })}
            placeholder="Select gender"
            searchPlaceholder="Search..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={onSubmit} disabled={!isValid || isLoading} className="w-full">
        {isLoading ? "Saving..." : "Continue"}
      </Button>
    </div>
  );
};
