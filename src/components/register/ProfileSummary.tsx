import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, User, Briefcase, MapPin, GraduationCap, Heart } from "lucide-react";
import { RegistrationData } from "@/hooks/useRegistration";
import { useNavigate } from "react-router-dom";

interface ProfileSummaryProps {
  formData: RegistrationData;
  profileId: string | null;
  onComplete: () => void;
  isLoading: boolean;
  fromStaff?: boolean;
}

export const ProfileSummary = ({ formData, profileId, onComplete, isLoading, fromStaff }: ProfileSummaryProps) => {
  const navigate = useNavigate();

  const handleComplete = async () => {
    await onComplete();
    if (fromStaff) {
      navigate("/staff-dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Profile Summary</h2>
        <p className="text-muted-foreground">Review your profile details</p>
        {profileId && (
          <p className="text-primary font-semibold mt-2">Profile ID: {profileId}</p>
        )}
      </div>

      <div className="space-y-4">
        {/* Profile Photo & Basic Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{formData.name}</h3>
                <p className="text-muted-foreground">{formData.email}</p>
                <p className="text-muted-foreground">{formData.phone}</p>
                <p className="text-sm text-muted-foreground">Profile for: {formData.profileFor}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Personal Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <span className="ml-2">{formData.gender}</span>
              </div>
              <div>
                <span className="text-muted-foreground">DOB:</span>
                <span className="ml-2">{formData.dateOfBirth || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Height:</span>
                <span className="ml-2">{formData.height || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Marital Status:</span>
                <span className="ml-2">{formData.maritalStatus || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mother Tongue:</span>
                <span className="ml-2">{formData.motherTongue || "Not specified"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Religion & Caste */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Religion & Caste</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Religion:</span>
                <span className="ml-2">{formData.religion || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Caste:</span>
                <span className="ml-2">{formData.caste || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gothram:</span>
                <span className="ml-2">{formData.gothram || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Star:</span>
                <span className="ml-2">{formData.star || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dosham:</span>
                <span className="ml-2">{formData.dosham || "Not specified"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Location</h3>
            </div>
            <p className="text-sm">
              {[formData.city, formData.state, formData.country].filter(Boolean).join(", ") || "Not specified"}
            </p>
          </CardContent>
        </Card>

        {/* Education & Career */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Education & Career</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Education:</span>
                <span className="ml-2">{formData.education || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Details:</span>
                <span className="ml-2">{formData.educationDetail || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Employment:</span>
                <span className="ml-2">{formData.employmentType || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Occupation:</span>
                <span className="ml-2">{formData.occupation || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Company:</span>
                <span className="ml-2">{formData.companyName || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Income:</span>
                <span className="ml-2">{formData.annualIncome || "Not specified"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={handleComplete} disabled={isLoading} className="w-full" size="lg">
        {isLoading ? "Completing..." : "Complete Registration"}
      </Button>
    </div>
  );
};
