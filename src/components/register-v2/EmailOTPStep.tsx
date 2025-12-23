import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailOTPStepProps {
  onComplete: (data: { email: string; profileId: string }) => void;
}

const EmailOTPStep = ({ onComplete }: EmailOTPStepProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [profileFor, setProfileFor] = useState("myself");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if profile exists or create new one
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      let profileId: string;

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ name, gender, phone, profile_for: profileFor })
          .eq("id", existingProfile.id);

        if (updateError) throw updateError;
        profileId = existingProfile.id;
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert({ email, name, gender, phone, profile_for: profileFor })
          .select("id")
          .single();

        if (insertError) throw insertError;
        profileId = newProfile.id;
      }

      toast({
        title: "Profile Created!",
        description: "Proceeding to the next step.",
      });
      
      onComplete({ email, profileId });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Basic Details
        </h2>
        <p className="text-muted-foreground">
          Let's start with your basic information
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label>Gender *</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === "male"}
                onChange={(e) => setGender(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === "female"}
                onChange={(e) => setGender(e.target.value)}
                className="w-4 h-4 text-primary"
              />
              <span>Female</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Profile For *</Label>
          <select
            value={profileFor}
            onChange={(e) => setProfileFor(e.target.value)}
            className="w-full h-12 px-3 rounded-md border border-input bg-background text-foreground"
          >
            <option value="myself">Myself</option>
            <option value="son">Son</option>
            <option value="daughter">Daughter</option>
            <option value="brother">Brother</option>
            <option value="sister">Sister</option>
            <option value="relative">Relative</option>
            <option value="friend">Friend</option>
          </select>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !email || !name || !phone}
          className="w-full h-12"
          variant="primary"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Profile...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailOTPStep;
