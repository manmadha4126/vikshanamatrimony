import { Shield, Users, Heart, Lock, Clock, Star } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "Every profile is carefully verified to ensure authenticity and trust.",
  },
  {
    icon: Users,
    title: "Trusted by Thousands",
    description: "Over 10,000+ families have found their perfect match through us.",
  },
  {
    icon: Lock,
    title: "Privacy Protection",
    description: "Your personal information is secure with our advanced encryption.",
  },
  {
    icon: Heart,
    title: "Personalized Matches",
    description: "Our smart algorithm finds compatible partners based on your preferences.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our dedicated team is always here to assist you on your journey.",
  },
  {
    icon: Star,
    title: "Premium Experience",
    description: "Enjoy exclusive features and priority matchmaking services.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 gradient-cream" />
      
      {/* Floating decorative shapes */}
      <div className="absolute top-10 left-10 w-32 h-32 sm:w-64 sm:h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-40 h-40 sm:w-72 sm:h-72 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/4 w-20 h-20 sm:w-40 sm:h-40 bg-primary/10 rounded-full blur-2xl" />
      
      {/* Traditional pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Paisley/Mandala decorative corner elements */}
      <div className="absolute top-0 right-0 w-40 h-40 sm:w-80 sm:h-80 opacity-5">
        <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M100 20 L100 180 M20 100 L180 100 M35 35 L165 165 M35 165 L165 35" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-80 sm:h-80 opacity-5 rotate-180">
        <svg viewBox="0 0 200 200" className="w-full h-full text-secondary">
          <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M100 20 L100 180 M20 100 L180 100 M35 35 L165 165 M35 165 L165 35" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      
      <div className="container px-3 sm:px-4 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Why Choose{" "}
            <span className="text-primary">Vikshana</span>
            <span className="text-secondary"> Matrimony</span>?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
            We are committed to helping you find your perfect life partner with trust, 
            tradition, and technology at the heart of everything we do.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card/80 backdrop-blur-sm p-5 sm:p-8 rounded-xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-lg gradient-primary flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
