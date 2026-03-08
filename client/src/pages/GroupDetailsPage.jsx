import { useParams, Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send,
  Search,
  ChevronDown,
  Paperclip,
  Hash,
  Plus,
  Compass,
  LogOut,
  X,
  Trash2,
  FileText,
  Image as ImageIcon,
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

export default function GroupDetailsPage() {
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

  const [activeChannel, setActiveChannel] = useState(null);
  const [group, setGroup] = useState(null);
  const [myGroups, setMyGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState(false);
  const [showDeleteChannelDialog, setShowDeleteChannelDialog] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState(null);
  const [deletingChannel, setDeletingChannel] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const previousChannelRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchGroupDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/groups/${id}`);
      setGroup(data);
    } catch (error) {
      console.error("Failed to fetch group details", error);
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMyGroups = useCallback(async () => {
    try {
      const data = await api.get("/groups/my-groups");
      setMyGroups(data);
    } catch (error) {
      console.error("Failed to fetch my groups", error);
    }
  }, []);

  const fetchChannelMessages = useCallback(
    async (channelId) => {
      try {
        const data = await api.get(
          `/groups/${id}/channels/${channelId}/messages`,
        );
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    },
    [id],
  );

  // Fetch group data
  useEffect(() => {
    fetchGroupDetails();
    fetchMyGroups();
  }, [fetchGroupDetails, fetchMyGroups]);

  // Set initial channel
  useEffect(() => {
    if (group?.channels?.length > 0 && !activeChannel) {
      setActiveChannel(group.channels[0].id);
    }
  }, [group, activeChannel]);

  // Fetch messages when channel changes (works without socket too)
  useEffect(() => {
    if (activeChannel && id) {
      fetchChannelMessages(activeChannel);
    }
  }, [activeChannel, id, fetchChannelMessages]);

  // Join/leave channel rooms for real-time updates
  useEffect(() => {
    if (!activeChannel || !id || !isConnected) return;

    // Leave previous channel
    if (
      previousChannelRef.current &&
      previousChannelRef.current !== activeChannel
    ) {
      leaveChannel(previousChannelRef.current);
    }

    // Join new channel
    joinChannel(activeChannel, id);
    previousChannelRef.current = activeChannel;
    setTypingUsers([]);

    return () => {
      if (activeChannel) {
        leaveChannel(activeChannel);
      }
    };
  }, [activeChannel, id, isConnected, joinChannel, leaveChannel]);

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

    // Send typing indicator if connected
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

    const maxSize = 10 * 1024 * 1024; // 10MB
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
    if ((!messageInput.trim() && !selectedFile) || !activeChannel || !id)
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
      sendChannelMessage(activeChannel, id, content || "", fileData);
      setChannelTyping(activeChannel, false);
    } else {
      try {
        const newMsg = await api.post(
          `/groups/${id}/channels/${activeChannel}/messages`,
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
    if (!newChannelName.trim()) {
      setFieldErrors({ name: "Channel name is required" });
      return;
    }

    setCreatingChannel(true);
    try {
      const newChannel = await api.post(`/groups/${id}/channels`, {
        name: newChannelName.trim().toLowerCase().replace(/\s+/g, "-"),
        type: "TEXT",
      });

      setGroup((prev) => ({
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
    if (!channelToDelete) return;
    setDeletingChannel(true);
    try {
      await api.delete(`/groups/${id}/channels/${channelToDelete.id}`);
      setGroup((prev) => ({
        ...prev,
        channels: prev.channels.filter((c) => c.id !== channelToDelete.id),
      }));

      // If we deleted the active channel, switch to another one
      if (activeChannel === channelToDelete.id) {
        const remainingChannels = group.channels.filter(
          (c) => c.id !== channelToDelete.id,
        );
        if (remainingChannels.length > 0) {
          setActiveChannel(remainingChannels[0].id);
        } else {
          setActiveChannel(null);
        }
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

  const handleLeaveGroup = async () => {
    setLeavingGroup(true);
    try {
      await api.post(`/groups/${id}/leave`);
      toast.success("Left group successfully");
      navigate("/groups");
    } catch (error) {
      toast.error(error.message || "Failed to leave group");
    } finally {
      setLeavingGroup(false);
      setShowLeaveDialog(false);
    }
  };

  const isAdmin =
    group?.participants?.find((p) => p.id === user?.id)?.role === "ADMIN";

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading group...
      </div>
    );
  if (!group)
    return (
      <div className="h-screen flex items-center justify-center">
        Group not found
      </div>
    );

  const currentChannel =
    group.channels?.find((c) => c.id === activeChannel) || group.channels?.[0];

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 animate-in fade-in duration-500">
      {/* LEFT RAIL: Joined Groups Switcher */}
      <div className="w-[72px] glass rounded-[2rem] flex flex-col items-center py-4 gap-3 border border-white/40 shadow-xl shrink-0 z-20">
        <TooltipProvider delayDuration={0}>
          {/* Back to Discovery */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/groups">
                <div className="h-12 w-12 rounded-[24px] bg-white/50 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm group">
                  <Compass className="h-6 w-6 text-foreground group-hover:text-white" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold ml-2">
              Discover Groups
            </TooltipContent>
          </Tooltip>

          <div className="w-8 h-[2px] bg-white/20 rounded-full" />

          {/* Joined Groups List */}
          {myGroups.map((g) => (
            <Tooltip key={g.id}>
              <TooltipTrigger asChild>
                <Link to={`/groups/${g.id}`}>
                  <div
                    className={`h-12 w-12 rounded-[24px] overflow-hidden border-2 transition-all duration-300 hover:rounded-[16px] ${id === g.id ? "border-primary ring-2 ring-primary/20 rounded-[16px]" : "border-white/50 hover:border-white"}`}
                  >
                    <img
                      src={
                        g.groupIconUrl ||
                        `https://ui-avatars.com/api/?name=${g.name}&background=random`
                      }
                      alt={g.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold ml-2">
                {g.name}
              </TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/groups">
                <div className="h-12 w-12 rounded-[24px] bg-white/30 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer group border border-dashed border-white/50">
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:text-white" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-bold ml-2">
              Join Group
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* CHANNEL SIDEBAR */}
      <div className="w-60 glass rounded-[2rem] flex flex-col border border-white/40 overflow-hidden shadow-xl shrink-0">
        {/* Group Header with Dropdown */}
        <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
          <DialogTrigger asChild>
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-4 hover:bg-white/10 transition-colors cursor-pointer bg-white/10">
              <h2 className="font-bold text-base truncate">{group.name}</h2>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Leave Group</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave <strong>{group.name}</strong>?
                You can rejoin anytime from the discover page.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setShowLeaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleLeaveGroup}
                disabled={leavingGroup}
              >
                {leavingGroup ? "Leaving..." : "Leave Group"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Channel Dialog */}
        <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Text Channel</DialogTitle>
              <DialogDescription>
                Create a new channel for your group discussions.
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
                    className={`w-full ${fieldErrors.name ? "border-red-500" : ""}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateChannel(e);
                    }}
                  />
                  {fieldErrors.name && (
                    <span className="text-sm text-red-500 mt-1 block">{fieldErrors.name}</span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateChannel(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateChannel}
                disabled={!newChannelName.trim() || creatingChannel}
                type="submit"
              >
                {creatingChannel ? "Creating..." : "Create Channel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Channel Dialog */}
        <Dialog
          open={showDeleteChannelDialog}
          onOpenChange={setShowDeleteChannelDialog}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Channel</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <strong>#{channelToDelete?.name}</strong>? This action cannot be
                undone and all messages will be lost.
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

        {/* Channel List */}
        <ScrollArea className="flex-1 p-3">
          <div className="mb-6">
            <h3 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 px-2 flex items-center justify-between group">
              <span>Text Channels</span>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateChannel(true)}
                  className="hover:text-primary transition-colors"
                >
                  <Plus className="h-4 w-4 text-black" />
                </button>
              )}
            </h3>

            <div className="space-y-[2px]">
              {group.channels?.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`
                    flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 group
                    ${
                      activeChannel === channel.id
                        ? "bg-primary/10 text-primary font-medium shadow-sm"
                        : "text-muted-foreground hover:bg-white/40 hover:text-foreground"
                    }
                  `}
                >
                  <Hash
                    className={`h-4 w-4 ${activeChannel === channel.id ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"}`}
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
              {(!group.channels || group.channels.length === 0) && (
                <div className="px-2 text-xs text-muted-foreground">
                  No channels yet
                </div>
              )}
            </div>
          </div>

          {/* Leave Group Button */}
          <div className="border-t border-white/10 pt-3 mt-3">
            <button
              onClick={() => setShowLeaveDialog(true)}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Leave Group</span>
            </button>
          </div>
        </ScrollArea>

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

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col glass rounded-[2rem] border border-white/40 shadow-xl overflow-hidden relative">
        {/* Chat Header */}
        <div className="h-16 border-b border-white/10 bg-white/30 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-bold text-lg">
              {currentChannel?.name || "select-channel"}
            </h3>
            <div className="h-4 w-[1px] bg-white/30 mx-2" />
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              General discussion
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
              <input
                className="h-8 rounded-md bg-black/5 border-none pl-8 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-primary/20"
                placeholder="Search"
              />
            </div>
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
              <Avatar className="h-10 w-10 border border-white/50 shadow-sm mt-0.5 cursor-pointer hover:drop-shadow-md transition-all">
                <AvatarImage src={msg.sender?.avatarUrl} />
                <AvatarFallback>{msg.sender?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-sm font-bold cursor-pointer hover:underline ${msg.sender?.id === user?.id ? "text-primary" : "text-foreground"}`}
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
              : typingUsers.length === 2
                ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
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

        {/* Input Area - Always enabled, uses REST fallback */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 bg-white/30 backdrop-blur-md mb-2 mx-4 rounded-xl"
        >
          <div className="bg-white/60 border border-white/40 rounded-xl p-1 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
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
      </div>

      {/* Member Sidebar (Right) */}
      <div className="w-60 glass rounded-[2rem] border border-white/40 hidden lg:flex flex-col overflow-hidden shadow-xl shrink-0">
        <div className="h-16 border-b border-white/10 flex items-center px-4 font-bold text-sm">
          Members — {group.participants?.length || 0}
        </div>
        <ScrollArea className="flex-1 p-3">
          <div className="mb-6">
            <h3 className="text-[10px] uppercase font-bold text-muted-foreground/70 mb-2 px-2">
              All Members
            </h3>
            <div className="space-y-1">
              {group.participants?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/40 cursor-pointer transition-colors group opacity-90 hover:opacity-100"
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8 border border-white/50">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-gray-400`}
                    ></span>
                  </div>
                  <div>
                    <div className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                      {member.role?.toLowerCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
