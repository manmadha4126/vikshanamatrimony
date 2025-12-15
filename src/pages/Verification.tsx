import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, User, Phone, CheckCircle, Lock, Eye, EyeOff } from "lucide-react";

interface RegistrationData {
  name: string;
  gender: string;
  email: string;
  phone: string;
}

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const data = location.state as RegistrationData;
    if (!data || !data.email) {
      navigate("/");
      return;
    }
    setRegistrationData(data);
    // Send OTP automatically when page loads
    sendOtp(data.email, data.name, data.gender, data.phone);
  }, [location.state, navigate]);

  const sendOtp = async (email: string, name: string, gender: string, phone: string) => {
    setIsSendingOtp(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: { email, name, gender, phone },
      });

      if (error) throw error;

      if (data?.profileId) {
        setProfileId(data.profileId);
      }

      toast({
        title: "OTP Sent!",
        description: `A verification code has been sent to ${email}`,
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-email-otp", {
        body: { 
          email: registrationData?.email, 
          otp,
          profileId 
        },
      });

      if (error) throw error;

      if (data?.verified) {
        setIsEmailVerified(true);
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified. Now create your password.",
        });
      } else {
        toast({
          title: "Invalid OTP",
          description: "The OTP you entered is incorrect or has expired",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Verification Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async () => {
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please ensure both passwords are the same",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registrationData!.email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name: registrationData!.name,
            gender: registrationData!.gender,
            phone: registrationData!.phone,
          }
        }
      });

      if (authError) throw authError;

      // Update the profile with the user_id
      if (authData.user && profileId) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ user_id: authData.user.id })
          .eq("id", profileId);

        if (updateError) {
          console.error("Error updating profile:", updateError);
        }
      }

      toast({
        title: "Account Created Successfully!",
        description: "Welcome to Lakshmi Matrimony. You can now login.",
      });

      navigate("/login");
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        title: "Account Creation Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = () => {
    if (registrationData) {
      sendOtp(registrationData.email, registrationData.name, registrationData.gender, registrationData.phone);
    }
  };

  if (!registrationData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-border/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            {isEmailVerified ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <Mail className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="font-display text-2xl">
            {isEmailVerified ? "Create Your Password" : "Verify Your Email"}
          </CardTitle>
          <CardDescription>
            {isEmailVerified 
              ? "Set a secure password for your account"
              : "We've sent a verification code to your email"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* User Details Display */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm text-foreground mb-3">Your Details</h4>
            
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Profile Name</p>
                <p className="text-sm font-medium">{registrationData.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Gender</p>
                <p className="text-sm font-medium capitalize">{registrationData.gender}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-medium">{registrationData.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{registrationData.email}</p>
              </div>
            </div>
          </div>

          {!isEmailVerified ? (
            <>
              {/* OTP Input */}
              <div className="space-y-3">
                <Label htmlFor="otp" className="text-sm font-medium">
                  Enter 6-digit OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="h-12 text-center text-lg tracking-widest"
                />
              </div>

              <Button 
                onClick={verifyOtp} 
                disabled={isLoading || otp.length !== 6}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>

              <div className="text-center">
                <button
                  onClick={resendOtp}
                  disabled={isSendingOtp}
                  className="text-sm text-primary hover:underline disabled:opacity-50"
                >
                  {isSendingOtp ? "Sending..." : "Didn't receive OTP? Resend"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Password Creation */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Create Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                onClick={createAccount} 
                disabled={isLoading || password.length < 6}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </>
          )}

          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Verification;
