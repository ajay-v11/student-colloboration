import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [connectionState, setConnectionState] = useState({ socket: null, isConnected: false });
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    // Handle user logout - cleanup
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // This setState is necessary to sync React state with the disconnected socket
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConnectionState({ socket: null, isConnected: false });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    // Don't recreate if already connected
    if (socketRef.current?.connected) {
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    // These setState calls are in callbacks, which is the correct pattern
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnectionState(prev => ({ ...prev, isConnected: true }));
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionState(prev => ({ ...prev, isConnected: false }));
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connect error:', error.message);
    });

    socketRef.current = newSocket;
    setConnectionState({ socket: newSocket, isConnected: false });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Channel chat helpers
  const joinChannel = useCallback((channelId, groupId) => {
    socketRef.current?.emit('channel:join', { channelId, groupId });
  }, []);

  const leaveChannel = useCallback((channelId) => {
    socketRef.current?.emit('channel:leave', { channelId });
  }, []);

  const sendChannelMessage = useCallback((channelId, groupId, content) => {
    socketRef.current?.emit('channel:message', { channelId, groupId, content });
  }, []);

  const setChannelTyping = useCallback((channelId, isTyping) => {
    socketRef.current?.emit('channel:typing', { channelId, isTyping });
  }, []);

  // DM helpers
  const joinDM = useCallback((recipientId) => {
    socketRef.current?.emit('dm:join', { recipientId });
  }, []);

  const leaveDM = useCallback((recipientId) => {
    socketRef.current?.emit('dm:leave', { recipientId });
  }, []);

  const sendDM = useCallback((recipientId, content) => {
    socketRef.current?.emit('dm:message', { recipientId, content });
  }, []);

  const setDMTyping = useCallback((recipientId, isTyping) => {
    socketRef.current?.emit('dm:typing', { recipientId, isTyping });
  }, []);

  const value = useMemo(() => ({
    socket: connectionState.socket,
    isConnected: connectionState.isConnected,
    // Channel
    joinChannel,
    leaveChannel,
    sendChannelMessage,
    setChannelTyping,
    // DM
    joinDM,
    leaveDM,
    sendDM,
    setDMTyping,
  }), [connectionState, joinChannel, leaveChannel, sendChannelMessage, setChannelTyping, joinDM, leaveDM, sendDM, setDMTyping]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
