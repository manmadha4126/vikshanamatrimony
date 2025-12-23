import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ArrowRight, Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatePasswordStepProps {
  onComplete: (password: string) => void;
}

const CreatePasswordStep = ({ onComplete }: CreatePasswordStepProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allChecksPassed = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = () => {
    if (allChecksPassed && passwordsMatch) {
      onComplete(password);
    }
  };

  const PasswordCheck = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={cn(passed ? "text-green-600" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">
          Create Your Password
        </h2>
        <p className="text-muted-foreground">
          Choose a strong password to secure your account
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-12 w-12"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-foreground mb-2">Password Requirements:</p>
          <PasswordCheck passed={passwordChecks.minLength} label="At least 8 characters" />
          <PasswordCheck passed={passwordChecks.hasUpper} label="One uppercase letter" />
          <PasswordCheck passed={passwordChecks.hasLower} label="One lowercase letter" />
          <PasswordCheck passed={passwordChecks.hasDigit} label="One number" />
          <PasswordCheck passed={passwordChecks.hasSymbol} label="One special character (!@#$%^&*)" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={cn(
                "h-12 pr-10",
                confirmPassword.length > 0 && !passwordsMatch && "border-destructive"
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-12 w-12"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-sm text-destructive">Passwords do not match</p>
          )}
          {passwordsMatch && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <Check className="h-4 w-4" /> Passwords match
            </p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!allChecksPassed || !passwordsMatch}
          className="w-full h-12"
          variant="primary"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CreatePasswordStep;
