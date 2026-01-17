import { useState, useEffect } from "react";
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
import loginCarousel1 from "@/assets/login-carousel-1.jpg";
import loginCarousel2 from "@/assets/login-carousel-2.jpg";
import loginCarousel3 from "@/assets/login-carousel-3.jpg";
import loginCarousel4 from "@/assets/login-carousel-4.jpg";

const weddingImages = [loginCarousel1, loginCarousel2, loginCarousel3, loginCarousel4];

const loginSchema = z.object({
  identifier: z.string().min(1, "Phone or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Heart particle component for success animation
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

// Floating heart for background animation
const FloatingHeart = ({ style }: { style: React.CSSProperties }) => (
  <div
    className="absolute pointer-events-none animate-floating-heart opacity-20"
    style={style}
  >
    <Heart className="text-amber-300 fill-amber-300/50" style={{ width: style.fontSize, height: style.fontSize }} />
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      
      // If it's a phone number, first find the email associated with it
      let loginEmail = identifier;
      
      if (!isEmail) {
        // Look up the profile by phone number to get the email
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', identifier)
          .maybeSingle();
        
        if (profileError || !profileData) {
          toast({
            title: "Login Failed",
            description: "No account found with this phone number.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        loginEmail = profileData.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
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

  // Generate heart particles for success animation
  const hearts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: Math.random() * 100,
  }));

  // Generate floating hearts for background
  const floatingHearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      fontSize: Math.random() * 20 + 10,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${Math.random() * 4 + 6}s`,
    } as React.CSSProperties,
  }));

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Back Arrow - Top Left */}
      <Link
        to="/"
        className="absolute top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white shadow-lg transition-all duration-300 hover:scale-105"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      {/* Hearts Animation Overlay */}
      {showHearts && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {hearts.map((heart) => (
            <HeartParticle key={heart.id} delay={heart.delay} left={heart.left} />
          ))}
        </div>
      )}

      {/* Left Side - Branding & Image Gallery */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-rose-900 via-pink-800 to-rose-900 overflow-hidden">
        {/* Floating hearts background animation */}
        <div className="absolute inset-0 z-0">
          {floatingHearts.map((heart) => (
            <FloatingHeart key={heart.id} style={heart.style} />
          ))}
        </div>

        {/* Decorative patterns */}
        <div className="absolute inset-0 opacity-10 z-[1]">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Golden accent overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 via-transparent to-rose-900/50 z-[2]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-8 z-[3]">
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

          {/* Image Gallery - Horizontal Auto-Scrolling Carousel */}
          <div className="w-full max-w-md mb-4 overflow-hidden">
            <div className="flex gap-4 animate-scroll-left">
              {/* Duplicate images for seamless loop */}
              {[...weddingImages, ...weddingImages].map((img, index) => (
                <div
                  key={index}
                  className="relative h-44 w-52 flex-shrink-0 rounded-xl overflow-hidden shadow-xl border border-amber-400/20 transform transition-transform duration-500 hover:scale-105"
                >
                  <img 
                    src={img} 
                    alt={`Wedding ${(index % 4) + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-900/40 via-transparent to-transparent" />
                </div>
              ))}
            </div>
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-medium transition-all duration-300 shadow-md hover:shadow-lg"
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
        
        @keyframes floating-heart {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.1) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) translateX(-5px) scale(0.95) rotate(-3deg);
          }
          75% {
            transform: translateY(-25px) translateX(5px) scale(1.05) rotate(3deg);
          }
        }
        .animate-floating-heart {
          animation: floating-heart 8s ease-in-out infinite;
        }
        
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-left {
          animation: scroll-left 20s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default Login;
