import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Singleton — created once for the app lifetime, connects automatically
export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
});

export const joinUserRoom = (userId) => {
  if (!userId) return;
  if (socket.connected) {
    socket.emit('join', userId);
  } else {
    socket.once('connect', () => socket.emit('join', userId));
  }
};
