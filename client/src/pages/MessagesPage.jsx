import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Search as SearchIcon,
  MessageCircle,
  Plus,
  UserPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-hot-toast";

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, isConnected, joinDM, leaveDM, sendDM, setDMTyping } =
    useSocket();
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isAvailableUsersLoading, setIsAvailableUsersLoading] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  const fetchAvailableUsers = async () => {
    setIsAvailableUsersLoading(true);
    try {
      const data = await api.get("/messages/users/available");
      setAvailableUsers(data);
    } catch (error) {
      console.error("Failed to fetch available users", error);
    } finally {
      setIsAvailableUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isNewChatModalOpen && availableUsers.length === 0) {
      fetchAvailableUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewChatModalOpen, availableUsers.length]);

  const filteredAvailableUsers = availableUsers.filter(u =>
      u.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const previousChatRef = useRef(null);
  const initialLoadDone = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = useCallback(async () => {
    try {
      const data = await api.get("/messages/conversations");
      setConversations(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch conversations", error);
      return [];
    }
  }, []);

  const fetchMessages = useCallback(async (recipientId) => {
    try {
      const data = await api.get(`/messages/dm/${recipientId}`);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  }, []);

  const markAsReadAndUpdate = useCallback(async (recipientId) => {
    try {
      await api.put(`/messages/mark-as-read/${recipientId}`);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.user.id === recipientId ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  }, []);

  const searchUsers = useCallback(async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const data = await api.get(
        `/messages/users/search?q=${encodeURIComponent(query)}`,
      );
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed", error);
    }
  }, []);

  const selectChat = useCallback(
    (selectedUser, updateUrl = true) => {
      setActiveChat(selectedUser);
      setSearchQuery("");
      setSearchResults([]);

      if (updateUrl) {
        navigate(`/messages/${selectedUser.id}`, { replace: true });
      }

      setIsNewChatModalOpen(false);

      setConversations((prev) => {
        if (prev.find((c) => c.user.id === selectedUser.id)) return prev;
        return [
          {
            user: selectedUser,
            lastMessage: null,
            unreadCount: 0,
          },
          ...prev,
        ];
      });
    },
    [navigate],
  );

  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      const convos = await fetchConversations();
      setLoading(false);

      if (initialLoadDone.current) return;
      initialLoadDone.current = true;

      const stateUser = location.state?.selectedUser;
      if (stateUser) {
        selectChat(stateUser, true);
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }

      if (urlUserId) {
        const existingConvo = convos.find((c) => c.user.id === urlUserId);
        if (existingConvo) {
          selectChat(existingConvo.user, false);
        } else {
          try {
            const users = await api.get(`/messages/users/search?q=`);
            const foundUser = users.find((u) => u.id === urlUserId);
            if (foundUser) {
              selectChat(foundUser, false);
            }
          } catch {
            // User not found, stay on empty state
          }
        }
      }
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeChat || !isConnected) return;

    if (
      previousChatRef.current &&
      previousChatRef.current.id !== activeChat.id
    ) {
      leaveDM(previousChatRef.current.id);
    }

    joinDM(activeChat.id);
    previousChatRef.current = activeChat;

    const loadChat = async () => {
      await fetchMessages(activeChat.id);
      await markAsReadAndUpdate(activeChat.id);
    };
    loadChat();
    setTypingUser(null);

    return () => {
      if (activeChat) {
        leaveDM(activeChat.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.id, isConnected]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      const isRelevant =
        message.senderId === activeChat?.id ||
        (message.receiverId === activeChat?.id &&
          message.senderId === user?.id);

      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);

        if (message.senderId === activeChat?.id) {
          markAsReadAndUpdate(activeChat.id);
        }
      }

      setConversations((prev) => {
        const existingIdx = prev.findIndex(
          (c) =>
            c.user.id === message.senderId || c.user.id === message.receiverId,
        );

        if (existingIdx === -1) return prev;

        const updated = [...prev];
        const conv = { ...updated[existingIdx] };
        conv.lastMessage = {
          content: message.content,
          createdAt: message.createdAt,
          senderId: message.senderId,
        };

        if (
          message.senderId !== user?.id &&
          message.senderId !== activeChat?.id
        ) {
          conv.unreadCount = (conv.unreadCount || 0) + 1;
        }

        updated.splice(existingIdx, 1);
        return [conv, ...updated];
      });
    };

    const handleTyping = ({ userId, userName, isTyping }) => {
      if (userId === activeChat?.id) {
        setTypingUser(isTyping ? userName : null);
      }
    };

    const handleNotification = (notification) => {
      if (
        notification.type === "DM_MESSAGE" &&
        notification.senderId !== activeChat?.id
      ) {
        toast(`New message from ${notification.sender?.name || "Someone"}`, {
          icon: "💬",
        });

        if (notification.sender) {
          setConversations((prev) => {
            const existingIdx = prev.findIndex(
              (c) => c.user.id === notification.senderId,
            );

            if (existingIdx === -1) {
              return [
                {
                  user: notification.sender,
                  lastMessage: {
                    content: notification.content,
                    createdAt: notification.createdAt,
                    senderId: notification.senderId,
                  },
                  unreadCount: 1,
                },
                ...prev,
              ];
            }

            const updated = [...prev];
            const conv = { ...updated[existingIdx] };
            conv.lastMessage = {
              content: notification.content,
              createdAt: notification.createdAt,
              senderId: notification.senderId,
            };
            conv.unreadCount = (conv.unreadCount || 0) + 1;
            updated.splice(existingIdx, 1);
            return [conv, ...updated];
          });
        }
      }
    };

    socket.on("dm:message", handleNewMessage);
    socket.on("dm:typing", handleTyping);
    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("dm:message", handleNewMessage);
      socket.off("dm:typing", handleTyping);
      socket.off("notification:new", handleNotification);
    };
  }, [socket, activeChat, user?.id, markAsReadAndUpdate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (activeChat) {
      setDMTyping(activeChat.id, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setDMTyping(activeChat.id, false);
      }, 2000);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    sendDM(activeChat.id, messageInput.trim());
    setMessageInput("");
    setDMTyping(activeChat.id, false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-6 animate-in fade-in duration-500">
      {/* Sidebar List */}
      <div className="w-80 md:w-96 glass rounded-[2rem] border border-white/40 flex flex-col overflow-hidden shadow-xl relative">
        <div className="p-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif font-bold">Messages</h1>
          </div>
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="text"
              placeholder="Search conversations or users..."
              className="pl-9 h-11 rounded-xl bg-white/40 border-transparent focus:bg-white/80 focus:border-primary/20 transition-all placeholder:text-muted-foreground/70"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white/60 rounded-xl border border-white/40 overflow-hidden shadow-lg">
              <div className="p-2 text-xs text-muted-foreground border-b border-white/20">
                Start new conversation
              </div>
              {searchResults.map((searchUser) => (
                <div
                  key={searchUser.id}
                  className="flex items-center gap-3 p-3 hover:bg-white/40 cursor-pointer transition-colors"
                  onClick={() => selectChat(searchUser)}
                >
                  <Avatar className="h-10 w-10 border border-white">
                    <AvatarImage src={searchUser.avatarUrl} />
                    <AvatarFallback>{searchUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{searchUser.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {searchUser.email}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Search for users to start chatting
              </p>
            </div>
          ) : (
            conversations.map((chat) => (
              <div
                key={chat.user.id}
                className={`
                  group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200
                  ${
                    activeChat?.id === chat.user.id
                      ? "bg-white/60 shadow-sm border border-white/40"
                      : "hover:bg-white/30 border border-transparent"
                  }
                `}
                onClick={() => selectChat(chat.user)}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={chat.user.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {chat.user.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`font-semibold truncate ${activeChat?.id === chat.user.id ? "text-primary" : "text-foreground"}`}
                    >
                      {chat.user.name}
                    </span>
                    {chat.lastMessage && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {formatDistanceToNow(
                          new Date(chat.lastMessage.createdAt),
                          { addSuffix: false },
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm truncate text-muted-foreground">
                    {chat.lastMessage?.content || "Start a conversation"}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="h-5 min-w-[1.25rem] px-1.5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold shadow-lg shadow-primary/30">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <Dialog open={isNewChatModalOpen} onOpenChange={setIsNewChatModalOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              className="absolute bottom-6 right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 z-10"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-white/40 shadow-2xl rounded-3xl overflow-hidden">
            <DialogHeader className="p-6 pb-2 border-b border-white/20">
              <DialogTitle className="text-xl font-serif font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                New Chat
              </DialogTitle>
              <div className="relative mt-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search available users..."
                  className="pl-9 bg-white/50 border-white/40 focus:bg-white focus:ring-primary/20 transition-all rounded-xl"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                />
              </div>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {isAvailableUsersLoading ? (
                <div className="flex justify-center p-8 text-muted-foreground">
                  Loading users...
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
                    className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-white/60 border border-transparent hover:border-white/40"
                    onClick={() => selectChat(u)}
                  >
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
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col glass rounded-[2rem] border border-white/40 shadow-xl overflow-hidden relative hidden md:flex">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-white/10 bg-white/30 backdrop-blur-md flex items-center justify-between px-6 z-10">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border border-white shadow-sm">
                  <AvatarImage src={activeChat.avatarUrl} />
                  <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg leading-tight">
                    {activeChat.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 shadow-sm shadow-green-500/50" : "bg-gray-400"}`}
                    ></span>
                    <p className="text-xs text-muted-foreground font-medium">
                      {typingUser
                        ? `${typingUser} is typing...`
                        : isConnected
                          ? "Online"
                          : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/*    <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/50 rounded-full h-10 w-10">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/50 rounded-full h-10 w-10">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/50 rounded-full h-10 w-10">
                  <MoreVertical className="h-5 w-5" />
                </Button> */}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Avatar className="h-20 w-20 border-2 border-white shadow-lg mb-4">
                    <AvatarImage src={activeChat.avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {activeChat.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-xl mb-1">{activeChat.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    This is the beginning of your conversation
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`max-w-[70%] group`}>
                        <div
                          className={`p-4 rounded-[1.25rem] shadow-sm text-sm leading-relaxed relative ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-tr-sm shadow-primary/20"
                              : "bg-white text-foreground rounded-tl-sm shadow-black/5"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p
                          className={`text-[10px] mt-1.5 px-1 font-medium ${isMe ? "text-right text-muted-foreground" : "text-muted-foreground"}`}
                        >
                          {msg.createdAt
                            ? formatDistanceToNow(new Date(msg.createdAt), {
                                addSuffix: true,
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/40 backdrop-blur-md border-t border-white/20">
              <form
                className="flex items-end gap-2"
                onSubmit={handleSendMessage}
              >
                <div className="flex-1 bg-white/60 border border-white/40 rounded-[1.5rem] p-1.5 pl-4 flex items-center shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <input
                    className="flex-1 bg-transparent border-none outline-none text-sm min-h-[2.5rem] placeholder:text-muted-foreground/70"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={handleInputChange}
                    disabled={!isConnected}
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90 shrink-0 disabled:opacity-50"
                  disabled={!messageInput.trim() || !isConnected}
                >
                  <Send className="h-5 w-5 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
            </div>

            {/* Floating message bubbles decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[15%] left-[10%] w-16 h-10 bg-white/40 rounded-2xl rounded-tl-sm shadow-sm animate-float" />
              <div className="absolute top-[25%] right-[15%] w-24 h-8 bg-primary/20 rounded-2xl rounded-tr-sm shadow-sm animate-float-delayed" />
              <div className="absolute bottom-[30%] left-[20%] w-20 h-8 bg-white/30 rounded-2xl rounded-bl-sm shadow-sm animate-float-slow" />
              <div className="absolute bottom-[20%] right-[10%] w-14 h-10 bg-primary/15 rounded-2xl rounded-br-sm shadow-sm animate-float" />
            </div>

            {/* Main content */}
            <div className="relative z-10">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-xl shadow-primary/10">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
                  <span className="text-lg">👋</span>
                </div>
              </div>

              <h3 className="font-serif font-bold text-2xl mb-3 text-foreground">
                Your inbox awaits
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
                Select a conversation from the sidebar to continue chatting, or
                search for someone new to connect with.
              </p>

              <div className="flex flex-col gap-3 text-xs text-muted-foreground/70">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Real-time messaging</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Connect with classmates</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
