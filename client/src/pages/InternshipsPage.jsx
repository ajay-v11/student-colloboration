import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, MapPin, Building2, ExternalLink } from "lucide-react";

export default function InternshipsPage() {
  const internships = [
    {
      id: 1,
      title: "Software Engineer Intern",
      company: "TechCorp Inc.",
      location: "San Francisco, CA (Remote)",
      type: "Summer 2024",
      tags: ["React", "Node.js", "AWS"],
      posted: "2 days ago",
      logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=100&h=100&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Data Science Intern",
      company: "DataFlow Analytics",
      location: "New York, NY",
      type: "Fall 2024",
      tags: ["Python", "Pandas", "Machine Learning"],
      posted: "1 week ago",
      logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&h=100&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "UX/UI Design Intern",
      company: "Creative Studio",
      location: "Austin, TX",
      type: "Summer 2024",
      tags: ["Figma", "User Research", "Prototyping"],
      posted: "3 days ago",
      logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=100&h=100&auto=format&fit=crop",
    },
    {
      id: 4,
      title: "Product Management Intern",
      company: "Innovate Labs",
      location: "Remote",
      type: "Summer 2024",
      tags: ["Product Strategy", "Agile", "Roadmapping"],
      posted: "5 days ago",
      logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&auto=format&fit=crop",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Internships</h1>
        <p className="text-muted-foreground">Discover opportunities to kickstart your career.</p>
      </div>

      <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border border-border shadow-sm max-w-md">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input 
            type="text" 
            placeholder="Search internships..." 
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
        />
      </div>

      <div className="grid gap-4">
        {internships.map((job) => (
          <Card key={job.id} className="border border-border hover:shadow-md transition-shadow group">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        <img src={job.logo} alt={job.company} className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">{job.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.company}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.type}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <Button>Apply Now <ExternalLink className="ml-2 h-4 w-4" /></Button>
                    <span className="text-xs text-muted-foreground">Posted {job.posted}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                {job.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
