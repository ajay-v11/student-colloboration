import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Github, ExternalLink, Loader2, MessageCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [joiningId, setJoiningId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get("/projects");
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setGithubUrl("");
    setDemoUrl("");
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    let hasError = false;
    const newErrors = {};
    if (!title.trim() || title.trim().length < 2) {
      newErrors.title = "Title must be at least 2 characters";
      hasError = true;
    }
    if (!description.trim() || description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    setCreating(true);
    try {
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await api.post("/projects", {
        title: title.trim(),
        description: description.trim(),
        tags: tagsArray,
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim(),
      });

      toast.success("Project created successfully!");
      setIsCreateOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      if (error.fieldErrors && error.fieldErrors.length > 0) {
        const errorsMap = {};
        error.fieldErrors.forEach((err) => {
          errorsMap[err.field] = err.message;
        });
        setFieldErrors(errorsMap);
      } else {
        console.error("Failed to create project", error);
        toast.error(error.message || "Failed to create project");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleJoinProject = async (projectId) => {
    setJoiningId(projectId);
    try {
      await api.post(`/projects/${projectId}/join`);
      toast.success("Joined project!");
      // Navigate to the project details page
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error("Failed to join project", error);
      toast.error(error.message || "Failed to join project");
    } finally {
      setJoiningId(null);
    }
  };

  const filteredProjects = searchQuery.trim()
    ? projects.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q)) ||
          p.author?.name?.toLowerCase().includes(q)
        );
      })
    : projects;

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteProject = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/projects/${deleteTarget.id}`);
      toast.success("Project deleted successfully");
      setDeleteTarget(null);
      fetchProjects();
    } catch (error) {
      toast.error(error.message || "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Student Projects</h1>
          <p className="text-muted-foreground">Showcase your work and find collaborators.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-card p-2 rounded-lg border border-border shadow-sm max-w-md">
        <Search className="h-5 w-5 text-muted-foreground ml-2" />
        <Input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent" 
        />
      </div>

      {loading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
            <Card key={project.id} className="border border-border hover:shadow-md transition-all">
                <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={project.author?.avatarUrl} />
                            <AvatarFallback>{project.author?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <p className="text-xs text-muted-foreground">by {project.author?.name || 'Unknown'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-0">
                          Active
                      </Badge>
                      {project.author?.id === user?.id && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
                          onClick={() => setDeleteTarget(project)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                </div>
                </CardHeader>
                <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    {project.description}
                </p>
                <div className="flex gap-2 flex-wrap">
                    {project.tags.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs font-normal">
                            {tech}
                        </Badge>
                    ))}
                </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-border pt-4">
                <div className="flex gap-2">
                    {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <Github className="h-4 w-4" />
                            </Button>
                        </a>
                    )}
                    {project.demoUrl && (
                        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                    <ExternalLink className="h-4 w-4" />
                            </Button>
                        </a>
                    )}
                </div>
                {project.isMember ? (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="gap-2"
                    onClick={() => handleViewProject(project.id)}
                  >
                    <MessageCircle className="h-4 w-4" />
                    View Project
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={() => handleJoinProject(project.id)}
                    disabled={joiningId === project.id}
                  >
                    {joiningId === project.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Join Project
                  </Button>
                )}
                </CardFooter>
            </Card>
            ))}
            {filteredProjects.length === 0 && (
                <div className="col-span-1 lg:col-span-2 text-center py-10 text-muted-foreground">
                    {searchQuery.trim() ? "No projects match your search." : "No projects found. Be the first to create one!"}
                </div>
            )}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="My Awesome Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={creating}
                className={fieldErrors.title ? "border-red-500" : ""}
              />
              {fieldErrors.title && (
                <span className="text-sm text-red-500">{fieldErrors.title}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your project (min 10 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={creating}
                className={`min-h-24 ${fieldErrors.description ? "border-red-500" : ""}`}
              />
              {fieldErrors.description && (
                <span className="text-sm text-red-500">{fieldErrors.description}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="React, Node.js, Machine Learning"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={creating}
                className={fieldErrors.tags ? "border-red-500" : ""}
              />
              {fieldErrors.tags ? (
                <span className="text-sm text-red-500">{fieldErrors.tags}</span>
              ) : (
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                disabled={creating}
                className={fieldErrors.githubUrl ? "border-red-500" : ""}
              />
              {fieldErrors.githubUrl && (
                <span className="text-sm text-red-500">{fieldErrors.githubUrl}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="demoUrl">Demo URL</Label>
              <Input
                id="demoUrl"
                placeholder="https://myproject.vercel.app"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                disabled={creating}
                className={fieldErrors.demoUrl ? "border-red-500" : ""}
              />
              {fieldErrors.demoUrl && (
                <span className="text-sm text-red-500">{fieldErrors.demoUrl}</span>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
