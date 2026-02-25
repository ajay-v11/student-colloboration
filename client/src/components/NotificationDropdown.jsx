import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, MessageCircle, Users, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const notificationIcons = {
  DM_MESSAGE: MessageCircle,
  GROUP_MESSAGE: Users,
  GROUP_INVITE: UserPlus,
  GROUP_JOIN: Users,
  MENTION: MessageCircle,
  SYSTEM: Bell,
};

const notificationColors = {
  DM_MESSAGE: 'bg-blue-500/10 text-blue-600',
  GROUP_MESSAGE: 'bg-purple-500/10 text-purple-600',
  GROUP_INVITE: 'bg-green-500/10 text-green-600',
  GROUP_JOIN: 'bg-emerald-500/10 text-emerald-600',
  MENTION: 'bg-orange-500/10 text-orange-600',
  SYSTEM: 'bg-gray-500/10 text-gray-600',
};

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'DM_MESSAGE':
        if (notification.senderId) {
          navigate(`/messages/${notification.senderId}`);
        }
        break;
      case 'GROUP_MESSAGE':
      case 'GROUP_JOIN':
      case 'GROUP_INVITE':
        if (notification.groupId) {
          navigate(`/groups/${notification.groupId}`);
        }
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full hover:bg-white/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 rounded-full bg-primary text-[10px] text-primary-foreground font-bold flex items-center justify-center shadow-lg shadow-primary/30">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 glass rounded-2xl border border-white/40 shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-bold text-lg">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs hover:bg-white/40 rounded-lg"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive rounded-lg"
                  onClick={clearAll}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <ScrollArea className="max-h-[400px]">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No notifications yet</p>
                <p className="text-muted-foreground/70 text-xs mt-1">
                  You'll see updates here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {notifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell;
                  const colorClass = notificationColors[notification.type] || notificationColors.SYSTEM;

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-white/30 cursor-pointer transition-colors group ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        {/* Icon or Avatar */}
                        <div className="shrink-0">
                          {notification.sender ? (
                            <Avatar className="h-10 w-10 border border-white/50">
                              <AvatarImage src={notification.sender.avatarUrl} />
                              <AvatarFallback>{notification.sender.name?.[0]}</AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className={`h-10 w-10 rounded-full ${colorClass} flex items-center justify-center`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                            {notification.content}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-start gap-1">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-white/50 text-muted-foreground hover:text-foreground"
                              title="Mark as read"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            title="Delete"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
