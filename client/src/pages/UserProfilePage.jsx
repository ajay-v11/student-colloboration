import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  BookOpen,
  Award,
  Briefcase,
  Github,
  Twitter,
  Linkedin,
  Grid,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { format } from "date-fns";

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authUser?.id && id === authUser.id) {
      navigate('/profile', { replace: true });
    }
  }, [id, authUser?.id, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!id || id === authUser?.id) return;
    try {
      setLoading(true);
      const { user } = await api.get(`/users/${id}`);
      setProfile(user);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }, [id, authUser?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const joinedDate = profile.createdAt
    ? format(new Date(profile.createdAt), "MMMM yyyy")
    : "Unknown";

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
                        <AvatarImage src={profile.avatarUrl ? (profile.avatarUrl.startsWith("/media") ? `${API_BASE}${profile.avatarUrl}` : profile.avatarUrl) : `https://i.pravatar.cc/150?u=${profile.id}`} className="object-cover" />
                        <AvatarFallback className="text-4xl font-serif bg-primary/10 text-primary">{profile.name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                 </div>
                 <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-green-500 border-4 border-white shadow-sm" title="Online" />
              </div>

              {/* Info */}
              <div className="flex-1 space-y-2 min-w-0">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-foreground">{profile.name}</h1>
                        <p className="text-muted-foreground font-medium text-lg">
                          {profile.course || "Student"} {profile.semester ? `• Semester ${profile.semester}` : ""}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {profile.github && (
                            <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all" onClick={() => window.open(profile.github.startsWith('http') ? profile.github : `https://${profile.github}`, '_blank')}>
                                <Github className="h-4 w-4 mr-2" /> GitHub
                            </Button>
                        )}
                        <Button
                          onClick={() => navigate(`/messages/${id}`, { state: { selectedUser: profile } })}
                          className="rounded-xl shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90"
                        >
                            <MessageCircle className="h-4 w-4 mr-2" /> Message
                        </Button>
                    </div>
                 </div>

                 <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-1">
                    {profile.college && (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 hover:bg-black/10 transition-colors cursor-default">
                          <MapPin className="h-3.5 w-3.5" /> {profile.college}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 cursor-default">
                        <Calendar className="h-3.5 w-3.5" /> Joined {joinedDate}
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
                 <div className="text-2xl font-bold font-serif text-foreground">{profile.stats?.connections || 0}</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Connections</div>
              </div>
              <div className="flex-1 px-2">
                 <div className="text-2xl font-bold font-serif text-foreground">{profile.stats?.projects || 0}</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Projects</div>
              </div>
              <div className="flex-1 px-2">
                 <div className="text-2xl font-bold font-serif text-emerald-600">{profile.stats?.groups || 0}</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Groups</div>
              </div>
           </div>

           {/* Bio & Skills */}
           <div className="glass-card rounded-[2rem] p-8 space-y-6">
              <div>
                 <h3 className="font-serif font-bold text-lg mb-3">About</h3>
                 <p className="text-muted-foreground leading-relaxed text-sm">
                   {profile.bio || "No bio added yet."}
                 </p>
              </div>

              <div>
                 <h3 className="font-serif font-bold text-lg mb-3">Skills</h3>
                 <div className="flex flex-wrap gap-2">
                    {profile.skills?.length > 0 ? (
                      profile.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-white/50 hover:bg-white border-none shadow-sm px-3 py-1 rounded-lg transition-all">
                            {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No skills added yet.</p>
                    )}
                 </div>
              </div>

              {profile.interests?.length > 0 && (
                <div>
                   <h3 className="font-serif font-bold text-lg mb-3">Interests</h3>
                   <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <Badge key={interest} variant="outline" className="bg-white/30 border-primary/20 px-3 py-1 rounded-lg">
                            {interest}
                        </Badge>
                      ))}
                   </div>
                </div>
              )}

              <div>
                  <h3 className="font-serif font-bold text-lg mb-3">Socials</h3>
                  <div className="flex gap-2">
                      {profile.twitter && <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600" onClick={() => window.open(profile.twitter.startsWith('http') ? profile.twitter : `https://${profile.twitter}`, '_blank')}><Twitter className="h-5 w-5" /></Button>}
                      {profile.linkedin && <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-700" onClick={() => window.open(profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`, '_blank')}><Linkedin className="h-5 w-5" /></Button>}
                      {profile.github && <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 hover:text-black" onClick={() => window.open(profile.github.startsWith('http') ? profile.github : `https://${profile.github}`, '_blank')}><Github className="h-5 w-5" /></Button>}
                      {!profile.twitter && !profile.linkedin && !profile.github && <p className="text-muted-foreground text-sm">No socials added yet.</p>}
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
                       {profile.experience?.length > 0 ? (
                         <div className="space-y-4">
                           {profile.experience.map((exp, i) => (
                             <div key={i} className="glass-card p-6 rounded-[1.5rem] flex gap-4 items-start group">
                               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                 <Briefcase className="h-6 w-6" />
                               </div>
                               <div>
                                 <h4 className="font-bold text-lg">{exp.title}</h4>
                                 {exp.company && <p className="text-sm font-medium text-foreground/80">{exp.company}</p>}
                                 {exp.duration && <p className="text-sm text-muted-foreground mt-1">{exp.duration}</p>}
                                 {exp.description && <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>}
                               </div>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="glass-card p-12 rounded-[2rem] text-center border-dashed border-2 border-white/30">
                           <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                           <h3 className="text-lg font-bold text-foreground">No experience added</h3>
                           <p className="text-muted-foreground">Experience entries will appear here.</p>
                         </div>
                       )}

                       <h3 className="text-xl font-serif font-bold flex items-center gap-2 mt-8">
                           <Award className="h-5 w-5 text-primary" /> Education
                       </h3>
                       {profile.college ? (
                         <div className="glass-card p-6 rounded-[1.5rem] flex gap-4 items-start group">
                              <div className="h-12 w-12 rounded-2xl bg-secondary/30 flex items-center justify-center text-secondary-foreground shrink-0">
                                  <BookOpen className="h-6 w-6" />
                              </div>
                              <div>
                                  <h4 className="font-bold text-lg">{profile.course || "Student"}</h4>
                                  <p className="text-sm font-medium text-foreground/80">{profile.college}</p>
                                  {profile.semester && (
                                    <p className="text-sm text-muted-foreground mt-2">Currently in Semester {profile.semester}</p>
                                  )}
                              </div>
                          </div>
                       ) : (
                         <div className="glass-card p-12 rounded-[2rem] text-center border-dashed border-2 border-white/30">
                             <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                             <h3 className="text-lg font-bold text-foreground">No education added</h3>
                             <p className="text-muted-foreground">No education details available.</p>
                         </div>
                       )}
                   </div>
               )}

               {activeTab === 'projects' && (
                   <div className="glass-card p-12 rounded-[2rem] text-center border-dashed border-2 border-white/30">
                       <Grid className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                       <h3 className="text-lg font-bold text-foreground">No projects yet</h3>
                       <p className="text-muted-foreground">Projects will appear here.</p>
                   </div>
               )}

               {activeTab === 'posts' && (
                    <div className="glass-card p-12 rounded-[2rem] text-center border-dashed border-2 border-white/30">
                        <Grid className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                        <h3 className="text-lg font-bold text-foreground">No posts yet</h3>
                        <p className="text-muted-foreground">When {profile.name.split(' ')[0]} posts something, it will appear here.</p>
                    </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
}
