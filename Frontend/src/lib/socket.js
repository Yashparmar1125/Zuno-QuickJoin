import { io } from 'socket.io-client';

// Prefer explicit VITE_SOCKET_URL; fallback to same-origin server
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:8080";

export function createSocket(token) {
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'],
    auth: token ? { token } : undefined,
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return socket;
}


