import { Heart, Shield, Users, Eye, Award, Handshake } from "lucide-react";
import AssistedServiceSection from "@/components/dashboard/AssistedServiceSection";
const coreValues = [{
  icon: Heart,
  title: "Trust & Tradition",
  description: "We honor the sacred institution of marriage and traditional values that have united families for generations."
}, {
  icon: Shield,
  title: "Safety & Security",
  description: "Your privacy is our priority. We employ advanced security measures to protect your personal information."
}, {
  icon: Users,
  title: "Family First",
  description: "We believe in the importance of family involvement and support in the matchmaking process."
}, {
  icon: Eye,
  title: "Transparency",
  description: "We maintain complete transparency in our processes, ensuring honest and authentic connections."
}, {
  icon: Award,
  title: "Quality Matches",
  description: "Our expert team carefully curates matches based on compatibility, values, and life goals."
}, {
  icon: Handshake,
  title: "Commitment",
  description: "We are committed to helping you find not just a match, but a lifelong partner."
}];
const AboutFullSection = () => {
  return <>
      {/* About Hero Section */}
      <section id="about" className="py-20 gradient-hero">
        <div className="container">
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
      <section className="py-16 bg-background">
        <div className="container">
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
              {[{
              number: "10,000+",
              label: "Happy Marriages"
            }, {
              number: "50,000+",
              label: "Verified Profiles"
            }, {
              number: "15+",
              label: "Years Experience"
            }, {
              number: "98%",
              label: "Satisfaction Rate"
            }].map((stat, index) => <div key={index} className="p-6 bg-card rounded-xl border border-border/50 shadow-soft text-center">
                  <div className="font-display text-3xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 gradient-cream">
        <div className="container">
          <div className="text-center mb-12">
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">
              Our Core Values
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at Vikshana Matrimony
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, index) => <div key={index} className="group bg-card p-8 rounded-xl border border-border/50 shadow-soft hover:shadow-card transition-all duration-300">
                <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="font-display text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Assisted Matrimony Service */}
      <section className="py-16 bg-background">
        <AssistedServiceSection />
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-neutral-600">
        <div className="container text-center">
          <h3 className="font-display text-3xl font-bold text-primary-foreground mb-4">
            Ready to Find Your Perfect Match?
          </h3>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of families who have trusted Vikshana Matrimony to find their 
            life partner. Your beautiful journey begins here.
          </p>
          <a href="#register" className="inline-flex items-center justify-center h-13 px-8 bg-secondary text-secondary-foreground font-semibold rounded-lg shadow-gold hover:bg-secondary/90 transition-colors">
            Register Now - It's Free
          </a>
        </div>
      </section>
    </>;
};
export default AboutFullSection;