import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send, Phone, Video, MoreVertical } from "lucide-react";
import { useState } from "react";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(1);

  const conversations = [
    { id: 1, name: "Alice M.", avatar: "https://i.pravatar.cc/150?u=alice", lastMessage: "Hey, did you finish the assignment?", time: "10:30 AM", unread: 2 },
    { id: 2, name: "React Developers", avatar: null, group: true, lastMessage: "Bob: I found a great tutorial!", time: "Yesterday", unread: 0 },
    { id: 3, name: "Study Group A", avatar: null, group: true, lastMessage: "Meeting at 5 PM?", time: "Yesterday", unread: 0 },
    { id: 4, name: "David K.", avatar: "https://i.pravatar.cc/150?u=david", lastMessage: "Thanks for the help!", time: "Mon", unread: 0 },
  ];

  const messages = [
    { id: 1, sender: "Alice M.", text: "Hey, did you finish the Data Structures assignment?", time: "10:30 AM", isMe: false },
    { id: 2, sender: "Me", text: "Almost there! Just stuck on the last graph problem.", time: "10:32 AM", isMe: true },
    { id: 3, sender: "Alice M.", text: "Oh, that one is tricky. Want to hop on a call and discuss it?", time: "10:33 AM", isMe: false },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Card className="w-80 flex flex-col border border-border shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search chats..." className="pl-9 bg-background/50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => (
            <div 
                key={chat.id} 
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${activeChat === chat.id ? 'bg-muted/50' : ''}`}
                onClick={() => setActiveChat(chat.id)}
            >
              <Avatar>
                <AvatarImage src={chat.avatar} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium truncate">{chat.name}</span>
                  <span className="text-xs text-muted-foreground">{chat.time}</span>
                </div>
                <p className={`text-sm truncate ${chat.unread > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex-1 flex flex-col border border-border shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
          <div className="flex items-center gap-3">
             <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?u=alice" />
                <AvatarFallback>AM</AvatarFallback>
             </Avatar>
             <div>
                <h3 className="font-semibold">Alice M.</h3>
                <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span> Online
                </p>
             </div>
          </div>
          <div className="flex items-center gap-1">
             <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5 text-muted-foreground" />
             </Button>
             <Button variant="ghost" size="icon">
                <Video className="h-5 w-5 text-muted-foreground" />
             </Button>
             <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
             </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.isMe 
                            ? 'bg-primary text-primary-foreground rounded-tr-none' 
                            : 'bg-muted rounded-tl-none'
                    }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {msg.time}
                        </p>
                    </div>
                </div>
            ))}
        </div>

        <div className="p-4 border-t border-border bg-background/50">
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <Input placeholder="Type a message..." className="flex-1" />
                <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
      </Card>
    </div>
  );
}
