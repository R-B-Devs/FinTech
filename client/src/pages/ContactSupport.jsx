import React, { useState } from 'react';

const ContactSupport = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Your message has been sent. Our support team will contact you shortly.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Contact Support</h1>
      <p style={styles.subtitle}>
        Need help? Reach out to our support team through the form below or use the provided contact information.
      </p>

      <div style={styles.infoSection}>
        <p><strong>Email:</strong> support@finlynq.com</p>
        <p><strong>Phone:</strong> +27 11 123 4567</p>
        <p><strong>Live Chat:</strong> Available Mon–Fri, 9:00am–5:00pm</p>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        <label style={styles.label}>Your Name</label>
        <input
          type="text"
          name="name"
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <label style={styles.label}>Your Email</label>
        <input
          type="email"
          name="email"
          placeholder="e.g. john@example.com"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <label style={styles.label}>Message</label>
        <textarea
          name="message"
          placeholder="Describe your issue or question..."
          value={formData.message}
          onChange={handleChange}
          style={styles.textarea}
          required
        />

        <button type="submit" style={styles.button}>Send Message</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
    color: 'white',
    padding: '2rem',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#ccc',
    marginBottom: '1.5rem',
    maxWidth: '600px',
  },
  infoSection: {
    backgroundColor: '#1f1f1f',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
    maxWidth: '500px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxWidth: '500px',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid #444',
    backgroundColor: '#1f2937',
    color: 'white',
    fontSize: '1rem',
  },
  textarea: {
    minHeight: '120px',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid #444',
    backgroundColor: '#1f2937',
    color: 'white',
    fontSize: '1rem',
  },
  button: {
    backgroundColor: '#8A1F2C',
    color: 'white',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 'bold',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background-color 0.3s',
  },
};

export default ContactSupport;
