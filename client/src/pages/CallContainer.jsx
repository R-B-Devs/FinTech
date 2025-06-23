import React, { useState, useEffect, useRef } from "react";
import socket from '../utilis/WebRTCService';
import InAppCall from "./InAppCall"; // Adjust path if needed

const CallContainer = () => {
  const [callFeature, setCallFeature] = useState({
    isOpen: true,
    currentPage: "welcome",
    microphoneAllowed: false,
    activeDepartment: null,
    callStatus: 'idle', // track call status here too
    mediaStream: null,
  });

  const [activeCall, setActiveCall] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnection = useRef(null);
  const localStream = useRef(null);

  // Request microphone permission and get audio stream
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStream.current = stream;

      setCallFeature((prev) => ({
        ...prev,
        microphoneAllowed: true,
        currentPage: "main-menu",
        mediaStream: stream,
      }));
    } catch (error) {
      alert("Microphone permission denied");
    }
  };

  // Start a call by joining a room and creating offer
  const startCall = (department, isVideo = false) => {
    setCallFeature((prev) => ({
      ...prev,
      activeDepartment: department,
      currentPage: "active-call",
      callStatus: "ringing",
      isVideo,
    }));

    setActiveCall({
      department,
      callerId: 'user-' + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: "ringing",
      isVideo,
    });

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local tracks to peer connection (audio + video if available)
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, localStream.current);
      });
    }

    // Listen for remote tracks
    peerConnection.current.ontrack = (event) => {
      // Combine tracks into one MediaStream
      setRemoteStream((prevStream) => {
        const newStream = prevStream || new MediaStream();
        newStream.addTrack(event.track);
        return newStream;
      });
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          roomId: department,
          targetUser: null, // Extend for multi-user later
        });
      }
    };

    socket.emit("join-room", department);

    peerConnection.current
      .createOffer()
      .then((offer) => peerConnection.current.setLocalDescription(offer))
      .then(() => {
        socket.emit("offer", {
          offer: peerConnection.current.localDescription,
          roomId: department,
          targetUser: null,
        });
      });
  };

  // Accept incoming call (for agent or peer)
  const acceptCall = async () => {
    setCallFeature((prev) => ({
      ...prev,
      callStatus: "active",
      currentPage: "active-call",
    }));

    setActiveCall((prev) => prev ? { ...prev, status: "active" } : null);

    if (!peerConnection.current) {
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, localStream.current);
        });
      }

      peerConnection.current.ontrack = (event) => {
        setRemoteStream((prevStream) => {
          const newStream = prevStream || new MediaStream();
          newStream.addTrack(event.track);
          return newStream;
        });
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            roomId: activeCall?.department,
            targetUser: null,
          });
        }
      };
    }
  };

  // End the call and clean up everything
  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    // Stop all media tracks (local and remote)
    localStream.current?.getTracks().forEach((track) => track.stop());
    setRemoteStream((prev) => {
      prev?.getTracks().forEach((track) => track.stop());
      return null;
    });

    localStream.current = null;

    setCallFeature((prev) => ({
      ...prev,
      activeDepartment: null,
      currentPage: "main-menu",
      callStatus: "idle",
      mediaStream: null,
      isVideo: false,
    }));

    setActiveCall(null);
  };

  // Socket signaling event listeners
  useEffect(() => {
    socket.on("offer", async ({ offer, sender, roomId }) => {
      if (!peerConnection.current) {
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        if (localStream.current) {
          localStream.current.getTracks().forEach((track) => {
            peerConnection.current.addTrack(track, localStream.current);
          });
        }

        peerConnection.current.ontrack = (event) => {
          setRemoteStream((prevStream) => {
            const newStream = prevStream || new MediaStream();
            newStream.addTrack(event.track);
            return newStream;
          });
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
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

      socket.emit("answer", { answer, roomId, targetUser: sender });

      // Update call state for UI
      setCallFeature((prev) => ({
        ...prev,
        callStatus: "active",
        currentPage: "active-call",
      }));

      setActiveCall({
        department: roomId,
        callerId: sender,
        timestamp: new Date().toISOString(),
        status: "active",
        isVideo: false,
      });
    });

    socket.on("answer", async ({ answer }) => {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        setCallFeature((prev) => ({
          ...prev,
          callStatus: "active",
          currentPage: "active-call",
        }));

        setActiveCall((prev) =>
          prev ? { ...prev, status: "active" } : null
        );
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerConnection.current?.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [activeCall]);

  // Toggle call panel open/close (optional)
  const toggleCallFeature = () => {
    setCallFeature((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  return (
    <InAppCall
      userRole="customer" // or "agent"
      callFeature={callFeature}
      toggleCallFeature={toggleCallFeature}
      setCallFeature={setCallFeature}
      requestMicrophonePermission={requestMicrophonePermission}
      startCall={startCall}
      endCall={endCall}
      activeCall={activeCall}
      setActiveCall={setActiveCall}
      localStream={localStream.current}
      remoteStream={remoteStream}
      acceptCall={acceptCall} // pass to Agent UI if needed
    />
  );
};

export default CallContainer;
