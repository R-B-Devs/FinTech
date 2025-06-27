// class WebRTCService {
//   constructor() {
//     this.localStream = null;
//     this.remoteStream = null;
//     this.peerConnection = null;
//     this.socket = null;
//     this.callId = null;
//     this.isInitiator = false;
    
//     // WebRTC configuration
//     this.config = {
//       iceServers: [
//         { urls: 'stun:stun.l.google.com:19302' },
//         { urls: 'stun:stun1.l.google.com:19302' }
//       ]
//     };
//   }

//   setSocket(socket) {
//     this.socket = socket;
//     this.setupSocketListeners();
//   }

//   setupSocketListeners() {
//     this.socket.on('webrtc-offer', this.handleOffer.bind(this));
//     this.socket.on('webrtc-answer', this.handleAnswer.bind(this));
//     this.socket.on('webrtc-ice-candidate', this.handleIceCandidate.bind(this));
//   }

//   async initializeCall(callId, isInitiator = false) {
//     try {
//       this.callId = callId;
//       this.isInitiator = isInitiator;

//       // Get user media (audio only)
//       this.localStream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true
//         },
//         video: false
//       });

//       // Create peer connection
//       this.peerConnection = new RTCPeerConnection(this.config);

//       // Add local stream
//       this.localStream.getTracks().forEach(track => {
//         this.peerConnection.addTrack(track, this.localStream);
//       });

//       // Handle remote stream
//       this.peerConnection.ontrack = (event) => {
//         this.remoteStream = event.streams[0];
//         this.onRemoteStream && this.onRemoteStream(this.remoteStream);
//       };

//       // Handle ICE candidates
//       this.peerConnection.onicecandidate = (event) => {
//         if (event.candidate && this.socket) {
//           this.socket.emit('webrtc-ice-candidate', {
//             callId: this.callId,
//             candidate: event.candidate,
//             targetId: this.targetId
//           });
//         }
//       };

//       // Handle connection state changes
//       this.peerConnection.onconnectionstatechange = () => {
//         console.log('Connection state:', this.peerConnection.connectionState);
//         this.onConnectionStateChange && this.onConnectionStateChange(this.peerConnection.connectionState);
//       };

//       return this.localStream;
//     } catch (error) {
//       console.error('Error initializing call:', error);
//       throw error;
//     }
//   }

//   async createOffer(targetId) {
//     try {
//       this.targetId = targetId;
//       const offer = await this.peerConnection.createOffer();
//       await this.peerConnection.setLocalDescription(offer);
      
//       this.socket.emit('webrtc-offer', {
//         callId: this.callId,
//         offer: offer,
//         targetId: targetId
//       });
//     } catch (error) {
//       console.error('Error creating offer:', error);
//       throw error;
//     }
//   }

//   async handleOffer(data) {
//     try {
//       this.targetId = data.fromId;
//       await this.peerConnection.setRemoteDescription(data.offer);
      
//       const answer = await this.peerConnection.createAnswer();
//       await this.peerConnection.setLocalDescription(answer);
      
//       this.socket.emit('webrtc-answer', {
//         callId: data.callId,
//         answer: answer,
//         targetId: data.fromId
//       });
//     } catch (error) {
//       console.error('Error handling offer:', error);
//     }
//   }

//   async handleAnswer(data) {
//     try {
//       await this.peerConnection.setRemoteDescription(data.answer);
//     } catch (error) {
//       console.error('Error handling answer:', error);
//     }
//   }

//   async handleIceCandidate(data) {
//     try {
//       await this.peerConnection.addIceCandidate(data.candidate);
//     } catch (error) {
//       console.error('Error handling ICE candidate:', error);
//     }
//   }

//   toggleMute() {
//     if (this.localStream) {
//       const audioTrack = this.localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         return !audioTrack.enabled;
//       }
//     }
//     return false;
//   }

//     endCall() {
//     try {
//       // Stop local stream
//       if (this.localStream) {
//         this.localStream.getTracks().forEach(track => track.stop());
//         this.localStream = null;
//       }

//       // Close peer connection
//       if (this.peerConnection) {
//         this.peerConnection.close();
//         this.peerConnection = null;
//       }

//       // Emit end call event
//       if (this.socket && this.callId) {
//         this.socket.emit('end-call', { callId: this.callId });
//       }

//       // Reset properties
//       this.callId = null;
//       this.targetId = null;
//       this.isInitiator = false;
//       this.remoteStream = null;

