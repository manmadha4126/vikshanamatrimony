import heroWedding from "@/assets/hero-wedding.jpg";
import RegistrationForm from "./RegistrationForm";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Image and Text */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="animate-fade-up">
              <span className="inline-block px-4 py-2 bg-secondary/20 text-secondary-foreground rounded-full text-sm font-medium mb-6">
                #1 Trusted Matrimony Service
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Find Your{" "}
                <span className="text-primary">Perfect</span>{" "}
                <span className="text-secondary">Life Partner</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Join thousands of families who have found their perfect match through 
                Lakshmi Matrimony. Your journey to a beautiful marriage begins here, 
                rooted in tradition and trust.
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl overflow-hidden shadow-card">
                <img
                  src={heroWedding}
                  alt="Happy Indian Wedding Couple"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -bottom-6 left-6 right-6 flex justify-between gap-4">
                <div className="bg-card rounded-lg shadow-card p-4 flex-1 text-center">
                  <div className="font-display text-2xl font-bold text-primary">10K+</div>
                  <div className="text-xs text-muted-foreground">Happy Couples</div>
                </div>
                <div className="bg-card rounded-lg shadow-card p-4 flex-1 text-center">
                  <div className="font-display text-2xl font-bold text-secondary">50K+</div>
                  <div className="text-xs text-muted-foreground">Verified Profiles</div>
                </div>
                <div className="bg-card rounded-lg shadow-card p-4 flex-1 text-center">
                  <div className="font-display text-2xl font-bold text-primary">15+</div>
                  <div className="text-xs text-muted-foreground">Years Trust</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div className="order-1 lg:order-2 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <RegistrationForm />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
