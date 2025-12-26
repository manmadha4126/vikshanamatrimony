import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Save, User, Heart, MapPin, GraduationCap, Users } from "lucide-react";
import {
  profileForOptions,
  genderOptions,
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
} from "@/data/registrationOptions";

interface Profile {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  phone: string;
  gender: string;
  profile_for: string | null;
  email_verified: boolean;
  verification_status: string | null;
  admin_notes: string | null;
  created_at: string;
  date_of_birth: string | null;
  mother_tongue: string | null;
  height: string | null;
  marital_status: string | null;
  religion: string | null;
  caste: string | null;
  sub_caste: string | null;
  gothram: string | null;
  star: string | null;
  dosham: string | null;
  family_status: string | null;
  family_type: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  education: string | null;
  education_detail: string | null;
  employment_type: string | null;
  occupation: string | null;
  company_name: string | null;
  annual_income: string | null;
  photo_url: string | null;
}

interface EditProfileDialogProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export const EditProfileDialog = ({
  profile,
  open,
  onOpenChange,
  onSaved,
}: EditProfileDialogProps) => {
  const [formData, setFormData] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
    }
  }, [profile]);

  const handleChange = (field: keyof Profile, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          profile_for: formData.profile_for,
          date_of_birth: formData.date_of_birth,
          mother_tongue: formData.mother_tongue,
          height: formData.height,
          marital_status: formData.marital_status,
          religion: formData.religion,
          caste: formData.caste,
          sub_caste: formData.sub_caste,
          gothram: formData.gothram,
          star: formData.star,
          dosham: formData.dosham,
          family_status: formData.family_status,
          family_type: formData.family_type,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          education: formData.education,
          education_detail: formData.education_detail,
          employment_type: formData.employment_type,
          occupation: formData.occupation,
          company_name: formData.company_name,
          annual_income: formData.annual_income,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: `Profile ${profile.profile_id || profile.name} has been updated successfully.`,
      });
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-maroon flex items-center gap-2">
            Edit Profile
            {profile.profile_id && (
              <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                {profile.profile_id}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <div className="space-y-6 py-4">
            {/* Basic Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-maroon flex items-center gap-2">
                <User className="w-4 h-4" />
                Basic Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profile For</Label>
                  <Select
                    value={formData.profile_for || ""}
                    onValueChange={(v) => handleChange("profile_for", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {profileForOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(v) => handleChange("gender", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((opt) => (
                        <SelectItem key={opt} value={opt.toLowerCase()}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.date_of_birth || ""}
                    onChange={(e) => handleChange("date_of_birth", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Personal Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-maroon flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Personal Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Mother Tongue</Label>
                  <Select
                    value={formData.mother_tongue || ""}
                    onValueChange={(v) => handleChange("mother_tongue", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {motherTongueOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <Select
                    value={formData.height || ""}
                    onValueChange={(v) => handleChange("height", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {heightOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marital Status</Label>
                  <Select
                    value={formData.marital_status || ""}
                    onValueChange={(v) => handleChange("marital_status", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatusOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Religion & Caste */}
            <div className="space-y-4">
              <h4 className="font-semibold text-maroon flex items-center gap-2">
                <Users className="w-4 h-4" />
                Religion & Caste
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Religion</Label>
                  <Select
                    value={formData.religion || ""}
                    onValueChange={(v) => handleChange("religion", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {religionOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caste">Caste</Label>
                  <Input
                    id="caste"
                    value={formData.caste || ""}
                    onChange={(e) => handleChange("caste", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sub_caste">Sub Caste</Label>
                  <Input
                    id="sub_caste"
                    value={formData.sub_caste || ""}
                    onChange={(e) => handleChange("sub_caste", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gothram">Gothram</Label>
                  <Input
                    id="gothram"
                    value={formData.gothram || ""}
                    onChange={(e) => handleChange("gothram", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Star</Label>
                  <Select
                    value={formData.star || ""}
                    onValueChange={(v) => handleChange("star", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {starOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dosham</Label>
                  <Select
                    value={formData.dosham || ""}
                    onValueChange={(v) => handleChange("dosham", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {doshamOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Family Status</Label>
                  <Select
                    value={formData.family_status || ""}
                    onValueChange={(v) => handleChange("family_status", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyStatusOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Family Type</Label>
                  <Select
                    value={formData.family_type || ""}
                    onValueChange={(v) => handleChange("family_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {familyTypeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-4">
              <h4 className="font-semibold text-maroon flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ""}
                    onChange={(e) => handleChange("country", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select
                    value={formData.state || ""}
                    onValueChange={(v) => handleChange("state", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {stateOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Education & Career */}
            <div className="space-y-4">
              <h4 className="font-semibold text-maroon flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Education & Career
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Education</Label>
                  <Select
                    value={formData.education || ""}
                    onValueChange={(v) => handleChange("education", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education_detail">Education Detail</Label>
                  <Input
                    id="education_detail"
                    value={formData.education_detail || ""}
                    onChange={(e) => handleChange("education_detail", e.target.value)}
                    placeholder="e.g., B.Tech from IIT Delhi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Employment Type</Label>
                  <Select
                    value={formData.employment_type || ""}
                    onValueChange={(v) => handleChange("employment_type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={formData.occupation || ""}
                    onChange={(e) => handleChange("occupation", e.target.value)}
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name || ""}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Annual Income</Label>
                  <Select
                    value={formData.annual_income || ""}
                    onValueChange={(v) => handleChange("annual_income", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
