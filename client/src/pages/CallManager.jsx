import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import CallButton from './CallButton';
import AgentUI from './AgentUI';

const CallManager = ({ userType = 'client', userName = 'User' }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [error, setError] = useState('');

  useEffect(() => {
    // Monitor connection status
    const checkConnection = () => {
      fetch('http://localhost:5000/health')
        .then(response => response.json())
        .then(() => setConnectionStatus('connected'))
        .catch(() => setConnectionStatus('disconnected'));
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (connectionStatus === 'disconnected') {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <Alert.Heading>Connection Issue</Alert.Heading>
          <p>Unable to connect to the call server. Please check if the server is running on port 5000.</p>
          <hr />
          <p className="mb-0">
            <strong>To start the server:</strong><br />
            1. Navigate to the server directory<br />
            2. Run: <code>npm install</code><br />
            3. Run: <code>npm start</code>
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          {userType === 'client' ? (
            <div>
              <h2 className="mb-4">ABSA Banking Portal</h2>
              <Row>
                <Col md={6} lg={4}>
                  <CallButton clientName={userName} />
                </Col>
              </Row>
            </div>
          ) : (
            <div>
              <h2 className="mb-4">ABSA Agent Portal</h2>
              <AgentUI agentName={userName} />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CallManager;