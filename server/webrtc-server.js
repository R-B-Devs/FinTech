const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Change to your frontend URL for production!
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Join a department room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);
  });

  // Caller sends offer, broadcast to agents in the room except caller
  socket.on('offer', ({ offer, roomId, sender }) => {
    console.log(`Offer received from ${sender} for room ${roomId}`);
    socket.to(roomId).emit('offer', { offer, roomId, sender });
  });

  // Agent sends answer back to caller (targetUser)
  socket.on('answer', ({ answer, roomId, targetUser }) => {
    console.log(`Answer sent from ${socket.id} to ${targetUser}`);
    io.to(targetUser).emit('answer', { answer });
  });

  // ICE candidate sent from either side, forwarded to targetUser
  socket.on('ice-candidate', ({ candidate, roomId, targetUser }) => {
    if (targetUser) {
      io.to(targetUser).emit('ice-candidate', { candidate });
    } else {
      socket.to(roomId).emit('ice-candidate', { candidate });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = 3005;

server.listen(PORT, () => {
  console.log(`WebRTC signaling server listening on port ${PORT}`);
});
