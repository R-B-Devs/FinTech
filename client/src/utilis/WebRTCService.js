// src/utilis/WebRTCService.js
import { io } from "socket.io-client";

const socket = io("http://localhost:3005", {
  withCredentials: true,
});

export default socket;
