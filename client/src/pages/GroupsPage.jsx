import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function GroupsPage() {
  const groups = [
    {
      id: 1,
      name: "React Developers",
      description: "A community for React enthusiasts to learn and share knowledge.",
      members: 128,
      tags: ["Development", "React", "Frontend"],
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 2,
      name: "Machine Learning 101",
      description: "Study group for the upcoming ML exam. Beginners welcome!",
      members: 45,
      tags: ["AI", "Python", "Study"],
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 3,
      name: "UX/UI Design Hub",
      description: "Discussing design trends, tools, and critiques.",
      members: 89,
      tags: ["Design", "Figma", "UX"],
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 4,
      name: "Algorithms & Data Structures",
      description: "LeetCode grinding and interview prep.",
      members: 230,
      tags: ["CS", "Interviews", "Coding"],
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 5,
      name: "Photography Club",
      description: "Sharing photos and tips on post-processing.",
      members: 67,
      tags: ["Art", "Photography", "Creative"],
      image: "https://images.unsplash.com/photo-1542038784456-1ea0e93ca64b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
    {
      id: 6,
      name: "Calculus Study Group",
      description: "Preparing for the finals. Solving problems together.",
      members: 34,
      tags: ["Math", "Study", "Academic"],
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
          <p className="text-muted-foreground">Find and join communities of like-minded students.</p>
        </div>
        <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Group
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border border-border shadow-sm max-w-md">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input 
            type="text" 
            placeholder="Search groups..." 
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 border border-border group">
            <div className="h-32 w-full overflow-hidden">
                <img 
                    src={group.image} 
                    alt={group.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{group.name}</CardTitle>
              </div>
              <div className="flex gap-2 flex-wrap pt-2">
                {group.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                        {tag}
                    </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {group.description}
              </p>
            </CardContent>
            <CardFooter className="pt-0 flex items-center justify-between border-t border-border p-4 bg-muted/20">
              <div className="flex items-center text-sm text-muted-foreground gap-1">
                <Users className="h-4 w-4" />
                <span>{group.members} members</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/groups/${group.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
