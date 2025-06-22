import React, { useEffect, useRef, useState } from 'react';
import socket from '../utilis/WebRTCService';

const AgentReceiver = () => {
  const [callStatus, setCallStatus] = useState('idle');
  const [incomingOffer, setIncomingOffer] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState('');
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const roomId = 'demo-room';

  useEffect(() => {
    socket.connect();
    socket.emit('join-room', roomId);

    // Let Agent know receiver is ready
    socket.emit('ready-to-call');

    socket.on('offer', async ({ offer, sender }) => {
      console.log('Incoming offer from', sender);
      setCallStatus('ringing');
      setIncomingOffer(offer);
      setRemoteSocketId(sender);
    });

    socket.on('ice-candidate', ({ candidate }) => {
      const pc = pcRef.current;
      if (pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit('ice-candidate', {
          roomId,
          candidate: e.candidate,
          targetUser: remoteSocketId
        });
      }
    };

    pc.ontrack = (e) => {
      if(remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    return pc;
  };

  const acceptCall = async () => {
    setCallStatus('active');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;

    const pc = createPeerConnection();
    pcRef.current = pc;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('answer', {
      roomId,
      answer: pc.localDescription,
      targetUser: remoteSocketId
    });
  };

  const rejectCall = () => {
    setCallStatus('idle');
    setIncomingOffer(null);
  };

  const endCall = () => {
    setCallStatus('idle');
    setIncomingOffer(null);

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

    setRemoteSocketId('');
  };

  return (
    <div>
      <h2>Receiver</h2>
      <p>Status: {callStatus}</p>

      {callStatus === 'ringing' && (
        <div>
          <p>Incoming Call</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}

      {callStatus !== 'idle' && (
        <button onClick={endCall}>End Call</button>
      )}

      <div>
        <h3>Your Video</h3>
        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: '300px' }} />
      </div>
      <div>
        <h3>Remote Video</h3>
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '300px' }} />
      </div>
    </div>
  );
};

export default AgentReceiver;
