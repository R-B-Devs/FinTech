import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import socket from '../utilis/WebRTCService';
import '../styles/AgentPage.css'; 

const AgentPage = () => {
  const location = useLocation();
  const roomId = 'demo-room';

  const [callStatus, setCallStatus] = useState('idle');
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);

  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          roomId,
          candidate: e.candidate,
          targetUser: targetUserId
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    return pc;
  };

  const startCall = async (userId) => {
    setCallStatus('calling');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if(localVideoRef.current) localVideoRef.current.srcObject = stream;

    const pc = createPeerConnection(userId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('offer', { roomId, offer, targetUser: userId });
  };

  const endCall = () => {
    setCallStatus('idle');

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }

    setRemoteSocketId(null);
  };

  useEffect(() => {
    socket.connect();

    socket.emit('join-room', roomId);

    socket.on('existing-users', (users) => {
      console.log('Existing users in room:', users);
      if (users.length > 0) {
        const firstUserId = users[0];
        setRemoteSocketId(firstUserId);
        startCall(firstUserId);
      }
    });

    socket.on('user-connected', (userId) => {
      console.log('New user connected:', userId);
      setRemoteSocketId(userId);
      startCall(userId);
    });

    socket.on('answer', async ({ answer }) => {
      const pc = pcRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus('connected');
      }
    });

    socket.on('ice-candidate', ({ candidate }) => {
      const pc = pcRef.current;
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="agent-container">
      <header className="agent-header">
        <h1 className="agent-title">Customer Support Agent</h1>
        <div className="status-indicator">
          <span className={`status-dot ${callStatus}`} />
          <span className="status-text">
            {callStatus === 'connected' ? 'In Call' : 
             callStatus === 'calling' ? 'Calling...' : 'Ready'}
          </span>
          {remoteSocketId && (
            <span className="connection-id">Connection ID: {remoteSocketId}</span>
          )}
        </div>
      </header>

      <div className="video-container">
        <div className="video-card">
          <div className="video-header">
            <h3 className="video-title">Your Camera</h3>
          </div>
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            className="video-element"
          />
          {!localVideoRef.current?.srcObject && (
            <div className="video-placeholder">
              <span className="placeholder-text">Local camera feed</span>
            </div>
          )}
        </div>

        <div className="video-card">
          <div className="video-header">
            <h3 className="video-title">Customer</h3>
          </div>
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className="video-element"
          />
          {!remoteVideoRef.current?.srcObject && (
            <div className="video-placeholder">
              <span className="placeholder-text">
                {callStatus === 'calling' ? 'Connecting to customer...' : 'Waiting for customer'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="controls">
        {callStatus !== 'idle' && (
          <button
            onClick={endCall}
            className="end-call-button"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

export default AgentPage;