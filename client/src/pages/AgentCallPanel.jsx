import React, { useState, useEffect } from 'react';
import AgentCallPanel from './AgentCallPanel';
import {
  Phone,
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  User,
  Users,
  MessageCircle,
  Shield,
  DollarSign,
  CreditCard
} from 'lucide-react';

const AgentCallPanel = ({
  incomingCall,
  acceptCall,
  rejectCall,
  endCall,
  callStatus,
  currentCaller,
  departments
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

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
    <div className={`agent-call-panel ${callStatus !== 'idle' ? 'active' : ''}`}>
      {callStatus === 'ringing' && incomingCall && (
        <div className="incoming-call">
          <div className="call-header">
            <h3>Incoming Call</h3>
            <button className="close-btn" onClick={rejectCall}>
              <X className="icon" />
            </button>
          </div>
          
          <div className="caller-info">
            <div className="caller-avatar">
              <User className="icon-large" />
            </div>
            <h4>{currentCaller.name || 'Customer'}</h4>
            <p>Department: {departments[incomingCall.department] || incomingCall.department}</p>
          </div>
          
          <div className="call-actions">
            <button className="btn reject" onClick={rejectCall}>
              Decline
            </button>
            <button className="btn accept" onClick={acceptCall}>
              Accept
            </button>
          </div>
        </div>
      )}

      {callStatus === 'active' && (
        <div className="active-call">
          <div className="call-header">
            <h3>Ongoing Call</h3>
            <button className="close-btn" onClick={endCall}>
              <X className="icon" />
            </button>
          </div>
          
          <div className="caller-info">
            <div className="caller-avatar">
              <User className="icon-large" />
            </div>
            <h4>{currentCaller.name || 'Customer'}</h4>
            <p>Department: {departments[currentCaller.department] || currentCaller.department}</p>
            <div className="call-timer">{formatTime(callDuration)}</div>
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
        <div className="call-ended">
          <div className="call-header">
            <h3>Call Ended</h3>
            <button className="close-btn" onClick={rejectCall}>
              <X className="icon" />
            </button>
          </div>
          
          <div className="call-summary">
            <p>Duration: {formatTime(callDuration)}</p>
            <p>With: {currentCaller.name || 'Customer'}</p>
            <p>Department: {departments[currentCaller.department] || currentCaller.department}</p>
          </div>
          
          <div className="call-feedback">
            <h4>Call Summary</h4>
            <textarea placeholder="Add call summary and feedback..." />
            <button className="btn primary">Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Default props for the component
AgentCallPanel.defaultProps = {
  departments: {
    'general-enquiries': 'General Enquiries',
    'fraud-department': 'Fraud Department',
    'loan-repayment': 'Loan Repayment',
    'credit-application': 'Credit Application'
  },
  callStatus: 'idle',
  currentCaller: {}
};

export default AgentCallPanel;