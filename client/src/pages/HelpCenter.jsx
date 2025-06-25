import React, { useState } from 'react';
import { Search, MessageCircle, Shield, CreditCard, Target, Mail, ChevronDown, ChevronUp, Sparkles, Zap } from 'lucide-react';

const HelpCenter = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems = [
    {
      question: "How can I reset my password?",
      answer: "You can reset your password by clicking 'Forgot Password' on the login page. Follow the instructions to receive a reset link.",
      icon: <Shield style={{ width: '20px', height: '20px' }} />,
      category: "Security"
    },
    {
      question: "How is my data protected?",
      answer: "We use end-to-end encryption and comply with POPIA to ensure your financial data remains secure and private.",
      icon: <Shield style={{ width: '20px', height: '20px' }} />,
      category: "Security"
    },
    {
      question: "How do I set up a budget?",
      answer: "Navigate to the Goals page from your Dashboard and click 'Create Goal'. Choose a category, amount, and timeline.",
      icon: <Target style={{ width: '20px', height: '20px' }} />,
      category: "Budgeting"
    },
    {
      question: "How can I contact support?",
      answer: "Use the 'Contact Support' section in Settings or email us directly at support@yourapp.com.",
      icon: <Mail style={{ width: '20px', height: '20px' }} />,
      category: "Support"
    },
  ];

  const filteredFAQs = faqItems.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={styles.container}>
      {/* Animated background elements */}
      <div style={styles.backgroundElements}>
        <div style={{...styles.bgOrb1, ...styles.animatePulse}}></div>
        <div style={{...styles.bgOrb2, ...styles.animatePulse, animationDelay: '2s'}}></div>
        <div style={{...styles.bgOrb3, ...styles.animatePulse, animationDelay: '4s'}}></div>
      </div>

      {/* Floating particles */}
      <div style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerBadge}>
            <Sparkles style={{ width: '24px', height: '24px', color: '#8A1F2C' }} />
            <span style={styles.badgeText}>Help Center</span>
            <Zap style={{ width: '24px', height: '24px', color: '#8A1F2C' }} />
          </div>
          
          <h1 style={styles.title}>
            How can we help you?
          </h1>
          
          <p style={styles.subtitle}>
            Find answers to common questions, explore our comprehensive guides, and get the support you need to master your finances.
          </p>
        </div>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <div style={styles.searchWrapper}>
            <div style={styles.searchGlow}></div>
            <div style={styles.searchBox}>
              <div style={styles.searchContent}>
                <Search style={{ width: '24px', height: '24px', color: '#8A1F2C' }} />
                <input
                  type="text"
                  placeholder="Search for help articles, guides, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={styles.faqContainer}>
          <div style={styles.faqHeader}>
            <MessageCircle style={{ width: '28px', height: '28px', color: '#8A1F2C' }} />
            <h2 style={styles.faqTitle}>Frequently Asked Questions</h2>
          </div>

          <div style={styles.faqList}>
            {filteredFAQs.map((item, index) => (
              <div
                key={index}
                style={styles.faqItemWrapper}
                onMouseEnter={(e) => {
                  e.currentTarget.querySelector('.glow-effect').style.opacity = '1';
                  e.currentTarget.querySelector('.faq-item').style.borderColor = 'rgba(138, 31, 44, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.querySelector('.glow-effect').style.opacity = '0';
                  e.currentTarget.querySelector('.faq-item').style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Glow effect */}
                <div className="glow-effect" style={styles.glowEffect}></div>
                
                <div className="faq-item" style={styles.faqItem}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    style={styles.faqButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.querySelector('.question-text').style.color = 'rgba(138, 31, 44, 0.8)';
                      e.currentTarget.querySelector('.chevron').style.color = '#8A1F2C';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.querySelector('.question-text').style.color = 'white';
                      e.currentTarget.querySelector('.chevron').style.color = openIndex === index ? '#8A1F2C' : '#94a3b8';
                    }}
                  >
                    <div style={styles.questionContent}>
                      <div style={styles.questionLeft}>
                        <div style={styles.iconContainer}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={styles.categoryText}>{item.category}</div>
                          <div className="question-text" style={styles.questionText}>
                            {item.question}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={styles.chevronContainer}>
                      {openIndex === index ? (
                        <ChevronUp className="chevron" style={{ width: '24px', height: '24px', color: '#8A1F2C', transition: 'all 0.2s' }} />
                      ) : (
                        <ChevronDown className="chevron" style={{ width: '24px', height: '24px', color: '#94a3b8', transition: 'all 0.2s' }} />
                      )}
                    </div>
                  </button>

                  {/* Answer with smooth animation */}
                  <div style={{
                    ...styles.answerContainer,
                    maxHeight: openIndex === index ? '400px' : '0',
                    opacity: openIndex === index ? '1' : '0'
                  }}>
                    <div style={styles.answerContent}>
                      <div style={styles.answerPadding}>
                        <div style={styles.answerDivider}></div>
                        <p style={styles.answerText}>
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div style={styles.noResults}>
              <div style={styles.noResultsIcon}>
                <Search style={{ width: '32px', height: '32px', color: 'white' }} />
              </div>
              <h3 style={styles.noResultsTitle}>No results found</h3>
              <p style={styles.noResultsText}>Try adjusting your search terms or browse all questions above.</p>
            </div>
          )}
        </div>

        {/* Contact Support CTA */}
        <div style={styles.supportContainer}>
          <div 
            style={styles.supportWrapper}
            onMouseEnter={(e) => {
              e.currentTarget.querySelector('.support-glow').style.opacity = '0.3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.querySelector('.support-glow').style.opacity = '0.2';
            }}
          >
            <div className="support-glow" style={styles.supportGlow}></div>
            <div style={styles.supportContent}>
              <h3 style={styles.supportTitle}>Still need help?</h3>
              <p style={styles.supportText}>
                Our support team is here to help you with any questions or issues you might have.
              </p>
              <button 
                style={styles.supportButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #6B1720, #8A1F2C)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(138, 31, 44, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #8A1F2C, #6B1720)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Mail style={{ width: '20px', height: '20px' }} />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.4; }
          }
        `
      }} />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #000000 0%, #1a0a0d 50%, #000000 100%)',
    position: 'relative',
    overflow: 'hidden'
  },
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  bgOrb1: {
    position: 'absolute',
    top: '-160px',
    right: '-160px',
    width: '320px',
    height: '320px',
    background: '#8A1F2C',
    borderRadius: '50%',
    mixBlendMode: 'multiply',
    filter: 'blur(60px)',
    opacity: 0.2
  },
  bgOrb2: {
    position: 'absolute',
    bottom: '-160px',
    left: '-160px',
    width: '320px',
    height: '320px',
    background: '#8A1F2C',
    borderRadius: '50%',
    mixBlendMode: 'multiply',
    filter: 'blur(60px)',
    opacity: 0.2
  },
  bgOrb3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '240px',
    height: '240px',
    background: '#8A1F2C',
    borderRadius: '50%',
    mixBlendMode: 'multiply',
    filter: 'blur(60px)',
    opacity: 0.2
  },
  animatePulse: {
    animation: 'pulse 6s ease-in-out infinite'
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none'
  },
  particle: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    background: 'white',
    borderRadius: '50%',
    opacity: 0.3,
    animation: 'float 5s ease-in-out infinite'
  },
  content: {
    position: 'relative',
    zIndex: 10,
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem'
  },
  headerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '1.5rem',
    padding: '12px 24px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    border: '1px solid rgba(138, 31, 44, 0.3)'
  },
  badgeText: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'white'
  },
  title: {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, #8A1F2C, #A0242F, #8A1F2C)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    lineHeight: '1.1'
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#cbd5e1',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  searchContainer: {
    maxWidth: '600px',
    margin: '0 auto 4rem auto'
  },
  searchWrapper: {
    position: 'relative'
  },
  searchGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #8A1F2C, #6B1720)',
    borderRadius: '16px',
    filter: 'blur(20px)',
    opacity: 0.25,
    transition: 'opacity 0.3s'
  },
  searchBox: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(138, 31, 44, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem'
  },
  searchContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    color: 'white',
    fontSize: '18px',
    border: 'none',
    outline: 'none',
    '::placeholder': {
      color: '#94a3b8'
    }
  },
  faqContainer: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  faqHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '2rem'
  },
  faqTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: 'white'
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  faqItemWrapper: {
    position: 'relative'
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(138, 31, 44, 0.2), rgba(107, 23, 32, 0.2))',
    borderRadius: '16px',
    filter: 'blur(20px)',
    opacity: 0,
    transition: 'opacity 0.5s'
  },
  faqItem: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s'
  },
  faqButton: {
    width: '100%',
    padding: '1.5rem',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  questionContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  questionLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    background: 'linear-gradient(135deg, #8A1F2C, #6B1720)',
    borderRadius: '8px',
    color: 'white'
  },
  categoryText: {
    fontSize: '14px',
    color: '#8A1F2C',
    fontWeight: '500',
    marginBottom: '4px'
  },
  questionText: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    transition: 'color 0.2s'
  },
  chevronContainer: {
    flexShrink: 0,
    marginLeft: '1rem'
  },
  answerContainer: {
    overflow: 'hidden',
    transition: 'all 0.5s ease-in-out'
  },
  answerContent: {
    padding: '0 1.5rem 1.5rem 1.5rem'
  },
  answerPadding: {
    paddingLeft: '4rem',
    paddingRight: '1rem'
  },
  answerDivider: {
    height: '1px',
    background: 'linear-gradient(90deg, rgba(138, 31, 44, 0.3), rgba(107, 23, 32, 0.3))',
    marginBottom: '1rem'
  },
  answerText: {
    color: '#cbd5e1',
    lineHeight: '1.6',
    fontSize: '18px',
    margin: 0
  },
  noResults: {
    textAlign: 'center',
    padding: '4rem 0'
  },
  noResultsIcon: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #8A1F2C, #6B1720)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem auto'
  },
  noResultsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'white',
    marginBottom: '0.5rem'
  },
  noResultsText: {
    color: '#94a3b8'
  },
  supportContainer: {
    maxWidth: '800px',
    margin: '4rem auto 0 auto'
  },
  supportWrapper: {
    position: 'relative'
  },
  supportGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #8A1F2C, #6B1720)',
    borderRadius: '16px',
    filter: 'blur(20px)',
    opacity: 0.2,
    transition: 'opacity 0.3s'
  },
  supportContent: {
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(138, 31, 44, 0.1), rgba(107, 23, 32, 0.1))',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(138, 31, 44, 0.3)',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center'
  },
  supportTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '1rem'
  },
  supportText: {
    color: '#cbd5e1',
    marginBottom: '1.5rem',
    maxWidth: '600px',
    margin: '0 auto 1.5rem auto'
  },
  supportButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #8A1F2C, #6B1720)',
    color: 'white',
    fontWeight: '600',
    padding: '1rem 2rem',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '16px'
  }
};

export default HelpCenter;