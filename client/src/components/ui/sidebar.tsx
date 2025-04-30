import * as React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import Logo from "@/components/Logo";
import { 
  Home, 
  Search, 
  PlusCircle, 
  User, 
  BarChart3, 
  Calendar, 
  LogOut, 
  Heart 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./button";
import { Separator } from "./separator";
import { useMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
}

export function Sidebar({ 
  className, 
  isCollapsed = false, 
  ...props 
}: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isMobile = useMobile();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get first letter of the user's name for avatar fallback
  const getInitials = (name: string) => {
    return name ? name[0].toUpperCase() : "U";
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar border-sidebar-border",
        isCollapsed ? "w-[80px]" : "w-60",
        className
      )}
      {...props}
    >
      <div className="flex h-16 items-center px-4">
        {isCollapsed ? (
          <Logo withText={false} size="sm" />
        ) : (
          <Logo size="sm" className="mt-2" />
        )}
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 gap-1">
          <NavItem 
            href="/" 
            label="Home" 
            icon={<Home className="h-5 w-5" />} 
            isCollapsed={isCollapsed} 
            isActive={location === "/"} 
          />
          <NavItem 
            href="/browse" 
            label="Browse Food" 
            icon={<Search className="h-5 w-5" />} 
            isCollapsed={isCollapsed} 
            isActive={location === "/browse"} 
          />
          <NavItem 
            href="/create-listing" 
            label="Share Food" 
            icon={<PlusCircle className="h-5 w-5" />} 
            isCollapsed={isCollapsed} 
            isActive={location === "/create-listing"} 
          />
          <NavItem 
            href="/dashboard" 
            label="Dashboard" 
            icon={<BarChart3 className="h-5 w-5" />} 
            isCollapsed={isCollapsed} 
            isActive={location === "/dashboard"} 
          />
          <NavItem 
            href="/profile" 
            label="Profile" 
            icon={<User className="h-5 w-5" />} 
            isCollapsed={isCollapsed} 
            isActive={location === "/profile"} 
          />
          <Separator className="my-4" />
          <NavItem 
            href="#" 
            label="About Annadaan" 
            icon={<Heart className="h-5 w-5" />} 
            isCollapsed={isCollapsed} 
            isActive={false} 
          />
        </nav>
      </div>
      <div className="sticky bottom-0 p-2">
        {!isCollapsed ? (
          <div className="flex flex-col gap-2">
            {user && (
              <div className="p-2 flex items-center">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarImage src={user.avatar || ""} alt={user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-muted-foreground text-xs truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isCollapsed: boolean;
  isActive: boolean;
}

function NavItem({ href, label, icon, isCollapsed, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent/20",
          isActive ? "bg-accent/30 text-accent-foreground" : "text-muted-foreground"
        )}
      >
        {icon}
        {!isCollapsed && <span>{label}</span>}
      </a>
    </Link>
  );
}
