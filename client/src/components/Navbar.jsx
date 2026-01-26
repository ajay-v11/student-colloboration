import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ChevronRight, Home, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to generate breadcrumbs from path
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);

    // Default to 'Dashboard' if at root or just /dashboard
    if (
      pathnames.length === 0 ||
      (pathnames.length === 1 && pathnames[0] === "dashboard")
    ) {
      return (
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Home className="h-4 w-4" />
          <span>Dashboard</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground capitalize">
        <Link
          to="/dashboard"
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <Home className="h-4 w-4" />
        </Link>
        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          return (
            <div key={to} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              {isLast ? (
                <span className="text-foreground font-semibold px-2 py-1 rounded-md bg-white/40 border border-white/50 shadow-sm">
                  {value.replace(/-/g, " ")}
                </span>
              ) : (
                <Link to={to} className="hover:text-primary transition-colors">
                  {value.replace(/-/g, " ")}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <header className="flex h-20 w-full items-center justify-between px-8 py-4 z-40 bg-transparent">
      {/* Mobile Brand (only visible on small screens) */}
      <div className="flex items-center gap-4 md:hidden glass px-4 py-2 rounded-full">
        <span className="font-serif font-bold text-lg text-primary">
          StudentFlow
        </span>
      </div>

      {/* Left: Breadcrumbs (Replaces Search) */}
      <div className="hidden md:flex flex-1 items-center">
        <div className="glass px-5 py-2.5 rounded-2xl flex items-center shadow-sm border border-white/40">
          {getBreadcrumbs()}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-white/50 transition-colors h-10 w-10"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive ring-2 ring-white"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 pl-2 glass rounded-full p-1.5 pr-4 transition-all hover:shadow-md cursor-pointer group">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.name?.[0] || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start hidden md:flex">
                <span className="text-sm font-semibold text-foreground leading-none">
                  {user?.name || "Student"}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
