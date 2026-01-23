import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Link as LinkIcon, Calendar, Edit, Grid, BookOpen, Award } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("about");

  const user = {
    name: "Alex Johnson",
    handle: "@alexj",
    role: "Computer Science Student",
    bio: "Passionate about full-stack development and AI. Always learning new technologies and looking for cool projects to collaborate on.",
    location: "New York, USA",
    website: "alexj.dev",
    joined: "September 2023",
    followers: 245,
    following: 120,
    avatar: "https://i.pravatar.cc/150?u=alex",
    skills: ["React", "Node.js", "TypeScript", "Python", "PostgreSQL", "Tailwind CSS", "Docker", "AWS"],
  };

  return (
    <div className="space-y-6">
      <Card className="border border-border shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-primary/20 via-purple-500/20 to-secondary/20 w-full" />
        <div className="px-6 pb-6">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
             <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
             </Avatar>
             <Button className="gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
             </Button>
          </div>
          
          <div className="space-y-4">
             <div>
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.handle} • {user.role}</p>
             </div>
             
             <p className="max-w-2xl text-sm">{user.bio}</p>
             
             <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {user.location}
                </div>
                <div className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" /> {user.website}
                </div>
                <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Joined {user.joined}
                </div>
             </div>
             
             <div className="flex gap-4 text-sm">
                <div><span className="font-bold text-foreground">{user.followers}</span> <span className="text-muted-foreground">Followers</span></div>
                <div><span className="font-bold text-foreground">{user.following}</span> <span className="text-muted-foreground">Following</span></div>
             </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 border-b border-border">
        <Button 
            variant={activeTab === 'about' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('about')}
            className="rounded-b-none"
        >
            About
        </Button>
        <Button 
            variant={activeTab === 'posts' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('posts')}
            className="rounded-b-none"
        >
            Posts
        </Button>
        <Button 
            variant={activeTab === 'projects' ? 'default' : 'ghost'} 
            onClick={() => setActiveTab('projects')}
            className="rounded-b-none"
        >
            Projects
        </Button>
      </div>

      <div className="grid gap-6">
        {activeTab === 'about' && (
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookOpen className="h-5 w-5" /> Skills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill) => (
                                <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Award className="h-5 w-5" /> Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <h3 className="font-semibold">B.S. Computer Science</h3>
                            <p className="text-sm text-muted-foreground">University of Technology • 2021 - Present</p>
                            <p className="text-sm">GPA: 3.8/4.0</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
        
        {activeTab === 'posts' && (
            <div className="text-center py-12 text-muted-foreground">
                <Grid className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No posts yet</p>
            </div>
        )}

        {activeTab === 'projects' && (
             <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No projects yet</p>
            </div>
        )}
      </div>
    </div>
  );
}
