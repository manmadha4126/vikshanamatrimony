import { useRegistration } from "@/hooks/useRegistration";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StepIndicator } from "@/components/register/StepIndicator";
import { BasicDetailsStep } from "@/components/register/BasicDetailsStep";
import { PasswordStep } from "@/components/register/PasswordStep";
import { PersonalDetailsStep } from "@/components/register/PersonalDetailsStep";
import { FamilyDetailsStep } from "@/components/register/FamilyDetailsStep";
import { HoroscopeDetailsStep } from "@/components/register/HoroscopeDetailsStep";
import { PhotoUploadStep } from "@/components/register/PhotoUploadStep";
import { ProfileSummary } from "@/components/register/ProfileSummary";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const stepLabels = [
  "Basic",
  "Password",
  "Personal",
  "Family",
  "Horoscope",
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
    submitFamilyDetails,
    submitHoroscopeDetails,
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
          <FamilyDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={submitFamilyDetails}
            onBack={prevStep}
            isLoading={isLoading}
          />
        );
      case 5:
        return (
          <HoroscopeDetailsStep
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={submitHoroscopeDetails}
            onBack={prevStep}
            isLoading={isLoading}
            profileId={profileId}
          />
        );
      case 6:
        return (
          <PhotoUploadStep
            onUpload={uploadPhoto}
            onBack={prevStep}
            onSkip={nextStep}
            isLoading={isLoading}
          />
        );
      case 7:
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
      <main className="container max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8 sm:h-9"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Home
          </Button>
          {fromStaff && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8 sm:h-9"
              onClick={() => navigate("/staff-dashboard")}
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Staff Dashboard
            </Button>
          )}
        </div>
        <StepIndicator
          currentStep={currentStep}
          totalSteps={7}
          stepLabels={stepLabels}
        />
        <div className="bg-card rounded-lg border shadow-sm p-4 sm:p-6">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default Register;