//     } catch (error) {
//       console.error('Error ending call:', error);
//     }
//   }

//   // Event handlers (to be set by components)
//   onRemoteStream = null;
//   onConnectionStateChange = null;
// }

// export default new WebRTCService();

class WebRTCService {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.socket = null;
    this.callId = null;
    this.isInitiator = false;
    this.targetId = null;
    
    // WebRTC configuration
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  setSocket(socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    this.socket.on('webrtc-offer', this.handleOffer.bind(this));
    this.socket.on('webrtc-answer', this.handleAnswer.bind(this));
    this.socket.on('webrtc-ice-candidate', this.handleIceCandidate.bind(this));
  }

  async initializeCall(callId, isInitiator = false) {
    try {
      console.log('Initializing call:', callId, 'isInitiator:', isInitiator);
      
      this.callId = callId;
      this.isInitiator = isInitiator;

      // Get user media (audio only)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      console.log('Local stream obtained');

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.config);
      console.log('Peer connection created');

      // Add local stream
      this.localStream.getTracks().forEach(track => {
        console.log('Adding track to peer connection');
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        console.log('Remote stream received');
        this.remoteStream = event.streams[0];
        this.onRemoteStream && this.onRemoteStream(this.remoteStream);
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate && this.socket && this.targetId) {
          console.log('Sending ICE candidate');
          this.socket.emit('webrtc-ice-candidate', {
            callId: this.callId,
            candidate: event.candidate,
            targetId: this.targetId
          });
        }
      };

      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', this.peerConnection.connectionState);
        this.onConnectionStateChange && this.onConnectionStateChange(this.peerConnection.connectionState);
      };

      // Handle ICE connection state changes
      this.peerConnection.oniceconnectionstatechange = () => {
        console.log('ICE connection state:', this.peerConnection.iceConnectionState);
      };

      return this.localStream;
    } catch (error) {
      console.error('Error initializing call:', error);
      this.cleanup();
      throw error;
    }
  }

  async createOffer(targetId) {
    try {
      console.log('Creating offer for target:', targetId);
      
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized');
      }

      this.targetId = targetId;
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      console.log('Offer created, setting local description');
      await this.peerConnection.setLocalDescription(offer);
      
      console.log('Sending offer via socket');
      this.socket.emit('webrtc-offer', {
        callId: this.callId,
        offer: offer,
        targetId: targetId
      });
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async handleOffer(data) {
    try {
      console.log('Handling offer from:', data.fromId);
      
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized when handling offer');
      }

      this.targetId = data.fromId;
      
      console.log('Setting remote description');
      await this.peerConnection.setRemoteDescription(data.offer);
      
      console.log('Creating answer');
      const answer = await this.peerConnection.createAnswer();
      
      console.log('Setting local description with answer');
      await this.peerConnection.setLocalDescription(answer);
      
      console.log('Sending answer via socket');
      this.socket.emit('webrtc-answer', {
        callId: data.callId,
        answer: answer,
        targetId: data.fromId
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(data) {
    try {
      console.log('Handling answer from:', data.fromId);
      
      if (!this.peerConnection) {
        throw new Error('Peer connection not initialized when handling answer');
      }

      await this.peerConnection.setRemoteDescription(data.answer);
      console.log('Answer set successfully');
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(data) {
    try {
      console.log('Handling ICE candidate');
      
      if (!this.peerConnection) {
        console.warn('Peer connection not initialized when handling ICE candidate');
        return;
      }

      await this.peerConnection.addIceCandidate(data.candidate);
      console.log('ICE candidate added successfully');
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('Audio track muted:', !audioTrack.enabled);
        return !audioTrack.enabled;
      }
    }
    return false;
  }

  cleanup() {
    console.log('Cleaning up WebRTC resources');
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped local track');
      });
      this.localStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      console.log('Peer connection closed');
    }

    // Reset properties
    this.callId = null;
    this.targetId = null;
    this.isInitiator = false;
    this.remoteStream = null;
  }

  endCall() {
    try {
      // Emit end call event first
      if (this.socket && this.callId) {
        this.socket.emit('end-call', { callId: this.callId });
      }

      // Clean up resources
      this.cleanup();

    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  // Event handlers (to be set by components)
  onRemoteStream = null;
  onConnectionStateChange = null;
}

export default new WebRTCService();