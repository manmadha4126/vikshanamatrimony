import { useRegistration } from "@/hooks/useRegistration";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StepIndicator } from "@/components/register/StepIndicator";
import { BasicDetailsStep } from "@/components/register/BasicDetailsStep";
import { PasswordStep } from "@/components/register/PasswordStep";
import { PersonalDetailsStep } from "@/components/register/PersonalDetailsStep";
import { PhotoUploadStep } from "@/components/register/PhotoUploadStep";
import { ProfileSummary } from "@/components/register/ProfileSummary";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const stepLabels = [
  "Basic Details",
  "Password",
  "Personal Details",
  "Photo",
  "Summary"
];

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromStaff = searchParams.get("from") === "staff";

  const {
    currentStep,
    formData,
    isLoading,
    profileId,
    updateFormData,
    prevStep,
    nextStep,
    submitBasicDetails,
    submitPassword,
    submitPersonalDetails,
    uploadPhoto,
    completeRegistration,
  } = useRegistration();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={submitBasicDetails}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <PasswordStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={submitPassword}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <PersonalDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={submitPersonalDetails}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );
      case 4:
        return (
          <PhotoUploadStep
            onUpload={uploadPhoto}
            onBack={prevStep}
            onSkip={nextStep}
            isLoading={isLoading}
          />
        );
      case 5:
        return (
          <ProfileSummary
            formData={formData}
            profileId={profileId}
            onComplete={completeRegistration}
            isLoading={isLoading}
            fromStaff={fromStaff}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl mx-auto px-4 py-8">
        {fromStaff && (
          <Button
            variant="ghost"
            className="mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/staff-dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff Dashboard
          </Button>
        )}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={5}
          stepLabels={stepLabels}
        />
        <div className="bg-card rounded-lg border shadow-sm p-6">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default Register;
