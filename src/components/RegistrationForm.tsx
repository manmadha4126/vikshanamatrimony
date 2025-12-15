import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    profileFor: "",
    gender: "",
    email: "",
    phone: "",
  });

  const profileForOptions = [
    { value: "myself", label: "Myself" },
    { value: "daughter", label: "Daughter" },
    { value: "son", label: "Son" },
    { value: "sister", label: "Sister" },
    { value: "brother", label: "Brother" },
    { value: "relative", label: "Relative" },
    { value: "friend", label: "Friend" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!formData.name || !formData.profileFor || !formData.gender || !formData.email || !formData.phone) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required for registration.",
        variant: "destructive",
      });
      return;
    }

    // Navigate to verification page with form data
    navigate("/verification", { state: formData });
  };

  return (
    <div id="register" className="bg-card rounded-xl shadow-card p-6 border border-border/50">
      <div className="text-center mb-4">
        <h3 className="font-display text-xl font-bold text-foreground">
          Begin Your Journey
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Register now to find your perfect match
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-medium">
            Profile Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profileFor" className="text-xs font-medium">
            Profile Created for
          </Label>
          <Select 
            value={formData.profileFor} 
            onValueChange={(value) => setFormData({ ...formData, profileFor: value })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select profile created for" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {profileForOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender" className="text-xs font-medium">
            Gender
          </Label>
          <Select 
            value={formData.gender} 
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="h-10"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="h-10"
          />
        </div>

        <Button type="submit" variant="primary" size="default" className="w-full">
          Register Now
        </Button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        <Button type="button" variant="outline" size="default" className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;
