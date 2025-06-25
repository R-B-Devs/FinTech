import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from "../assets/logo.png";
import "../styles/Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm LynqAI, your intelligent assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call your actual AI endpoint
      const aiResponseText = await generateAIResponse(inputMessage);
      
      const aiResponse = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble responding right now. Please try again.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userInput) => {
    const token = localStorage.getItem('jwt');
    
    const response = await fetch('http://localhost:3001/api/ai/ask-context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ question: userInput })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.answer || 'Sorry, could not get a response';
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm LynqAI, your intelligent assistant. How can I help you today?",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <img src={Logo} alt="LynqAI Logo" className="chat-logo" />
          <div className="chat-title">
            <h1>Lynq Chat</h1>
            <span className="chat-status">Online</span>
          </div>
        </div>
        <div className="chat-header-right">
          <button className="chat-action-btn" onClick={clearChat} title="Clear Chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
          <button className="chat-action-btn logout-btn" onClick={handleLogout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-content">
              <div className="message-bubble">
                {message.text}
              </div>
              <div className="message-timestamp">
                {message.timestamp}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message ai">
            <div className="message-content">
              <div className="message-bubble typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="chat-input-wrapper">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="chat-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={!inputMessage.trim() || isTyping}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;