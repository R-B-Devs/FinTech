import React from 'react';

const ContactSupport = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Contact Support</h1>
      <p style={styles.text}>
        Need help? Reach out to our support team via email or live chat for assistance.
      </p>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
    color: 'white',
    padding: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1rem',
    color: '#ccc',
  },
};

export default ContactSupport;
