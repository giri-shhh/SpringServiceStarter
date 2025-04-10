import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Github, Menu } from "lucide-react";

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Emit a custom event that the sidebar can listen to
    window.dispatchEvent(new CustomEvent("toggle-sidebar"));
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-3 md:hidden"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center">
            <img 
              src="https://spring.io/img/logos/spring-initializr.svg" 
              alt="Spring logo" 
              className="h-8 mr-2"
            />
            <h1 className="text-xl font-semibold">Microservice Architect</h1>
          </div>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-4 text-gray-700"
          >
            <Github className="h-6 w-6" />
          </a>
        </div>
      </div>
    </header>
  );
}
