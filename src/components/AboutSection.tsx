const AboutSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background base */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/3 to-secondary/3 rounded-full blur-3xl" />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Traditional decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-60 sm:h-60 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
          <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 25 L75 50 L50 75 L25 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      
      <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-60 sm:h-60 opacity-10 rotate-45">
        <svg viewBox="0 0 100 100" className="w-full h-full text-secondary">
          <path d="M50 5 L95 50 L50 95 L5 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 25 L75 50 L50 75 L25 50 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="10" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      
      {/* Floating hearts decoration */}
      <div className="absolute top-1/4 right-10 opacity-10 animate-float">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-primary fill-current">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>
      
      <div className="absolute bottom-1/3 left-10 opacity-10 animate-float" style={{ animationDelay: '1s' }}>
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-secondary fill-current">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      <div className="container relative z-10">
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
              At Vikshana Matrimony, we understand that marriage is not just a union of two individuals, 
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
              <div className="p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border/30 shadow-soft">
                <h4 className="font-display font-semibold text-foreground mb-1">Our Mission</h4>
                <p className="text-sm text-muted-foreground">
                  To unite souls with trust, tradition, and care.
                </p>
              </div>
              <div className="p-4 bg-card/80 backdrop-blur-sm rounded-lg border border-border/30 shadow-soft">
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
                  className="p-6 bg-card/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-soft text-center hover:shadow-card transition-all duration-300"
                >
                  <div className="font-display text-3xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-border/50 backdrop-blur-sm">
              <h4 className="font-display font-semibold text-foreground mb-4 text-center">
                Why Families Trust Us
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                {["Safe & Secure", "Verified Profiles", "Privacy First", "Expert Support"].map(
                  (badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-card rounded-full text-sm font-medium text-foreground border border-border/50 shadow-sm"
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
