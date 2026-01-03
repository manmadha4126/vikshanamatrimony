import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Home } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const isRegisterPage = location.pathname === "/register";

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "About Us", href: "#about" },
    { name: "Contact Us", href: "#contact" },
  ];

  const handleNavClick = (href: string) => {
    if (isHomePage) {
      // On home page, just scroll to section
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // On other pages, navigate to home with hash
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <button onClick={handleLogoClick} className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="font-display text-2xl font-bold text-primary">
              Vikshana
            </span>
            <span className="font-display text-2xl font-medium text-secondary">
              {" "}Matrimony
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {!isHomePage && !isRegisterPage && (
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => navigate("/")}>
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}
          {isHomePage && (
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link to="/register">Register Now</Link>
            </Button>
          )}
          <Button className="bg-slate-900 hover:bg-slate-800 text-white" asChild>
            <Link to="/staff-login">Staff Login</Link>
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white" asChild>
            <Link to="/login">Log In</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-foreground"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border shadow-lg animate-fade-in">
          <nav className="container py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium py-2 transition-colors text-muted-foreground hover:text-primary text-left"
              >
                {link.name}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {!isHomePage && !isRegisterPage && (
                <Button variant="outline" className="w-full border-primary text-primary" onClick={() => { navigate("/"); setIsMenuOpen(false); }}>
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              )}
              {isHomePage && (
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                  <Link to="/register">Register Now</Link>
                </Button>
              )}
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" asChild>
                <Link to="/staff-login">Staff Login</Link>
              </Button>
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white" asChild>
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
