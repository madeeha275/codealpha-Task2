import { useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

// One shared connection for the whole app
let socket = null;

function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: (cb) => cb({ token: localStorage.getItem('token') }),
    });
    socket.on('connect_error', (err) => console.warn('Socket connection error:', err.message));
  }
  return socket;
}

export function useSocket(projectId) {
  const s = getSocket();

  useEffect(() => {
    if (!projectId) return;
    s.emit('joinProject', projectId);
    return () => { s.emit('leaveProject', projectId); };
  }, [projectId, s]);

  return s;
}

export default useSocket;
