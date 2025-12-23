import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import EmailOTPStep from "@/components/register-v2/EmailOTPStep";
import CreatePasswordStep from "@/components/register-v2/CreatePasswordStep";
import DetailedRegistrationForm from "@/components/register-v2/DetailedRegistrationForm";
import PhotoUploadStep from "@/components/register-v2/PhotoUploadStep";
import ProfileSummary from "@/components/register-v2/ProfileSummary";

type Step = "email" | "password" | "details" | "photo" | "summary";

const RegisterV2 = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [profileId, setProfileId] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const steps: Step[] = ["email", "password", "details", "photo", "summary"];
  const stepIndex = steps.indexOf(currentStep);

  const goBack = () => {
    if (stepIndex > 0 && currentStep !== "summary") {
      setCurrentStep(steps[stepIndex - 1]);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-1">
            {steps.slice(0, -1).map((_, i) => (
              <div key={i} className={`h-1.5 w-8 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          <div className="w-10" />
        </div>

        {/* Content Card */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-6">
          {currentStep === "email" && (
            <EmailOTPStep onComplete={({ email, profileId }) => { setEmail(email); setProfileId(profileId); setCurrentStep("password"); }} />
          )}
          {currentStep === "password" && (
            <CreatePasswordStep onComplete={() => setCurrentStep("details")} />
          )}
          {currentStep === "details" && (
            <DetailedRegistrationForm onComplete={(data) => { setProfileData(data); setCurrentStep("photo"); }} />
          )}
          {currentStep === "photo" && (
            <PhotoUploadStep onComplete={(url) => { setPhotoUrl(url); setCurrentStep("summary"); }} onSkip={() => setCurrentStep("summary")} />
          )}
          {currentStep === "summary" && (
            <ProfileSummary profileData={profileData} photoUrl={photoUrl} />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterV2;
