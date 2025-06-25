import React, { useEffect, useState, useRef } from 'react';
import {
  Phone, X, Mic, MicOff, MessageCircle, Shield, DollarSign,
  CreditCard, ChevronRight, Video, VideoOff, User, Clock
} from 'lucide-react';
import socket from '../utilis/WebRTCService';
import { useNavigate } from 'react-router-dom';
 
const CustomerCallUI = ({
  callFeature,
  toggleCallFeature,
  setCallFeature,
  requestMicrophonePermission,
  startCall,
  endCall,
  activeCall,
  callStatus,
  remoteVideoRef,
  localVideoRef
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
 
  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && callFeature.mediaStream) {
      localVideoRef.current.srcObject = callFeature.mediaStream;
    }
  }, [callFeature.mediaStream]);
 
  // Timer for call duration
  useEffect(() => {
    let interval;
    if (callStatus === 'connected') {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callFeature.callStatus]);
 
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
 
  const toggleMute = () => {
    if (callFeature.mediaStream) {
      const audioTracks = callFeature.mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };
 
  const toggleVideo = async () => {
    if (!isVideoOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setCallFeature(prev => ({ ...prev, mediaStream: stream }));
        setIsVideoOn(true);
      } catch (err) {
        console.error("Failed to enable video:", err);
      }
    } else {
      if (callFeature.mediaStream) {
        callFeature.mediaStream.getVideoTracks().forEach(track => track.stop());
      }
      setIsVideoOn(false);
    }
  };
 
  return (
    <div className={`call-panel ${callFeature.isOpen ? 'open' : ''}`}>
      <div className="call-panel-header">
        <h3>Customer Support</h3>
        <button className="call-close-btn" onClick={toggleCallFeature}>
          <X className="icon" />
        </button>
      </div>
 
      <div className="call-panel-content">
        {!activeCall && callFeature.currentPage === 'welcome' && (
          <div className="call-page welcome-page">
            <div className="call-icon">
              <div className="icon-circle">
                <Phone className="icon-large" />
              </div>
            </div>
            <h4>BankConnect Support</h4>
            <p className="call-description">Get instant help from our banking specialists through secure voice or video calls.</p>
 
            <div className="call-options">
              <button
                className="btn primary voice-call-btn"
                onClick={() => setCallFeature(prev => ({ ...prev, currentPage: 'microphone-permission' }))}
              >
                <div className="btn-icon-circle">
                  <Phone className="btn-icon" />
                </div>
                <span>Voice Call</span>
              </button>
              <button
                className="btn primary video-call-btn"
                onClick={() => setCallFeature(prev => ({ ...prev, currentPage: 'video-permission' }))}
              >
                <div className="btn-icon-circle">
                  <Video className="btn-icon" />
                </div>
                <span>Video Call</span>
              </button>
            </div>
 
            <div className="call-info">
              <div className="info-item">
                <Clock className="info-icon" size={16} />
                <span>Mon-Fri 8am-8pm, Sat 9am-5pm</span>
              </div>
              <div className="info-item">
                <Shield className="info-icon" size={16} />
                <span>Secure encrypted connection</span>
              </div>
            </div>
          </div>
        )}
 
        {!activeCall && (callFeature.currentPage === 'microphone-permission' || callFeature.currentPage === 'video-permission') && (
          <div className="call-page permission-page">
            <div className="call-icon">
              <div className="icon-circle">
                {callFeature.currentPage === 'video-permission' ? (
                  <Video className="icon-large" />
                ) : (
                  <Mic className="icon-large" />
                )}
              </div>
            </div>
            <h4>Permission Required</h4>
            <p className="permission-text">
              {callFeature.currentPage === 'video-permission'
                ? 'To make a video call, we need access to your camera and microphone.'
                : 'To make a voice call, we need access to your microphone.'}
            </p>
 
            <button
              className="btn primary allow-btn"
              onClick={() => requestMicrophonePermission(callFeature.currentPage === 'video-permission')}
            >
              Allow Access
            </button>
            <button
              className="btn secondary back-btn"
              onClick={() => setCallFeature(prev => ({ ...prev, currentPage: 'welcome' }))}
            >
              Back
            </button>
 
            <div className="security-note">
              <Shield className="security-icon" size={14} />
              <span>We only access your {callFeature.currentPage === 'video-permission' ? 'camera and microphone' : 'microphone'} during active calls.</span>
            </div>
          </div>
        )}
 
        {!activeCall && callFeature.currentPage === 'main-menu' && (
          <div className="call-page menu-page">
            <h4>Which service do you need?</h4>
            <p className="menu-subtitle">Select a department to connect with</p>
 
            {callFeature.isVideo && (
              <div className="video-preview">
                <video ref={localVideoRef} autoPlay muted playsInline className="preview-video" />
                <div className="preview-label">Your Camera</div>
              </div>
            )}
 
            <div className="call-departments">
              <button
                className="department-btn general-btn"
                onClick={() => startCall('general-enquiries', callFeature.isVideo)}
              >
                <div className="btn-icon-container">
                  <MessageCircle className="department-icon" />
                </div>
                <div className="department-info">
                  <span className="department-name">General Enquiries</span>
                  <span className="department-desc">Account questions and general support</span>
                </div>
                <ChevronRight className="arrow" />
              </button>
 
              <button
                className="department-btn emergency-btn"
                onClick={() => startCall('fraud-department', callFeature.isVideo)}
              >
                <div className="btn-icon-container emergency">
                  <Shield className="department-icon" />
                </div>
                <div className="department-info">
                  <span className="department-name">Fraud & Security</span>
                  <span className="department-desc">Lost card or suspicious activity</span>
                </div>
                <ChevronRight className="arrow" />
              </button>
 
              <button
                className="department-btn loan-btn"
                onClick={() => startCall('loan-repayment', callFeature.isVideo)}
              >
                <div className="btn-icon-container">
                  <DollarSign className="department-icon" />
                </div>
                <div className="department-info">
                  <span className="department-name">Loans & Mortgages</span>
                  <span className="department-desc">Payments and applications</span>
                </div>
                <ChevronRight className="arrow" />
              </button>
 
              <button
                className="department-btn credit-btn"
                onClick={() => startCall('credit-application', callFeature.isVideo)}
              >
                <div className="btn-icon-container">
                  <CreditCard className="department-icon" />
                </div>
                <div className="department-info">
                  <span className="department-name">Credit Cards</span>
                  <span className="department-desc">Applications and support</span>
                </div>
                <ChevronRight className="arrow" />
              </button>
            </div>
 
            <div className="call-status">
              <div className="wait-time-container">
                <Clock className="wait-icon" size={16} />
                <span>Current wait time: <span className="wait-time">2 minutes</span></span>
              </div>
            </div>
          </div>
        )}
 
        {activeCall && (
          <div className="active-call-view">
<<<<<<< HEAD
            {activeCall.isVideo ? (
              <div className="video-call-container">
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
              </div>
            ) : (
              <div className="voice-call-ui">
                <div className="caller-avatar">
                  <div className="avatar-circle">
                    <User className="avatar-icon" />
                  </div>
                </div>
                <p className="caller-info">Connected to {activeCall.department.replace('-', ' ')}</p>
              </div>
            )}
 
            <div className="call-status-message">
              <div className="call-timer">
                <Clock className="timer-icon" />
                <span>{formatTime(callDuration)}</span>
              </div>
              <p className="call-status-text">
                {activeCall.status === 'ringing' ? 'Connecting to agent...' : 'Call in progress'}
              </p>
              {activeCall.status === 'ringing' && (
                <div className="connecting-animation">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
=======
            {callFeature.isVideo && (
              <div className="video-container">
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline 
                  className="remote-video"
                />
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="local-video"
                />
              </div>
            )}
            
            <div className="call-status-message">
              {callStatus === 'ringing' && (
                <>
                  <p>Connecting to agent...</p>
                  <div className="connecting-animation">
                    <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                  </div>
                </>
              )}
              {callStatus === 'connected' && (
                <>
                  <p>Call in progress</p>
                  <div className="call-timer">
                    <Clock className="timer-icon" />
                    <span>{formatTime(callDuration)}</span>
                  </div>
                </>
>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
              )}
            </div>
 
            <div className="active-call-controls">
<<<<<<< HEAD
              <div className="call-buttons">
                <button
                  className={`control-btn ${isMuted ? 'active' : ''}`}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="icon" /> : <Mic className="icon" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                {activeCall.isVideo && (
                  <button
                    className={`control-btn ${!isVideoOn ? 'active' : ''}`}
                    onClick={toggleVideo}
                  >
                    {isVideoOn ? <Video className="icon" /> : <VideoOff className="icon" />}
                    <span>{isVideoOn ? 'Video On' : 'Video Off'}</span>
                  </button>
                )}
                <button
                  className="control-btn end-call"
                  onClick={endCall}
                >
                  <Phone className="icon" />
                  <span>End Call</span>
                </button>
=======
              <div className="call-info">
                <p>Department: <strong>{activeCall.department.replace('-', ' ')}</strong></p>
                <p>Status: <span className={`status-${callStatus}`}>
                  {callStatus === 'ringing' ? 'Connecting' : 'Connected'}
                </span></p>
              </div>
              <div className="call-buttons">
                <button className="control-btn"><Mic className="icon" /><span>Mute</span></button>
                {callFeature.isVideo && (
                  <button className="control-btn"><Video className="icon" /><span>Video</span></button>
                )}
                <button className="control-btn end-call" onClick={endCall}><Phone className="icon" /><span>End Call</span></button>
>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
const InAppCall = ({
  userRole = 'customer',
  callFeature,
  setCallFeature,
  activeCall,
  setActiveCall,
  toggleCallFeature
}) => {
  const peerConnection = useRef(null);
  const localStream = useRef(null);
<<<<<<< HEAD
  const remoteStream = useRef(new MediaStream());
  const remoteVideoRef = useRef(null);
 
  useEffect(() => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream.current;
    }
  }, []);
 
  const requestMicrophonePermission = async (video = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      });
     
=======
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callStatus, setCallStatus] = useState('idle');

  const requestMicrophonePermission = async (video = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: video 
      });
>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
      localStream.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setCallFeature(prev => ({
        ...prev,
        microphoneAllowed: true,
        mediaStream: stream,
        callStatus: 'idle',
        currentPage: 'main-menu',
        isVideo: video
      }));
    } catch (err) {
      console.error('Media access denied:', err);
      setCallFeature(prev => ({
        ...prev,
        microphoneAllowed: false,
        error: video ? 'Camera and microphone access required' : 'Microphone access required'
      }));
    }
  };
