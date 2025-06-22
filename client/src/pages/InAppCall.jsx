import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  X,
  Mic,
  MessageCircle,
  Shield,
  DollarSign,
  CreditCard,
  ChevronRight,
  Video,
  VideoOff,
  Clock
} from 'lucide-react';

const CustomerCallUI = ({
  callFeature,
  toggleCallFeature,
  setCallFeature,
  requestMicrophonePermission,
  startCall,
  endCall,
  activeCall
}) => {
  const navigate = useNavigate();

  // Modified startCall to also navigate to /agent with department in state
  const handleStartCall = (department) => {
    startCall(department);
    navigate('/agent', { state: { department } });
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
              <button className="department-btn" onClick={() => handleStartCall('general-enquiries')}>
                <div className="btn-icon">
                  <MessageCircle className="icon" />
                </div>
                <span>General Enquiries</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn emergency" onClick={() => handleStartCall('fraud-department')}>
                <div className="btn-icon">
                  <Shield className="icon" />
                </div>
                <span>Fraud or Card Emergency</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn" onClick={() => handleStartCall('loan-repayment')}>
                <div className="btn-icon">
                  <DollarSign className="icon" />
                </div>
                <span>Loan Repayment</span>
                <ChevronRight className="arrow" />
              </button>

              <button className="department-btn" onClick={() => handleStartCall('credit-application')}>
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
                    <span>{/* format time here if you want */}</span>
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

export default CustomerCallUI;
