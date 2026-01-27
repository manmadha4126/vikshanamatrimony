import { Heart, Shield, Users, Eye, Award, Handshake } from "lucide-react";
import AssistedServiceSection from "@/components/dashboard/AssistedServiceSection";

const coreValues = [
  {
    icon: Heart,
    title: "Trust & Tradition",
    description: "We honor the sacred institution of marriage and traditional values that have united families for generations.",
  },
  {
    icon: Shield,
    title: "Safety & Security",
    description: "Your privacy is our priority. We employ advanced security measures to protect your personal information.",
  },
  {
    icon: Users,
    title: "Family First",
    description: "We believe in the importance of family involvement and support in the matchmaking process.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "We maintain complete transparency in our processes, ensuring honest and authentic connections.",
  },
  {
    icon: Award,
    title: "Quality Matches",
    description: "Our expert team carefully curates matches based on compatibility, values, and life goals.",
  },
  {
    icon: Handshake,
    title: "Commitment",
    description: "We are committed to helping you find not just a match, but a lifelong partner.",
  },
];

const AboutFullSection = () => {
  return (
    <>
      {/* About Hero Section */}
      <section id="about" className="py-20 relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 gradient-hero" />
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        
        {/* Traditional pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M20 0L40 20L20 40L0 20z' fill='none' stroke='%239C92AC' stroke-width='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              About Vikshana Matrimony
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Where <span className="text-primary">Traditions</span> Meet{" "}
              <span className="text-secondary">Modern Love</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              For over 15 years, Vikshana Matrimony has been the trusted bridge connecting 
              hearts and families. We understand that finding a life partner is one of life's 
              most important decisions, and we're honored to be part of your journey.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-background" />
        
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full" />
        
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="font-display text-3xl font-bold text-foreground">
                Our Story
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Vikshana Matrimony was founded with a simple yet profound vision: to help 
                individuals find their soulmates while honoring the rich traditions that 
                make Indian marriages so special.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                What started as a small community initiative has grown into one of the most 
                trusted matrimony platforms, serving families across India and around the world. 
                Our success is measured not in numbers, but in the happiness of the couples 
                we've helped unite.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We combine the wisdom of traditional matchmaking with the convenience of 
                modern technology, creating a platform where authentic connections flourish 
                in a safe, respectful environment.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "10,000+", label: "Happy Marriages" },
                { number: "50,000+", label: "Verified Profiles" },
                { number: "15+", label: "Years Experience" },
                { number: "98%", label: "Satisfaction Rate" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-soft text-center hover:shadow-card transition-all duration-300"
                >
                  <div className="font-display text-3xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-cream" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-secondary/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 A50 50 0 0 1 100 50 A50 50 0 0 1 50 100 A50 50 0 0 1 0 50 A50 50 0 0 1 50 0' fill='none' stroke='%239C92AC' stroke-width='0.5'/%3E%3Cpath d='M50 10 A40 40 0 0 1 90 50 A40 40 0 0 1 50 90 A40 40 0 0 1 10 50 A40 40 0 0 1 50 10' fill='none' stroke='%239C92AC' stroke-width='0.5'/%3E%3C/svg%3E")`,
        }} />
        
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">
              Our Core Values
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at Vikshana Matrimony
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className="group bg-card/80 backdrop-blur-sm p-8 rounded-xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-display text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assisted Matrimony Service */}
      <section className="py-16 bg-background">
        <AssistedServiceSection />
      </section>

      {/* CTA Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        
        {/* Decorative overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="container text-center relative z-10">
          <h3 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Ready to Find Your Perfect Match?
          </h3>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of families who have trusted Vikshana Matrimony to find their 
            life partner. Your beautiful journey begins here.
          </p>
          <a
            href="#register"
            className="inline-flex items-center justify-center h-13 px-8 bg-secondary text-secondary-foreground font-semibold rounded-lg shadow-gold hover:bg-secondary/90 transition-colors"
          >
            Register Now - It's Free
          </a>
        </div>
      </section>
    </>
  );
};

export default AboutFullSection;
