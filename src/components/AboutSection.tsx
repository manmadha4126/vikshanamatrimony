const AboutSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              About Us
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Connecting Hearts,{" "}
              <span className="text-primary">Building</span>{" "}
              <span className="text-secondary">Families</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              At Lakshmi Matrimony, we understand that marriage is not just a union of two individuals, 
              but a sacred bond that brings two families together. For over 15 years, we have been 
              the trusted partner for thousands of families seeking to find the perfect life partner 
              for their loved ones.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform combines traditional values with modern technology to provide you with 
              a secure, confidential, and reliable matchmaking experience. Every profile is carefully 
              verified, ensuring that you connect with genuine individuals who share your values and aspirations.
            </p>

            {/* Core Values */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-display font-semibold text-foreground mb-1">Our Mission</h4>
                <p className="text-sm text-muted-foreground">
                  To unite souls with trust, tradition, and care.
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-display font-semibold text-foreground mb-1">Our Vision</h4>
                <p className="text-sm text-muted-foreground">
                  To be India's most trusted matrimony platform.
                </p>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "10K+", label: "Successful Marriages" },
                { number: "50K+", label: "Active Members" },
                { number: "15+", label: "Years of Trust" },
                { number: "24/7", label: "Support Available" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="p-6 bg-card rounded-xl border border-border/50 shadow-soft text-center"
                >
                  <div className="font-display text-3xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border/50">
              <h4 className="font-display font-semibold text-foreground mb-4 text-center">
                Why Families Trust Us
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                {["Safe & Secure", "Verified Profiles", "Privacy First", "Expert Support"].map(
                  (badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-card rounded-full text-sm font-medium text-foreground border border-border/50"
                    >
                      {badge}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
