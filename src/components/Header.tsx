import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#hero" },
    { name: "About Us", href: "#about" },
    { name: "Contact Us", href: "#contact" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="font-display text-2xl font-bold text-primary">
              Lakshmi
            </span>
            <span className="font-display text-2xl font-medium text-secondary">
              {" "}Matrimony
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            >
              {link.name}
            </button>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link to="/register">Register Now</Link>
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" asChild>
            <Link to="/staff-login">Staff Login</Link>
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" asChild>
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
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium py-2 transition-colors text-muted-foreground hover:text-primary text-left"
              >
                {link.name}
              </button>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link to="/register">Register Now</Link>
              </Button>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" asChild>
                <Link to="/staff-login">Staff Login</Link>
              </Button>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white" asChild>
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
