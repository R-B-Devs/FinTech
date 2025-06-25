import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Send, User, AtSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ✅ Import navigate

const ContactSupport = () => {
  const navigate = useNavigate(); // ✅ Setup navigation

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    alert('Your message has been sent. Our support team will contact you shortly.');
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1f1f1f 50%, #450a0a 100%)',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    backgroundOrb1: {
      position: 'absolute',
      top: '-10rem',
      right: '-10rem',
      width: '20rem',
      height: '20rem',
      borderRadius: '50%',
      background: '#dc2626',
      mixBlendMode: 'multiply',
      filter: 'blur(64px)',
      opacity: 0.3,
      animation: 'pulse 4s ease-in-out infinite'
    },
    backgroundOrb2: {
      position: 'absolute',
      bottom: '-10rem',
      left: '-10rem',
      width: '20rem',
      height: '20rem',
      borderRadius: '50%',
      background: '#dc143c',
      mixBlendMode: 'multiply',
      filter: 'blur(64px)',
      opacity: 0.3,
      animation: 'pulse 4s ease-in-out infinite 2s'
    },
    backgroundOrb3: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '15rem',
      height: '15rem',
      borderRadius: '50%',
      background: '#b91c1c',
      mixBlendMode: 'multiply',
      filter: 'blur(64px)',
      opacity: 0.25,
      animation: 'pulse 4s ease-in-out infinite 4s'
    },
    gridOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `
        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
      `,
      backgroundSize: '50px 50px'
    },
    content: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '3rem 1.5rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    iconContainer: {
      display: 'inline-block',
      padding: '1rem',
      borderRadius: '50%',
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(220, 38, 38, 0.3)',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '3rem',
      fontWeight: 'bold',
      background: 'linear-gradient(to right, #ffffff, #fca5a5, #f87171)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '1rem'
    },
    subtitle: {
      fontSize: '1.25rem',
      color: '#d1d5db',
      maxWidth: '42rem',
      margin: '0 auto',
      lineHeight: '1.6'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '3rem',
      alignItems: 'start'
    },
    mainGridLarge: {
      gridTemplateColumns: '1fr 1fr'
    },
    contactSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '1.5rem'
    },
    contactCard: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(220, 38, 38, 0.2)',
      borderRadius: '1rem',
      padding: '1.5rem',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    contactCardHover: {
      background: 'rgba(0, 0, 0, 0.5)',
      borderColor: 'rgba(220, 38, 38, 0.4)',
      transform: 'scale(1.05)',
      boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.3)'
    },
    contactCardContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    },
    iconBg: {
      padding: '0.75rem',
      borderRadius: '0.75rem',
      transition: 'transform 0.3s ease'
    },
    iconBgEmail: {
      background: '#8A1F2C'
    },
    iconBgPhone: {
      background: '#8A1F2C'
    },
    iconBgChat: {
      background: '#8A1F2C'
    },
    iconBgHover: {
      transform: 'scale(1.1)'
    },
    contactInfo: {
      flex: 1
    },
    contactTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: 'white'
    },
    contactValue: {
      color: '#fca5a5',
      fontWeight: '500'
    },
    contactSubtext: {
      fontSize: '0.875rem',
      color: '#9ca3af'
    },
    formSection: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(220, 38, 38, 0.2)',
      borderRadius: '1.5rem',
      padding: '2rem',
      transition: 'background 0.3s ease'
    },
    formSectionHover: {
      background: 'rgba(0, 0, 0, 0.4)'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    fieldGroup: {
      position: 'relative'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#d1d5db',
      marginBottom: '0.5rem'
    },
    inputContainer: {
      position: 'relative'
    },
    inputIcon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '1.25rem',
      height: '1.25rem',
      transition: 'color 0.2s ease'
    },
    inputIconFocused: {
      color: '#f87171'
    },
    inputIconDefault: {
      color: '#9ca3af'
    },
    input: {
      width: '100%',
      paddingLeft: '2.75rem',
      paddingRight: '1rem',
      paddingTop: '0.75rem',
      paddingBottom: '0.75rem',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(220, 38, 38, 0.3)',
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      outline: 'none'
    },
    inputFocused: {
      borderColor: '#f87171',
      background: 'rgba(0, 0, 0, 0.4)',
      boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.2)'
    },
    inputHover: {
      borderColor: 'rgba(220, 38, 38, 0.5)'
    },
    textarea: {
      width: '100%',
      padding: '0.75rem 1rem',
      background: 'rgba(0, 0, 0, 0.2)',
      border: '1px solid rgba(220, 38, 38, 0.3)',
      borderRadius: '0.75rem',
      color: 'white',
      fontSize: '1rem',
      transition: 'all 0.2s ease',
      outline: 'none',
      resize: 'none',
      minHeight: '120px'
    },
    textareaFocused: {
      borderColor: '#f87171',
      background: 'rgba(0, 0, 0, 0.4)',
      boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.2)'
    },
    textareaHover: {
      borderColor: 'rgba(220, 38, 38, 0.5)'
    },
    submitButton: {
      width: '100%',
      background: '#8A1F2C',
      color: 'white',
      fontWeight: '600',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '0.75rem',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    submitButtonHover: {
      background: '#8A1F2C',
      transform: 'scale(1.05)',
      boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.4)'
    },
    submitButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none'
    },
    spinner: {
      width: '1.25rem',
      height: '1.25rem',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    emergencySection: {
      marginTop: '4rem',
      textAlign: 'center'
    },
    emergencyCard: {
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(220, 38, 38, 0.2)',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '42rem',
      margin: '0 auto'
    },
    emergencyTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: 'white',
      marginBottom: '1rem'
    },
    emergencyText: {
      color: '#d1d5db',
      marginBottom: '1.5rem'
    },
    emergencyContact: {
      display: 'inline-block',
      padding: '0.5rem 1rem',
      background: 'rgba(220, 38, 38, 0.3)',
      border: '#8A1F2C',
      borderRadius: '0.5rem',
      color: '#fca5a5',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.backgroundOrb1}></div>
      <div style={styles.backgroundOrb2}></div>
      <div style={styles.backgroundOrb3}></div>
      
      {/* Grid pattern overlay */}
      <div style={styles.gridOverlay}></div>

      <div style={styles.content}>
        {/* Header section */}
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <MessageCircle style={{ width: '2rem', height: '2rem', color: '#f87171' }} />
          </div>
          <h1 style={styles.title}>Contact Support</h1>
          <p style={styles.subtitle}>
            Need help? Our dedicated support team is here to assist you. Reach out through the form below or use our direct contact channels.
          </p>
        </div>

        <div style={window.innerWidth >= 1024 ? {...styles.mainGrid, ...styles.mainGridLarge} : styles.mainGrid}>
          {/* Contact info cards */}
          <div style={styles.contactSection}>
            <h2 style={styles.sectionTitle}>Get in Touch</h2>
            
            {/* Email card */}
            <div 
              style={styles.contactCard}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.contactCardHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, styles.contactCard)}
            >
              <div style={styles.contactCardContent}>
                <div style={{...styles.iconBg, ...styles.iconBgEmail}}>
                  <Mail style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <div style={styles.contactInfo}>
                  <h3 style={styles.contactTitle}>Email Support</h3>
                  <p style={styles.contactValue}>support@finlynq.com</p>
                  <p style={styles.contactSubtext}>Response within 2-4 hours</p>
                </div>
              </div>
            </div>

            {/* Phone card */}
            <div 
              style={styles.contactCard}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.contactCardHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, styles.contactCard)}
            >
              <div style={styles.contactCardContent}>
                <div style={{...styles.iconBg, ...styles.iconBgPhone}}>
                  <Phone style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <div style={styles.contactInfo}>
                  <h3 style={styles.contactTitle}>Phone Support</h3>
                  <p style={styles.contactValue}>+27 11 123 4567</p>
                  <p style={styles.contactSubtext}>Mon–Fri, 8:00am–6:00pm SAST</p>
                </div>
              </div>
            </div>

            {/* Live chat card */}
            {/* Live chat card */}
