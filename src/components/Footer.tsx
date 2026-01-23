import { useNavigate, useLocation } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleNavClick = (sectionId: string) => {
    if (location.pathname === "/") {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };
  
  return (
    <footer className="bg-primary-dark text-white">
      <div className="container py-8 sm:py-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center">
              <span className="font-display text-lg sm:text-xl font-bold text-primary-foreground">
                Vikshana
              </span>
              <span className="font-display text-lg sm:text-xl font-medium text-secondary">
                {" "}Matrimony
              </span>
            </div>
            <p className="text-xs sm:text-sm text-primary-foreground/80 leading-relaxed">
              Trusted by thousands of families for finding the perfect life partner. 
              Your journey to a beautiful marriage starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-display text-base sm:text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-1.5 sm:gap-2">
              <button 
                onClick={() => handleNavClick("hero")} 
                className="text-xs sm:text-sm text-primary-foreground/80 hover:text-secondary transition-colors text-left"
              >
                Home
              </button>
              <button 
                onClick={() => handleNavClick("about")} 
                className="text-xs sm:text-sm text-primary-foreground/80 hover:text-secondary transition-colors text-left"
              >
                About Us
              </button>
              <button 
                onClick={() => handleNavClick("contact")} 
                className="text-xs sm:text-sm text-primary-foreground/80 hover:text-secondary transition-colors text-left"
              >
                Contact Us
              </button>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-display text-base sm:text-lg font-semibold">Contact Us</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-primary-foreground/80">
                <MapPin size={14} className="text-secondary mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
                <span className="leading-relaxed">
                  Pillar No 44, Korlagunta junction, Tirupati - 517501, AP, India
                </span>
              </div>
              <div className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-primary-foreground/80">
                <Phone size={14} className="text-secondary mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
                <div className="flex flex-col">
                  <span>+91 9491449044</span>
                  <span>+91 9100090883</span>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-primary-foreground/80">
                <Mail size={14} className="text-secondary flex-shrink-0 sm:w-4 sm:h-4" />
                <span className="break-all">info@vikshanamatrimony.com</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-display text-base sm:text-lg font-semibold">Follow Us</h4>
            <div className="flex gap-3 sm:gap-4">
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors"
              >
                <Facebook size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
              <a 
                href="https://www.instagram.com/vikshana_matrimony/?hl=en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors"
              >
                <Instagram size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors"
              >
                <Phone size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-4 sm:py-6 px-4">
          <div className="flex flex-col gap-2 sm:gap-4 text-center">
            <p className="text-[11px] sm:text-sm text-primary-foreground/70">
              © {new Date().getFullYear()} Vikshana Matrimony. All Rights Reserved.
            </p>
            <p className="text-[10px] sm:text-xs text-primary-foreground/60 italic">
              Disclaimer: This website is strictly for matrimonial purposes only and not a dating website.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
