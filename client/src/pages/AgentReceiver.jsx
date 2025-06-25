import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Users, Settings, Volume2, VolumeX } from 'lucide-react';
import '../styles/AgentReceiver.css';
import socket from '../utilis/WebRTCService';
import { useLocation } from 'react-router-dom';

const AgentReceiver = () => {
  const [callStatus, setCallStatus] = useState('idle');
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isVolumeOff, setIsVolumeOff] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const callStartTime = useRef(null);
  const roomId = 'demo-room';

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', roomId);
    socket.emit('ready-to-call');

    socket.on('offer', async ({ offer, sender }) => {
      console.log('Incoming offer from', sender);
      setCallStatus('ringing');
      setIncomingOffer(offer);
      setRemoteSocketId(sender);
    });

    socket.on('ice-candidate', ({ candidate }) => {
      const pc = pcRef.current;
      if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let interval;
    if (callStatus === 'active') {
      callStartTime.current = Date.now();
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          roomId,
          candidate: e.candidate,
          targetUser: remoteSocketId
        });
      }
    };
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };
    return pc;
  };

  const acceptCall = async () => {
    setCallStatus('active');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = createPeerConnection();
      pcRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer', {
        roomId,
        answer: pc.localDescription,
        targetUser: remoteSocketId
      });

      console.log('Call accepted');
    } catch (error) {
      console.error('Error accepting call:', error);
      setCallStatus('idle');
    }
  };

  const rejectCall = () => {
    setCallStatus('idle');
    setIncomingOffer(null);
    setRemoteSocketId('');
  };

  const endCall = () => {
    setCallStatus('idle');
    setIncomingOffer(null);

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteSocketId('');
  };

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const audioTracks = localVideoRef.current.srcObject.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const videoTracks = localVideoRef.current.srcObject.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleVolume = () => {
    setIsVolumeOff(!isVolumeOff);
  };

  const getStatusColor = () => {
    switch(callStatus) {
      case 'ringing': return 'ringing';
      case 'active': return 'active';
      default: return 'idle';
    }
  };

  const getStatusText = () => {
    switch(callStatus) {
      case 'ringing': return 'Incoming Call';
      case 'active': return 'Connected';
      default: return 'Ready';
    }
  };

  const getConnectionIcon = () => {
    switch(connectionQuality) {
      case 'excellent': return '████';
      case 'good': return '███░';
      case 'fair': return '██░░';
      default: return '█░░░';
    }
  };

  return (
    <div className="agent-receiver-container">
      {/* Animated background elements */}
      <div className="floating-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="agent-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-container">
              <Video className="logo-icon" />
              <div className={`status-indicator ${getStatusColor()}`}></div>
            </div>
            <div>
              <h1 className="app-title">Agent Receiver</h1>
              <div className="status-info">
                <div className={`status-dot ${getStatusColor()}`}></div>
                <span className="status-text">{getStatusText()}</span>
                {callStatus === 'active' && (
                  <>
                    <span className="separator">•</span>
                    <span className="call-duration">{formatDuration(callDuration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="header-info">
            {callStatus === 'active' && (
              <div className="connection-quality">
                <span>Quality:</span>
                <span className="quality-bars">{getConnectionIcon()}</span>
              </div>
            )}
            <div className="room-info">
              <p className="room-label">Room ID</p>
              <p className="room-id">{roomId}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Incoming Call Modal */}
        {callStatus === 'ringing' && (
          <div className="call-modal-overlay">
            <div className="call-modal">
              <div className="call-avatar">
                <div className="avatar-ring">
                  <Phone className="avatar-icon" />
                </div>
                <div className="avatar-ripple"></div>
              </div>
              <h2 className="call-title">Incoming Call</h2>
              <p className="call-subtitle">AI Agent requesting connection</p>
              <div className="call-actions">
                <button 
                  onClick={rejectCall}
                  className="call-button decline"
                >
                  <PhoneOff className="button-icon" />
                  <span>Decline</span>
                </button>
                <button 
                  onClick={acceptCall}
                  className="call-button accept"
                >
                  <Phone className="button-icon" />
                  <span>Accept</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Interface */}
        <div className="content-container">
          {callStatus === 'active' ? (
            <div className="video-interface">
              {/* Main Video Area */}
              <div className="main-video-container">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="main-video"
                />
                <div className="video-overlay"></div>
                
                {/* Remote Video Overlay */}
                <div className="video-info">
                  <div className="video-info-content">
                    <div className="status-dot active"></div>
                    <span>AI Agent</span>
                  </div>
                </div>

                {/* Connection Quality */}
                <div className="connection-indicator">
                  {getConnectionIcon()}
                </div>
              </div>
              
              {/* Picture in Picture */}
              <div className="pip-video">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="pip-video-content"
                />
                {isVideoOff && (
                  <div className="video-off-overlay">
                    <VideoOff className="icon" />
                    <span className="text">Video Off</span>
                  </div>
                )}
                <div className="pip-label">You</div>
              </div>
            </div>
          ) : (
            <div className="idle-state">
              <div className="idle-content">
                <div className="idle-avatar">
                  <div className="idle-avatar-ring">
                    <Video className="idle-icon" />
                  </div>
                  <div className="idle-avatar-ripple"></div>
                </div>
                <h2 className="idle-title">Ready to Connect</h2>
                <p className="idle-subtitle">Waiting for incoming calls from AI agents</p>
                <div className="idle-status">
                  <div className="idle-status-item">
                    <div className="status-dot active"></div>
                    <span>System Online</span>
                  </div>
                  <div className="idle-status-item">
                    <Settings className="status-icon" />
                    <span>Auto-Accept Disabled</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Control Panel */}
      {callStatus === 'active' && (
        <div className="control-panel">
          <div className="control-container">
            <button 
              onClick={toggleMute}
              className={`control-button ${isMuted ? 'active' : 'default'}`}
            >
              {isMuted ? <MicOff className="control-icon" /> : <Mic className="control-icon" />}
              <span className="control-tooltip">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            
            <button 
              onClick={toggleVideo}
              className={`control-button ${isVideoOff ? 'active' : 'default'}`}
            >
              {isVideoOff ? <VideoOff className="control-icon" /> : <Video className="control-icon" />}
              <span className="control-tooltip">{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
            </button>

            <button 
              onClick={toggleVolume}
              className={`control-button ${isVolumeOff ? 'active' : 'default'}`}
            >
              {isVolumeOff ? <VolumeX className="control-icon" /> : <Volume2 className="control-icon" />}
              <span className="control-tooltip">{isVolumeOff ? 'Unmute Audio' : 'Mute Audio'}</span>
            </button>
            
            <div className="control-divider"></div>
            
            <button 
              onClick={endCall}
              className="control-button end-call"
            >
              <PhoneOff className="control-icon" />
              <span className="control-tooltip">End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentReceiver;