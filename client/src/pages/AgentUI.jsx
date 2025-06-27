import React, { useState, useEffect, useRef } from 'react';
import SocketService from '../utils/socket';
import WebRTCService from '../services/webrtc';


const AgentUI = ({ agentName = "Support Agent" }) => {
  const [agentStatus, setAgentStatus] = useState('available'); // available, busy, offline
  const [incomingCall, setIncomingCall] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionState, setConnectionState] = useState('');
  const [showIncomingCallModal, setShowIncomingCallModal] = useState(false);
  const [callNotes, setCallNotes] = useState('');

  const callStartTimeRef = useRef(null);
  const callTimerRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    // Initialize socket connection
    const socket = SocketService.connect();
    WebRTCService.setSocket(socket);

    // Register as agent
    socket.emit('register-agent', { name: agentName });

    // Set up WebRTC callbacks
    WebRTCService.onRemoteStream = (stream) => {
      const audio = document.getElementById('remoteAudio');
      if (audio) {
        audio.srcObject = stream;
      }
    };

    WebRTCService.onConnectionStateChange = (state) => {
      setConnectionState(state);
      if (state === 'connected' && currentCall) {
        startCallTimer();
      } else if (state === 'disconnected' || state === 'failed') {
        handleCallEnd();
      }
    };

    // Socket event listeners
    socket.on('incoming-call', (data) => {
      setIncomingCall(data);
      setShowIncomingCallModal(true);
      setAgentStatus('busy');
      
      // Play notification sound (optional)
      playNotificationSound();
    });

    socket.on('call-ready', async (data) => {
      try {
        await WebRTCService.initializeCall(data.callId, false);
      } catch (err) {
        console.error('Failed to initialize call:', err);
        handleCallEnd();
      }
    });

    socket.on('call-ended', () => {
      handleCallEnd();
    });

    // Cleanup on unmount
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      WebRTCService.endCall();
      SocketService.disconnect();
    };
  }, [agentName]);

  const playNotificationSound = () => {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      console.log('Accepting call:', incomingCall.callId);
      
      // First initialize WebRTC
      await WebRTCService.initializeCall(incomingCall.callId, false);
      console.log('WebRTC initialized for agent');
      
      // Then accept the call
      const socket = SocketService.getSocket();
      socket.emit('accept-call', { callId: incomingCall.callId });
      
      setCurrentCall({
        ...incomingCall,
        status: 'connected',
        startTime: new Date()
      });
      
      setShowIncomingCallModal(false);
      setIncomingCall(null);
      callStartTimeRef.current = Date.now();
      
    } catch (error) {
      console.error('Error accepting call:', error);
      rejectCall();
    }
  };

  const rejectCall = () => {
    if (!incomingCall) return;

    const socket = SocketService.getSocket();
    socket.emit('reject-call', { callId: incomingCall.callId });
    
    setIncomingCall(null);
    setShowIncomingCallModal(false);
    setAgentStatus('available');
  };

  const endCall = () => {
    WebRTCService.endCall();
    handleCallEnd();
  };

  const handleCallEnd = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    if (currentCall) {
      // Add to call history
      const callRecord = {
        id: currentCall.callId,
        clientName: currentCall.client.name,
        startTime: currentCall.startTime || new Date(),
        endTime: new Date(),
        duration: callDuration,
        notes: callNotes,
        status: 'completed'
      };
      
      setCallHistory(prev => [callRecord, ...prev.slice(0, 9)]); // Keep last 10 calls
    }

    // Reset state
    setCurrentCall(null);
    setCallDuration(0);
    setCallNotes('');
    setIsMuted(false);
    setConnectionState('');
    setAgentStatus('available');
    callStartTimeRef.current = null;
  };

  const startCallTimer = () => {
    if (callTimerRef.current) return;
    
    callTimerRef.current = setInterval(() => {
      if (callStartTimeRef.current) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        setCallDuration(duration);
      }
    }, 1000);
  };

  const toggleMute = () => {
    const muted = WebRTCService.toggleMute();
    setIsMuted(muted);
  };

  const toggleAvailability = () => {
    const newStatus = agentStatus === 'available' ? 'offline' : 'available';
    setAgentStatus(newStatus);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    const statusMap = {
      available: { className: 'badge badge-success', text: 'Available' },
      busy: { className: 'badge badge-warning', text: 'On Call' },
      offline: { className: 'badge badge-secondary', text: 'Offline' }
    };

    const status = statusMap[agentStatus] || statusMap.available;
    return <span className={status.className}>{status.text}</span>;
  };

  return (
    <div className="agent-ui-container">
      <div className="row">
        <div className="col-main">
          {/* Main Call Interface */}
          <div className="card main-card">
            <div className="card-header">
              <h5>ABSA Agent Dashboard - {agentName}</h5>
              <div className="header-controls">
                {getStatusBadge()}
                <button
                  className={`btn ${agentStatus === 'available' ? 'btn-outline-secondary' : 'btn-outline-success'} btn-sm`}
                  onClick={toggleAvailability}
                  disabled={currentCall !== null}
                >
                  {agentStatus === 'available' ? 'Go Offline' : 'Go Online'}
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {!currentCall ? (
                <div className="waiting-state">
                  <div className="icon-container">
                    <span className="headset-icon">🎧</span>
                  </div>
                  <h6 className="status-message">
                    {agentStatus === 'available' ? 'Waiting for incoming calls...' : 'Currently offline'}
                  </h6>
                  {connectionState && (
                    <small className="connection-info">Connection: {connectionState}</small>
                  )}
                </div>
              ) : (
                <div className="active-call">
                  <div className="call-info">
                    <h6>Current Call</h6>
                    <p><strong>Client:</strong> {currentCall.client.name}</p>
                    <p><strong>Duration:</strong> {formatDuration(callDuration)}</p>
                    <p><strong>Status:</strong> 
                      <span className="badge badge-success connected-badge">Connected</span>
                    </p>
                  </div>

                  <div className="call-controls">
                    <button
                      className={`btn ${isMuted ? "btn-warning" : "btn-outline-warning"}`}
                      onClick={toggleMute}
                    >
                      {isMuted ? "🔇 Unmute" : "🔊 Mute"}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={endCall}
                    >
                      📞 End Call
                    </button>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Call Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Add notes about this call..."
                      value={callNotes}
                      onChange={(e) => setCallNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-sidebar">
          {/* Call History */}
          <div className="card history-card">
            <div className="card-header">
              <h6>Recent Calls</h6>
            </div>
            <div className="card-body call-history">
              {callHistory.length === 0 ? (
                <p className="no-calls">No recent calls</p>
              ) : (
                <div className="call-list">
                  {callHistory.map((call) => (
                    <div key={call.id} className="call-item">
                      <div className="call-details">
                        <div className="client-name">{call.clientName}</div>
                        <small className="call-time">
                          {call.startTime.toLocaleTimeString()}
                        </small>
                        <div className="call-duration">
                          <span className="badge badge-secondary">
                            {formatDuration(call.duration)}
                          </span>
                        </div>
                        {call.notes && (
                          <div className="call-notes">
                            <small>{call.notes}</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Incoming Call Modal */}
      {showIncomingCallModal && (
        <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="modal">
            <div className="modal-header">
              <h3>📞 Incoming Call</h3>
            </div>
            <div className="modal-body">
              {incomingCall && (
                <div className="incoming-call-content">
                  <div className="caller-info">
                    <div className="caller-avatar">
                      👤
                    </div>
                    <h5>{incomingCall.client.name}</h5>
                    <p>Requesting support assistance</p>
                  </div>
                  
                  <div className="call-actions">
                    <button
                      className="btn btn-success btn-lg"
                      onClick={acceptCall}
                    >
                      ✅ Accept
                    </button>
                    <button
                      className="btn btn-danger btn-lg"
                      onClick={rejectCall}
                    >
                      ❌ Decline
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element for remote stream */}
      <audio
        id="remoteAudio"
        autoPlay
        playsInline
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default AgentUI;