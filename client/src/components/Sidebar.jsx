import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Briefcase, 
  MessageSquare, 
  Settings,
  LogOut,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Users, label: "Groups", href: "/groups" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Briefcase, label: "Internships", href: "/internships" },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-4 top-4 bottom-4 w-[260px] hidden md:flex flex-col rounded-3xl glass z-50 overflow-hidden transition-all duration-300">
      {/* Brand Header */}
      <div className="flex h-20 items-center px-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-3 font-bold text-xl text-foreground tracking-tight group">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
            <GraduationCap className="w-6 h-6" strokeWidth={2} />
          </div>
          <span className="font-serif">StudentFlow</span>
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 translate-x-1" 
                  : "text-muted-foreground hover:bg-white/50 hover:text-foreground hover:translate-x-1"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive && "text-primary-foreground")} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute right-3 h-2 w-2 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer / Settings */}
      <div className="p-4 mt-auto border-t border-white/10 space-y-2 bg-white/30 backdrop-blur-md">
        <Link to="/settings">
             <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl hover:bg-white/60 h-10" >
                <Settings className="h-4 w-4" />
                Settings
            </Button>
        </Link>
        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-10">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
