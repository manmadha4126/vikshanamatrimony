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
    <div id="register" className="bg-card rounded-xl shadow-card p-8 border border-border/50">
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl font-bold text-foreground">
          Begin Your Journey
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Register now to find your perfect match
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Profile Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Profile Created for
          </Label>
          <div className="grid grid-cols-4 gap-2">
            {profileForOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, profileFor: option.value })}
                className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                  formData.profileFor === option.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium">
            Gender
          </Label>
          <Select 
            value={formData.gender} 
            onValueChange={(value) => setFormData({ ...formData, gender: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="h-12"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full">
          Register Now
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        <Button type="button" variant="outline" size="lg" className="w-full">
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;
