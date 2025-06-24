import React, { useEffect, useState, useRef } from 'react';
import {
  Phone, X, Mic, MicOff, Video, VideoOff, User, Clock,
  MessageCircle, Shield, DollarSign, CreditCard, ChevronRight
} from 'lucide-react';
import socket from '../utilis/WebRTCService';

const CustomerCallUI = ({
  callFeature,
  toggleCallFeature,
  setCallFeature,
  startCall,
  endCall,
  activeCall,
  localStream,
  remoteStream
}) => {
  const localVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

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

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
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
            <h4>Customer Support</h4>
            <p>Connect with our support team via voice or video call.</p>

            <div className="call-options">
              <button className="btn primary" onClick={() => setCallFeature(prev => ({ ...prev, currentPage: 'main-menu' }))}>
                <Phone className="btn-icon" /> Voice Call
              </button>
              <button className="btn primary" onClick={() => alert("Video not implemented yet")}> {/* Placeholder */}
                <Video className="btn-icon" /> Video Call
              </button>
            </div>

            <div className="call-info">
              <p>Standard call rates apply. Available Mon-Fri 8am-8pm, Sat 9am-5pm.</p>
            </div>
          </div>
        )}

        {!activeCall && callFeature.currentPage === 'main-menu' && (
          <div className="call-page menu-page">
            <h4>How Can We Help You Today?</h4>
            <div className="call-departments">
              <button
                className="department-btn"
                onClick={() => startCall('general-enquiries')}
              >
                <div className="btn-icon">
                  <MessageCircle className="icon" />
                </div>
                <span>General Enquiries</span>
                <ChevronRight className="arrow" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InAppCall = ({
  callFeature,
  toggleCallFeature,
  setCallFeature,
  activeCall,
  setActiveCall
}) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const startCall = async (department) => {
    try {
      console.log('🎤 Requesting mic...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        console.log('🔊 Remote stream received');
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            roomId: department,
            targetUser: null,
          });
        }
      };

      socket.emit('join-room', department);

      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);

      socket.emit('offer', {
        offer,
        roomId: department,
        targetUser: null,
      });

      setCallFeature((prev) => ({
        ...prev,
        activeDepartment: department,
        currentPage: 'active-call',
        callStatus: 'ringing',
        microphoneAllowed: true,
        mediaStream: stream,
      }));

      setActiveCall({
        department,
        status: 'ringing',
        isVideo: false,
      });
    } catch (err) {
      console.error('❌ Error starting call:', err);
    }
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    localStream.current?.getTracks().forEach((track) => track.stop());
    setRemoteStream(null);

    setCallFeature((prev) => ({
      ...prev,
      activeDepartment: null,
      currentPage: 'main-menu',
      callStatus: 'idle',
      mediaStream: null,
    }));
    setActiveCall(null);
  };

  useEffect(() => {
    socket.on('offer', async ({ offer, sender, roomId }) => {
      if (!peerConnection.current) {
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        localStream.current?.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, localStream.current);
        });

        peerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit('ice-candidate', {
              candidate: event.candidate,
              roomId,
              targetUser: sender,
            });
          }
        };
      }

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);

      socket.emit('answer', { answer, roomId, targetUser: sender });

      setActiveCall({
        department: roomId,
        status: 'connected',
        isVideo: false,
      });

      setCallFeature((prev) => ({
        ...prev,
        currentPage: 'active-call',
      }));
    });

    socket.on('answer', async ({ answer }) => {
      await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await peerConnection.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (e) {
        console.error('Error adding received ice candidate', e);
      }
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, []);

  return (
    <CustomerCallUI
      callFeature={callFeature}
      toggleCallFeature={toggleCallFeature}
      setCallFeature={setCallFeature}
      startCall={startCall}
      endCall={endCall}
      activeCall={activeCall}
      localStream={localStream.current}
      remoteStream={remoteStream}
    />
  );
};

export default InAppCall;