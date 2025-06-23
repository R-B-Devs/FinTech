import React, { useState, useEffect } from 'react';
import {
  Phone,
  X,
  Mic,
  MicOff,
  MessageCircle,
  Shield,
  DollarSign,
  CreditCard,
  ChevronRight,
  Video,
  VideoOff,
  User,
  Clock
} from 'lucide-react';

// Customer UI Component
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
            <h4>Customer Support Call</h4>
            <p>Connect with our support team for assistance with your banking needs.</p>

            <button
              className="btn primary"
              onClick={() =>
                setCallFeature((prev) => ({ ...prev, currentPage: 'microphone-permission' }))
              }
            >
              Continue to Call Service
            </button>

            <div className="call-info">
              <p>Standard call rates apply. Available Mon-Fri 8am-8pm, Sat 9am-5pm.</p>
            </div>
          </div>
        )}

        {!activeCall && callFeature.currentPage === 'microphone-permission' && (
          <div className="call-page permission-page">
            <div className="call-icon">
              <Mic className="icon-large" />
            </div>
            <h4>Microphone Access Required</h4>
            <p>To use our call service, we need access to your microphone.</p>

            <button className="btn primary" onClick={requestMicrophonePermission}>
              Allow Microphone Access
            </button>
            <button
              className="btn secondary"
              onClick={() =>
                setCallFeature((prev) => ({ ...prev, currentPage: 'main-menu' }))
              }
            >
              Continue with Call Service
            </button>

            <div className="call-info">
              <p>We only access your microphone during active calls.</p>
            </div>
          </div>
        )}

        {!activeCall && callFeature.currentPage === 'main-menu' && (
          <div className="call-page menu-page">
            <h4>How Can We Help You Today?</h4>

            <div className="call-departments">
              <button className="department-btn" onClick={() => startCall('general-enquiries')}>
                <div className="btn-icon">
                  <MessageCircle className="icon" />
                </div>
                <span>General Enquiries</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn emergency" onClick={() => startCall('fraud-department')}>
                <div className="btn-icon">
                  <Shield className="icon" />
                </div>
                <span>Fraud or Card Emergency</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn" onClick={() => startCall('loan-repayment')}>
                <div className="btn-icon">
                  <DollarSign className="icon" />
                </div>
                <span>Loan Repayment</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn" onClick={() => startCall('credit-application')}>
                <div className="btn-icon">
                  <CreditCard className="icon" />
                </div>
                <span>Credit Application</span>
                <ChevronRight className="arrow" />
              </button>
            </div>

            <div className="call-status">
              <p>
                Current wait time: <span className="wait-time">2 minutes</span>
              </p>
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
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
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
                <button className="control-btn">
                  <Mic className="icon" />
                  <span>Mute</span>
                </button>
                <button className="control-btn">
                  <Video className="icon" />
                  <span>Video</span>
                </button>
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
  endCall
}) => {
  const [callStatus, setCallStatus] = useState('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Handle incoming calls
  useEffect(() => {
    if (activeCall?.status === 'ringing') {
      setCallStatus('ringing');
      // Auto-open the call panel when receiving a call
      if (!activeCall.isOpen) {
        toggleCallFeature();
      }
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
            
            <div className="call-actions">
              <button className="btn reject" onClick={endCall}>
                Decline
              </button>
              <button className="btn accept" onClick={acceptCall}>
                Accept
              </button>
            </div>
          </div>
        )}

        {callStatus === 'active' && (
          <div className="ongoing-call-view">
            <div className="caller-info">
              <div className="caller-avatar">
                <User className="icon-large" />
              </div>
              <h4>Customer</h4>
              <p>Department: {activeCall?.department.replace('-', ' ') || 'General Enquiry'}</p>
              <div className="call-timer">
                <Clock className="timer-icon" />
                <span>{formatTime(callDuration)}</span>
              </div>
            </div>

            <div className="call-controls">
              <button 
                className={`control-btn ${isMuted ? 'active' : ''}`}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="icon" /> : <Mic className="icon" />}
                <span>{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>
              
              <button 
                className={`control-btn ${isVideoOn ? 'active' : ''}`}
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? <VideoOff className="icon" /> : <Video className="icon" />}
                <span>{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
              </button>
              
              <button className="control-btn end-call" onClick={endCall}>
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
  toggleCallFeature,
  requestMicrophonePermission,
  startCall,
  endCall
}) => {
  // Handle call acceptance (agent side)
  const acceptCall = () => {
    setCallFeature(prev => ({
      ...prev,
      callStatus: 'active'
    }));
    setActiveCall(prev => ({
      ...prev,
      status: 'connected'
    }));
  };

  // Enhanced props for both UIs
  const commonProps = {
    callFeature,
    setCallFeature,
    activeCall,
    setActiveCall,
    toggleCallFeature,
    requestMicrophonePermission,
    startCall,
    endCall,
    acceptCall
  };

  return userRole === 'customer' 
    ? <CustomerCallUI {...commonProps} /> 
    : <AgentCallUI {...commonProps} />;
};

export default InAppCall;
