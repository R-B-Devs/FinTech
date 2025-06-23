import React, { useState, useEffect, useRef } from "react";
import socket from '../utilis/WebRTCService';
import InAppCall from "./InAppCall"; // Adjust path if needed

const CallContainer = () => {
  const [callFeature, setCallFeature] = useState({
    isOpen: true,
    currentPage: "welcome",
    microphoneAllowed: false,
    activeDepartment: null,
  });

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
      }));
    } catch (error) {
      alert("Microphone permission denied");
    }
  };

  // Start a call by joining a room and creating offer
  const startCall = (department) => {
    setCallFeature((prev) => ({
      ...prev,
      activeDepartment: department,
      currentPage: "active-call",
    }));

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local audio tracks to peer connection
    localStream.current.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, localStream.current);
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          roomId: department,
          targetUser: null, // Implement multi-user later if needed
        });
      }
    };

    socket.emit("join-room", department);

    peerConnection.current
      .createOffer()
      .then((offer) => {
        return peerConnection.current.setLocalDescription(offer);
      })
      .then(() => {
        socket.emit("offer", {
          offer: peerConnection.current.localDescription,
          roomId: department,
          targetUser: null,
        });
      });
  };

  // End the call and clean up
  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;
    setCallFeature((prev) => ({
      ...prev,
      activeDepartment: null,
      currentPage: "main-menu",
    }));
  };

  // Listen to socket events for signaling
  useEffect(() => {
    socket.on("offer", async ({ offer, sender, roomId }) => {
      if (!peerConnection.current) {
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        localStream.current.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, localStream.current);
        });

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
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnection.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
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
  }, []);

  // Toggle call panel open/close (optional)
  const toggleCallFeature = () => {
    setCallFeature((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  return (
    <InAppCall
      callFeature={callFeature}
      toggleCallFeature={toggleCallFeature}
      setCallFeature={setCallFeature}
      requestMicrophonePermission={requestMicrophonePermission}
      startCall={startCall}
      endCall={endCall}
    />
  );
};

export default CallContainer;
