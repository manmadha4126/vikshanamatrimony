import { useNavigate, useLocation } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleNavClick = (sectionId: string) => {
    if (location.pathname === "/") {
      // On homepage, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth"
        });
      }
    } else {
      // On other pages, navigate to homepage with hash
      navigate(`/#${sectionId}`);
    }
  };
  return <footer className="bg-primary-dark text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center">
              <span className="font-display text-xl font-bold text-primary-foreground">
                Vikshana
              </span>
              <span className="font-display text-xl font-medium text-secondary">
                {" "}Matrimony
              </span>
            </div>
            <p className="text-sm text-primary-foreground/80">
              Trusted by thousands of families for finding the perfect life partner. 
              Your journey to a beautiful marriage starts here.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <button onClick={() => handleNavClick("hero")} className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors text-left">
                Home
              </button>
              <button onClick={() => handleNavClick("about")} className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors text-left">
                About Us
              </button>
              <button onClick={() => handleNavClick("contact")} className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors text-left">
                Contact Us
              </button>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <MapPin size={16} className="text-secondary mx-0 my-0 mr-0 w-[35px] h-[25px]" />
                <span>Pillar No 44, 20-1-244, Korlagunta junction, Tirupati Bypass road Tirupati, Andhra Pradesh - 517501
India.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-primary-foreground/80">
                <Phone size={16} className="text-secondary mt-0.5" />
                <div className="flex flex-col">
                  <span>+91 9491449044</span>
                  <span>+91 9100090883</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <Mail size={16} className="text-secondary w-[20px] h-[25px]" />
                <span>info@vikshanamatrimony.com</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://www.instagram.com/vikshana_matrimony/?hl=en" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                <Phone size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="text-sm text-primary-foreground/70">
              © {new Date().getFullYear()} Vikshana Matrimony. All Rights Reserved.
            </p>
            <p className="text-xs text-primary-foreground/60 italic">
              Disclaimer: This website is strictly for matrimonial purposes only and not a dating website.
            </p>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;