<div 
        style={styles.contactCard}
        onClick={() => navigate('/dashboard/chat')}
        onMouseEnter={(e) => Object.assign(e.target.style, styles.contactCardHover)}
        onMouseLeave={(e) => Object.assign(e.target.style, styles.contactCard)}
>
              <div style={styles.contactCardContent}>
                <div style={{...styles.iconBg, ...styles.iconBgChat}}>
                  <MessageCircle style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
                </div>
                <div style={styles.contactInfo}>
                  <h3 style={styles.contactTitle}>Live Chat</h3>
                  <p style={styles.contactValue}>Available Now</p>
                  <p style={styles.contactSubtext}>Average response: 2 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Send us a Message</h2>
            <div style={styles.form}>
              {/* Name field */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Your Name</label>
                <div style={styles.inputContainer}>
                  <User style={{
                    ...styles.inputIcon,
                    ...(focusedField === 'name' ? styles.inputIconFocused : styles.inputIconDefault)
                  }} />
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus('name')}
                    onBlur={handleBlur}
                    style={{
                      ...styles.input,
                      ...(focusedField === 'name' ? styles.inputFocused : {})
                    }}
                    onMouseEnter={(e) => {
                      if (focusedField !== 'name') {
                        Object.assign(e.target.style, styles.inputHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (focusedField !== 'name') {
                        Object.assign(e.target.style, styles.input);
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {/* Email field */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Your Email</label>
                <div style={styles.inputContainer}>
                  <AtSign style={{
                    ...styles.inputIcon,
                    ...(focusedField === 'email' ? styles.inputIconFocused : styles.inputIconDefault)
                  }} />
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={handleBlur}
                    style={{
                      ...styles.input,
                      ...(focusedField === 'email' ? styles.inputFocused : {})
                    }}
                    onMouseEnter={(e) => {
                      if (focusedField !== 'email') {
                        Object.assign(e.target.style, styles.inputHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (focusedField !== 'email') {
                        Object.assign(e.target.style, styles.input);
                      }
                    }}
                    required
                  />
                </div>
              </div>

              {/* Message field */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Message</label>
                <textarea
                  name="message"
                  placeholder="Describe your issue or question in detail..."
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => handleFocus('message')}
                  onBlur={handleBlur}
                  style={{
                    ...styles.textarea,
                    ...(focusedField === 'message' ? styles.textareaFocused : {})
                  }}
                  onMouseEnter={(e) => {
                    if (focusedField !== 'message') {
                      Object.assign(e.target.style, styles.textareaHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (focusedField !== 'message') {
                      Object.assign(e.target.style, styles.textarea);
                    }
                  }}
                  required
                />
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  ...styles.submitButton,
                  ...(isSubmitting ? styles.submitButtonDisabled : {})
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    Object.assign(e.target.style, styles.submitButtonHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting) {
                    Object.assign(e.target.style, styles.submitButton);
                  }
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={styles.spinner}></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send style={{ width: '1.25rem', height: '1.25rem' }} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Emergency section */}
        <div style={styles.emergencySection}>
          <div style={styles.emergencyCard}>
            <h3 style={styles.emergencyTitle}>Need Immediate Assistance?</h3>
            <p style={styles.emergencyText}>
              For urgent matters or technical emergencies, please call our priority support line or use our live chat feature for immediate assistance.
            </p>
            <div>
              <div style={styles.emergencyContact}>
                🚨 Emergency: +27 11 999 0000
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.1; }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input::placeholder,
          textarea::placeholder {
            color: #9ca3af;
          }
        `}
      </style>
    </div>
  );
};

export default ContactSupport;
