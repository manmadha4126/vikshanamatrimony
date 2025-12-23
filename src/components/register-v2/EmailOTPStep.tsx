import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailOTPStepProps {
  onComplete: (data: { email: string; profileId: string }) => void;
}

const EmailOTPStep = ({ onComplete }: EmailOTPStepProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [profileId, setProfileId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const sendOTP = async () => {
    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDevOtp(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-email-otp", {
        body: {
          email,
          name: "User",
          gender: "other",
          phone: "",
          profileFor: "myself",
        },
      });

      if (error) throw error;

      setProfileId(data.profileId);
      setOtpSent(true);
      
      // If in dev mode (Resend test mode), show the OTP
      if (data.devOtp) {
        setDevOtp(data.devOtp);
        toast({
          title: "Development Mode",
          description: `OTP: ${data.devOtp} (Email not sent - Resend test mode)`,
          duration: 15000,
        });
      } else {
        toast({
          title: "OTP Sent!",
          description: "Please check your email for the verification code.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-email-otp", {
        body: { email, otp, profileId },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Email Verified!",
          description: "Your email has been verified successfully.",
        });
        onComplete({ email, profileId });
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid or expired OTP.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOTP = async () => {
    setOtp("");
    await sendOTP();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          {otpSent ? "Verify Your Email" : "Enter Your Email"}
        </h2>
        <p className="text-muted-foreground">
          {otpSent
            ? `We've sent a 6-digit code to ${email}`
            : "We'll send you a verification code"}
        </p>
      </div>

      {!otpSent ? (
        <div className="space-y-4">
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
          <Button
            onClick={sendOTP}
            disabled={isLoading || !email}
            className="w-full h-12"
            variant="primary"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send Verification Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Enter 6-Digit Code</Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {devOtp && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
              <p className="text-xs text-amber-600 font-medium">Development Mode - OTP:</p>
              <p className="text-2xl font-bold text-amber-700 tracking-widest">{devOtp}</p>
              <p className="text-xs text-amber-500 mt-1">Verify domain at resend.com for production</p>
            </div>
          )}

          <Button
            onClick={verifyOTP}
            disabled={isVerifying || otp.length !== 6}
            className="w-full h-12"
            variant="primary"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify Email
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={resendOTP}
              disabled={isLoading}
              className="text-sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend Code
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailOTPStep;
