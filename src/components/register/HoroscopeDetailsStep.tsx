import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ArrowLeft, Star, Upload, FileText, Check } from "lucide-react";
import { RegistrationData } from "@/hooks/useRegistration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { stateOptions } from "@/data/registrationOptions";
import { citiesByState } from "@/data/locationOptions";

interface HoroscopeDetailsStepProps {
  formData: RegistrationData;
  updateFormData: (data: Partial<RegistrationData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
  profileId: string | null;
}

const toOptions = (arr: string[]) => arr.map((item) => ({ value: item, label: item }));

const countryOptions = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "United Arab Emirates",
  "Singapore",
  "Malaysia",
  "Germany",
  "New Zealand",
  "Other",
];

const timeOfBirthOptions = [
  "12:00 AM - 01:00 AM",
  "01:00 AM - 02:00 AM",
  "02:00 AM - 03:00 AM",
  "03:00 AM - 04:00 AM",
  "04:00 AM - 05:00 AM",
  "05:00 AM - 06:00 AM",
  "06:00 AM - 07:00 AM",
  "07:00 AM - 08:00 AM",
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM",
  "10:00 PM - 11:00 PM",
  "11:00 PM - 12:00 AM",
  "Don't Know",
];

const chartStyleOptions = [
  "North Indian",
  "South Indian",
  "East Indian",
  "Bengali",
  "Kerala",
  "Tamil",
  "Telugu",
  "Kannada",
  "Other",
];

const horoscopeLanguageOptions = [
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Hindi",
  "English",
  "Sanskrit",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Other",
];

export const HoroscopeDetailsStep = ({
  formData,
  updateFormData,
  onSubmit,
  onBack,
  isLoading,
  profileId,
}: HoroscopeDetailsStepProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(formData.horoscopeUrl || null);

  const availableBirthCities = formData.birthState ? citiesByState[formData.birthState] || [] : [];

  const handleHoroscopeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or image file (JPG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profileId}/horoscope-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("horoscopes")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("horoscopes")
        .getPublicUrl(fileName);

      setUploadedFile(urlData.publicUrl);
      updateFormData({ horoscopeUrl: urlData.publicUrl });
      toast.success("Horoscope uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload horoscope");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
          <Star className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Horoscope Details</h2>
        <p className="text-sm text-muted-foreground mt-1">Fill in your birth details for horoscope</p>
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Note: Date of Birth has been captured in the previous step. These details help generate an accurate horoscope.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Time of Birth (HH:MM:SS AM/PM)</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="text"
                inputMode="numeric"
                value={(() => {
                  const parts = formData.timeOfBirth?.replace(/ (AM|PM)$/i, '').split(':') || [];
                  return parts[0] || '';
                })()}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  const timePart = formData.timeOfBirth?.replace(/ (AM|PM)$/i, '') || '';
                  const parts = timePart.split(':');
                  const period = formData.timeOfBirth?.match(/(AM|PM)$/i)?.[0] || 'AM';
                  const mm = parts[1] || '00';
                  const ss = parts[2] || '00';
                  updateFormData({ timeOfBirth: `${val}:${mm}:${ss} ${period}` });
                }}
                placeholder="HH"
                className="h-10 w-16 text-center"
                maxLength={2}
              />
              <span className="text-muted-foreground font-medium">:</span>
              <Input
                type="text"
                inputMode="numeric"
                value={(() => {
                  const parts = formData.timeOfBirth?.replace(/ (AM|PM)$/i, '').split(':') || [];
                  return parts[1] || '';
                })()}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  const timePart = formData.timeOfBirth?.replace(/ (AM|PM)$/i, '') || '';
                  const parts = timePart.split(':');
                  const period = formData.timeOfBirth?.match(/(AM|PM)$/i)?.[0] || 'AM';
                  const hh = parts[0] || '00';
                  const ss = parts[2] || '00';
                  updateFormData({ timeOfBirth: `${hh}:${val}:${ss} ${period}` });
                }}
                placeholder="MM"
                className="h-10 w-16 text-center"
                maxLength={2}
              />
              <span className="text-muted-foreground font-medium">:</span>
              <Input
                type="text"
                inputMode="numeric"
                value={(() => {
                  const parts = formData.timeOfBirth?.replace(/ (AM|PM)$/i, '').split(':') || [];
                  return parts[2] || '';
                })()}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  const timePart = formData.timeOfBirth?.replace(/ (AM|PM)$/i, '') || '';
                  const parts = timePart.split(':');
                  const period = formData.timeOfBirth?.match(/(AM|PM)$/i)?.[0] || 'AM';
                  const hh = parts[0] || '00';
                  const mm = parts[1] || '00';
                  updateFormData({ timeOfBirth: `${hh}:${mm}:${val} ${period}` });
                }}
                placeholder="SS"
                className="h-10 w-16 text-center"
                maxLength={2}
              />
              <select
                value={formData.timeOfBirth?.match(/(AM|PM)$/i)?.[0]?.toUpperCase() || 'AM'}
                onChange={(e) => {
                  const timePart = formData.timeOfBirth?.replace(/ (AM|PM)$/i, '') || '00:00:00';
                  updateFormData({ timeOfBirth: `${timePart} ${e.target.value}` });
                }}
                className="h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Country of Birth</Label>
            <SearchableSelect
              options={toOptions(countryOptions)}
              value={formData.birthCountry}
              onValueChange={(value) => updateFormData({ birthCountry: value })}
              placeholder="Select country"
              searchPlaceholder="Search country..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">State of Birth</Label>
            <SearchableSelect
              options={toOptions(stateOptions)}
              value={formData.birthState}
              onValueChange={(value) => updateFormData({ birthState: value, birthCity: "" })}
              placeholder="Select state"
              searchPlaceholder="Search state..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">City of Birth</Label>
            <SearchableSelect
              options={toOptions(availableBirthCities)}
              value={formData.birthCity}
              onValueChange={(value) => updateFormData({ birthCity: value })}
              placeholder="Select city"
              searchPlaceholder="Search city..."
              disabled={!formData.birthState}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Chart Style</Label>
            <SearchableSelect
              options={toOptions(chartStyleOptions)}
              value={formData.chartStyle}
              onValueChange={(value) => updateFormData({ chartStyle: value })}
              placeholder="Select chart style"
              searchPlaceholder="Search style..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Language</Label>
            <SearchableSelect
              options={toOptions(horoscopeLanguageOptions)}
              value={formData.horoscopeLanguage}
              onValueChange={(value) => updateFormData({ horoscopeLanguage: value })}
              placeholder="Select language"
              searchPlaceholder="Search language..."
            />
          </div>
        </div>

        {/* Horoscope Upload Section */}
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-center text-muted-foreground mb-4">
            Or upload a scanned copy of your Horoscope
          </p>
          
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/20">
            {uploadedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Horoscope Uploaded</p>
                  <p className="text-xs text-muted-foreground">File uploaded successfully</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadedFile(null);
                    updateFormData({ horoscopeUrl: "" });
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium mb-1">Upload Horoscope</p>
                <p className="text-xs text-muted-foreground mb-3">PDF, JPG, or PNG (max 5MB)</p>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleHoroscopeUpload}
                  disabled={isUploading}
                  className="max-w-xs mx-auto text-sm"
                />
                {isUploading && (
                  <p className="text-xs text-primary mt-2">Uploading...</p>
                )}
              </>
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
