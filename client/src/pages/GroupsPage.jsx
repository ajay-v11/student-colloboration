import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Sparkles, Filter, Users, Zap, Hash, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GroupsPage() {
  const groups = [
    {
      id: 1,
      name: "React Developers",
      description: "A community for React enthusiasts to learn and share knowledge.",
      members: 128,
      tags: ["Development", "React", "Frontend"],
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      active: true,
      joined: true
    },
    {
      id: 2,
      name: "Machine Learning 101",
      description: "Study group for the upcoming ML exam. Beginners welcome!",
      members: 45,
      tags: ["AI", "Python", "Study"],
      image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      active: false,
      joined: true
    },
    {
      id: 3,
      name: "UX/UI Design Hub",
      description: "Discussing design trends, tools, and critiques.",
      members: 89,
      tags: ["Design", "Figma", "UX"],
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      active: true,
      joined: false
    },
    {
      id: 4,
      name: "Algorithms & Data Structures",
      description: "LeetCode grinding and interview prep.",
      members: 230,
      tags: ["CS", "Interviews", "Coding"],
      image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      active: true,
      joined: false
    },
    {
      id: 5,
      name: "Photography Club",
      description: "Sharing photos and tips on post-processing.",
      members: 67,
      tags: ["Art", "Photography", "Creative"],
      image: "https://images.unsplash.com/photo-1542038784456-1ea0e93ca64b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      active: false,
      joined: false
    },
    {
      id: 6,
      name: "Calculus Study Group",
      description: "Preparing for the finals. Solving problems together.",
      members: 34,
      tags: ["Math", "Study", "Academic"],
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      active: false,
      joined: false
    },
  ];

  const joinedGroups = groups.filter(g => g.joined);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary">Academic Circles</Badge>
             <span className="text-xs text-muted-foreground font-medium">85 Active Groups</span>
           </div>
           <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">
             Discover Your <span className="text-primary">Squad</span>
           </h1>
           <p className="text-muted-foreground mt-2 max-w-xl text-lg">
             Join a circle of peers who share your passion. Collaborate, learn, and grow together.
           </p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="rounded-full h-12 px-6 glass hover:bg-white/50 border-white/40">
                <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
            <Button className="rounded-full h-12 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" /> Create Circle
            </Button>
        </div>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="bg-white/40 backdrop-blur-sm border border-white/20 p-1 rounded-full h-auto">
          <TabsTrigger value="discover" className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/25 transition-all">
             <Search className="w-4 h-4 mr-2" /> Discover
          </TabsTrigger>
          <TabsTrigger value="joined" className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/25 transition-all">
             <Layers className="w-4 h-4 mr-2" /> My Circles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-8 mt-8">
            {/* Search Bar */}
            <div className="relative group max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input 
                    type="text" 
                    placeholder="Search for 'Machine Learning', 'Calculus', 'Design'..." 
                    className="pl-11 h-14 rounded-2xl border-white/40 bg-white/60 backdrop-blur-md shadow-sm text-lg focus-visible:ring-primary/20 transition-all hover:bg-white/80 focus:bg-white/90" 
                />
            </div>

            {/* Featured / Trending Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-3">
                    <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" /> Trending Now
                    </h2>
                </div>
                {groups.slice(0, 3).map((group) => (
                    <Link to={`/groups/${group.id}`} key={group.id} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full glass p-6 rounded-[2rem] border border-white/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                                    <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                                </div>
                                {group.active && (
                                    <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">Active Now</Badge>
                                )}
                            </div>
                            
                            <div>
                                <h3 className="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">{group.name}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{group.description}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {group.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-white/50 text-muted-foreground border border-white/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/20">
                                <div className="flex -space-x-2">
                                    {[1,2,3].map(i => (
                                        <Avatar key={i} className="h-7 w-7 border-2 border-white">
                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${group.id}${i}`} />
                                            <AvatarFallback>U</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border-2 border-white text-muted-foreground">
                                        +{group.members}
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-primary flex items-center group/btn">
                                    Join <Sparkles className="h-3 w-3 ml-1 group-hover/btn:rotate-12 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* All Groups Grid */}
            <div>
                <h2 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                    <Hash className="h-5 w-5 text-primary" /> All Circles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {groups.slice(3).map((group) => (
                        <Link to={`/groups/${group.id}`} key={group.id} className="glass-card p-5 rounded-3xl border border-white/40 hover:border-primary/40 group flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="h-10 w-10 rounded-xl overflow-hidden shadow-sm">
                                    <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-base truncate group-hover:text-primary transition-colors">{group.name}</h4>
                                    <p className="text-xs text-muted-foreground">{group.members} Members</p>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{group.description}</p>
                            <div className="flex gap-2">
                                {group.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-white/50 text-[10px] px-1.5 h-5">{tag}</Badge>
                                ))}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </TabsContent>

        <TabsContent value="joined" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedGroups.map((group) => (
                     <Link to={`/groups/${group.id}`} key={group.id} className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full glass p-6 rounded-[2rem] border border-white/50 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                                    <img src={group.image} alt={group.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge className="bg-primary/10 text-primary border-primary/20">Member</Badge>
                                    {group.active && <span className="text-[10px] text-green-600 font-medium animate-pulse">● Active Now</span>}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">{group.name}</h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 mb-6">{group.description}</p>
                            </div>

                            <Button className="w-full rounded-xl bg-white/50 hover:bg-white text-foreground shadow-sm">
                                Enter Hub <Sparkles className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </Link>
                ))}
                
                {/* Create New Prompt */}
                <div className="glass p-6 rounded-[2rem] border border-dashed border-white/40 flex flex-col items-center justify-center text-center gap-4 min-h-[250px] hover:bg-white/40 transition-colors cursor-pointer group">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Join More Circles</h3>
                        <p className="text-sm text-muted-foreground max-w-[200px]">Browse the directory to find more communities.</p>
                    </div>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
