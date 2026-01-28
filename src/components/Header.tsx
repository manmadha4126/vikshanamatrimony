import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home } from "lucide-react";
import { useState } from "react";
import vikshanaLogo from "@/assets/vikshana-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isRegisterPage = location.pathname === "/register";
  
  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "About Us", href: "#about" },
    { name: "Contact Us", href: "#contact" }
  ];
  
  const handleNavClick = (href: string) => {
    if (isHomePage) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/" + href);
    }
    setIsMenuOpen(false);
  };
  
  const handleLogoClick = () => {
    if (isHomePage) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full glass-nav">
      <div className="container flex h-16 sm:h-20 items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <button onClick={handleLogoClick} className="flex items-center gap-1.5 sm:gap-2">
          <img 
            src={vikshanaLogo} 
            alt="Vikshana Logo" 
            className="h-9 w-9 sm:h-12 sm:w-12 object-contain" 
          />
          <div className="flex items-center">
            <span className="font-display text-primary text-xl sm:text-3xl font-extrabold mr-0.5 sm:mr-[4px] mb-[2px] text-left">
              Vikshana
            </span>
            <span className="text-green-900 text-xl sm:text-3xl font-serif font-bold text-right hidden xs:inline">
              {" "}Matrimony
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map(link => (
            <button 
              key={link.href} 
              onClick={() => handleNavClick(link.href)} 
              className="text-sm font-medium transition-all duration-200 hover:text-primary hover:scale-110 text-muted-foreground"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {!isHomePage && !isRegisterPage && (
            <Button 
              variant="outline" 
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          )}
          {isHomePage && (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link to="/register">Register Now</Link>
            </Button>
          )}
          <Button className="bg-black hover:bg-black/80 text-white" size="sm" asChild>
            <Link to="/staff-login">Admin Login</Link>
          </Button>
          <Button className="bg-black hover:bg-black/80 text-white" size="sm" asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="md:hidden p-2 text-foreground"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 sm:top-20 left-0 right-0 glass shadow-lg animate-fade-in">
          <nav className="container py-3 sm:py-4 flex flex-col gap-2 sm:gap-4 px-4">
            {navLinks.map(link => (
              <button 
                key={link.href} 
                onClick={() => handleNavClick(link.href)} 
                className="text-sm font-medium py-2 transition-all duration-200 text-muted-foreground hover:text-primary hover:translate-x-2 text-left"
              >
                {link.name}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-3 sm:pt-4 border-t border-border">
              {!isHomePage && !isRegisterPage && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-primary text-primary" 
                  onClick={() => {
                    navigate("/");
                    setIsMenuOpen(false);
                  }}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              )}
              {isHomePage && (
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="sm" asChild>
                  <Link to="/register">Register Now</Link>
                </Button>
              )}
              <div className="flex gap-2">
                <Button className="flex-1 bg-black hover:bg-black/80 text-white" size="sm" asChild>
                  <Link to="/staff-login">Admin Login</Link>
                </Button>
                <Button className="flex-1 bg-black hover:bg-black/80 text-white" size="sm" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
