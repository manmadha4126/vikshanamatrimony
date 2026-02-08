import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ArrowLeft } from "lucide-react";
import { RegistrationData } from "@/hooks/useRegistration";
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
  incomeOptionsByCountry,
  starOptions,
} from "@/data/registrationOptions";
import { countryOptions, statesByCountry, citiesByState } from "@/data/locationOptions";
import { castesByReligion, subCastesByCaste } from "@/data/casteOptions";

interface PersonalDetailsStepProps {
  formData: RegistrationData;
  updateFormData: (data: Partial<RegistrationData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

// Helper to convert string array to options format
const toOptions = (arr: string[]) => arr.map((item) => ({ value: item, label: item }));

export const PersonalDetailsStep = ({ formData, updateFormData, onSubmit, onBack, isLoading }: PersonalDetailsStepProps) => {
  // Get cascading options based on selections
  const casteOptions = formData.religion ? castesByReligion[formData.religion] || [] : [];
  const subCasteOptions = formData.caste ? subCastesByCaste[formData.caste] || [] : [];
  const stateOptions = formData.country ? statesByCountry[formData.country] || [] : [];
  const cityOptions = formData.state ? citiesByState[formData.state] || [] : [];
  
  // Get income options based on selected country
  const countryIncomeOptions = formData.country 
    ? incomeOptionsByCountry[formData.country] || incomeOptions 
    : incomeOptions;

  // Reset dependent fields when parent changes
  const handleReligionChange = (value: string) => {
    updateFormData({ religion: value, caste: "", subCaste: "" });
  };

  const handleCasteChange = (value: string) => {
    updateFormData({ caste: value, subCaste: "" });
  };

  const handleCountryChange = (value: string) => {
    updateFormData({ country: value, state: "", city: "", annualIncome: "" });
  };

  const handleStateChange = (value: string) => {
    updateFormData({ state: value, city: "" });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Personal Details</h2>
        <p className="text-muted-foreground">Complete your profile information</p>
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Mother Tongue</Label>
              <SearchableSelect
                options={toOptions(motherTongueOptions)}
                value={formData.motherTongue}
                onValueChange={(value) => updateFormData({ motherTongue: value })}
                placeholder="Select mother tongue"
                searchPlaceholder="Search language..."
              />
            </div>

            <div className="space-y-2">
              <Label>Height</Label>
              <SearchableSelect
                options={toOptions(heightOptions)}
                value={formData.height}
                onValueChange={(value) => updateFormData({ height: value })}
                placeholder="Select height"
                searchPlaceholder="Search height..."
              />
            </div>

            <div className="space-y-2">
              <Label>Marital Status</Label>
              <SearchableSelect
                options={toOptions(maritalStatusOptions)}
                value={formData.maritalStatus}
                onValueChange={(value) => updateFormData({ maritalStatus: value })}
                placeholder="Select marital status"
                searchPlaceholder="Search..."
              />
            </div>
          </div>
        </div>

        {/* Religion & Caste */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Religion & Caste</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Religion <span className="text-destructive">*</span></Label>
              <SearchableSelect
                options={toOptions(religionOptions)}
                value={formData.religion}
                onValueChange={handleReligionChange}
                placeholder="Select religion"
                searchPlaceholder="Search religion..."
              />
            </div>

            <div className="space-y-2">
              <Label>Caste</Label>
              <SearchableSelect
                options={toOptions(casteOptions)}
                value={formData.caste}
                onValueChange={handleCasteChange}
                placeholder={formData.religion ? "Select caste" : "Select religion first"}
                searchPlaceholder="Search caste..."
                disabled={!formData.religion}
              />
            </div>

            <div className="space-y-2">
              <Label>Sub Caste</Label>
              <SearchableSelect
                options={toOptions(subCasteOptions)}
                value={formData.subCaste}
                onValueChange={(value) => updateFormData({ subCaste: value })}
                placeholder={formData.caste ? "Select sub caste" : "Select caste first"}
                searchPlaceholder="Search sub caste..."
                disabled={!formData.caste}
              />
            </div>

            <div className="space-y-2">
              <Label>Gothram</Label>
              <Input
                placeholder="Enter gothram"
                value={formData.gothram}
                onChange={(e) => updateFormData({ gothram: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Star (Nakshatra)</Label>
              <SearchableSelect
                options={toOptions(starOptions)}
                value={formData.star}
                onValueChange={(value) => updateFormData({ star: value })}
                placeholder="Select star"
                searchPlaceholder="Search star..."
              />
            </div>

            <div className="space-y-2">
              <Label>Dosham</Label>
              <SearchableSelect
                options={toOptions(doshamOptions)}
                value={formData.dosham}
                onValueChange={(value) => updateFormData({ dosham: value })}
                placeholder="Select dosham"
                searchPlaceholder="Search..."
              />
            </div>
          </div>
        </div>

        {/* Family */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Family Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Family Status</Label>
              <SearchableSelect
                options={toOptions(familyStatusOptions)}
                value={formData.familyStatus}
                onValueChange={(value) => updateFormData({ familyStatus: value })}
                placeholder="Select family status"
                searchPlaceholder="Search..."
              />
            </div>

            <div className="space-y-2">
              <Label>Family Type</Label>
              <SearchableSelect
                options={toOptions(familyTypeOptions)}
                value={formData.familyType}
                onValueChange={(value) => updateFormData({ familyType: value })}
                placeholder="Select family type"
                searchPlaceholder="Search..."
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <SearchableSelect
                options={toOptions(countryOptions)}
                value={formData.country}
                onValueChange={handleCountryChange}
                placeholder="Select country"
                searchPlaceholder="Search country..."
              />
            </div>

            <div className="space-y-2">
              <Label>State</Label>
              <SearchableSelect
                options={toOptions(stateOptions)}
                value={formData.state}
                onValueChange={handleStateChange}
                placeholder={formData.country ? "Select state" : "Select country first"}
                searchPlaceholder="Search state..."
                disabled={!formData.country}
              />
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <SearchableSelect
                options={toOptions(cityOptions)}
                value={formData.city}
                onValueChange={(value) => updateFormData({ city: value })}
                placeholder={formData.state ? "Select city" : "Select state first"}
                searchPlaceholder="Search city..."
                disabled={!formData.state}
              />
            </div>
          </div>
        </div>

        {/* Education & Employment */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Education & Employment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Education</Label>
              <SearchableSelect
                options={toOptions(educationOptions)}
                value={formData.education}
                onValueChange={(value) => updateFormData({ education: value })}
                placeholder="Select education"
                searchPlaceholder="Search education..."
              />
            </div>

            <div className="space-y-2">
              <Label>Education Details</Label>
              <Input
                placeholder="E.g., B.Tech in Computer Science"
                value={formData.educationDetail}
                onChange={(e) => updateFormData({ educationDetail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Employment Type</Label>
              <SearchableSelect
                options={toOptions(employmentOptions)}
                value={formData.employmentType}
                onValueChange={(value) => updateFormData({ employmentType: value })}
                placeholder="Select employment type"
                searchPlaceholder="Search..."
              />
            </div>

            <div className="space-y-2">
              <Label>Occupation</Label>
              <Input
                placeholder="Enter occupation"
                value={formData.occupation}
                onChange={(e) => updateFormData({ occupation: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                placeholder="Enter company name"
                value={formData.companyName}
                onChange={(e) => updateFormData({ companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Annual Income {formData.country && formData.country !== "India" && <span className="text-xs text-muted-foreground">({formData.country} Currency)</span>}</Label>
              <SearchableSelect
                options={toOptions(countryIncomeOptions)}
                value={formData.annualIncome}
                onValueChange={(value) => updateFormData({ annualIncome: value })}
                placeholder={formData.country ? "Select income range" : "Select country first for currency"}
                searchPlaceholder="Search..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onSubmit} disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};
