import React, { useEffect, useState, useRef } from 'react';
import {
  Phone, X, Mic, MicOff, Video, VideoOff, User, Clock,
  MessageCircle, Shield, DollarSign, CreditCard, ChevronRight
} from 'lucide-react';
import socket from '../utilis/WebRTCService';
import CustomerCallUI from './InAppCall'; // Assuming this is your correct UI component

const CallContainer = () => {
  const [callFeature, setCallFeature] = useState({
    isOpen: true,
    currentPage: "welcome",
    microphoneAllowed: false,
    activeDepartment: null,
  });

  const [activeCall, setActiveCall] = useState(null);

  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const remoteStream = useRef(new MediaStream());

  useEffect(() => {
    if (callFeature.currentPage === 'main-menu' && !callFeature.microphoneAllowed) {
      requestMicrophonePermission();
    }
  }, [callFeature.currentPage]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current = stream;
      setCallFeature(prev => ({
        ...prev,
        microphoneAllowed: true,
        currentPage: "main-menu",
      }));
    } catch (err) {
      alert("Microphone permission denied.");
    }
  };

  const startCall = async (department) => {
    if (!localStream.current) {
      alert("Microphone access required.");
      return;
    }

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    localStream.current.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          roomId: department,
          targetUser: null,
          sender: socket.id,
        });
      }
    };

    peerConnection.current.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        remoteStream.current.addTrack(track);
      });
    };

    socket.emit('join-room', department);

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit('offer', {
      offer: peerConnection.current.localDescription,
      roomId: department,
      targetUser: null,
      sender: socket.id,
    });

    setActiveCall({
      department,
      status: 'calling',
      isVideo: false,
      remoteStream: remoteStream.current,
    });

    setCallFeature(prev => ({
      ...prev,
      activeDepartment: department,
      currentPage: 'active-call',
    }));
  };

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    localStream.current?.getTracks().forEach(track => track.stop());
    localStream.current = null;

    remoteStream.current.getTracks().forEach(track => remoteStream.current.removeTrack(track));

    setActiveCall(null);

    setCallFeature(prev => ({
      ...prev,
      activeDepartment: null,
      currentPage: 'main-menu',
    }));
  };

  useEffect(() => {
    socket.on('answer', async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        setActiveCall(prev => ({ ...prev, status: 'active' }));
      }
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      try {
        await peerConnection.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error('Error adding ICE candidate:', e);
      }
    });

    return () => {
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, []);

  return (
    <CustomerCallUI
      callFeature={callFeature}
      setCallFeature={setCallFeature}
      startCall={startCall}
      endCall={endCall}
      activeCall={activeCall}
    />
  );
};

export default CallContainer;
