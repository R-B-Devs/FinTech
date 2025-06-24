import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import socket from '../utilis/WebRTCService';

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
    <div className="agent-container" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Customer Support Agent</h1>
        <div style={styles.statusIndicator}>
          <span style={{
            ...styles.statusDot,
            backgroundColor: callStatus === 'connected' ? '#52c41a' : 
                           callStatus === 'calling' ? '#faad14' : '#f5222d'
          }} />
          <span style={styles.statusText}>
            {callStatus === 'connected' ? 'In Call' : 
             callStatus === 'calling' ? 'Calling...' : 'Ready'}
          </span>
          {remoteSocketId && (
            <span style={styles.connectionId}>Connection ID: {remoteSocketId}</span>
          )}
        </div>
      </header>

      <div style={styles.videoContainer}>
        <div style={styles.videoCard}>
          <div style={styles.videoHeader}>
            <h3 style={styles.videoTitle}>Your Camera</h3>
          </div>
          <video 
            ref={localVideoRef} 
            autoPlay 
            muted 
            playsInline 
            style={styles.videoElement}
          />
          {!localVideoRef.current?.srcObject && (
            <div style={styles.videoPlaceholder}>
              <span style={styles.placeholderText}>Local camera feed</span>
            </div>
          )}
        </div>

        <div style={styles.videoCard}>
          <div style={styles.videoHeader}>
            <h3 style={styles.videoTitle}>Customer</h3>
          </div>
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            style={styles.videoElement}
          />
          {!remoteVideoRef.current?.srcObject && (
            <div style={styles.videoPlaceholder}>
              <span style={styles.placeholderText}>
                {callStatus === 'calling' ? 'Connecting to customer...' : 'Waiting for customer'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={styles.controls}>
        {callStatus !== 'idle' && (
          <button
            onClick={endCall}
            style={{
              ...styles.button,
              ...styles.endCallButton
            }}
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: '#333',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e8e8e8',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    margin: '0',
    color: '#1890ff',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  statusText: {
    fontSize: '14px',
    fontWeight: '500',
  },
  connectionId: {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#f5f5f5',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  videoContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '30px',
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  videoHeader: {
    padding: '12px 16px',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #e8e8e8',
  },
  videoTitle: {
    margin: '0',
    fontSize: '16px',
    fontWeight: '500',
  },
  videoElement: {
    width: '100%',
    height: '300px',
    backgroundColor: '#000',
    display: 'block',
  },
  videoPlaceholder: {
    width: '100%',
    height: '300px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: '14px',
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
  },
  button: {
    padding: '10px 24px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  endCallButton: {
    backgroundColor: '#ff4d4f',
    color: 'white',
    boxShadow: '0 2px 0 rgba(255, 77, 79, 0.2)',
  },
  endCallButtonHover: {
    backgroundColor: '#ff7875',
  },
};

export default AgentPage;