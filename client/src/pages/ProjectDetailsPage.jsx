import { useParams, Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Search,
  Paperclip,
  Hash,
  Plus,
  LogOut,
  Trash2,
  Info,
  FileText,
  MessageCircle,
  Users,
  Github,
  ExternalLink,
  Link as LinkIcon,
  Video,
  File,
  Loader2,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

const TABS = {
  ABOUT: "about",
  CHAT: "chat",
  RESOURCES: "resources",
  TEAM: "team",
};

const RESOURCE_ICONS = {
  link: LinkIcon,
  doc: FileText,
  file: File,
  video: Video,
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    joinChannel,
    leaveChannel,
    sendChannelMessage,
    setChannelTyping,
  } = useSocket();

  const [activeTab, setActiveTab] = useState(TABS.ABOUT);
  const [activeChannel, setActiveChannel] = useState(null);
  const [project, setProject] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leavingProject, setLeavingProject] = useState(false);
  const [showDeleteChannelDialog, setShowDeleteChannelDialog] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [deletingChannel, setDeletingChannel] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Resource states
  const [showAddResource, setShowAddResource] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState("link");
  const [addingResource, setAddingResource] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const previousChannelRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/projects/${id}`);
      setProject(data);
    } catch (error) {
      console.error("Failed to fetch project details", error);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMyProjects = useCallback(async () => {
    try {
      const data = await api.get("/projects");
      // Filter to only show projects user is a member of
      setMyProjects(data.filter((p) => p.isMember));
    } catch (error) {
      console.error("Failed to fetch my projects", error);
    }
  }, []);

  const fetchChannelMessages = useCallback(
    async (channelId) => {
      if (!project?.group?.id) return;
      try {
        const data = await api.get(
          `/groups/${project.group.id}/channels/${channelId}/messages`,
        );
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    },
    [project?.group?.id],
  );

  // Fetch project data
  useEffect(() => {
    fetchProjectDetails();
    fetchMyProjects();
  }, [fetchProjectDetails, fetchMyProjects]);

  // Set initial channel when switching to chat tab
  useEffect(() => {
    if (
      activeTab === TABS.CHAT &&
      project?.channels?.length > 0 &&
      !activeChannel
    ) {
      setActiveChannel(project.channels[0].id);
    }
  }, [project, activeChannel, activeTab]);

  // Fetch messages when channel changes
  useEffect(() => {
    if (activeChannel && project?.group?.id) {
      fetchChannelMessages(activeChannel);
    }
  }, [activeChannel, project?.group?.id, fetchChannelMessages]);

  // Join/leave channel rooms for real-time updates
  useEffect(() => {
    if (!activeChannel || !project?.group?.id || !isConnected) return;

    if (
      previousChannelRef.current &&
      previousChannelRef.current !== activeChannel
    ) {
      leaveChannel(previousChannelRef.current);
    }

    joinChannel(activeChannel, project.group.id);
    previousChannelRef.current = activeChannel;
    setTypingUsers([]);

    return () => {
      if (activeChannel) {
        leaveChannel(activeChannel);
      }
    };
  }, [
    activeChannel,
    project?.group?.id,
    isConnected,
    joinChannel,
    leaveChannel,
  ]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.channelId === activeChannel) {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      }
    };

    const handleTyping = ({ userId, userName, isTyping }) => {
      if (userId === user?.id) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.find((u) => u.userId === userId)) {
            return [...prev, { userId, userName }];
          }
          return prev;
        } else {
          return prev.filter((u) => u.userId !== userId);
        }
      });
    };

    socket.on("channel:message", handleNewMessage);
    socket.on("channel:typing", handleTyping);

    return () => {
      socket.off("channel:message", handleNewMessage);
      socket.off("channel:typing", handleTyping);
    };
  }, [socket, activeChannel, user?.id]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (activeChannel && isConnected) {
      setChannelTyping(activeChannel, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setChannelTyping(activeChannel, false);
      }, 2000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be under 10MB");
      return;
    }

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only images, PDF, and DOCX files are allowed");
      return;
    }

    setSelectedFile(file);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/uploads/channel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (
      (!messageInput.trim() && !selectedFile) ||
      !activeChannel ||
      !project?.group?.id
    )
      return;

    const content = messageInput.trim();
    setMessageInput("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    let fileData = null;
    if (selectedFile) {
      setUploadingFile(true);
      try {
        const uploaded = await uploadFile(selectedFile);
        fileData = {
          fileUrl: uploaded.url,
          fileName: uploaded.fileName,
          fileType: uploaded.fileType,
        };
      } catch {
        toast.error("Failed to upload file");
        setUploadingFile(false);
        setMessageInput(content);
        return;
      }
      clearSelectedFile();
      setUploadingFile(false);
    }

    if (isConnected) {
      sendChannelMessage(
        activeChannel,
        project.group.id,
        content || "",
        fileData,
      );
      setChannelTyping(activeChannel, false);
    } else {
      try {
        const newMsg = await api.post(
          `/groups/${project.group.id}/channels/${activeChannel}/messages`,
          { content: content || "", ...fileData },
        );
        setMessages((prev) => [...prev, newMsg]);
        setTimeout(scrollToBottom, 100);
      } catch {
        toast.error("Failed to send message");
        setMessageInput(content);
      }
    }
  };

  const handleCreateChannel = async (e) => {
    if (e) e.preventDefault();
    setFieldErrors({});
    if (!newChannelName.trim() || !project?.group?.id) {
      if (!newChannelName.trim()) setFieldErrors({ channelName: "Channel name is required" });
      return;
    }

    setCreatingChannel(true);
    try {
      const newChannel = await api.post(
        `/groups/${project.group.id}/channels`,
        {
          name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
          type: "TEXT",
        },
      );

      setProject((prev) => ({
        ...prev,
        channels: [...(prev.channels || []), newChannel],
      }));

      setNewChannelName("");
      setShowCreateChannel(false);
      setActiveChannel(newChannel.id);
      toast.success("Channel created!");
    } catch (error) {
      if (error.fieldErrors && error.fieldErrors.length > 0) {
        const errorsMap = {};
        error.fieldErrors.forEach((err) => {
          errorsMap[err.field] = err.message;
        });
        setFieldErrors(errorsMap);
      } else {
        toast.error(error.message || "Failed to create channel");
      }
    } finally {
      setCreatingChannel(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete || !project?.group?.id) return;
    setDeletingChannel(true);
    try {
      await api.delete(
        `/groups/${project.group.id}/channels/${channelToDelete.id}`,
      );
      setProject((prev) => ({
        ...prev,
        channels: prev.channels.filter((c) => c.id !== channelToDelete.id),
      }));

      if (activeChannel === channelToDelete.id) {
        const remainingChannels = project.channels.filter(
          (c) => c.id !== channelToDelete.id,
        );
        setActiveChannel(
          remainingChannels.length > 0 ? remainingChannels[0].id : null,
        );
      }

      toast.success("Channel deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete channel");
    } finally {
      setDeletingChannel(false);
      setShowDeleteChannelDialog(false);
      setChannelToDelete(null);
    }
  };

  const handleLeaveProject = async () => {
    setLeavingProject(true);
    try {
      await api.post(`/projects/${id}/leave`);
      toast.success("Left project successfully");
      navigate("/projects");
    } catch (error) {
      toast.error(error.message || "Failed to leave project");
    } finally {
      setLeavingProject(false);
      setShowLeaveDialog(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    
    let hasError = false;
    const newErrors = {};
    if (!resourceTitle.trim()) { newErrors.title = "Title is required"; hasError = true; }
    if (!resourceUrl.trim()) { newErrors.url = "URL is required"; hasError = true; }
    
    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

    setAddingResource(true);
    try {
      const newResource = await api.post(`/projects/${id}/resources`, {
        title: resourceTitle.trim(),
        url: resourceUrl.trim(),
        type: resourceType,
      });

      setProject((prev) => ({
        ...prev,
        resources: [newResource, ...(prev.resources || [])],
      }));

      setResourceTitle("");
      setResourceUrl("");
      setResourceType("link");
      setShowAddResource(false);
      toast.success("Resource added!");
    } catch (error) {
      if (error.fieldErrors && error.fieldErrors.length > 0) {
        const errorsMap = {};
        error.fieldErrors.forEach((err) => {
          errorsMap[err.field] = err.message;
        });
        setFieldErrors(errorsMap);
      } else {
        toast.error(error.message || "Failed to add resource");
      }
    } finally {
      setAddingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await api.delete(`/projects/${id}/resources/${resourceId}`);
      setProject((prev) => ({
        ...prev,
        resources: prev.resources.filter((r) => r.id !== resourceId),
      }));
      toast.success("Resource deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete resource");
    }
  };

  const isAdmin = project?.memberRole === "ADMIN";
  const currentChannel =
    project?.channels?.find((c) => c.id === activeChannel) ||
    project?.channels?.[0];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center">
        Project not found
      </div>
    );
  }

  if (!project.isMember) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-bold">
          You are not a member of this project
        </h2>
        <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 animate-in fade-in duration-500">
      {/* LEFT RAIL: My Projects Switcher */}
      <div className="w-[72px] glass rounded-[2rem] flex flex-col items-center py-4 gap-3 border border-white/40 shadow-xl shrink-0 z-20">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/projects">
                <div className="h-12 w-12 rounded-[24px] bg-white/50 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm group">
                  <FileText className="h-6 w-6 text-foreground group-hover:text-white" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold ml-2">
              All Projects
            </TooltipContent>
          </Tooltip>

          <div className="w-8 h-[2px] bg-white/20 rounded-full" />

          {myProjects.map((p) => (
            <Tooltip key={p.id}>
              <TooltipTrigger asChild>
                <Link to={`/projects/${p.id}`}>
                  <div
                    className={`h-12 w-12 rounded-[24px] overflow-hidden border-2 transition-all duration-300 hover:rounded-[16px] flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 ${
                      id === p.id
                        ? "border-primary ring-2 ring-primary/20 rounded-[16px]"
                        : "border-white/50 hover:border-white"
                    }`}
                  >
                    <span className="text-sm font-bold text-primary">
                      {p.title?.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold ml-2">
                {p.title}
              </TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/projects">
                <div className="h-12 w-12 rounded-[24px] bg-white/30 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer group border border-dashed border-white/50">
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:text-white" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold ml-2">
              Create/Join Project
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* LEFT SIDEBAR */}
      <div className="w-60 glass rounded-[2rem] flex flex-col border border-white/40 overflow-hidden shadow-xl shrink-0">
        {/* Project Header */}
        <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-white/10">
          <h2 className="font-bold text-base truncate">{project.title}</h2>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2 border-b border-white/10">
          <div className="grid grid-cols-2 gap-1">
            {[
              { key: TABS.ABOUT, icon: Info, label: "About" },
              { key: TABS.CHAT, icon: MessageCircle, label: "Chat" },
              { key: TABS.RESOURCES, icon: FileText, label: "Resources" },
              { key: TABS.TEAM, icon: Users, label: "Team" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-white/40"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channel List (only in Chat tab) */}
        {activeTab === TABS.CHAT && (
          <ScrollArea className="flex-1 p-3">
            <div className="mb-6">
              <h3 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 px-2 flex items-center justify-between">
                <span>Channels</span>
                {isAdmin && (
                  <button
                    onClick={() => setShowCreateChannel(true)}
                    className="hover:text-primary transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </h3>

              <div className="space-y-[2px]">
                {project.channels?.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 group ${
                      activeChannel === channel.id
                        ? "bg-primary/10 text-primary font-medium shadow-sm"
                        : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
                    }`}
                  >
                    <Hash
                      className={`h-4 w-4 ${activeChannel === channel.id ? "text-primary" : "text-muted-foreground/50"}`}
                    />
                    <span className="text-sm truncate flex-1">
                      {channel.name}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChannelToDelete(channel);
                          setShowDeleteChannelDialog(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Spacer for non-chat tabs */}
        {activeTab !== TABS.CHAT && <div className="flex-1" />}

        {/* Leave Project Button */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => setShowLeaveDialog(true)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Leave Project</span>
          </button>
        </div>

        {/* User Mini Profile */}
        <div className="p-3 bg-white/30 border-t border-white/10 flex items-center gap-2">
          <Avatar className="h-9 w-9 border border-white shadow-sm">
            <AvatarImage
              src={
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=random`
              }
            />
            <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold truncate">
              {user?.name || "Me"}
            </div>
            <div className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
              <span
                className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`}
              ></span>
              {isConnected ? "Online" : "Connecting..."}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col glass rounded-[2rem] border border-white/40 shadow-xl overflow-hidden">
        {/* About Tab */}
        {activeTab === TABS.ABOUT && (
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Project Title & Author */}
              <div className="space-y-4">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border">
                    <AvatarImage src={project.author?.avatarUrl} />
                    <AvatarFallback>{project.author?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {project.author?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Project Creator
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-foreground/90 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Tech Stack */}
              {project.tags?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3">
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Button>
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Live Demo
                    </Button>
                  </a>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="bg-white/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {project.participants?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                </div>
                <div className="bg-white/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">
                    {project.resources?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Resources</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Chat Tab */}
        {activeTab === TABS.CHAT && (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 bg-white/30 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-bold text-lg">
                  {currentChannel?.name || "select-channel"}
                </h3>
              </div>
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
                <input
                  className="h-8 rounded-md bg-black/5 border-none pl-8 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-primary/20"
                  placeholder="Search"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="mb-8 mt-4 px-4">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mb-4">
                    <Hash className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-3xl font-bold font-serif mb-2">
                    Welcome to #{currentChannel?.name}!
                  </h1>
                  <p className="text-muted-foreground">
                    This is the start of the{" "}
                    <span className="font-bold text-foreground">
                      #{currentChannel?.name}
                    </span>{" "}
                    channel.
                  </p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="group flex gap-4 hover:bg-black/5 -mx-4 px-4 py-1 rounded-lg transition-colors"
                >
                  <Avatar className="h-10 w-10 border border-white/50 shadow-sm mt-0.5">
                    <AvatarImage src={msg.sender?.avatarUrl} />
                    <AvatarFallback>{msg.sender?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-sm font-bold ${msg.sender?.id === user?.id ? "text-primary" : "text-foreground"}`}
                      >
                        {msg.sender?.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {msg.createdAt
                          ? formatDistanceToNow(new Date(msg.createdAt), {
                              addSuffix: true,
                            })
                          : ""}
                      </span>
                    </div>
                    {msg.content && (
                      <p className="text-sm text-foreground/90 leading-relaxed mt-0.5">
                        {msg.content}
                      </p>
                    )}
                    {msg.fileUrl && (
                      <div className="mt-2">
                        {msg.fileType?.startsWith("image/") ? (
                          <a
                            href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${msg.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${msg.fileUrl}`}
                              alt={msg.fileName || "attachment"}
                              className="max-w-xs max-h-60 rounded-lg border border-white/40 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            />
                          </a>
                        ) : (
                          <a
                            href={`${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}${msg.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white/60 border border-white/40 rounded-lg px-3 py-2 hover:bg-white/80 transition-colors"
                          >
                            <FileText className="h-5 w-5 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {msg.fileName || "File"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Click to open
                              </p>
                            </div>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-6 py-2 text-xs text-muted-foreground animate-pulse">
                {typingUsers.length === 1
                  ? `${typingUsers[0].userName} is typing...`
                  : `${typingUsers.length} people are typing...`}
              </div>
            )}

            {/* File Preview */}
            {selectedFile && (
              <div className="px-4 pb-2">
                <div className="bg-white/60 border border-white/40 rounded-lg p-3 flex items-center gap-3">
                  {selectedFile.type.startsWith("image/") ? (
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-black/5 shrink-0">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="p-1 rounded-full hover:bg-black/10 transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white/30 backdrop-blur-md mb-2 mx-4 rounded-xl"
            >
              <div className="bg-white/60 border border-white/40 rounded-xl p-1 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-black/5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
                  onChange={handleFileSelect}
                />
                <input
                  className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-2 placeholder:text-muted-foreground/70"
                  placeholder={`Message #${currentChannel?.name || "channel"}`}
                  value={messageInput}
                  onChange={handleInputChange}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 rounded-lg bg-transparent text-primary hover:bg-primary/10 shadow-none disabled:opacity-50"
                  disabled={
                    (!messageInput.trim() && !selectedFile) || uploadingFile
                  }
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        )}

        {/* Resources Tab */}
        {activeTab === TABS.RESOURCES && (
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Project Resources</h2>
                <Button
                  onClick={() => setShowAddResource(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Resource
                </Button>
              </div>

              {project.resources?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    No resources yet. Add documentation, links, or files to help
                    your team.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {project.resources?.map((resource) => {
                  const Icon = RESOURCE_ICONS[resource.type] || LinkIcon;
                  return (
                    <div
                      key={resource.id}
                      className="flex items-center gap-4 p-4 bg-white/40 rounded-xl border border-white/40 hover:bg-white/60 transition-colors group"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:text-primary transition-colors"
                        >
                          {resource.title}
                        </a>
                        <p className="text-xs text-muted-foreground truncate">
                          Added by {resource.addedBy?.name} •{" "}
                          {formatDistanceToNow(new Date(resource.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {(resource.addedById === user?.id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Team Tab */}
        {activeTab === TABS.TEAM && (
          <ScrollArea className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-bold mb-6">
                Team Members ({project.participants?.length || 0})
              </h2>
              <div className="space-y-3">
                {project.participants?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 bg-white/40 rounded-xl border border-white/40"
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.role?.toLowerCase()}
                      </p>
                    </div>
                    {member.role === "ADMIN" && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-0"
                      >
                        Admin
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* RIGHT SIDEBAR - Team (only on Chat tab) */}
      {activeTab === TABS.CHAT && (
        <div className="w-60 glass rounded-[2rem] border border-white/40 hidden lg:flex flex-col overflow-hidden shadow-xl shrink-0">
          <div className="h-16 border-b border-white/10 flex items-center px-4 font-bold text-sm">
            Team — {project.participants?.length || 0}
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-1">
              {project.participants?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/40 cursor-pointer transition-colors"
                >
                  <Avatar className="h-8 w-8 border border-white/50">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium leading-none">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                      {member.role?.toLowerCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave <strong>{project.title}</strong>?
              You can rejoin from the projects page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveProject}
              disabled={leavingProject}
            >
              {leavingProject ? "Leaving..." : "Leave Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>
              Create a new channel for your project discussions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="new-channel"
                    className={`w-full ${fieldErrors.channelName || fieldErrors.name ? "border-red-500" : ""}`}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateChannel(e)}
                  />
                  {(fieldErrors.channelName || fieldErrors.name) && (
                    <span className="text-sm text-red-500 mt-1 block">
                      {fieldErrors.channelName || fieldErrors.name}
                    </span>
                  )}
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateChannel(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChannel}
              disabled={!newChannelName.trim() || creatingChannel}
            >
              {creatingChannel ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteChannelDialog}
        onOpenChange={setShowDeleteChannelDialog}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Channel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>#{channelToDelete?.name}</strong>? All messages will be
              lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteChannelDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChannel}
              disabled={deletingChannel}
            >
              {deletingChannel ? "Deleting..." : "Delete Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddResource} onOpenChange={setShowAddResource}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
            <DialogDescription>
              Add a link, document, or file reference for your team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddResource} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resourceTitle">Title</Label>
              <Input
                id="resourceTitle"
                value={resourceTitle}
                onChange={(e) => setResourceTitle(e.target.value)}
                placeholder="Project Documentation"
                className={fieldErrors.title ? "border-red-500" : ""}
              />
              {fieldErrors.title && (
                <span className="text-sm text-red-500">{fieldErrors.title}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resourceUrl">URL</Label>
              <Input
                id="resourceUrl"
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                placeholder="https://..."
                className={fieldErrors.url ? "border-red-500" : ""}
              />
              {fieldErrors.url && (
                <span className="text-sm text-red-500">{fieldErrors.url}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={resourceType} onValueChange={setResourceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="doc">Document</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddResource(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !resourceTitle.trim() || !resourceUrl.trim() || addingResource
                }
              >
                {addingResource ? "Adding..." : "Add Resource"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
