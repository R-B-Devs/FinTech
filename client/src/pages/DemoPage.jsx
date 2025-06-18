import React from 'react';
import { Link } from 'react-router-dom';

const DemoPage = () => {
  return (
    <div style={styles.container}>
      {/* Navigation Back Button */}
      <Link to="/" className="nav-link">
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back</span>
      </Link>



      <div style={styles.brandContainer}>
        <h1 style={styles.brandName}>
          <span style={styles.brand}>Lynq</span>
          <span style={styles.highlight}>AI</span>
        </h1>
      </div>

      <h2 style={styles.title}>Product Demo</h2>
      <p style={styles.description}>
        Discover how LynqAI empowers you to make smarter financial decisions
        with real-time insights and powerful AI tools.
      </p>

      {/* Placeholder for the embedded video */}
      <div style={styles.videoContainer}>
        <div style={styles.videoPlaceholder}>
          <p style={styles.videoText}>[ Demo video will appear here ]</p>
        </div>
      </div>

      <p style={styles.footerNote}>
        Need help? Contact our support or go back to{' '}
        <a href="/" style={styles.link}>Home</a>.
      </p>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    backgroundColor: '#fff',
    color: '#333',
    minHeight: '100vh',
    padding: '40px 20px',
    textAlign: 'center',
  },
  brandContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  brandName: {
    fontSize: '48px',
    fontWeight: '700',
    margin: '0',
  },
  brand: {
    color: '#333',
  },
  highlight: {
    color: '#8A1F2C',
  },
  title: {
    fontSize: '36px',
    color: '#8A1F2C',
    marginBottom: '10px',
    fontWeight: '600',
  },
  description: {
    fontSize: '18px',
    maxWidth: '800px',
    margin: '0 auto 40px',
    lineHeight: '1.6',
  },
  videoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
  },
  videoPlaceholder: {
    width: '80%',
    maxWidth: '720px',
    height: '400px',
    backgroundColor: '#fbeaec',
    border: '2px dashed #8A1F2C',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    color: '#8A1F2C',
    fontStyle: 'italic',
  },
  footerNote: {
    fontSize: '16px',
    marginTop: '20px',
  },
  link: {
    color: '#8A1F2C',
    textDecoration: 'underline',
  },
};

export default DemoPage;