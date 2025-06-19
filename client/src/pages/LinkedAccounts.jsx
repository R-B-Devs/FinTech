import React from 'react';

const LinkedAccounts = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Linked Accounts</h1>
      <p style={styles.text}>
        Manage your connected bank accounts, payment methods, and card information.
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

export default LinkedAccounts;
