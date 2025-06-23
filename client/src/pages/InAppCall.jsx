import React, { useState, useEffect, useRef } from 'react';
import {
  Phone, X, Mic, MicOff, MessageCircle, Shield, DollarSign, 
  CreditCard, ChevronRight, Video, VideoOff, User, Clock
} from 'lucide-react';

import "../styles/InAppCall.css"; 
// import "../styles/dashboard.css"; // Adjust path as needed

// Customer UI Component
const CustomerCallUI = ({
  callFeature,
  toggleCallFeature,
  setCallFeature,
  requestMicrophonePermission,
  startCall,
  endCall,
  activeCall,
  localStream,
  remoteStream
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (callFeature.callStatus === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
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

  const toggleMute = () => {
    if (callFeature.mediaStream) {
      const audioTracks = callFeature.mediaStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
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
              <Phone className="icon-large" />
            </div>
            <h4>Customer Support</h4>
            <p>Connect with our support team via voice or video call.</p>

            <div className="call-options">
              <button
                className="btn primary"
                onClick={() => {
                  setCallFeature(prev => ({ ...prev, currentPage: 'main-menu' }));
                  requestMicrophonePermission();
                }}
              >
                <Phone className="btn-icon" /> Voice Call
              </button>
              <button
                className="btn primary"
                onClick={async () => {
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    setCallFeature(prev => ({ 
                      ...prev, 
                      currentPage: 'main-menu',
                      mediaStream: stream,
                      microphoneAllowed: true
                    }));
                    setIsVideoOn(true);
                  } catch (err) {
                    console.error("Failed to access camera:", err);
                  }
                }}
              >
                <Video className="btn-icon" /> Video Call
              </button>
            </div>

            <div className="call-info">
              <p>Standard call rates apply. Available Mon-Fri 8am-8pm, Sat 9am-5pm.</p>
            </div>
          </div>
        )}

        {!activeCall && callFeature.currentPage === 'main-menu' && (
          <div className="call-page menu-page">
            <h4>How Can We Help You Today?</h4>

            {isVideoOn && (
              <div className="video-preview">
                <video ref={localVideoRef} autoPlay muted playsInline />
              </div>
            )}

            <div className="call-departments">
              <button className="department-btn" onClick={() => startCall('general-enquiries', isVideoOn)}>
                <div className="btn-icon">
                  <MessageCircle className="icon" />
                </div>
                <span>General Enquiries</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn emergency" onClick={() => startCall('fraud-department', isVideoOn)}>
                <div className="btn-icon">
                  <Shield className="icon" />
                </div>
                <span>Fraud or Card Emergency</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn" onClick={() => startCall('loan-repayment', isVideoOn)}>
                <div className="btn-icon">
                  <DollarSign className="icon" />
                </div>
                <span>Loan Repayment</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn" onClick={() => startCall('credit-application', isVideoOn)}>
                <div className="btn-icon">
                  <CreditCard className="icon" />
                </div>
                <span>Credit Application</span>
                <ChevronRight className="arrow" />
              </button>
            </div>

            <div className="call-status">
              <p>Current wait time: <span className="wait-time">2 minutes</span></p>
            </div>
          </div>
        )}
        
        {activeCall && (
          <div className="active-call-view">
            {activeCall.isVideo ? (
              <div className="video-call-container">
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
              </div>
            ) : (
              <div className="voice-call-ui">
                <div className="caller-avatar">
                  <User className="icon-large" />
                </div>
                <p>Connected to {activeCall.department.replace('-', ' ')}</p>
              </div>
            )}

            <div className="call-status-message">
              <div className="call-timer">
                <Clock className="timer-icon" />
                <span>{formatTime(callDuration)}</span>
              </div>
            </div>
            
            <div className="active-call-controls">
              <div className="call-buttons">
                <button className={`control-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute}>
                  {isMuted ? <MicOff className="icon" /> : <Mic className="icon" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
                {activeCall.isVideo && (
                  <button className={`control-btn ${!isVideoOn ? 'active' : ''}`} onClick={toggleVideo}>
                    {isVideoOn ? <Video className="icon" /> : <VideoOff className="icon" />}
                    <span>{isVideoOn ? 'Video On' : 'Video Off'}</span>
                  </button>
                )}
                <button className="control-btn end-call" onClick={endCall}>
                  <Phone className="icon" />
                  <span>End Call</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Agent UI Component
const AgentCallUI = ({
  activeCall,
  setActiveCall,
  toggleCallFeature,
  acceptCall,
  endCall,
  localStream,
  remoteStream
}) => {
  const [callStatus, setCallStatus] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Setup video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  // Handle incoming calls
  useEffect(() => {
    if (activeCall?.status === 'ringing') {
      setCallStatus('ringing');
    }
  }, [activeCall]);

  // Timer for call duration
  useEffect(() => {
    let interval;
    if (callStatus === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleVideo = async () => {
    if (!isVideoOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        // In a real app, you would send this stream to the peer connection
        setIsVideoOn(true);
      } catch (err) {
        console.error("Failed to enable video:", err);
      }
    } else {
      setIsVideoOn(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real app, you would mute the audio tracks
  };

  const handleAcceptCall = () => {
    acceptCall();
    setCallStatus('active');
  };

  const handleEndCall = () => {
    endCall();
    setCallStatus('ended');
  };

  return (
    <div className={`call-panel ${callStatus !== 'idle' ? 'open' : ''}`}>
      <div className="call-panel-header">
        <h3>
          {callStatus === 'ringing' && 'Incoming Call'}
          {callStatus === 'active' && 'Ongoing Call'}
          {callStatus === 'ended' && 'Call Ended'}
        </h3>
        <button className="call-close-btn" onClick={toggleCallFeature}>
          <X className="icon" />
        </button>
      </div>

      <div className="call-panel-content">
        {callStatus === 'ringing' && (
          <div className="incoming-call-view">
            <div className="caller-avatar">
              <User className="icon-large" />
            </div>
            <h4>Customer Call</h4>
            <p>Department: {activeCall?.department.replace('-', ' ') || 'General Enquiry'}</p>
            {activeCall?.isVideo && <p className="video-indicator">Video Call Requested</p>}
            
            <div className="call-actions">
              <button className="btn reject" onClick={handleEndCall}>
                Decline
              </button>
              <button className="btn accept" onClick={handleAcceptCall}>
                Accept
              </button>
            </div>
          </div>
        )}

        {callStatus === 'active' && (
          <div className="ongoing-call-view">
            {activeCall?.isVideo ? (
              <div className="video-call-container">
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
              </div>
            ) : (
              <div className="caller-info">
                <div className="caller-avatar">
                  <User className="icon-large" />
                </div>
                <h4>Customer</h4>
                <p>Department: {activeCall?.department.replace('-', ' ') || 'General Enquiry'}</p>
              </div>
            )}

            <div className="call-timer">
              <Clock className="timer-icon" />
              <span>{formatTime(callDuration)}</span>
            </div>

            <div className="call-controls">
              <button 
                className={`control-btn ${isMuted ? 'active' : ''}`}
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="icon" /> : <Mic className="icon" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
              
              {activeCall?.isVideo && (
                <button 
                  className={`control-btn ${isVideoOn ? 'active' : ''}`}
                  onClick={toggleVideo}
                >
                  {isVideoOn ? <Video className="icon" /> : <VideoOff className="icon" />}
                  <span>{isVideoOn ? 'Video On' : 'Video Off'}</span>
                </button>
              )}
              
              <button className="control-btn end-call" onClick={handleEndCall}>
                <Phone className="icon" />
                <span>End Call</span>
              </button>
            </div>

            <div className="call-notes">
              <textarea placeholder="Add call notes..." />
              <button className="btn save-notes">Save Notes</button>
            </div>
          </div>
        )}

        {callStatus === 'ended' && (
          <div className="call-ended-view">
            <div className="call-summary">
              <h4>Call Ended</h4>
              <p>Duration: {formatTime(callDuration)}</p>
              <p>Department: {activeCall?.department.replace('-', ' ') || 'General Enquiry'}</p>
            </div>
            
            <div className="call-feedback">
              <textarea placeholder="Add call summary and feedback..." />
              <div className="feedback-actions">
                <button className="btn secondary" onClick={() => {
                  setCallStatus('idle');
                  setActiveCall(null);
                }}>
                  Skip
                </button>
                <button className="btn primary">Submit Report</button>
              </div>
            </div>
          </div>
        )}

        {callStatus === 'idle' && (
          <div className="idle-state">
            <div className="idle-icon">
              <Phone className="icon-large" />
            </div>
            <h4>Waiting for Calls</h4>
            <p>You will be notified when a customer calls.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const InAppCall = ({ 
  userRole = 'customer', 
  callFeature, 
  setCallFeature,
  activeCall,
  setActiveCall,
  toggleCallFeature
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      setCallFeature(prev => ({
        ...prev,
        callStatus: 'connecting',
        error: null
      }));
     
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
     
      setCallFeature(prev => ({
        ...prev,
        microphoneAllowed: true,
        currentPage: 'main-menu',
        callStatus: 'idle',
        mediaStream: stream
      }));
    } catch (err) {
      console.error("Microphone access denied:", err);
      setCallFeature(prev => ({
        ...prev,
        microphoneAllowed: false,
        callStatus: 'idle',
        error: 'Microphone access is required for voice calls'
      }));
    }
  };

  // Start a call to a department
  const startCall = (department, isVideo = false) => {
    const callData = {
      department,
      callerId: 'user-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: 'ringing',
      isVideo
    };
    
    setActiveCall(callData);
    setCallFeature(prev => ({
      ...prev,
      activeDepartment: department,
      callStatus: 'ringing',
      isOpen: true
    }));

    // In a real app, you would initiate a WebRTC connection here
    // and set up the remote stream when the call is accepted
  };

  // Accept incoming call (agent side)
  const acceptCall = () => {
    setCallFeature(prev => ({
      ...prev,
      callStatus: 'active'
    }));
    setActiveCall(prev => ({
      ...prev,
      status: 'connected'
    }));

    // In a real app, you would accept the WebRTC connection here
    // and set up the remote stream
  };

  // End the current call
  const endCall = () => {
    if (callFeature.mediaStream) {
      callFeature.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
   
    setCallFeature(prev => ({
      ...prev,
      activeDepartment: null,
      currentPage: 'main-menu',
      callStatus: 'idle',
      mediaStream: null
    }));
    setActiveCall(null);
    setLocalStream(null);
    setRemoteStream(null);
  };

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream, remoteStream]);

  return userRole === 'customer' ? (
    <CustomerCallUI
      callFeature={callFeature}
      toggleCallFeature={toggleCallFeature}
      setCallFeature={setCallFeature}
      requestMicrophonePermission={requestMicrophonePermission}
      startCall={startCall}
      endCall={endCall}
      activeCall={activeCall}
      localStream={localStream}
      remoteStream={remoteStream}
    />
  ) : (
    <AgentCallUI
      activeCall={activeCall}
      setActiveCall={setActiveCall}
      toggleCallFeature={toggleCallFeature}
      acceptCall={acceptCall}
      endCall={endCall}
      localStream={localStream}
      remoteStream={remoteStream}
    />
  );
};

export default InAppCall;