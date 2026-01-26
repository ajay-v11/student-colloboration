import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Settings, 
  Search,
  ChevronDown,
  Paperclip,
  Hash,
  Plus,
  Compass
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function GroupDetailsPage() {
  const { id } = useParams();
  const [activeChannel, setActiveChannel] = useState(null);
  const [group, setGroup] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [messages] = useState([]); // Placeholder for now, real chat is Phase 5
  const [loading, setLoading] = useState(true);

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/groups/${id}`);
      setGroup(data);
    } catch (error) {
      console.error("Failed to fetch group details", error);
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMyGroups = useCallback(async () => {
    try {
        const data = await api.get("/groups/my-groups");
        setMyGroups(data);
    } catch (error) {
        console.error("Failed to fetch my groups", error);
    }
  }, []);

  useEffect(() => {
    fetchGroupDetails();
    fetchMyGroups();
  }, [fetchGroupDetails, fetchMyGroups]);

  useEffect(() => {
    if (group?.channels?.length > 0 && !activeChannel) {
        setActiveChannel(group.channels[0].id);
    }
  }, [group, activeChannel]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading group...</div>;
  if (!group) return <div className="h-screen flex items-center justify-center">Group not found</div>;

  const currentChannel = group.channels?.find(c => c.id === activeChannel) || group.channels?.[0];

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
            {myGroups.map((g) => (
                <Tooltip key={g.id}>
                    <TooltipTrigger asChild>
                        <Link to={`/groups/${g.id}`}>
                            <div className={`h-12 w-12 rounded-[24px] overflow-hidden border-2 transition-all duration-300 hover:rounded-[16px] ${id === g.id ? 'border-primary ring-2 ring-primary/20 rounded-[16px]' : 'border-white/50 hover:border-white'}`}>
                                <img src={g.groupIconUrl || `https://ui-avatars.com/api/?name=${g.name}&background=random`} alt={g.name} className="h-full w-full object-cover" />
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-bold ml-2">{g.name}</TooltipContent>
                </Tooltip>
            ))}

            <Tooltip>
                <TooltipTrigger asChild>
                    <Link to="/groups">
                        <div className="h-12 w-12 rounded-[24px] bg-white/30 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer group border border-dashed border-white/50">
                            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-white" />
                        </div>
                    </Link>
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
            <div className="mb-6">
                <h3 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 px-2 flex items-center justify-between group">
                  Text Channels
                </h3>
                <div className="space-y-[2px]">
                  {group.channels?.map((channel) => (
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
                  {(!group.channels || group.channels.length === 0) && (
                      <div className="px-2 text-xs text-muted-foreground">No channels yet</div>
                  )}
                </div>
            </div>
         </ScrollArea>

         {/* User Mini Profile */}
         <div className="p-3 bg-white/30 border-t border-white/10 flex items-center gap-2">
            <Avatar className="h-9 w-9 border border-white shadow-sm">
               <AvatarImage src={`https://ui-avatars.com/api/?name=User&background=random`} />
               <AvatarFallback>ME</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
               <div className="text-sm font-bold truncate">Me</div>
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
                <h3 className="font-bold text-lg">{currentChannel?.name || 'select-channel'}</h3>
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
            
            {messages.length === 0 && (
                 <div className="mb-8 mt-4 px-4">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-4">
                    <Hash className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold font-serif mb-2">Welcome to #{currentChannel?.name}!</h1>
                    <p className="text-muted-foreground">This is the start of the <span className="font-bold text-foreground">#{currentChannel?.name}</span> channel.</p>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/30 backdrop-blur-md mb-2 mx-4 rounded-xl">
            <div className="bg-white/60 border border-white/40 rounded-xl p-1 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-black/5">
                    <Paperclip className="h-4 w-4" />
                </Button>
                <input 
                    className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-2 placeholder:text-muted-foreground/70"
                    placeholder={`Message #${currentChannel?.name || 'channel'}`}
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
             Members — {group.participants?.length || 0}
          </div>
          <ScrollArea className="flex-1 p-3">
             {/* Flattened member list for now since we don't have online status in DB yet */}
             <div className="mb-6">
                 <h3 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 px-2">
                     All Members
                 </h3>
                 <div className="space-y-1">
                     {group.participants?.map((member) => (
                         <div key={member.id} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/40 cursor-pointer transition-colors group opacity-90 hover:opacity-100">
                             <div className="relative">
                                 <Avatar className="h-8 w-8 border border-white/50">
                                     <AvatarImage src={member.avatarUrl} />
                                     <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                 </Avatar>
                                 {/* Mock status indicator */}
                                 <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-gray-400`}></span>
                             </div>
                             <div>
                                 <div className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{member.name}</div>
                                 <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">{member.role?.toLowerCase()}</div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
          </ScrollArea>
      </div>
    </div>
  );
}
