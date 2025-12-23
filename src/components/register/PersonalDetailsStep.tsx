import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export const PersonalDetailsStep = ({ formData, updateFormData, onSubmit, onBack, isLoading }: PersonalDetailsStepProps) => {
  // Get cascading options based on selections
  const casteOptions = formData.religion ? castesByReligion[formData.religion] || [] : [];
  const subCasteOptions = formData.caste ? subCastesByCaste[formData.caste] || [] : [];
  const stateOptions = formData.country ? statesByCountry[formData.country] || [] : [];
  const cityOptions = formData.state ? citiesByState[formData.state] || [] : [];

  // Reset dependent fields when parent changes
  const handleReligionChange = (value: string) => {
    updateFormData({ religion: value, caste: "", subCaste: "" });
  };

  const handleCasteChange = (value: string) => {
    updateFormData({ caste: value, subCaste: "" });
  };

  const handleCountryChange = (value: string) => {
    updateFormData({ country: value, state: "", city: "" });
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
              <Select value={formData.motherTongue} onValueChange={(value) => updateFormData({ motherTongue: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mother tongue" />
                </SelectTrigger>
                <SelectContent>
                  {motherTongueOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Height</Label>
              <Select value={formData.height} onValueChange={(value) => updateFormData({ height: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select height" />
                </SelectTrigger>
                <SelectContent>
                  {heightOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Marital Status</Label>
              <Select value={formData.maritalStatus} onValueChange={(value) => updateFormData({ maritalStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  {maritalStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Religion & Caste */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Religion & Caste</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Religion <span className="text-destructive">*</span></Label>
              <Select value={formData.religion} onValueChange={handleReligionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  {religionOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Caste</Label>
              <Select 
                value={formData.caste} 
                onValueChange={handleCasteChange}
                disabled={!formData.religion}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.religion ? "Select caste" : "Select religion first"} />
                </SelectTrigger>
                <SelectContent>
                  {casteOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sub Caste</Label>
              <Select 
                value={formData.subCaste} 
                onValueChange={(value) => updateFormData({ subCaste: value })}
                disabled={!formData.caste}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.caste ? "Select sub caste" : "Select caste first"} />
                </SelectTrigger>
                <SelectContent>
                  {subCasteOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={formData.star} onValueChange={(value) => updateFormData({ star: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select star" />
                </SelectTrigger>
                <SelectContent>
                  {starOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dosham</Label>
              <Select value={formData.dosham} onValueChange={(value) => updateFormData({ dosham: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dosham" />
                </SelectTrigger>
                <SelectContent>
                  {doshamOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Family */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Family Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Family Status</Label>
              <Select value={formData.familyStatus} onValueChange={(value) => updateFormData({ familyStatus: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select family status" />
                </SelectTrigger>
                <SelectContent>
                  {familyStatusOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Family Type</Label>
              <Select value={formData.familyType} onValueChange={(value) => updateFormData({ familyType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select family type" />
                </SelectTrigger>
                <SelectContent>
                  {familyTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={formData.country} onValueChange={handleCountryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>State</Label>
              <Select 
                value={formData.state} 
                onValueChange={handleStateChange}
                disabled={!formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.country ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Select 
                value={formData.city} 
                onValueChange={(value) => updateFormData({ city: value })}
                disabled={!formData.state}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.state ? "Select city" : "Select state first"} />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Education & Employment */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Education & Employment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Education</Label>
              <Select value={formData.education} onValueChange={(value) => updateFormData({ education: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select education" />
                </SelectTrigger>
                <SelectContent>
                  {educationOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Select value={formData.employmentType} onValueChange={(value) => updateFormData({ employmentType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {employmentOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Annual Income</Label>
              <Select value={formData.annualIncome} onValueChange={(value) => updateFormData({ annualIncome: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  {incomeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
