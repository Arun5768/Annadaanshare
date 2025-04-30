import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobile } from "@/hooks/use-mobile";

const Header = () => {
  const [location] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get first letter of the user's name for avatar fallback
  const getInitials = (name: string) => {
    return name ? name[0].toUpperCase() : "U";
  };

  const navItems = [
    { title: "Home", path: "/" },
    { title: "Browse Food", path: "/browse" },
    { title: "How It Works", path: "#how-it-works" },
    { title: "About Us", path: "#about" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a>
            <Logo />
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={`text-neutral-600 hover:text-primary transition-colors ${location === item.path ? 'text-primary font-medium' : ''}`}>
                {item.title}
              </a>
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  {!isMobile && (
                    <>
                      <Link href="/dashboard">
                        <a className="text-neutral-700 hover:text-primary transition-colors">
                          Dashboard
                        </a>
                      </Link>
                      <Link href="/create-listing">
                        <a>
                          <Button size="sm" variant="default">
                            Share Food
                          </Button>
                        </a>
                      </Link>
                    </>
                  )}
                  <Link href="/profile">
                    <a className="flex items-center">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar || ""} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </a>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/auth">
                    <a className="hidden md:block px-4 py-2 text-neutral-700 hover:text-primary transition-colors">
                      Login
                    </a>
                  </Link>
                  <Link href="/auth">
                    <a className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
                      Sign Up
                    </a>
                  </Link>
                </>
              )}
            </>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="md:hidden text-neutral-700">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center py-4">
                  <Logo size="sm" />
                </div>
                <div className="flex flex-col space-y-3 mt-8">
                  {navItems.map(item => (
                    <Link key={item.path} href={item.path}>
                      <a className="text-neutral-600 py-2 hover:text-primary transition-colors text-lg">
                        {item.title}
                      </a>
                    </Link>
                  ))}
                  {user ? (
                    <>
                      <Link href="/dashboard">
                        <a className="text-neutral-600 py-2 hover:text-primary transition-colors text-lg">
                          Dashboard
                        </a>
                      </Link>
                      <Link href="/create-listing">
                        <a className="text-neutral-600 py-2 hover:text-primary transition-colors text-lg">
                          Share Food
                        </a>
                      </Link>
                      <Link href="/profile">
                        <a className="text-neutral-600 py-2 hover:text-primary transition-colors text-lg">
                          Profile
                        </a>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="text-neutral-600 py-2 hover:text-primary transition-colors text-lg text-left"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/auth">
                      <a className="text-neutral-600 py-2 hover:text-primary transition-colors text-lg">
                        Login / Sign Up
                      </a>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Header;
