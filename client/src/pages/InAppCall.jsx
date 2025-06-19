import React, { useEffect } from 'react';

import socket from '../utilis/WebRTCService';

import {
  Phone,
  X,
  Mic,
  MessageCircle,
  Shield,
  DollarSign,
  CreditCard,
  ChevronRight,
  Video
} from 'lucide-react';

const InAppCall = ({
  callFeature,
  toggleCallFeature,
  setCallFeature,
  requestMicrophonePermission,
  startCall,
  endCall
}) => {
  // 👉 useEffect to handle incoming socket events once component loads
  useEffect(() => {
    // Join the room when a department is selected
    if (callFeature.activeDepartment) {
      socket.emit('join-room', callFeature.activeDepartment);

      console.log('Joined room:', callFeature.activeDepartment);

      socket.on('user-connected', (userId) => {
        console.log('Another user joined:', userId);
        // Here you could initiate a WebRTC connection if needed
      });

      socket.on('user-disconnected', (userId) => {
        console.log('User disconnected:', userId);
        // You might clean up peer connection here
      });

      socket.on('existing-users', (users) => {
        console.log('Existing users in room:', users);
        // You'll use this to start peer connection if users exist
      });
    }

    // Clean up when component unmounts or user leaves the room
    return () => {
      socket.off('user-connected');
      socket.off('user-disconnected');
      socket.off('existing-users');
    };
  }, [callFeature.activeDepartment]);

  return (
    <div className={`call-panel ${callFeature.isOpen ? 'open' : ''}`}>
      <div className="call-panel-header">
        <h3>Customer Support</h3>
        <button className="call-close-btn" onClick={toggleCallFeature}>
          <X className="icon" />
        </button>
      </div>

      <div className="call-panel-content">
        {callFeature.currentPage === 'welcome' && (
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

        {callFeature.currentPage === 'microphone-permission' && (
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

        {callFeature.currentPage === 'main-menu' && (
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

        {callFeature.microphoneAllowed && callFeature.activeDepartment && (
          <div className="active-call-controls">
            <div className="call-info">
              <p>
                Connected to: <strong>{callFeature.activeDepartment}</strong>
              </p>
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
        )}
      </div>
    </div>
  );
};

export default InAppCall;
