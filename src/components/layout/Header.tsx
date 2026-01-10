import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Code, Users, Calendar, BookOpen, Info, Sun, Moon, UserPlus, HandHeart } from "lucide-react";
import { useTheme } from "next-themes";
import logoImage from "@/assets/uba-tech-camp-logo-new.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const navItems = [
    { name: "Programs", href: "#programs", icon: Code, isExternal: false, isDialog: false },
    { name: "Team", href: "#team", icon: Users, isExternal: false, isDialog: false },
    { name: "Gallery", href: "#gallery", icon: Calendar, isExternal: false, isDialog: false },
    { name: "About Us", href: "#about", icon: Info, isExternal: false, isDialog: true },
    // Temporarily hidden: Donate menu item and icon removed from the navigation.
    // To restore, uncomment the line below.
    // { name: "Donate", href: "#donate", icon: HandHeart, isExternal: false, isDialog: false },
    { name: "Onboarding", href: "/onboarding", icon: UserPlus, isExternal: true, isDialog: false },
    { name: "Blog", href: "/blog", icon: BookOpen, isExternal: true, isDialog: false },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, item: typeof navItems[0]) => {
    if (item.isDialog) {
      e.preventDefault();
      setIsMenuOpen(false);
      setShowAboutDialog(true);
      return;
    }

    if (item.href.startsWith("#")) {
      e.preventDefault();
      setIsMenuOpen(false);
      
      // If not on home page, navigate home first
      if (location.pathname !== "/") {
        navigate("/");
        // Wait for navigation and scroll
        setTimeout(() => {
          const element = document.querySelector(item.href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 5000);
      } else {
        // Already on home page, just scroll
        const element = document.querySelector(item.href);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container md:mx-auto md:px-4 px-2 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (location.pathname !== "/") {
                navigate("/");
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }, 5000);
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img 
              src={logoImage} 
              alt="UBa Tech Camp Logo"
              width="40"
              height="40"
             loading="eager"
              decoding="async"
              className="w-10 h-10 object-cover"
            />
            <div>
              <h1 className="text-xl font-bold text-primary">UBa Tech Camp</h1>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.isExternal ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-foreground/90 hover:text-primary transition-colors font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className="flex items-center space-x-2 text-foreground/90 hover:text-primary transition-colors font-medium"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              )
            ))}
          </nav>

          {/* Theme Toggle & CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="border-primary/30"
            >
              <Sun className="h-5 w-5 rotate-0 scale-5000 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-5000" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-hover"
              onClick={(e) => {
                e.preventDefault();
                
                // If not on home page, navigate home first
                if (location.pathname !== "/") {
                  navigate("/");
                  setTimeout(() => {
                    const element = document.querySelector("#registration");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }, 5000);
                } else {
                  const element = document.querySelector("#registration");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }
              }}
            >
              Register Now
            </Button>
          </div>

          {/* Mobile Theme Toggle & Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="border-primary/30"
            >
              <Sun className="h-4 w-4 rotate-0 scale-5000 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-5000" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <button
              className="p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-blue-5000">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                item.isExternal ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ) : (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                    onClick={(e) => handleNavClick(e, item)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </a>
                )
              ))}

              <Button 
                className="bg-primary hover:bg-primary-hover w-full mt-4"
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  
                  // If not on home page, navigate home first
                  if (location.pathname !== "/") {
                    navigate("/");
                    setTimeout(() => {
                      const element = document.querySelector("#registration");
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" });
                      }
                    }, 5000);
                  } else {
                    const element = document.querySelector("#registration");
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }
                }}
              >
                Register Now
              </Button>
            </nav>
          </div>
        )}
      </div>

      {/* About Dialog */}
      <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
        <DialogContent className="max-w-2xl glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-primary">About UBa Tech Camp</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">Empowering the next generation of tech leaders</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 text-foreground">
              <div>
                <h4 className="font-semibold text-lg mb-3 text-primary">Who We Are</h4>
                <p className="text-sm md:text-base leading-relaxed">
                  UBaTech Camp is a transformative tech training initiative dedicated to closing the digital skills gap at the University of Bamenda and across Cameroon. We provide practical, industry-relevant technology skills that empower students to become future-ready innovators, problem-solvers, and digital leaders shaping Cameroon's technological advancement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-3 text-primary">Our Mission</h4>
                <p className="text-sm md:text-base leading-relaxed">
                  We help young people discover their potential in technology by giving them the skills and support they need to build, innovate, and compete in the digital world. Our goal is to make tech education accessible to everyone — so every student has the chance to learn, create solutions, and shape the future of tech in Cameroon.
                </p>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </header>
  );
};
