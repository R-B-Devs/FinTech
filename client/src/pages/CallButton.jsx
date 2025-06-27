import React, { useState, useEffect } from 'react';
import SocketService from '../utils/socket';
import WebRTCService from '../services/webrtc';


const CallButton = ({ clientName = "Customer" }) => {
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, ringing, connected, ended
  const [error, setError] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [connectionState, setConnectionState] = useState('');

  useEffect(() => {
    // Initialize socket connection
    const socket = SocketService.connect();
    WebRTCService.setSocket(socket);

    // Register as client
    socket.emit('register-client', { name: clientName });

    // Set up WebRTC callbacks
    WebRTCService.onRemoteStream = (stream) => {
      // Play remote audio
      const audio = document.getElementById('remoteAudio');
      if (audio) {
        audio.srcObject = stream;
      }
    };

    WebRTCService.onConnectionStateChange = (state) => {
      setConnectionState(state);
      if (state === 'connected') {
        setCallStatus('connected');
      } else if (state === 'disconnected' || state === 'failed') {
        handleCallEnd();
      }
    };

    // Socket event listeners
    socket.on('call-connecting', (data) => {
      setCallStatus('ringing');
      setCurrentCallId(data.callId);
      setError('');
    });

    socket.on('call-accepted', async (data) => {
      try {
        await WebRTCService.initializeCall(data.callId, true);
        setCallStatus('connecting');
      } catch (err) {
        setError('Failed to initialize call');
        setCallStatus('idle');
      }
    });

    socket.on('call-ready', async (data) => {
      try {
        console.log('Call ready, peer ID:', data.peerId);
        
        // Small delay to ensure both sides are ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (WebRTCService.peerConnection) {
          await WebRTCService.createOffer(data.peerId);
        } else {
          console.error('Peer connection not ready');
          setError('Failed to establish connection');
          setCallStatus('idle');
        }
      } catch (err) {
        console.error('Error in call-ready handler:', err);
        setError('Failed to establish connection');
        setCallStatus('idle');
      }
    });

    socket.on('call-rejected', () => {
      setError('Call was rejected by agent');
      setCallStatus('idle');
      setCurrentCallId(null);
    });

    socket.on('call-ended', () => {
      handleCallEnd();
    });

    socket.on('call-failed', (data) => {
      setError(data.reason || 'Call failed');
      setCallStatus('idle');
      setCurrentCallId(null);
    });

    // Cleanup on unmount
    return () => {
      WebRTCService.endCall();
      SocketService.disconnect();
    };
  }, [clientName]);

  const initiateCall = () => {
    if (callStatus !== 'idle') return;

    setCallStatus('connecting');
    setError('');
    
    const socket = SocketService.getSocket();
    socket.emit('initiate-call', { clientName });
  };

  const endCall = () => {
    WebRTCService.endCall();
    handleCallEnd();
  };

  const handleCallEnd = () => {
    setCallStatus('idle');
    setCurrentCallId(null);
    setIsMuted(false);
    setConnectionState('');
    setError('');
  };

  const toggleMute = () => {
    const muted = WebRTCService.toggleMute();
    setIsMuted(muted);
  };

  const getStatusBadge = () => {
    const statusMap = {
      idle: { className: 'badge badge-secondary', text: 'Ready to Call' },
      connecting: { className: 'badge badge-warning', text: 'Connecting...' },
      ringing: { className: 'badge badge-info', text: 'Ringing...' },
      connected: { className: 'badge badge-success', text: 'Connected' },
      ended: { className: 'badge badge-secondary', text: 'Call Ended' }
    };

    const status = statusMap[callStatus] || statusMap.idle;
    return <span className={status.className}>{status.text}</span>;
  };

  const renderCallControls = () => {
    if (callStatus === 'connected') {
      return (
        <div className="call-controls">
          <button
            className={`btn ${isMuted ? "btn-warning" : "btn-outline-warning"} btn-sm`}
            onClick={toggleMute}
          >
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={endCall}
          >
            📞 End Call
          </button>
        </div>
      );
    }

    if (callStatus === 'ringing' || callStatus === 'connecting') {
      return (
        <div className="call-controls">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={endCall}
          >
            Cancel Call
          </button>
        </div>
      );
    }

    return null;
  };

  const renderSpinner = () => {
    if (callStatus === 'connecting' || callStatus === 'ringing') {
      return (
        <div className="spinner">
          <div className="spinner-border"></div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="call-button-container">
      <div className="call-header">
        <h5>ABSA Banking Support</h5>
        {getStatusBadge()}
      </div>
      
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="call-content">
        {callStatus === 'idle' ? (
          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={initiateCall}
          >
            📞 Call Support Agent
          </button>
        ) : (
          <div className="call-status">
            {renderSpinner()}
            <span className="status-text">
              {callStatus === 'connecting' && 'Connecting to agent...'}
              {callStatus === 'ringing' && 'Agent is being notified...'}
              {callStatus === 'connected' && '🎧 Call in progress'}
            </span>
          </div>
        )}
      </div>

      {renderCallControls()}

      {connectionState && (
        <small className="connection-info">
          Connection: {connectionState}
        </small>
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

export default CallButton;