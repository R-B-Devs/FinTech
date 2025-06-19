import React from 'react';

const HelpCenter = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Help Center</h1>
      <p style={styles.text}>
        Browse frequently asked questions, guides, and tutorials to get help with the app.
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

export default HelpCenter;
