import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Phone, Video, MoreVertical, Edit, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(1);

  const conversations = [
    { id: 1, name: "Alice M.", avatar: "https://i.pravatar.cc/150?u=alice", lastMessage: "Hey, did you finish the assignment?", time: "10:30 AM", unread: 2, online: true },
    { id: 2, name: "React Developers", avatar: null, group: true, lastMessage: "Bob: I found a great tutorial!", time: "Yesterday", unread: 0, online: false },
    { id: 3, name: "Study Group A", avatar: null, group: true, lastMessage: "Meeting at 5 PM?", time: "Yesterday", unread: 0, online: false },
    { id: 4, name: "David K.", avatar: "https://i.pravatar.cc/150?u=david", lastMessage: "Thanks for the help!", time: "Mon", unread: 0, online: true },
  ];

  const messages = [
    { id: 1, sender: "Alice M.", text: "Hey, did you finish the Data Structures assignment?", time: "10:30 AM", isMe: false },
    { id: 2, sender: "Me", text: "Almost there! Just stuck on the last graph problem.", time: "10:32 AM", isMe: true },
    { id: 3, sender: "Alice M.", text: "Oh, that one is tricky. Want to hop on a call and discuss it?", time: "10:33 AM", isMe: false },
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 animate-in fade-in duration-500">
      
      {/* Sidebar List */}
      <div className="w-80 md:w-96 glass rounded-[2rem] border border-white/40 flex flex-col overflow-hidden shadow-xl">
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif font-bold">Messages</h1>
            <Button size="icon" variant="ghost" className="rounded-full hover:bg-white/50">
                <Edit className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
                type="text" 
                placeholder="Search conversations..." 
                className="pl-9 h-11 rounded-xl bg-white/40 border-transparent focus:bg-white/80 focus:border-primary/20 transition-all placeholder:text-muted-foreground/70" 
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.map((chat) => (
            <div 
                key={chat.id} 
                className={`
                    group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200
                    ${activeChat === chat.id 
                        ? 'bg-white/60 shadow-sm border border-white/40' 
                        : 'hover:bg-white/30 border border-transparent'
                    }
                `}
                onClick={() => setActiveChat(chat.id)}
            >
              <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                  )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold truncate ${activeChat === chat.id ? 'text-primary' : 'text-foreground'}`}>{chat.name}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{chat.time}</span>
                </div>
                <p className={`text-sm truncate ${chat.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {chat.unread > 0 ? <span className="text-primary">{chat.lastMessage}</span> : chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="h-5 min-w-[1.25rem] px-1.5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold shadow-lg shadow-primary/30">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col glass rounded-[2rem] border border-white/40 shadow-xl overflow-hidden relative hidden md:flex">
         {/* Chat Header */}
         <div className="h-20 border-b border-white/10 bg-white/30 backdrop-blur-md flex items-center justify-between px-6 z-10">
           <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-white shadow-sm">
                 <AvatarImage src="https://i.pravatar.cc/150?u=alice" />
                 <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div>
                 <h3 className="font-bold text-lg leading-tight">Alice M.</h3>
                 <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span> 
                    <p className="text-xs text-muted-foreground font-medium">Online now</p>
                 </div>
              </div>
           </div>
           <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/50 rounded-full h-10 w-10"><Phone className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/50 rounded-full h-10 w-10"><Video className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/50 rounded-full h-10 w-10"><MoreVertical className="h-5 w-5" /></Button>
           </div>
         </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                    <div className={`max-w-[70%] group`}>
                        <div className={`p-4 rounded-[1.25rem] shadow-sm text-sm leading-relaxed relative ${
                            msg.isMe 
                            ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-primary/20' 
                            : 'bg-white text-foreground rounded-tl-sm shadow-black/5'
                        }`}>
                            {msg.text}
                        </div>
                        <p className={`text-[10px] mt-1.5 px-1 font-medium ${msg.isMe ? 'text-right text-muted-foreground' : 'text-muted-foreground'}`}>
                            {msg.time}
                        </p>
                    </div>
                </div>
            ))}
         </div>

         {/* Footer */}
         <div className="p-4 bg-white/40 backdrop-blur-md border-t border-white/20">
            <form className="flex items-end gap-2" onSubmit={(e) => e.preventDefault()}>
                <div className="flex-1 bg-white/60 border border-white/40 rounded-[1.5rem] p-1.5 pl-4 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <input 
                        className="flex-1 bg-transparent border-none outline-none text-sm min-h-[2.5rem] placeholder:text-muted-foreground/70"
                        placeholder="Type your message..."
                    />
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-primary">
                        <MoreVertical className="h-4 w-4 rotate-90" />
                    </Button>
                </div>
                <Button type="submit" size="icon" className="rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90 shrink-0">
                    <Send className="h-5 w-5 ml-0.5" />
                </Button>
            </form>
         </div>
      </div>
    </div>
  );
}
