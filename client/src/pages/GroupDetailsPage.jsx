import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Send, Users, MessageSquare, Info } from "lucide-react";

export default function GroupDetailsPage() {
  const { id } = useParams();

  const group = {
    id,
    name: "React Developers",
    description: "A community for React enthusiasts to learn and share knowledge.",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    members: [
        { name: "Alice", avatar: "https://i.pravatar.cc/150?u=alice" },
        { name: "Bob", avatar: "https://i.pravatar.cc/150?u=bob" },
        { name: "Charlie", avatar: "https://i.pravatar.cc/150?u=charlie" },
    ],
    tags: ["React", "JavaScript", "Frontend"],
  };

  return (
    <div className="space-y-6">
      <div className="relative h-48 rounded-lg overflow-hidden">
        <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
            <div className="text-white">
                <h1 className="text-3xl font-bold">{group.name}</h1>
                <p className="opacity-90">{group.description}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <Card className="flex flex-col h-[500px]">
                <CardHeader className="border-b border-border">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" /> Discussion
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 bg-muted/5 flex items-center justify-center text-muted-foreground">
                    <p>Chat messages would appear here...</p>
                </CardContent>
                <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                        <Input placeholder="Type a message..." />
                        <Button size="icon"><Send className="h-4 w-4" /></Button>
                    </div>
                </div>
            </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" /> About
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {group.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                    <Button className="w-full">Join Group</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" /> Members ({group.members.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {group.members.map((member, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{member.name}</span>
                            </div>
                        ))}
                         <Button variant="link" className="px-0 text-muted-foreground w-full">View all</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
