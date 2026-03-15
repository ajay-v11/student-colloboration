import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Sparkles,
  Filter,
  Zap,
  Hash,
  Layers,
  Loader2,
  Users,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function GroupsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInterests, setFormInterests] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [joining, setJoining] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const [myGroupsRes, discoverRes] = await Promise.all([
        api.get("/groups/my-groups"),
        api.get("/groups/discover"),
      ]);
      setJoinedGroups(myGroupsRes);
      setDiscoverGroups(discoverRes);

      // Combine for "All Circles" view
      const combined = [
        ...myGroupsRes.map((g) => ({ ...g, isJoined: true })),
        ...discoverRes.map((g) => ({ ...g, isJoined: false })),
      ];
      setAllGroups(combined);
    } catch (error) {
      console.error("Failed to fetch groups", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = (groups) => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.interests?.some((i) => i.toLowerCase().includes(q)),
    );
  };

  // Derived lists for display
  const filteredAll = filterGroups(allGroups);

  // Trending = Newest (Latest)
  const trendingGroups = [...filteredAll]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // All Circles = Popularity (Member Count)
  const allCirclesGroups = [...filteredAll].sort(
    (a, b) =>
      (b._count?.GroupMemberShip || 0) - (a._count?.GroupMemberShip || 0),
  );

  const filteredJoinedGroups = filterGroups(joinedGroups);

  const handleJoinGroup = async (groupId, shouldNavigate = false) => {
    try {
      setJoining(true);
      await api.post(`/groups/${groupId}/join`);
      toast.success("Joined group successfully!");
      if (shouldNavigate) {
        navigate(`/groups/${groupId}`);
      } else {
        fetchGroups();
      }
      setSelectedGroup(null);
    } catch (error) {
      toast.error(error.message || "Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    let hasError = false;
    const newErrors = {};
    if (!formName.trim()) { newErrors.name = "Name is required"; hasError = true; }
    if (!formDescription.trim()) { newErrors.description = "Description is required"; hasError = true; }
    
    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }
    const interestsArray = formInterests
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      setCreating(true);
      await api.post("/groups/createGroup", {
        name: formName.trim(),
        description: formDescription.trim(),
        interests: interestsArray,
      });
      toast.success("Circle created!");
      setIsCreateOpen(false);
      setFormName("");
      setFormDescription("");
      setFormInterests("");
      fetchGroups();
    } catch (error) {
      if (error.fieldErrors && error.fieldErrors.length > 0) {
        const errorsMap = {};
        error.fieldErrors.forEach((err) => {
          errorsMap[err.field] = err.message;
        });
        setFieldErrors(errorsMap);
      } else {
        toast.error(error.message || "Failed to create circle");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/groups/${deleteTarget.id}`);
      toast.success("Circle deleted successfully");
      setDeleteTarget(null);
      fetchGroups();
    } catch (error) {
      toast.error(error.message || "Failed to delete circle");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="border-primary/20 bg-primary/5 text-primary"
            >
              Academic Circles
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {discoverGroups.length + joinedGroups.length} Active Groups
            </span>
          </div>
          <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground">
            Discover Your <span className="text-primary">Squad</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl text-lg">
            Join a circle of peers who share your passion. Collaborate, learn,
            and grow together.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-full h-12 px-6 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-4 w-4 mr-2" /> Create Circle
          </Button>
        </div>
      </div>

      <Tabs defaultValue="discover" className="w-full">
        <TabsList className="bg-white/40 backdrop-blur-sm border border-white/20 p-1 rounded-full h-auto">
          <TabsTrigger
            value="discover"
            className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/25 transition-all"
          >
            <Search className="w-4 h-4 mr-2" /> Discover
          </TabsTrigger>
          <TabsTrigger
            value="joined"
            className="rounded-full px-6 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg shadow-primary/25 transition-all"
          >
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-14 rounded-2xl border-white/40 bg-white/60 backdrop-blur-md shadow-sm text-lg focus-visible:ring-primary/20 transition-all hover:bg-white/80 focus:bg-white/90"
            />
          </div>

          {loading ? (
            <div className="text-center py-10">Loading groups...</div>
          ) : (
            <>
              {/* Featured / Trending Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-3">
                  <h2 className="text-xl font-bold font-serif mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />{" "}
                    Trending Now
                  </h2>
                </div>
                {trendingGroups.map((group) => (
                  <div
                    key={group.id}
                    className="group relative cursor-pointer"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative h-full glass p-6 rounded-[2rem] border border-white/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div className="h-14 w-14 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-muted">
                          <img
                            src={
                              group.groupIconUrl ||
                              `https://ui-avatars.com/api/?name=${group.name}&background=random`
                            }
                            alt={group.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {group.isJoined ? (
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            Member
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">
                            Active Now
                          </Badge>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">
                          {group.name}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                          {group.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {group.interests.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-white/50 text-muted-foreground border border-white/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {group._count?.GroupMemberShip || 0} members
                          </span>
                        </div>
                        {group.isJoined ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled
                            className="text-xs font-bold opacity-80"
                          >
                            Joined
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinGroup(group.id, true);
                            }}
                          >
                            Join <Sparkles className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* All Groups Grid */}
              <div>
                <h2 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" /> All Circles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {allCirclesGroups
                    .slice(0, showAll ? undefined : 3)
                    .map((group) => (
                      <div
                        key={group.id}
                        className="glass-card p-5 rounded-3xl border border-white/40 hover:border-primary/40 group flex flex-col h-full cursor-pointer"
                        onClick={() => setSelectedGroup(group)}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className="h-10 w-10 rounded-xl overflow-hidden shadow-sm bg-muted">
                            <img
                              src={
                                group.groupIconUrl ||
                                `https://ui-avatars.com/api/?name=${group.name}&background=random`
                              }
                              alt={group.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                              {group.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {group._count?.GroupMemberShip || 0} Members
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
                          {group.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 flex-wrap flex-1">
                            {group.interests.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-white/50 text-[10px] px-1.5 h-5"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          {group.isJoined ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled
                              className="text-xs h-7 px-3"
                            >
                              Joined
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="text-xs h-7 px-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinGroup(group.id, true);
                              }}
                            >
                              Join
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
                {!showAll && allCirclesGroups.length > 3 && (
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowAll(true)}
                      className="rounded-full px-8 glass border-primary/20 hover:bg-primary/5 text-primary"
                    >
                      Show All Circles
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="joined" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJoinedGroups.map((group) => (
              <Link
                to={`/groups/${group.id}`}
                key={group.id}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative h-full glass p-6 rounded-[2rem] border border-white/50 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-muted">
                      <img
                        src={
                          group.groupIconUrl ||
                          `https://ui-avatars.com/api/?name=${group.name}&background=random`
                        }
                        alt={group.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        Member
                      </Badge>
                      {group.adminId === user?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTarget(group);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                      {group.description}
                    </p>
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
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Browse the directory to find more communities.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-[1.5rem] glass border-white/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">
              Create a New Circle
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Machine Learning Enthusiasts"
                className={`rounded-xl border-white/40 bg-white/60 ${fieldErrors.name ? "border-red-500" : ""}`}
                required
              />
              {fieldErrors.name && (
                <span className="text-sm text-red-500">{fieldErrors.name}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="What is this circle about?"
                className={`rounded-xl border-white/40 bg-white/60 min-h-24 ${fieldErrors.description ? "border-red-500" : ""}`}
                required
              />
              {fieldErrors.description && (
                <span className="text-sm text-red-500">{fieldErrors.description}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              <Input
                id="interests"
                value={formInterests}
                onChange={(e) => setFormInterests(e.target.value)}
                placeholder="AI, Python, Deep Learning"
                className={`rounded-xl border-white/40 bg-white/60 ${fieldErrors.interests ? "border-red-500" : ""}`}
              />
              {fieldErrors.interests && (
                <span className="text-sm text-red-500">{fieldErrors.interests}</span>
              )}
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={creating}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Circle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Join Group Preview Dialog */}
      <Dialog
        open={!!selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
      >
        <DialogContent className="rounded-[1.5rem] glass border-white/40 sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-16 w-16 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-muted">
                <img
                  src={
                    selectedGroup?.groupIconUrl ||
                    `https://ui-avatars.com/api/?name=${selectedGroup?.name}&background=random`
                  }
                  alt={selectedGroup?.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <DialogTitle className="text-2xl font-serif">
                  {selectedGroup?.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Users className="h-4 w-4" />
                  {selectedGroup?._count?.GroupMemberShip || 0} members
                </p>
              </div>
            </div>
            <DialogDescription className="text-left">
              {selectedGroup?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedGroup?.interests?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedGroup.interests.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-white/50">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setSelectedGroup(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            {selectedGroup?.adminId === user?.id && (
              <Button
                variant="destructive"
                onClick={() => {
                  setSelectedGroup(null);
                  setDeleteTarget(selectedGroup);
                }}
                className="rounded-xl"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
            {selectedGroup?.isJoined ? (
              <Button
                onClick={() => navigate(`/groups/${selectedGroup.id}`)}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Enter Hub <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => handleJoinGroup(selectedGroup?.id, true)}
                disabled={joining}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {joining && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Join Circle
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-[1.5rem] glass border-white/40 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Delete Circle</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone and all channels and messages will be lost.
          </p>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGroup} disabled={deleting} className="rounded-xl">
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
