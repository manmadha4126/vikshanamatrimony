import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { User, Lock, Mail, Phone, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  identifier: z.string().min(1, "Phone or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = loginSchema.safeParse({ identifier, password });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Determine if identifier is email or phone
      const isEmail = identifier.includes("@");
      
      const { error } = await supabase.auth.signInWithPassword({
        email: isEmail ? identifier : `${identifier}@phone.vikshanamatrimony.com`,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back!",
          description: "You have successfully logged in.",
        });
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with diagonal split */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-primary/10" />
      
      {/* Decorative diagonal line */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: "linear-gradient(135deg, transparent 40%, hsl(var(--primary) / 0.3) 50%, hsl(180, 70%, 40%) 60%, transparent 70%)",
        }}
      />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative z-10 flex w-full max-w-5xl mx-4">
        {/* Login Form Card */}
        <div className="flex-1 max-w-md mx-auto lg:mx-0">
          <div 
            className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8 shadow-2xl"
            style={{ 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)" 
            }}
          >
            <h1 className="text-3xl font-display font-bold text-center mb-8 text-white">
              Login
            </h1>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Phone/Email Field */}
              <div className="relative group">
                <div className="flex items-center border-b-2 border-slate-600 group-focus-within:border-cyan-400 transition-colors pb-2">
                  <Input
                    type="text"
                    placeholder="Phone Number or Email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  />
                  <div className="flex items-center gap-1 text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span className="text-xs">/</span>
                    <Mail className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="flex items-center border-b-2 border-slate-600 group-focus-within:border-cyan-400 transition-colors pb-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white transition-colors mr-2"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
              </div>

              {/* Stay Logged In & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stayLoggedIn"
                    checked={stayLoggedIn}
                    onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
                    className="border-slate-500 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <label
                    htmlFor="stayLoggedIn"
                    className="text-sm text-slate-300 cursor-pointer"
                  >
                    Stay logged in
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-lg font-semibold rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-900 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:shadow-cyan-500/50 hover:scale-[1.02]"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/#hero"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Back Section - Desktop Only */}
        <div className="hidden lg:flex flex-1 items-center justify-center pl-12">
          <div className="text-right">
            <h2 className="text-5xl font-display font-bold text-white leading-tight">
              WELCOME
            </h2>
            <h2 className="text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent leading-tight">
              BACK!
            </h2>
            <p className="mt-4 text-slate-400 text-lg">
              Find your perfect match with<br />
              <span className="text-secondary font-semibold">Vikshana Matrimony</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
