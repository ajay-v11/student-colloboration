import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Grid,
  Loader2
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("about");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    course: "",
    semester: "",
    college: "",
    skills: "",
    interests: "",
    avatarUrl: "",
  });

  const fetchProfile = useCallback(async () => {
    if (!authUser?.id) return;
    try {
      setLoading(true);
      const { user } = await api.get(`/users/${authUser.id}`);
      setProfile(user);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const openEditDialog = () => {
    setFormData({
      name: profile?.name || "",
      bio: profile?.bio || "",
      course: profile?.course || "",
      semester: profile?.semester?.toString() || "",
      college: profile?.college || "",
      skills: profile?.skills?.join(", ") || "",
      interests: profile?.interests?.join(", ") || "",
      avatarUrl: profile?.avatarUrl || "",
    });
    setIsEditOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        bio: formData.bio.trim() || null,
        course: formData.course.trim() || null,
        semester: formData.semester ? parseInt(formData.semester, 10) : null,
        college: formData.college.trim() || null,
        skills: formData.skills
          ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        interests: formData.interests
          ? formData.interests.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
        avatarUrl: formData.avatarUrl.trim() || null,
      };

      const updatedUser = await api.put(`/users/${authUser.id}`, payload);
      setProfile(updatedUser);
      updateUser(updatedUser);
      setIsEditOpen(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

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
                        <AvatarImage src={profile.avatarUrl || `https://i.pravatar.cc/150?u=${profile.id}`} className="object-cover" />
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
                        <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all">
                            <Github className="h-4 w-4 mr-2" /> GitHub
                        </Button>
                        <Button 
                          onClick={openEditDialog}
                          className="rounded-xl shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90"
                        >
                            <Edit className="h-4 w-4 mr-2" /> Edit Profile
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
                 <div className="text-2xl font-bold font-serif text-foreground">0</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Followers</div>
              </div>
              <div className="flex-1 px-2">
                 <div className="text-2xl font-bold font-serif text-foreground">0</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Following</div>
              </div>
              <div className="flex-1 px-2">
                 <div className="text-2xl font-bold font-serif text-emerald-600">0</div>
                 <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Reputation</div>
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
                       <div className="glass-card p-12 rounded-[2rem] text-center border-dashed border-2 border-white/30">
                           <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                           <h3 className="text-lg font-bold text-foreground">No experience added</h3>
                           <p className="text-muted-foreground">Experience entries will appear here.</p>
                       </div>

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
                             <p className="text-muted-foreground">Add your college details in Edit Profile.</p>
                         </div>
                       )}
                   </div>
               )}

               {activeTab === 'projects' && (
                   <div className="glass-card p-12 rounded-[2rem] text-center border-dashed border-2 border-white/30">
                       <Grid className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
                       <h3 className="text-lg font-bold text-foreground">No projects yet</h3>
                       <p className="text-muted-foreground">Projects you create will appear here.</p>
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

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Profile</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Your full name"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={3}
                className="rounded-xl resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Input
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="e.g., Computer Science"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  name="semester"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.semester}
                  onChange={handleInputChange}
                  placeholder="e.g., 5"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                placeholder="Your college or university"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="React, Node.js, Python, ..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                name="interests"
                value={formData.interests}
                onChange={handleInputChange}
                placeholder="AI, Web Dev, Machine Learning, ..."
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleInputChange}
                placeholder="https://..."
                className="rounded-xl"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="rounded-xl bg-primary"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
