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
    <section className="py-12 sm:py-20 gradient-cream">
      <div className="container px-3 sm:px-4">
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
              className="group bg-card p-5 sm:p-8 rounded-xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
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
