import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Settings, 
  Search,
  ChevronDown,
  Paperclip,
  Hash,
  Plus,
  Compass,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const [activeChannel, setActiveChannel] = useState("general");

  // Mock data - in real app, fetch based on ID
  const group = {
    id,
    name: "React Developers",
    description: "A community for React enthusiasts.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    members: [
        { name: "Alice", avatar: "https://i.pravatar.cc/150?u=alice", role: "Admin", status: "online" },
        { name: "Bob", avatar: "https://i.pravatar.cc/150?u=bob", role: "Member", status: "online" },
        { name: "Charlie", avatar: "https://i.pravatar.cc/150?u=charlie", role: "Member", status: "offline" },
        { name: "Dave", avatar: "https://i.pravatar.cc/150?u=dave", role: "Member", status: "online" },
    ],
    categories: [
      {
        name: "Text Channels",
        channels: [
          { id: "general", name: "general", type: "text" },
          { id: "resources", name: "resources", type: "text" },
          { id: "announcements", name: "announcements", type: "text" },
          { id: "q-and-a", name: "q-and-a", type: "text" },
        ]
      }
    ]
  };

  const otherJoinedGroups = [
      { id: 1, name: "React Developers", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
      { id: 2, name: "ML 101", image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" },
  ];

  const messages = [
      { id: 1, user: "Alice", avatar: "https://i.pravatar.cc/150?u=alice", text: "Has anyone tried the new React compiler?", time: "10:30 AM" },
      { id: 2, user: "Bob", avatar: "https://i.pravatar.cc/150?u=bob", text: "Yes! It's amazing. No more useMemo everywhere.", time: "10:32 AM" },
      { id: 3, user: "You", avatar: null, text: "I need to check that out. Is it stable yet?", time: "10:35 AM", isMe: true },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 animate-in fade-in duration-500">
      
      {/* LEFT RAIL: Joined Groups Switcher */}
      <div className="w-[72px] glass rounded-[2rem] flex flex-col items-center py-4 gap-3 border border-white/40 shadow-xl shrink-0 z-20">
          <TooltipProvider delayDuration={0}>
            {/* Back to Discovery */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link to="/groups">
                        <div className="h-12 w-12 rounded-[24px] bg-white/50 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm group">
                            <Compass className="h-6 w-6 text-foreground group-hover:text-white" />
                        </div>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold ml-2">Discover Groups</TooltipContent>
            </Tooltip>

            <div className="w-8 h-[2px] bg-white/20 rounded-full" />

            {/* Joined Groups List */}
            {otherJoinedGroups.map((g) => (
                <Tooltip key={g.id}>
                    <TooltipTrigger asChild>
                        <Link to={`/groups/${g.id}`}>
                            <div className={`h-12 w-12 rounded-[24px] overflow-hidden border-2 transition-all duration-300 hover:rounded-[16px] ${Number(id) === g.id ? 'border-primary ring-2 ring-primary/20 rounded-[16px]' : 'border-white/50 hover:border-white'}`}>
                                <img src={g.image} alt={g.name} className="h-full w-full object-cover" />
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-bold ml-2">{g.name}</TooltipContent>
                </Tooltip>
            ))}

            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="h-12 w-12 rounded-[24px] bg-white/30 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer group border border-dashed border-white/50">
                        <Plus className="h-6 w-6 text-muted-foreground group-hover:text-white" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-bold ml-2">Join Group</TooltipContent>
            </Tooltip>
          </TooltipProvider>
      </div>

      {/* CHANNEL SIDEBAR */}
      <div className="w-60 glass rounded-[2rem] flex flex-col border border-white/40 overflow-hidden shadow-xl shrink-0">
         {/* Group Header */}
         <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 hover:bg-white/10 transition-colors cursor-pointer bg-white/10">
            <h2 className="font-bold text-base truncate">{group.name}</h2>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
         </div>

         {/* Channel List */}
         <ScrollArea className="flex-1 p-3">
            {group.categories.map((cat, i) => (
              <div key={i} className="mb-6">
                <h3 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 px-2 flex items-center justify-between group">
                  {cat.name}
                </h3>
                <div className="space-y-[2px]">
                  {cat.channels.map((channel) => (
                    <div 
                      key={channel.id}
                      onClick={() => setActiveChannel(channel.id)}
                      className={`
                        flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 group
                        ${activeChannel === channel.id 
                          ? 'bg-primary/10 text-primary font-medium shadow-sm' 
                          : 'text-muted-foreground hover:bg-white/40 hover:text-foreground'
                        }
                      `}
                    >
                      <Hash className={`h-4 w-4 ${activeChannel === channel.id ? 'text-primary' : 'text-muted-foreground/50 group-hover:text-muted-foreground'}`} />
                      <span className="text-sm truncate">{channel.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
         </ScrollArea>

         {/* User Mini Profile */}
         <div className="p-3 bg-white/30 border-t border-white/10 flex items-center gap-2">
            <Avatar className="h-9 w-9 border border-white shadow-sm">
               <AvatarImage src="https://github.com/shadcn.png" />
               <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
               <div className="text-sm font-bold truncate">Student Name</div>
               <div className="text-[10px] text-muted-foreground truncate">Online</div>
            </div>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
               <Settings className="h-4 w-4" />
            </Button>
         </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col glass rounded-[2rem] border border-white/40 shadow-xl overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-white/10 bg-white/30 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
            <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-bold text-lg">{activeChannel}</h3>
                <div className="h-4 w-[1px] bg-white/30 mx-2" />
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">General discussion</p>
            </div>
            <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                   <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
                   <input className="h-8 rounded-md bg-black/5 border-none pl-8 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-primary/20" placeholder="Search" />
                </div>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col-reverse">
             <div className="flex-1" />
            {messages.map((msg) => (
                <div key={msg.id} className="group flex gap-4 hover:bg-black/5 -mx-4 px-4 py-1 rounded-lg transition-colors">
                     <Avatar className="h-10 w-10 border border-white/50 shadow-sm mt-0.5 cursor-pointer hover:drop-shadow-md transition-all">
                         <AvatarImage src={msg.avatar} />
                         <AvatarFallback>{msg.user[0]}</AvatarFallback>
                     </Avatar>
                     <div className="flex-1 min-w-0">
                         <div className="flex items-baseline gap-2">
                             <span className={`text-sm font-bold cursor-pointer hover:underline ${msg.isMe ? 'text-primary' : 'text-foreground'}`}>
                               {msg.user}
                             </span>
                             <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                         </div>
                         <p className="text-sm text-foreground/90 leading-relaxed mt-0.5">
                             {msg.text}
                         </p>
                     </div>
                </div>
            ))}
            
            <div className="mb-8 mt-4 px-4">
                <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-4">
                   <Hash className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold font-serif mb-2">Welcome to #{activeChannel}!</h1>
                <p className="text-muted-foreground">This is the start of the <span className="font-bold text-foreground">#{activeChannel}</span> channel.</p>
            </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/30 backdrop-blur-md mb-2 mx-4 rounded-xl">
            <div className="bg-white/60 border border-white/40 rounded-xl p-1 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-black/5">
                    <Paperclip className="h-4 w-4" />
                </Button>
                <input 
                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-2 placeholder:text-muted-foreground/70"
                    placeholder={`Message #${activeChannel}`}
                />
                <Button size="icon" className="h-8 w-8 rounded-lg bg-transparent text-primary hover:bg-primary/10 shadow-none">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>

      {/* Member Sidebar (Right) */}
      <div className="w-60 glass rounded-[2rem] border border-white/40 hidden lg:flex flex-col overflow-hidden shadow-xl shrink-0">
          <div className="h-16 border-b border-white/10 flex items-center px-4 font-bold text-sm">
             Members — {group.members.length}
          </div>
          <ScrollArea className="flex-1 p-3">
             {["online", "offline"].map(status => {
                 const statusMembers = group.members.filter(m => m.status === status);
                 if (statusMembers.length === 0) return null;
                 return (
                     <div key={status} className="mb-6">
                         <h3 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 px-2">
                             {status.charAt(0).toUpperCase() + status.slice(1)} — {statusMembers.length}
                         </h3>
                         <div className="space-y-1">
                             {statusMembers.map((member, i) => (
                                 <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/40 cursor-pointer transition-colors group opacity-90 hover:opacity-100">
                                     <div className="relative">
                                         <Avatar className="h-8 w-8 border border-white/50">
                                             <AvatarImage src={member.avatar} />
                                             <AvatarFallback>{member.name[0]}</AvatarFallback>
                                         </Avatar>
                                         <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                     </div>
                                     <div>
                                         <div className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{member.name}</div>
                                         <div className="text-[10px] text-muted-foreground mt-0.5">{member.role}</div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )
             })}
          </ScrollArea>
      </div>
    </div>
  );
}
