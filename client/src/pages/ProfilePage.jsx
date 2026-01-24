import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit, 
  BookOpen, 
  Award, 
  Briefcase,
  Github,
  Twitter,
  Linkedin,
  Grid
} from "lucide-react";
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
    reputation: 1540,
    avatar: "https://i.pravatar.cc/150?u=alex",
    skills: ["React", "Node.js", "TypeScript", "Python", "PostgreSQL", "Tailwind CSS", "Docker", "AWS"],
    experience: [
       { role: "Frontend Intern", company: "TechCorp", period: "Summer 2023", desc: "Built reusable React components." },
       { role: "Open Source Contributor", company: "GitHub", period: "2022 - Present", desc: "Contributed to various OSS projects." }
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 1. Hero / Profile Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-64 rounded-[2rem] bg-gradient-to-br from-primary/80 via-emerald-600 to-teal-800 shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>

        {/* Profile Card Overlay */}
        <div className="mx-6 md:mx-12 relative -mt-20">
           <div className="glass rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-end gap-6 shadow-2xl">
              
              {/* Avatar */}
              <div className="relative -mt-20 md:-mt-24 mb-2 md:mb-0 shrink-0">
                 <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] p-1.5 bg-white/80 backdrop-blur-sm shadow-xl ring-1 ring-white/50">
                    <Avatar className="h-full w-full rounded-[2rem]">
                        <AvatarImage src={user.avatar} className="object-cover" />
                        <AvatarFallback className="text-4xl font-serif bg-primary/10 text-primary">{user.name[0]}</AvatarFallback>
                    </Avatar>
                 </div>
                 <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-green-500 border-4 border-white shadow-sm" title="Online" />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2 min-w-0">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">{user.name}</h1>
                        <p className="text-muted-foreground font-medium text-lg">{user.role}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all">
                            <Github className="h-4 w-4 mr-2" /> GitHub
                        </Button>
                        <Button className="rounded-xl shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90">
                            <Edit className="h-4 w-4 mr-2" /> Edit Profile
                        </Button>
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-1">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 hover:bg-black/10 transition-colors cursor-default">
                        <MapPin className="h-3.5 w-3.5" /> {user.location}
                    </span>
                    <a href={`https://${user.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 hover:bg-primary/10 hover:text-primary transition-colors">
                        <LinkIcon className="h-3.5 w-3.5" /> {user.website}
                    </a>
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 cursor-default">
                        <Calendar className="h-3.5 w-3.5" /> Joined {user.joined}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-2 md:mx-4">
        
        {/* Left Column: Stats & Bio */}
        <div className="space-y-6">
           {/* Stats Widget */}
           <div className="glass-card rounded-[2rem] p-6 flex justify-between items-center text-center divide-x divide-black/5">
              <div className="flex-1 px-2">
                 <div className="text-2xl font-bold font-serif text-foreground">{user.followers}</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Followers</div>
              </div>
              <div className="flex-1 px-2">
                 <div className="text-2xl font-bold font-serif text-foreground">{user.following}</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Following</div>
              </div>
              <div className="flex-1 px-2">
                 <div className="text-2xl font-bold font-serif text-emerald-600">{user.reputation}</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Reputation</div>
              </div>
           </div>

           {/* Bio & Skills */}
           <div className="glass-card rounded-[2rem] p-8 space-y-6">
              <div>
                 <h3 className="font-serif font-bold text-lg mb-3">About</h3>
                 <p className="text-muted-foreground leading-relaxed text-sm">{user.bio}</p>
              </div>
              
              <div>
                 <h3 className="font-serif font-bold text-lg mb-3">Skills</h3>
                 <div className="flex flex-wrap gap-2">
                    {user.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="bg-white/50 hover:bg-white border-none shadow-sm px-3 py-1 rounded-lg transition-all">
                            {skill}
                        </Badge>
                    ))}
                 </div>
              </div>

              <div>
                  <h3 className="font-serif font-bold text-lg mb-3">Socials</h3>
                  <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600"><Twitter className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-700"><Linkedin className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 hover:text-black"><Github className="h-5 w-5" /></Button>
                  </div>
              </div>
           </div>
        </div>

        {/* Right Column: Tabs & Feed */}
        <div className="lg:col-span-2 space-y-6">
           {/* Custom Tab Switcher */}
           <div className="glass p-2 rounded-[1.5rem] flex gap-2 w-fit mx-auto lg:mx-0">
               {['about', 'projects', 'posts'].map((tab) => (
                   <button
                       key={tab}
                       onClick={() => setActiveTab(tab)}
                       className={`
                           px-6 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300
                           ${activeTab === tab 
                               ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                               : 'hover:bg-black/5 text-muted-foreground hover:text-foreground'
                           }
                       `}
                   >
                       {tab}
                   </button>
               ))}
           </div>

           {/* Content Area */}
           <div className="min-h-[400px]">
               {activeTab === 'about' && (
                   <div className="space-y-6">
                       <h3 className="text-xl font-serif font-bold flex items-center gap-2">
                           <Briefcase className="h-5 w-5 text-primary" /> Experience
                       </h3>
                       <div className="space-y-4">
                           {user.experience.map((exp, i) => (
                               <div key={i} className="glass-card p-6 rounded-[1.5rem] flex gap-4 items-start group">
                                   <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                                       <Briefcase className="h-6 w-6" />
                                   </div>
                                   <div>
                                       <h4 className="font-bold text-lg">{exp.role}</h4>
                                       <p className="text-sm font-medium text-foreground/80">{exp.company} • {exp.period}</p>
                                       <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.desc}</p>
                                   </div>
                               </div>
                           ))}
                       </div>

                       <h3 className="text-xl font-serif font-bold flex items-center gap-2 mt-8">
                           <Award className="h-5 w-5 text-primary" /> Education
                       </h3>
                       <div className="glass-card p-6 rounded-[1.5rem] flex gap-4 items-start group">
                            <div className="h-12 w-12 rounded-2xl bg-secondary/30 flex items-center justify-center text-secondary-foreground shrink-0">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">B.S. Computer Science</h4>
                                <p className="text-sm font-medium text-foreground/80">University of Technology • 2021 - Present</p>
                                <p className="text-sm text-muted-foreground mt-2">GPA: 3.8/4.0 • Dean's List</p>
                            </div>
                        </div>
                   </div>
               )}

               {activeTab === 'projects' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {[1, 2, 3].map((_, i) => (
                           <div key={i} className="glass-card rounded-[2rem] overflow-hidden group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                               <div className="h-40 bg-muted relative">
                                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                       <h4 className="text-white font-bold text-lg">Project Alpha {i+1}</h4>
                                   </div>
                               </div>
                               <div className="p-6">
                                   <p className="text-sm text-muted-foreground mb-4">A cutting-edge AI tool for student productivity.</p>
                                   <div className="flex gap-2">
                                       <Badge variant="secondary" className="bg-black/5">React</Badge>
                                       <Badge variant="secondary" className="bg-black/5">Python</Badge>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
               
               {activeTab === 'posts' && (
                    <div className="glass-card p-12 rounded-[2rem] text-center border-dashed border-2 border-white/30">
                        <Grid className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-lg font-bold text-foreground">No posts yet</h3>
                        <p className="text-muted-foreground">When {user.name.split(' ')[0]} posts something, it will appear here.</p>
                    </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
}
