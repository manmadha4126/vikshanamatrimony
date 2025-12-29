import weddingCarousel2 from "@/assets/wedding-carousel-2.jpg";
import weddingCarousel4 from "@/assets/wedding-carousel-4.jpg";
import weddingCarousel6 from "@/assets/wedding-carousel-6.jpg";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const weddingImages = [
  weddingCarousel2,
  weddingCarousel4,
  weddingCarousel6,
];
const HeroSection = () => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % weddingImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  return <section className="relative min-h-[90vh] gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 pt-0 pb-8 lg:pb-12">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Text Content */}
          <div className="animate-fade-up max-w-4xl">
            <span className="inline-block px-4 py-2 bg-secondary/20 text-secondary-foreground rounded-full text-sm font-medium mb-6">
              #1 Trusted Matrimony Service
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Waiting for <span className="text-primary">Someone</span>{" "}
              <span className="text-secondary"> Special...!</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Join thousands of families who have found their perfect match through Vikshana Matrimony. Your journey to
              a beautiful marriage begins here, rooted in tradition and trust.
            </p>
            <Button variant="primary" size="lg" className="text-lg px-8 py-6" onClick={() => navigate("/register")}>
              Register Now - It's Free
            </Button>
          </div>

          {/* Hero Image Carousel */}
          <div className="relative animate-fade-up w-full max-w-5xl" style={{
          animationDelay: "0.2s"
        }}>
            <div className="relative rounded-2xl overflow-hidden shadow-card">
              {weddingImages.map((img, index) => <img key={index} src={img} alt={`Happy Indian Wedding Couple ${index + 1}`} className={`w-full h-[500px] lg:h-[600px] object-cover transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0 absolute inset-0"}`} />)}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Text Overlay on Image */}
              <div className="absolute inset-0 flex items-end justify-center pb-32">
                <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground text-center px-4">
                  Find Your Perfect Life Partner
                </h2>
              </div>
            </div>

            {/* Image Indicators */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {weddingImages.map((_, index) => <button key={index} onClick={() => setCurrentImage(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentImage ? "bg-primary w-6" : "bg-white/60"}`} />)}
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
    </section>;
};
export default HeroSection;