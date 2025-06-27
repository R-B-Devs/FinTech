const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Add your client URLs
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected clients and agents
const clients = new Map();
const agents = new Map();
const activeCalls = new Map();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Get available agents
app.get('/api/agents', (req, res) => {
  const availableAgents = Array.from(agents.entries()).map(([id, agent]) => ({
    id,
    name: agent.name,
    status: agent.status
  }));
  res.json(availableAgents);
});

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);

  // Register as client
  socket.on('register-client', (data) => {
    clients.set(socket.id, {
      id: socket.id,
      name: data.name || 'Anonymous Client',
      status: 'online'
    });
    console.log('Client registered:', socket.id);
  });

  // Register as agent
  socket.on('register-agent', (data) => {
    agents.set(socket.id, {
      id: socket.id,
      name: data.name || 'Agent',
      status: 'available'
    });
    console.log('Agent registered:', socket.id);
    
    // Notify all clients about available agents
    socket.broadcast.emit('agents-updated', Array.from(agents.values()));
  });

  // Client initiates call
  socket.on('initiate-call', (data) => {
    const callId = uuidv4();
    const client = clients.get(socket.id);
    
    // Find available agent (first available for now)
    const availableAgent = Array.from(agents.entries()).find(([id, agent]) => 
      agent.status === 'available'
    );

    if (!availableAgent) {
      socket.emit('call-failed', { reason: 'No agents available' });
      return;
    }

    const [agentId, agent] = availableAgent;
    
    // Create call record
    activeCalls.set(callId, {
      id: callId,
      clientId: socket.id,
      agentId: agentId,
      status: 'ringing',
      startTime: new Date()
    });

    // Update agent status
    agents.get(agentId).status = 'busy';

    // Notify agent about incoming call
    io.to(agentId).emit('incoming-call', {
      callId,
      client: {
        id: socket.id,
        name: client.name
      }
    });

    // Notify client that call is being connected
    socket.emit('call-connecting', { callId, agent: agent.name });
  });

  // Agent accepts call
  socket.on('accept-call', (data) => {
    const { callId } = data;
    const call = activeCalls.get(callId);
    
    if (!call) {
      socket.emit('call-error', { reason: 'Call not found' });
      return;
    }

    call.status = 'accepted';
    
    // Notify client that call was accepted
    io.to(call.clientId).emit('call-accepted', { callId });
    
    // Both parties can now start WebRTC negotiation
    socket.emit('call-ready', { callId, peerId: call.clientId });
    io.to(call.clientId).emit('call-ready', { callId, peerId: socket.id });
  });

  // Agent rejects call
  socket.on('reject-call', (data) => {
    const { callId } = data;
    const call = activeCalls.get(callId);
    
    if (call) {
      // Notify client
      io.to(call.clientId).emit('call-rejected', { callId });
      
      // Clean up
      activeCalls.delete(callId);
      if (agents.has(socket.id)) {
        agents.get(socket.id).status = 'available';
      }
    }
  });

  // WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    const { callId, offer, targetId } = data;
    io.to(targetId).emit('webrtc-offer', {
      callId,
      offer,
      fromId: socket.id
    });
  });

  socket.on('webrtc-answer', (data) => {
    const { callId, answer, targetId } = data;
    io.to(targetId).emit('webrtc-answer', {
      callId,
      answer,
      fromId: socket.id
    });
  });

  socket.on('webrtc-ice-candidate', (data) => {
    const { callId, candidate, targetId } = data;
    io.to(targetId).emit('webrtc-ice-candidate', {
      callId,
      candidate,
      fromId: socket.id
    });
  });

  // End call
  socket.on('end-call', (data) => {
    const { callId } = data;
    const call = activeCalls.get(callId);
    
    if (call) {
      // Notify both parties
      io.to(call.clientId).emit('call-ended', { callId });
      io.to(call.agentId).emit('call-ended', { callId });
      
      // Clean up
      activeCalls.delete(callId);
      if (agents.has(call.agentId)) {
        agents.get(call.agentId).status = 'available';
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Clean up client
    if (clients.has(socket.id)) {
      clients.delete(socket.id);
    }
    
    // Clean up agent
    if (agents.has(socket.id)) {
      agents.delete(socket.id);
      // Notify clients about agent list update
      io.emit('agents-updated', Array.from(agents.values()));
    }
    
    // Handle active calls
    for (const [callId, call] of activeCalls.entries()) {
      if (call.clientId === socket.id || call.agentId === socket.id) {
        const otherPartyId = call.clientId === socket.id ? call.agentId : call.clientId;
        io.to(otherPartyId).emit('call-ended', { callId, reason: 'Other party disconnected' });
        activeCalls.delete(callId);
        
        // Reset agent status if needed
        if (agents.has(call.agentId)) {
          agents.get(call.agentId).status = 'available';
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ABSA Call Server running on port ${PORT}`);
});