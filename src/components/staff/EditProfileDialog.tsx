import { useState, useEffect, useRef } from "react";
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
import { Save, User, Heart, MapPin, GraduationCap, Users, Camera, Plus, X, Loader2 } from "lucide-react";
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

interface ProfilePhoto {
  id: string;
  photo_url: string;
  display_order: number;
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
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
      fetchPhotos(profile.id);
    }
  }, [profile]);

  const fetchPhotos = async (profileId: string) => {
    const { data, error } = await supabase
      .from("profile_photos")
      .select("*")
      .eq("profile_id", profileId)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setPhotos(data);
    }
  };

  const handleChange = (field: keyof Profile, value: string | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > 10 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 10MB`,
            variant: "destructive",
          });
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${profile.profile_id}_${Date.now()}_${i}.${fileExt}`;
        const filePath = `photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(filePath);

        const { error: insertError } = await supabase
          .from("profile_photos")
          .insert({
            profile_id: profile.id,
            photo_url: urlData.publicUrl,
            display_order: photos.length + i,
          });

        if (insertError) throw insertError;
      }

      await fetchPhotos(profile.id);
      toast({
        title: "Photos Uploaded",
        description: "Photos have been added successfully.",
      });
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `photos/${fileName}`;

      // Delete from storage
      await supabase.storage.from("profile-photos").remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from("profile_photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast({
        title: "Photo Deleted",
        description: "Photo has been removed.",
      });
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete photo",
        variant: "destructive",
      });
    }
  };

  const handleSetPrimaryPhoto = async (photoUrl: string) => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ photo_url: photoUrl })
        .eq("id", profile.id);

      if (error) throw error;

      setFormData((prev) => ({ ...prev, photo_url: photoUrl }));
      toast({
        title: "Primary Photo Updated",
        description: "This photo is now the primary profile photo.",
      });
    } catch (error: any) {
      console.error("Error setting primary photo:", error);
      toast({
        title: "Error",
        description: "Failed to set primary photo",
        variant: "destructive",
      });
    }
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
            {/* Profile Photos */}
            <div className="space-y-4">
              <h4 className="font-semibold text-maroon flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Profile Photos
              </h4>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.photo_url}
                      alt="Profile"
                      className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-all ${
                        formData.photo_url === photo.photo_url
                          ? "ring-2 ring-primary"
                          : "hover:ring-2 hover:ring-primary/50"
                      }`}
                      onClick={() => handleSetPrimaryPhoto(photo.photo_url)}
                      title="Click to set as primary"
                    />
                    {formData.photo_url === photo.photo_url && (
                      <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1 rounded">
                        Primary
                      </span>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id, photo.photo_url)}
                      className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
                  className={`h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/50 ${
                    uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Add Photo</span>
                    </>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Click on a photo to set it as primary. Max 10MB per photo.
              </p>
            </div>

            <Separator />

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
