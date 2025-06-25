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
  activeCall
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (callFeature.callStatus === 'active') {
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
            <div className="call-icon"><Phone className="icon-large" /></div>
            <h4>Customer Support Call</h4>
            <p>Connect with our support team for assistance with your banking needs.</p>
            <div className="call-options">
              <button className="btn primary" onClick={() => setCallFeature(prev => ({ ...prev, currentPage: 'microphone-permission' }))}>
                <Phone className="btn-icon" /> Voice Call
              </button>
              <button className="btn primary" onClick={() => setCallFeature(prev => ({ ...prev, currentPage: 'video-permission' }))}>
                <Video className="btn-icon" /> Video Call
              </button>
            </div>
            <div className="call-info">
              <p>Standard call rates apply. Available Mon-Fri 8am-8pm, Sat 9am-5pm.</p>
            </div>
          </div>
        )}

        {!activeCall && callFeature.currentPage === 'microphone-permission' && (
          <div className="call-page permission-page">
            <div className="call-icon"><Mic className="icon-large" /></div>
            <h4>Microphone Access Required</h4>
            <p>To use our call service, we need access to your microphone.</p>
            <button className="btn primary" onClick={() => requestMicrophonePermission(false)}>Allow Microphone Access</button>
            <button className="btn secondary" onClick={() => setCallFeature(prev => ({ ...prev, currentPage: 'main-menu' }))}>
              Continue with Call Service
            </button>
            <div className="call-info">
              <p>We only access your microphone during active calls.</p>
            </div>
          </div>
        )}

        {!activeCall && callFeature.currentPage === 'video-permission' && (
          <div className="call-page permission-page">
            <div className="call-icon"><Video className="icon-large" /></div>
            <h4>Camera & Mic Access Required</h4>
            <p>To use video calling, we need access to your camera and microphone.</p>
            <button className="btn primary" onClick={() => requestMicrophonePermission(true)}>Allow Camera & Mic Access</button>
            <button className="btn secondary" onClick={() => setCallFeature(prev => ({ ...prev, currentPage: 'main-menu' }))}>
              Continue to Menu
            </button>
            <div className="call-info">
              <p>We only access your media during active calls.</p>
            </div>
          </div>
        )}

        {!activeCall && callFeature.currentPage === 'main-menu' && (
          <div className="call-page menu-page">
            <h4>How Can We Help You Today?</h4>
            <div className="call-departments">
              <button className="department-btn" onClick={() => callFeature.isVideo ? navigate('/agent') : startCall('general-enquiries', false)}>
                <div className="btn-icon"><MessageCircle className="icon" /></div>
                <span>General Enquiries</span><ChevronRight className="arrow" />
              </button>
              <button className="department-btn emergency" onClick={() => startCall('fraud-department', callFeature.isVideo)}>
                <div className="btn-icon"><Shield className="icon" /></div>
                <span>Fraud or Card Emergency</span><ChevronRight className="arrow" />
              </button>
              <button className="department-btn" onClick={() => startCall('loan-repayment', callFeature.isVideo)}>
                <div className="btn-icon"><DollarSign className="icon" /></div>
                <span>Loan Repayment</span><ChevronRight className="arrow" />
              </button>
              <button className="department-btn" onClick={() => startCall('credit-application', callFeature.isVideo)}>
                <div className="btn-icon"><CreditCard className="icon" /></div>
                <span>Credit Application</span><ChevronRight className="arrow" />
              </button>
            </div>
            <div className="call-status">
              <p>Current wait time: <span className="wait-time">2 minutes</span></p>
            </div>
          </div>
        )}

        {activeCall && (
          <div className="active-call-view">
            <div className="call-status-message">
              {activeCall.status === 'ringing' && (
                <>
                  <p>Connecting to agent...</p>
                  <div className="connecting-animation">
                    <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                  </div>
                </>
              )}
              {activeCall.status === 'connected' && (
                <>
                  <p>Call in progress</p>
                  <div className="call-timer">
                    <Clock className="timer-icon" />
                    <span>{formatTime(callDuration)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="active-call-controls">
              <div className="call-info">
                <p>Department: <strong>{activeCall.department.replace('-', ' ')}</strong></p>
                <p>Status: <span className={`status-${activeCall.status}`}>
                  {activeCall.status === 'ringing' ? 'Connecting' : 'Connected'}
                </span></p>
              </div>
              <div className="call-buttons">
                <button className="control-btn"><Mic className="icon" /><span>Mute</span></button>
                <button className="control-btn"><Video className="icon" /><span>Video</span></button>
                <button className="control-btn end-call" onClick={endCall}><Phone className="icon" /><span>End Call</span></button>
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

  const requestMicrophonePermission = async (video = false) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video });
      localStream.current = stream;
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
      setCallFeature(prev => ({ ...prev, microphoneAllowed: false }));
    }
  };

  const startCall = async (department, isVideo = false) => {
    const stream = localStream.current;
    if (!stream) {
      console.error('Local stream not available');
      return;
    }

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: department
        });
      }
    };

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

    setCallFeature(prev => ({
      ...prev,
      currentPage: 'active-call',
      callStatus: 'ringing'
    }));
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    localStream.current?.getTracks().forEach(track => track.stop());

    setActiveCall(null);
    setCallFeature(prev => ({
      ...prev,
      currentPage: 'main-menu',
      callStatus: 'idle',
      mediaStream: null
    }));
  };

  return (
    <CustomerCallUI
      callFeature={callFeature}
      toggleCallFeature={toggleCallFeature}
      setCallFeature={setCallFeature}
      requestMicrophonePermission={requestMicrophonePermission}
      startCall={startCall}
      endCall={endCall}
      activeCall={activeCall}
    />
  );
};

export default InAppCall;