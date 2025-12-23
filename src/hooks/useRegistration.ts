import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RegistrationData {
  // Basic Details
  name: string;
  profileFor: string;
  gender: string;
  email: string;
  phone: string;
  
  // Password
  password: string;
  
  // Personal Details
  dateOfBirth: string;
  motherTongue: string;
  height: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  subCaste: string;
  gothram: string;
  star: string;
  dosham: string;
  familyStatus: string;
  familyType: string;
  
  // Location
  country: string;
  state: string;
  city: string;
  
  // Education & Employment
  education: string;
  educationDetail: string;
  employmentType: string;
  occupation: string;
  companyName: string;
  annualIncome: string;
  
  // Photo
  photoUrl: string;
}

const initialData: RegistrationData = {
  name: "",
  profileFor: "",
  gender: "",
  email: "",
  phone: "",
  password: "",
  dateOfBirth: "",
  motherTongue: "",
  height: "",
  maritalStatus: "",
  religion: "",
  caste: "",
  subCaste: "",
  gothram: "",
  star: "",
  dosham: "",
  familyStatus: "",
  familyType: "",
  country: "India",
  state: "",
  city: "",
  education: "",
  educationDetail: "",
  employmentType: "",
  occupation: "",
  companyName: "",
  annualIncome: "",
  photoUrl: "",
};

export const useRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const updateFormData = (data: Partial<RegistrationData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitBasicDetails = async () => {
    setIsLoading(true);
    try {
      // Generate profile ID
      const { data: profileIdData, error: profileIdError } = await supabase
        .rpc('generate_profile_id', { p_gender: formData.gender });
      
      if (profileIdError) throw profileIdError;
      
      const newProfileId = profileIdData as string;
      setProfileId(newProfileId);

      // Insert basic profile
      const { error } = await supabase.from("profiles").insert({
        profile_id: newProfileId,
        name: formData.name,
        profile_for: formData.profileFor,
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        registration_step: 1,
      });

      if (error) throw error;
      
      toast.success("Basic details saved!");
      nextStep();
    } catch (error: any) {
      toast.error(error.message || "Failed to save basic details");
    } finally {
      setIsLoading(false);
    }
  };

  const submitPassword = async () => {
    setIsLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // Update profile with user_id
      if (authData.user && profileId) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ 
            user_id: authData.user.id,
            registration_step: 2 
          })
          .eq("profile_id", profileId);

        if (updateError) throw updateError;
      }

      toast.success("Account created successfully!");
      nextStep();
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const submitPersonalDetails = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          date_of_birth: formData.dateOfBirth || null,
          mother_tongue: formData.motherTongue,
          height: formData.height,
          marital_status: formData.maritalStatus,
          religion: formData.religion,
          caste: formData.caste,
          sub_caste: formData.subCaste,
          gothram: formData.gothram,
          star: formData.star,
          dosham: formData.dosham,
          family_status: formData.familyStatus,
          family_type: formData.familyType,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          education: formData.education,
          education_detail: formData.educationDetail,
          employment_type: formData.employmentType,
          occupation: formData.occupation,
          company_name: formData.companyName,
          annual_income: formData.annualIncome,
          registration_step: 3,
        })
        .eq("profile_id", profileId);

      if (error) throw error;
      
      toast.success("Personal details saved!");
      nextStep();
    } catch (error: any) {
      toast.error(error.message || "Failed to save personal details");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setIsLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profileId}.${fileExt}`;
      const filePath = `photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      const photoUrl = urlData.publicUrl;
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ 
          photo_url: photoUrl,
          registration_step: 4 
        })
        .eq("profile_id", profileId);

      if (updateError) throw updateError;

      updateFormData({ photoUrl });
      toast.success("Photo uploaded successfully!");
      nextStep();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setIsLoading(false);
    }
  };

  const completeRegistration = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_complete: true,
          registration_step: 5 
        })
        .eq("profile_id", profileId);

      if (error) throw error;
      
      toast.success("Registration completed successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete registration");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentStep,
    formData,
    isLoading,
    profileId,
    updateFormData,
    nextStep,
    prevStep,
    submitBasicDetails,
    submitPassword,
    submitPersonalDetails,
    uploadPhoto,
    completeRegistration,
    setCurrentStep,
  };
};
