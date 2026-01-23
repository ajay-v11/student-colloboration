import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Plus, Github, ExternalLink } from "lucide-react";

export default function ProjectsPage() {
  const projects = [
    {
      id: 1,
      title: "EcoTrack Mobile App",
      description: "A Flutter application to track daily carbon footprint and suggest eco-friendly habits.",
      author: { name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=sarah" },
      techStack: ["Flutter", "Firebase", "Dart"],
      status: "Looking for Contributors",
      statusColor: "bg-green-500/10 text-green-600",
    },
    {
      id: 2,
      title: "AI Study Buddy",
      description: "An NLP-powered chatbot that helps students summarize lecture notes and generate quizzes.",
      author: { name: "James Wilson", avatar: "https://i.pravatar.cc/150?u=james" },
      techStack: ["Python", "OpenAI API", "React"],
      status: "In Progress",
      statusColor: "bg-blue-500/10 text-blue-600",
    },
    {
      id: 3,
      title: "Campus Marketplace",
      description: "A web platform for students to buy and sell textbooks and furniture securely.",
      author: { name: "Emily Davis", avatar: "https://i.pravatar.cc/150?u=emily" },
      techStack: ["Next.js", "PostgreSQL", "Stripe"],
      status: "Planning",
      statusColor: "bg-yellow-500/10 text-yellow-600",
    },
    {
      id: 4,
      title: "Smart Dorm Automation",
      description: "IoT system for controlling dorm lights and thermostat via a web dashboard.",
      author: { name: "Michael Brown", avatar: "https://i.pravatar.cc/150?u=michael" },
      techStack: ["Arduino", "Node.js", "WebSockets"],
      status: "Looking for Contributors",
      statusColor: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Student Projects</h1>
          <p className="text-muted-foreground">Showcase your work and find collaborators.</p>
        </div>
        <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border border-border shadow-sm max-w-md">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input 
            type="text" 
            placeholder="Search projects..." 
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="border border-border hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={project.author.avatar} />
                        <AvatarFallback>{project.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <p className="text-xs text-muted-foreground">by {project.author.name}</p>
                    </div>
                 </div>
                 <Badge variant="secondary" className={`${project.statusColor} hover:${project.statusColor} border-0`}>
                    {project.status}
                 </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {project.description}
              </p>
              <div className="flex gap-2 flex-wrap">
                {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs font-normal">
                        {tech}
                    </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-border pt-4">
               <div className="flex gap-2">
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Github className="h-4 w-4" />
                   </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                   </Button>
               </div>
               <Button size="sm">Request to Join</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
