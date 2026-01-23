import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ArrowLeft, Users } from "lucide-react";
import { RegistrationData } from "@/hooks/useRegistration";
import { occupationOptions } from "@/data/registrationOptions";

interface FamilyDetailsStepProps {
  formData: RegistrationData;
  updateFormData: (data: Partial<RegistrationData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const toOptions = (arr: string[]) => arr.map((item) => ({ value: item, label: item }));

const siblingsOptions = [
  "No Siblings",
  "1 Brother",
  "2 Brothers",
  "3 Brothers",
  "1 Sister",
  "2 Sisters",
  "3 Sisters",
  "1 Brother, 1 Sister",
  "1 Brother, 2 Sisters",
  "2 Brothers, 1 Sister",
  "2 Brothers, 2 Sisters",
  "1 Brother, 3 Sisters",
  "3 Brothers, 1 Sister",
  "Other",
];

export const FamilyDetailsStep = ({ 
  formData, 
  updateFormData, 
  onSubmit, 
  onBack, 
  isLoading 
}: FamilyDetailsStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Family Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Tell us about your family</p>
      </div>

      <div className="space-y-6">
        {/* Father's Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Father's Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Father's Name</Label>
              <Input
                placeholder="Enter father's name"
                value={formData.fatherName}
                onChange={(e) => updateFormData({ fatherName: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Father's Occupation</Label>
              <SearchableSelect
                options={toOptions(occupationOptions)}
                value={formData.fatherOccupation}
                onValueChange={(value) => updateFormData({ fatherOccupation: value })}
                placeholder="Select occupation"
                searchPlaceholder="Search occupation..."
              />
            </div>
          </div>
        </div>

        {/* Mother's Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Mother's Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Mother's Name</Label>
              <Input
                placeholder="Enter mother's name"
                value={formData.motherName}
                onChange={(e) => updateFormData({ motherName: e.target.value })}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Mother's Occupation</Label>
              <SearchableSelect
                options={toOptions(occupationOptions)}
                value={formData.motherOccupation}
                onValueChange={(value) => updateFormData({ motherOccupation: value })}
                placeholder="Select occupation"
                searchPlaceholder="Search occupation..."
              />
            </div>
          </div>
        </div>

        {/* Siblings Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-base sm:text-lg border-b pb-2">Siblings Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Siblings</Label>
              <SearchableSelect
                options={toOptions(siblingsOptions)}
                value={formData.siblings}
                onValueChange={(value) => updateFormData({ siblings: value })}
                placeholder="Select siblings"
                searchPlaceholder="Search..."
              />
            </div>

            {formData.siblings && formData.siblings !== "No Siblings" && (
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm">Siblings Details (Names & Occupations)</Label>
                <Input
                  placeholder="E.g., Brother - Ram (Software Engineer), Sister - Priya (Doctor)"
                  value={formData.siblingsDetails}
                  onChange={(e) => updateFormData({ siblingsDetails: e.target.value })}
                  className="h-10"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          onClick={onBack} 
          className="flex-1 h-11 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={onSubmit} 
          disabled={isLoading} 
          className="flex-1 h-11 text-sm"
        >
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};
