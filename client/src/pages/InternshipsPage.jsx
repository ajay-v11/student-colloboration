import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Briefcase, MapPin, Building2, ExternalLink, Plus, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function InternshipsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const data = await api.get("/internships");
      setInternships(data);
    } catch (error) {
      console.error("Failed to fetch internships", error);
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInternship = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/internships/${deleteTarget.id}`);
      toast.success("Internship deleted successfully");
      setDeleteTarget(null);
      fetchInternships();
    } catch (error) {
      toast.error(error.message || "Failed to delete internship");
    } finally {
      setDeleting(false);
    }
  };

  const filteredInternships = searchQuery.trim()
    ? internships.filter((j) => {
        const q = searchQuery.toLowerCase();
        return (
          j.role.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q) ||
          j.type?.toLowerCase().includes(q) ||
          j.description?.toLowerCase().includes(q)
        );
      })
    : internships;

  const resetForm = () => {
    setCompany("");
    setRole("");
    setDescription("");
    setLocation("");
    setType("");
    setApplyUrl("");
  };

  const handleCreateInternship = async (e) => {
    e.preventDefault();
    
    if (!company || company.length < 2) {
      toast.error("Company name must be at least 2 characters");
      return;
    }
    if (!role || role.length < 2) {
      toast.error("Role must be at least 2 characters");
      return;
    }
    if (!description || description.length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }
    if (!location || location.length < 2) {
      toast.error("Location must be at least 2 characters");
      return;
    }
    if (!type) {
      toast.error("Please select a work type");
      return;
    }
    try {
      new URL(applyUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    try {
      setCreating(true);
      await api.post("/internships", {
        company,
        role,
        description,
        location,
        type,
        applyUrl,
      });
      toast.success("Internship posted successfully");
      setIsCreateOpen(false);
      resetForm();
      fetchInternships();
    } catch (error) {
      console.error("Failed to create internship", error);
      toast.error(error.message || "Failed to post internship");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Internships</h1>
          <p className="text-muted-foreground">Discover opportunities to kickstart your career.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Post New Internship</DialogTitle>
              <DialogDescription>
                Share an internship opportunity with the community.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateInternship} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role / Position *</Label>
                <Input
                  id="role"
                  placeholder="e.g. Software Engineering Intern"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the internship role and requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Remote">Remote</SelectItem>
                      <SelectItem value="On-site">On-site</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="applyUrl">Apply URL *</Label>
                <Input
                  id="applyUrl"
                  type="url"
                  placeholder="https://example.com/apply"
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {creating ? "Posting..." : "Post Internship"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border border-border shadow-sm max-w-md">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input 
            type="text" 
            placeholder="Search internships..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
        />
      </div>

      {loading ? (
         <div className="text-center py-10">Loading internships...</div>
      ) : (
        <div className="grid gap-4">
            {filteredInternships.map((job) => (
            <Card key={job.id} className="border border-border hover:shadow-md transition-shadow group">
                <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {/* Placeholder for company logo if not available */}
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg group-hover:text-primary transition-colors">{job.role}</CardTitle>
                              {job.postedBy?.id === user?.id && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                                  onClick={() => setDeleteTarget(job)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.company}</span>
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {job.type}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                            <Button>Apply Now <ExternalLink className="ml-2 h-4 w-4" /></Button>
                        </a>
                        <span className="text-xs text-muted-foreground">Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                    {/* Assuming no tags field yet, or we can add it later. Using description excerpt for now if needed, or just Type */}
                    <Badge variant="secondary" className="font-normal">{job.type}</Badge>
                </div>
                <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                </CardContent>
            </Card>
            ))}
            {filteredInternships.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                    {searchQuery.trim() ? "No internships match your search." : "No internships posted yet."}
                </div>
            )}
        </div>
      )}

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Internship</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete the <strong>{deleteTarget?.role}</strong> internship at <strong>{deleteTarget?.company}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInternship} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
