import React, { useEffect, useRef, useState } from 'react';
import socket from '../utilis/WebRTCService';
import { Mic, Phone, X, Clock } from 'lucide-react';

const AgentContainer = () => {
  const [status, setStatus] = useState('waiting'); // waiting, incoming, active
  const [incoming, setIncoming] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerSocketId, setCallerSocketId] = useState(null);

  const localStream = useRef(null);
  const peerConnection = useRef(null);
  const remoteAudioRef = useRef(null);

  // Listen for incoming call offers and ICE candidates
  useEffect(() => {
    socket.on('offer', ({ offer, roomId, isVideo, sender }) => {
      console.log('📞 Incoming call offer from:', sender);
      setIncoming(offer);
      setRoomId(roomId);
      setIsVideo(isVideo);
      setCallerSocketId(sender);
      setStatus('incoming');
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        if (peerConnection.current) {
          await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    return () => {
      socket.off('offer');
      socket.off('ice-candidate');
    };
  }, []);

  // Accept the incoming call
  const acceptCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      // Add local audio tracks to peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      // When remote track arrives, set it as source for audio element
      peerConnection.current.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
        }
      };

      // Send ICE candidates to caller
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            roomId,
            targetUser: callerSocketId,
          });
        }
      };

      // Set the remote offer SDP properly
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription({ type: 'offer', sdp: incoming.sdp })
      );

      // Create and send answer SDP back to caller
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit('answer', {
        answer,
        roomId,
        targetUser: callerSocketId,
      });

      setStatus('active');
    } catch (error) {
      console.error('Error accepting call:', error);
      endCall();
    }
  };

  // End the call and cleanup
  const endCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    setIncoming(null);
    setRoomId(null);
    setCallerSocketId(null);
    setIsVideo(false);
    setStatus('waiting');
    setCallDuration(0);
  };

  // Call timer
  useEffect(() => {
    let timer;
    if (status === 'active') {
      timer = setInterval(() => setCallDuration((c) => c + 1), 1000);
    } else {
      clearInterval(timer);
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [status]);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="agent-container">
      <h2>Agent Support Panel</h2>

      {status === 'waiting' && (
        <div className="waiting-view">
          <Phone size={32} />
          <p>Waiting for incoming calls...</p>
        </div>
      )}

      {status === 'incoming' && (
        <div className="incoming-call-view">
          <h4>Incoming Voice Call</h4>
          <p>From department: {roomId}</p>
          <button className="btn accept" onClick={acceptCall}>
            Accept Call
          </button>
          <button className="btn decline" onClick={endCall}>
            Decline
          </button>
        </div>
      )}

      {status === 'active' && (
        <div className="active-call-view">
          <div className="voice-call-info">
            <Mic size={32} />
            <p>In call with {roomId}</p>
            <audio ref={remoteAudioRef} autoPlay />
          </div>

          <div className="call-details">
            <Clock size={16} />
            <span>{formatTime(callDuration)}</span>
          </div>

          <button className="btn end-call" onClick={endCall}>
            <X /> End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentContainer;
