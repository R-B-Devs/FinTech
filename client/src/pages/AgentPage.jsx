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

    // Ask for existing users after joining
    socket.on('existing-users', (users) => {
      console.log('Existing users in room:', users);
      if (users.length > 0) {
        const firstUserId = users[0];
        setRemoteSocketId(firstUserId);
        startCall(firstUserId);
      }
    });

    // New user joined after you
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
  <div>
    <h2>Agent Page</h2>
    <p>Status: {callStatus}</p>

    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
      <div>
        <h3>Your Video</h3>
        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px', border: '1px solid #ccc' }} />
      </div>

      <div>
        <h3>Remote Video</h3>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px', border: '1px solid #ccc' }} />
      </div>
    </div>

    {callStatus !== 'idle' && (
      <button
        onClick={endCall}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff4d4f',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        End Call
      </button>
    )}
  </div>
);

};

export default AgentPage;
