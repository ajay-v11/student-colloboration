import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Plus,
  ArrowUpRight,
  Zap,
  Users,
  Loader2,
  Search as SearchIcon,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [showBriefing, setShowBriefing] = useState(true);
  const [exploreFeed, setExploreFeed] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedFilter, setFeedFilter] = useState("All");
  const [appStats, setAppStats] = useState({ users: 0, groups: 0 });

  const [isAllSuggestionsModalOpen, setIsAllSuggestionsModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isAvailableUsersLoading, setIsAvailableUsersLoading] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  useEffect(() => {
    if (isAllSuggestionsModalOpen && availableUsers.length === 0) {
      const fetchAvailableUsers = async () => {
        setIsAvailableUsersLoading(true);
        try {
          const data = await api.get("/messages/users/available");
          setAvailableUsers(data);
        } catch (error) {
          console.error("Failed to fetch available users:", error);
        } finally {
          setIsAvailableUsersLoading(false);
        }
      };
      fetchAvailableUsers();
    }
  }, [isAllSuggestionsModalOpen, availableUsers.length]);

  const filteredAvailableUsers = useMemo(() => {
    return availableUsers.filter(u =>
      u.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(modalSearchQuery.toLowerCase()))
    );
  }, [availableUsers, modalSearchQuery]);

  // Compute notification stats for briefing
  const notificationStats = useMemo(() => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    const dmCount = unreadNotifications.filter(
      (n) => n.type === "DM_MESSAGE",
    ).length;
    const groupCount = unreadNotifications.filter(
      (n) =>
        n.type === "GROUP_MESSAGE" ||
        n.type === "GROUP_JOIN" ||
        n.type === "GROUP_INVITE",
    ).length;

    // Get unique groups from notifications
    const groupNames = [
      ...new Set(
        unreadNotifications
          .filter((n) => n.group?.name)
          .map((n) => n.group.name),
      ),
    ].slice(0, 2);

    return { dmCount, groupCount, groupNames, total: unreadCount };
  }, [notifications, unreadCount]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setSuggestionsLoading(true);
        const data = await api.get("/users/suggestions");
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setSuggestionsLoading(false);
      }
    };
    const fetchFeed = async () => {
      try {
        setFeedLoading(true);
        const data = await api.get("/dashboard/feed");
        setExploreFeed(data);
      } catch (error) {
        console.error("Failed to fetch feed:", error);
      } finally {
        setFeedLoading(false);
      }
    };
    const fetchStats = async () => {
      try {
        const data = await api.get("/dashboard/stats");
        setAppStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchSuggestions();
    fetchFeed();
    fetchStats();
  }, []);

  const handleConnectClick = (person) => {
    navigate(`/messages/${person.id}`, { state: { selectedUser: person } });
  };

  const filteredFeed = useMemo(() => {
    if (feedFilter === "All") return exploreFeed;
    const typeMap = { Groups: "group", Projects: "project", Internships: "internship" };
    return exploreFeed.filter((item) => item.type === typeMap[feedFilter]);
  }, [exploreFeed, feedFilter]);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Left Column: Focus & Feed (65%) */}
      <div className="flex-1 space-y-8">
        {/* Welcome & Focus Mode */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">
                Hello, {user?.name?.split(" ")[0] || "Scholar"}
              </h1>
              <p className="text-muted-foreground">
                Ready to make an impact today?
              </p>
            </div>
            {/*  <Button className="rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground px-6">
              <Plus className="w-4 h-4 mr-2" /> New Post
            </Button>
*/}{" "}
          </div>

          {/* Active Context Card (Personalized Briefing) */}
          {showBriefing && notificationStats.total > 0 ? (
            <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl relative overflow-hidden group">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center gap-2 text-primary font-medium text-sm uppercase tracking-wider">
                    <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    {new Date().getHours() < 12
                      ? "Morning"
                      : new Date().getHours() < 17
                        ? "Afternoon"
                        : "Evening"}{" "}
                    Briefing
                  </div>
                  <h2 className="text-3xl font-serif font-bold leading-tight">
                    You have{" "}
                    <span className="text-primary">
                      {notificationStats.total} unread notification
                      {notificationStats.total !== 1 ? "s" : ""}
                    </span>
                    {notificationStats.dmCount > 0 &&
                    notificationStats.groupCount > 0 ? (
                      <>
                        <br />
                        including {notificationStats.dmCount} message
                        {notificationStats.dmCount !== 1 ? "s" : ""} and{" "}
                        {notificationStats.groupCount} group update
                        {notificationStats.groupCount !== 1 ? "s" : ""}.
                      </>
                    ) : notificationStats.dmCount > 0 ? (
                      <>
                        <br />
                        from direct messages.
                      </>
                    ) : notificationStats.groupCount > 0 ? (
                      <>
                        <br />
                        from your groups.
                      </>
                    ) : null}
                  </h2>
                  {notificationStats.groupNames.length > 0 && (
                    <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
                      {notificationStats.groupNames.map((name, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-2 bg-white/40 px-3 py-1 rounded-full text-xs border border-white/20"
                        >
                          <Users className="w-3 h-3" /> {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button
                    size="lg"
                    className="rounded-2xl h-14 text-lg px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    onClick={() => navigate("/messages")}
                  >
                    Check Inbox <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-2xl h-12 hover:bg-white/40 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowBriefing(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ) : showBriefing ? (
            <div className="glass rounded-[2rem] p-8 border border-white/40 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="space-y-4 max-w-lg">
                  <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm uppercase tracking-wider">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    All Caught Up
                  </div>
                  <h2 className="text-3xl font-serif font-bold leading-tight">
                    You're all caught up!{" "}
                    <span className="text-emerald-600">
                      No new notifications.
                    </span>
                  </h2>
                  <p className="text-muted-foreground">
                    Take some time to explore new groups or connect with
                    classmates.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <Button
                    size="lg"
                    className="rounded-2xl h-14 text-lg px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    onClick={() => navigate("/groups")}
                  >
                    Explore Groups <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Explore / Masonry Feed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-serif flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500 fill-current" /> Community
              Pulse
            </h3>
            <div className="flex gap-2">
              {["All", "Groups", "Projects", "Internships"].map((tab) => (
                <Button
                  key={tab}
                  variant={feedFilter === tab ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-full hover:bg-white/50"
                  onClick={() => setFeedFilter(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredFeed.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground text-sm py-8">
                {feedFilter === "All"
                  ? "No activity yet. Create a group or post a project to get started!"
                  : `No ${feedFilter.toLowerCase()} found.`}
              </p>
            ) : (
              filteredFeed.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-5 rounded-3xl border border-white/40 hover:border-primary/30 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <Badge
                      variant="secondary"
                      className="bg-white/60 backdrop-blur-sm text-xs font-normal uppercase tracking-wide"
                    >
                      {item.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {item.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 flex-wrap">
                      {item.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] uppercase tracking-wide bg-white/40 px-2 py-0.5 rounded-full text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full hover:bg-primary/10 hover:text-primary h-8 px-4"
                      onClick={() => {
                        if (item.type === "internship") {
                          navigate('/internships');
                        } else {
                          navigate(`/${item.type}s/${item.id}`);
                        }
                      }}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
            {/* "See More" Card */}
            <div
              onClick={() => navigate("/groups")}
              className="glass-card p-5 rounded-3xl border border-dashed border-white/40 flex flex-col items-center justify-center text-center gap-2 hover:border-primary/50 hover:bg-primary/5 cursor-pointer min-h-[200px]"
            >
              <div className="h-12 w-12 rounded-full bg-white/50 flex items-center justify-center text-primary">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <span className="font-medium text-muted-foreground">
                Discover More
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Timeline & Personal (35%) */}
      <aside className="lg:w-[350px] space-y-6">
        {/* Date Widget */}
        <div className="glass rounded-[2rem] p-6 text-center border border-white/40">
          <h3 className="text-muted-foreground uppercase tracking-widest text-xs font-bold mb-1">
            Today
          </h3>
          <p className="text-4xl font-serif font-bold text-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Timeline / Recommended Connections */}
        <div className="glass rounded-[2rem] p-6 border border-white/40 min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold font-serif text-lg">
              People You May Know
            </h3>
          </div>

          <div className="space-y-4">
            {suggestionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : suggestions.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-4">
                No suggestions available
              </p>
            ) : (
              suggestions.slice(0, 4).map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between group p-2 rounded-2xl hover:bg-white/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/profile/${person.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 border border-white/50">
                        <AvatarImage src={person.avatarUrl} />
                        <AvatarFallback>{person.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-none">
                        {person.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {person.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectClick(person);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button
            variant="outline"
            className="w-full mt-6 rounded-xl glass border-dashed hover:border-solid text-xs h-10"
            onClick={() => setIsAllSuggestionsModalOpen(true)}
          >
            View All Suggestions
          </Button>
        </div>

        {/* Quick Stats Mini */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-[1.5rem] p-4 flex flex-col items-center justify-center text-center gap-1 hover:scale-105 transition-transform group cursor-pointer">
            <span className="text-2xl font-bold text-emerald-600 group-hover:text-emerald-500 transition-colors">
              {appStats.users}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
              Total Users
            </span>
          </div>
          <div className="glass rounded-[1.5rem] p-4 flex flex-col items-center justify-center text-center gap-1 hover:scale-105 transition-transform group cursor-pointer">
            <span className="text-2xl font-bold text-blue-600 group-hover:text-blue-500 transition-colors">
              {appStats.groups}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">
              Active Groups
            </span>
          </div>
        </div>
      </aside>

      {/* View All Suggestions Modal */}
      <Dialog open={isAllSuggestionsModalOpen} onOpenChange={setIsAllSuggestionsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl rounded-3xl overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-white/20">
            <DialogTitle className="text-xl font-serif font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              All Suggestions
            </DialogTitle>
            <div className="relative mt-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search suggestions..."
                className="pl-9 bg-white/50 border-white/40 focus:bg-white focus:ring-primary/20 transition-all rounded-xl"
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
              />
            </div>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {isAvailableUsersLoading ? (
              <div className="flex justify-center p-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredAvailableUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <UserPlus className="h-8 w-8 mb-2 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              filteredAvailableUsers.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-white/60 border border-transparent hover:border-white/40 justify-between"
                  onClick={() => {
                    setIsAllSuggestionsModalOpen(false);
                    navigate(`/profile/${u.id}`);
                  }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {u.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.course || u.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConnectClick(u);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
