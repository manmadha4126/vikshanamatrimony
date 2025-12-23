import heroWedding from "@/assets/hero-wedding.jpg";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-8 lg:py-12">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Text Content */}
          <div className="animate-fade-up max-w-4xl">
            <span className="inline-block px-4 py-2 bg-secondary/20 text-secondary-foreground rounded-full text-sm font-medium mb-6">
              #1 Trusted Matrimony Service
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Find Your{" "}
              <span className="text-primary">Perfect</span>{" "}
              <span className="text-secondary">Life Partner</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Join thousands of families who have found their perfect match through Lakshmi Matrimony. 
              Your journey to a beautiful marriage begins here, rooted in tradition and trust.
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/register")}
            >
              Register Now - It's Free
            </Button>
          </div>

          {/* Hero Image - Extended */}
          <div className="relative animate-fade-up w-full max-w-5xl" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              <img 
                src={heroWedding} 
                alt="Happy Indian Wedding Couple" 
                className="w-full h-[500px] lg:h-[600px] object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -bottom-6 left-6 right-6 flex justify-center gap-4 md:gap-8">
              <div className="bg-card rounded-lg shadow-card p-4 text-center min-w-[100px]">
                <div className="font-display text-2xl font-bold text-primary">10K+</div>
                <div className="text-xs text-muted-foreground">Happy Couples</div>
              </div>
              <div className="bg-card rounded-lg shadow-card p-4 text-center min-w-[100px]">
                <div className="font-display text-2xl font-bold text-secondary">50K+</div>
                <div className="text-xs text-muted-foreground">Verified Profiles</div>
              </div>
              <div className="bg-card rounded-lg shadow-card p-4 text-center min-w-[100px]">
                <div className="font-display text-2xl font-bold text-primary">15+</div>
                <div className="text-xs text-muted-foreground">Years Trust</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
