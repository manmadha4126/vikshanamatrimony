import weddingHero1 from "@/assets/wedding-hero-1.jpg";
import weddingHero2 from "@/assets/wedding-hero-2.jpg";
import weddingCarousel2 from "@/assets/wedding-carousel-2.jpg";
import weddingCarousel4 from "@/assets/wedding-carousel-4.jpg";
import weddingHindu5 from "@/assets/wedding-hindu-5.jpg";
import weddingHindu6 from "@/assets/wedding-hindu-6.jpg";
import weddingHindu7 from "@/assets/wedding-hindu-7.jpg";
import weddingHindu8 from "@/assets/wedding-hindu-8.jpg";
import weddingHindu9 from "@/assets/wedding-hindu-9.jpg";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const weddingImages = [weddingHero1, weddingHero2, weddingCarousel2, weddingCarousel4, weddingHindu5, weddingHindu6, weddingHindu7, weddingHindu8, weddingHindu9];

const HeroSection = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % weddingImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 sm:w-64 h-32 sm:h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 sm:w-80 h-40 sm:h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 pt-0 pb-6 sm:pb-8 lg:pb-12 px-3 sm:px-4">
        <div className="text-center space-y-4 sm:space-y-8 flex-col flex items-center justify-start">
          {/* Text Content */}
          <div className="animate-fade-up max-w-4xl">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-secondary/20 text-secondary-foreground rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              #1 Trusted Matrimony Service
            </span>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
              Waiting for <span className="text-primary">Someone</span>{" "}
              <span className="text-secondary">Special...!</span>
            </h1>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4 sm:mb-8 px-2">
              Join thousands of families who have found their perfect match through Vikshana Matrimony. Your journey to a beautiful marriage begins here, rooted in tradition and trust.
            </p>
            <Button 
              variant="primary" 
              size="lg" 
              className="text-sm sm:text-lg px-6 sm:px-8 py-4 sm:py-6" 
              onClick={() => navigate("/register")}
            >
              Register Now - It's Free
            </Button>
          </div>

          {/* Hero Image Carousel */}
          <div className="relative animate-fade-up w-full max-w-5xl" style={{ animationDelay: "0.2s" }}>
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-card">
              {weddingImages.map((img, index) => (
                <img 
                  key={index} 
                  src={img} 
                  alt={`Happy Indian Wedding Couple ${index + 1}`} 
                  className={`w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] object-cover transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0 absolute inset-0"}`} 
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Text Overlay on Image */}
              <div className="absolute inset-0 flex items-end justify-center pb-16 sm:pb-28">
                <h2 className="font-display text-xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white text-center px-4 drop-shadow-lg">
                  Find Your Perfect Life Partner
                </h2>
              </div>
            </div>

            {/* Image Indicators */}
            <div className="absolute bottom-10 sm:bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
              {weddingImages.map((_, index) => (
                <button 
                  key={index} 
                  onClick={() => setCurrentImage(index)} 
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${index === currentImage ? "bg-primary w-4 sm:w-6" : "bg-white/60"}`} 
                />
              ))}
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-4 sm:-bottom-6 left-2 right-2 sm:left-6 sm:right-6 flex justify-center gap-2 sm:gap-4 md:gap-8">
              <div className="bg-card rounded-lg shadow-card p-2 sm:p-4 text-center min-w-[70px] sm:min-w-[100px]">
                <div className="font-display text-lg sm:text-2xl font-bold text-primary">10K+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Happy Couples</div>
              </div>
              <div className="bg-card rounded-lg shadow-card p-2 sm:p-4 text-center min-w-[70px] sm:min-w-[100px]">
                <div className="font-display text-lg sm:text-2xl font-bold text-secondary">50K+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Verified Profiles</div>
              </div>
              <div className="bg-card rounded-lg shadow-card p-2 sm:p-4 text-center min-w-[70px] sm:min-w-[100px]">
                <div className="font-display text-lg sm:text-2xl font-bold text-primary">15+</div>
                <div className="text-[10px] sm:text-xs text-muted-foreground">Years Trust</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
