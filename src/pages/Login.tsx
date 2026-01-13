import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail, Phone, Eye, EyeOff, Heart, Sparkles } from "lucide-react";
import { z } from "zod";

// Import logo and wedding images
import vikshanaLogo from "@/assets/vikshana-logo.png";
import weddingImg1 from "@/assets/wedding-carousel-1.jpg";
import weddingImg2 from "@/assets/wedding-carousel-2.jpg";
import weddingImg3 from "@/assets/wedding-carousel-3.jpg";
import weddingImg4 from "@/assets/wedding-carousel-4.jpg";

const weddingImages = [weddingImg1, weddingImg2, weddingImg3, weddingImg4];

const loginSchema = z.object({
  identifier: z.string().min(1, "Phone or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Heart particle component
const HeartParticle = ({ delay, left }: { delay: number; left: number }) => (
  <div
    className="absolute text-rose-500 animate-float-up pointer-events-none"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      fontSize: Math.random() * 16 + 12,
    }}
  >
    ❤️
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  const triggerHeartsAnimation = () => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 3000);
  };

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
        triggerHeartsAnimation();
        toast({
          title: "Welcome Back! 💕",
          description: "You have successfully logged in.",
        });
        setTimeout(() => navigate("/my-dashboard"), 1500);
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/my-dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Google Sign-In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Generate heart particles
  const hearts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
  }));

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Hearts Animation Overlay */}
      {showHearts && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {hearts.map((heart) => (
            <HeartParticle key={heart.id} delay={heart.delay} left={heart.left} />
          ))}
        </div>
      )}

      {/* Left Side - Branding & Image Gallery */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-rose-900 via-pink-800 to-rose-900">
        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Golden accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-rose-900/50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-8">
          {/* Logo & Brand */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img 
                src={vikshanaLogo} 
                alt="Vikshana Matrimony" 
                className="h-14 w-14 object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-1 tracking-wide">
              Vikshana
              <span className="text-amber-300"> Matrimony</span>
            </h1>
            <p className="text-rose-200 text-sm italic">
              Where Hearts Find Home
            </p>
          </div>

          {/* Decorative hearts */}
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-3 w-3 text-amber-400 fill-amber-400 animate-pulse" />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <Sparkles className="h-4 w-4 text-amber-300" />
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            <Heart className="h-3 w-3 text-amber-400 fill-amber-400 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          {/* Welcome text */}
          <div className="text-center mb-4">
            <h2 className="text-4xl font-display font-bold text-white mb-1" style={{
              textShadow: "0 4px 20px rgba(0,0,0,0.4)"
            }}>
              Welcome Back!
            </h2>
            <p className="text-rose-100 text-sm max-w-sm">
              Continue your journey to find your perfect life partner
            </p>
          </div>

          {/* Image Gallery - Compact Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4 w-full max-w-sm">
            {weddingImages.map((img, index) => (
              <div
                key={index}
                className="relative h-28 rounded-xl overflow-hidden shadow-xl border border-amber-400/20 transform transition-transform duration-500 hover:scale-105"
              >
                <img 
                  src={img} 
                  alt={`Wedding ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent" />
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-300">10K+</p>
              <p className="text-rose-200 text-xs">Happy Couples</p>
            </div>
            <div className="w-px bg-amber-400/30" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-300">50K+</p>
              <p className="text-rose-200 text-xs">Verified Profiles</p>
            </div>
            <div className="w-px bg-amber-400/30" />
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-300">98%</p>
              <p className="text-rose-200 text-xs">Success Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-gradient-to-br from-slate-50 via-rose-50 to-amber-50 p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <img 
                src={vikshanaLogo} 
                alt="Vikshana Matrimony" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <h1 className="text-xl font-display font-bold text-rose-900">
              Vikshana <span className="text-amber-600">Matrimony</span>
            </h1>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-rose-100" style={{
            boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.12)"
          }}>
            <div className="text-center mb-5">
              <h2 className="text-2xl font-display font-bold text-slate-800 mb-1">
                Sign In
              </h2>
              <p className="text-slate-500 text-sm">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone/Email Field */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Phone Number or Email
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Enter your phone or email"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="h-11 pl-4 pr-12 bg-slate-50 border-slate-200 rounded-xl focus:border-rose-400 focus:ring-rose-400/20 text-slate-800 placeholder:text-slate-400 text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-xs">/</span>
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-4 pr-16 bg-slate-50 border-slate-200 rounded-xl focus:border-rose-400 focus:ring-rose-400/20 text-slate-800 placeholder:text-slate-400 text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Stay Logged In & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stayLoggedIn"
                    checked={stayLoggedIn}
                    onCheckedChange={(checked) => setStayLoggedIn(checked as boolean)}
                    className="border-slate-300 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 h-4 w-4"
                  />
                  <label
                    htmlFor="stayLoggedIn"
                    className="text-xs text-slate-600 cursor-pointer"
                  >
                    Stay logged in
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:shadow-rose-500/40 hover:scale-[1.02]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <Heart className="h-4 w-4" />
                  </span>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400">or</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <Button
                type="button"
                variant="outline"
                disabled={isGoogleLoading}
                onClick={handleGoogleSignIn}
                className="w-full h-11 text-sm font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isGoogleLoading ? "Signing in..." : "Sign in with Google"}
              </Button>
            </form>

            {/* Sign Up & Back Links */}
            <div className="mt-5 text-center space-y-2">
              <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <Link
                  to="/#hero"
                  className="text-rose-500 hover:text-rose-600 font-semibold transition-colors"
                >
                  Register Now
                </Link>
              </p>
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors inline-flex items-center gap-1"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-4 flex items-center justify-center gap-4 text-slate-400">
            <div className="flex items-center gap-1 text-xs">
              <Lock className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1 text-xs">
              <Heart className="h-3 w-3" />
              <span>100% Privacy</span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for hearts animation */}
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(100vh) scale(0.5) rotate(0deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-20vh) scale(1.2) rotate(360deg);
          }
        }
        .animate-float-up {
          animation: float-up 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;
