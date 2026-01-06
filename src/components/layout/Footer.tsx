import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Linkedin,
} from "lucide-react";
import logoImage from "@/assets/uba-tech-camp-logo-new.png";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Programs", href: "#programs" },
    { label: "About", href: "#about" },
    { label: "Gallery", href: "#gallery" },
    { label: "Contact", href: "#contact" },
  ];

  const resourceLinks = [
    { label: "Blog", href: "/blog", isRoute: true },
    { label: "Student Portal", href: "/onboarding", isRoute: true },
    { label: "Ambassador Portal", href: "/ambassador-portal", isRoute: true },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", url: "https://www.facebook.com/profile.php?id=61572374583186" },
    { icon: Linkedin, name: "LinkedIn", url: "http://linkedin.com/company/uba-tech-camp" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoImage} 
                alt="UBa Tech Camp Logo"
                width="40"
                height="40"
                loading="eager"
                decoding="async"
                className="w-10 h-10"
              />
              <div>
                <h3 className="text-lg font-bold text-primary">UBa Tech Camp</h3>
                <p className="text-xs text-muted-foreground">2025 - 3rd Edition</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Transforming lives through technology education at the University of Bamenda.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 border-border hover:border-primary hover:bg-primary/10"
                  asChild
                >
                  <a href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                    <social.icon className="w-4 h-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  {link.isRoute ? (
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a 
                      href={link.href} 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>UBaDEF Hall 3, University of Bamenda</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span>+237 671 308 991</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <span>info.ubatechcamp@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} UBa Tech Camp. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Your Skills Today, Your Success Tomorrow.
          </p>
        </div>
      </div>
    </footer>
  );
};
