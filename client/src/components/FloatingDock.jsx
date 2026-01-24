import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  Briefcase, 
  MessageSquare, 
  UserCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const dockItems = [
  { icon: LayoutDashboard, label: "Hub", href: "/dashboard" },
  { icon: Users, label: "Groups", href: "/groups" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Briefcase, label: "Internships", href: "/internships" },
  { icon: MessageSquare, label: "Chat", href: "/messages" },
  { icon: UserCircle, label: "Profile", href: "/profile" },
];

export function FloatingDock() {
  const location = useLocation();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="glass flex items-center gap-2 p-2 rounded-full border border-white/20 shadow-2xl shadow-primary/10 transition-all duration-300 hover:scale-105">
        <TooltipProvider delayDuration={0}>
          {dockItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out hover:-translate-y-2",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110" 
                        : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                    {isActive && (
                      <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-white/80" />
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="mb-2 font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
