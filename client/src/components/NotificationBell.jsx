// src/components/NotificationBell.jsx
import React, { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'react-hot-toast';

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 18.75a2.25 2.25 0 01-4.5 0M6 12a6 6 0 1112 0v4.5l1.5 1.5H4.5l1.5-1.5V12z" />
  </svg>
);

const NotificationBell = () => {
  const [unread, setUnread] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on('notification', (data) => {
      setUnread((c) => c + 1);
      toast.info(data.message || 'New notification');
    });
    return () => {
      socket.off('notification');
    };
  }, [socket]);

  const clear = () => setUnread(0);

  return (
    <button onClick={clear} className="relative p-1">
      <BellIcon className="text-gray-600 dark:text-gray-300" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
          {unread}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