<<<<<<< HEAD
 
  const setupPeerConnection = (department) => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
 
    // Add local stream tracks
    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });
 
    // Handle incoming tracks
    peerConnection.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.current.addTrack(track);
      });
    };
 
    peerConnection.current.onicecandidate = (event) => {
=======

  const createPeerConnection = (department) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: department
        });
      }
    };
<<<<<<< HEAD
 
    return peerConnection.current;
=======

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'disconnected') {
        endCall();
      }
    };

    return pc;
  };

  const startCall = async (department, isVideo = false) => {
    try {
      const stream = localStream.current;
      if (!stream) {
        console.error('Local stream not available');
        return;
      }

      peerConnection.current = createPeerConnection(department);
      
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      socket.emit('join-room', department);

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit('offer', {
        offer,
        roomId: department
      });

      setActiveCall({
        department,
        status: 'ringing',
        isVideo
      });

      setCallStatus('ringing');
      setCallFeature(prev => ({
        ...prev,
        currentPage: 'active-call',
        callStatus: 'ringing'
      }));

      // Setup socket listeners
      socket.on('answer', async ({ answer }) => {
        try {
          if (peerConnection.current.signalingState === 'have-local-offer') {
            await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
            setCallStatus('connected');
          }
        } catch (error) {
          console.error('Error setting remote description:', error);
          endCall();
        }
      });

      socket.on('ice-candidate', ({ candidate }) => {
        if (peerConnection.current && candidate) {
          peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error('Error adding ICE candidate:', e));
        }
      });

    } catch (error) {
      console.error('Error starting call:', error);
      endCall();
    }
