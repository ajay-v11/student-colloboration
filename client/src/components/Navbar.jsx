import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

export function Navbar({ user }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-4 md:hidden">
        <span className="font-bold text-lg text-primary">StudentFlow</span>
      </div>
      
      <div className="hidden md:flex flex-1 max-w-lg">
        <div className="relative w-full">
           <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search..." 
            className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive"></span>
        </Button>
        
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end hidden md:flex">
             <span className="text-sm font-medium text-foreground">
               {user?.name || "Student"}
             </span>
           </div>
           <Link to="/profile">
             <Avatar className="cursor-pointer h-9 w-9">
               <AvatarImage src={user?.avatarUrl} />
               <AvatarFallback>{user?.name?.[0] || "S"}</AvatarFallback>
             </Avatar>
           </Link>
        </div>
      </div>
    </header>
  );
}
