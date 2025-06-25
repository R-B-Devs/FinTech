// server/webrtcServer.js
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
 
// Create express instance for WebRTC signaling
const app = express();
const server = http.createServer(app);
 
// Use 3005 if 3002 is taken or set from .env
const PORT = process.env.WEBRTC_PORT || 3005;
 
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'], // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000, // 2 minutes
    skipMiddlewares: true
  }
});
 
const activeRooms = new Map();
 
io.on('connection', (socket) => {
  console.log(`🚀 New WebRTC connection: ${socket.id}`);
 
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    activeRooms.set(roomId, [...(activeRooms.get(roomId) || []), socket.id]);
 
    console.log(`📞 ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-connected', socket.id);
 
    const usersInRoom = activeRooms.get(roomId) || [];
    if (usersInRoom.length > 1) {
      socket.emit('existing-users', usersInRoom.filter(id => id !== socket.id));
    }
  });
 
  socket.on('offer', ({ roomId, offer, targetUser }) => {
    socket.to(targetUser).emit('offer', { offer, sender: socket.id, roomId });
  });
 
  socket.on('answer', ({ roomId, answer, targetUser }) => {
    socket.to(targetUser).emit('answer', { answer, sender: socket.id, roomId });
  });
 
  socket.on('ice-candidate', ({ roomId, candidate, targetUser }) => {
    socket.to(targetUser).emit('ice-candidate', { candidate, sender: socket.id, roomId });
  });
 
  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    activeRooms.forEach((users, roomId) => {
      if (users.includes(socket.id)) {
        const updatedUsers = users.filter(id => id !== socket.id);
        activeRooms.set(roomId, updatedUsers);
        socket.to(roomId).emit('user-disconnected', socket.id);
 
        if (updatedUsers.length === 0) {
          activeRooms.delete(roomId);
        }
      }
    });
  });
 
  socket.on('error', (err) => {
    console.error(`WebRTC Error (${socket.id}):`, err);
  });
});
 
// Health check
app.use(cors());
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    activeRooms: activeRooms.size,
    activeConnections: io.engine.clientsCount
  });
});
 
// Start WebRTC Server
server.listen(PORT, () => {
  console.log(`🎧 WebRTC Signaling Server running on port ${PORT}`);
  console.log(`   - Socket.IO: ws://localhost:${PORT}`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
});
 
// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down WebRTC server...');
  io.close();
  server.close();
});