>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
  };
 
  const startCall = async (department, isVideo = false) => {
    if (!localStream.current) {
      console.error('Local stream not available');
      return;
    }
 
    const pc = setupPeerConnection(department);
    socket.emit('join-room', department);
 
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
 
      socket.emit('offer', {
        offer,
        roomId: department,
        isVideo
      });
 
      setActiveCall({
        department,
        status: 'ringing',
        isVideo
      });
 
      setCallFeature(prev => ({
        ...prev,
        callStatus: 'ringing'
      }));
 
      // Listen for answers
      socket.on('answer', async (data) => {
        await pc.setRemoteDescription(data.answer);
        setActiveCall(prev => ({ ...prev, status: 'connected' }));
        setCallFeature(prev => ({ ...prev, callStatus: 'active' }));
      });
 
      // Listen for ICE candidates
      socket.on('ice-candidate', async (data) => {
        try {
          await pc.addIceCandidate(data.candidate);
        } catch (e) {
          console.error('Error adding ICE candidate', e);
        }
      });
 
    } catch (err) {
      console.error('Call setup failed:', err);
      endCall();
    }
  };
 
  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
<<<<<<< HEAD
 
=======

>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
<<<<<<< HEAD
 
    remoteStream.current.getTracks().forEach(track => track.stop());
    remoteStream.current = new MediaStream();
 
    socket.off('answer');
    socket.off('ice-candidate');
 
=======

    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject = null;
    }

    socket.off('answer');
    socket.off('ice-candidate');

>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
    setActiveCall(null);
    setCallStatus('idle');
    setCallFeature(prev => ({
      ...prev,
      callStatus: 'idle',
      mediaStream: null,
      isVideo: false
    }));
  };
<<<<<<< HEAD
 
=======

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
  return (
    <CustomerCallUI
      callFeature={callFeature}
      toggleCallFeature={toggleCallFeature}
      setCallFeature={setCallFeature}
      requestMicrophonePermission={requestMicrophonePermission}
      startCall={startCall}
      endCall={endCall}
      activeCall={activeCall}
      callStatus={callStatus}
      remoteVideoRef={remoteVideoRef}
      localVideoRef={localVideoRef}
    />
  );
};
<<<<<<< HEAD
 
export default InAppCall;
 
=======

export default InAppCall;
>>>>>>> 16d02d8913d5803c0d6d5e2a8af4e6fdef853b60
