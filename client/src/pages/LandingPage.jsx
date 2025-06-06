import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import woman from '../assets/woman.png';



const LandingPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setIsLoaded(true);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: "🧠",
      title: "AI-Powered Insights",
      description: "Revolutionary machine learning algorithms analyze your spending patterns to deliver hyper-personalized financial recommendations that evolve with your lifestyle.",
      gradient: "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)"
    },
    {
      icon: "📊",
      title: "Live Analytics",
      description: "Watch your financial health transform in real-time with stunning visualizations and predictive analytics that anticipate your future needs.",
      gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
    },
    {
      icon: "🛡️",
      title: "Fortress Security",
      description: "Military-grade encryption meets biometric authentication in a security system so advanced, it makes bank vaults look like piggy banks.",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      icon: "⚡",
      title: "Lightning Sync",
      description: "Seamless cross-device synchronization that's faster than your morning coffee and smoother than your favorite playlist.",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)"
    }
  ];

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.backgroundContainer}>
        {/* Gradient Orbs */}
        <div 
          style={{
            ...styles.gradientOrb1,
            left: `${mousePosition.x * 0.05}%`,
            top: `${mousePosition.y * 0.05}%`,
          }}
        />
        <div 
          style={{
            ...styles.gradientOrb2,
            right: `${mousePosition.x * 0.03}%`,
            bottom: `${mousePosition.y * 0.03}%`,
          }}
        />
        
        {/* Animated Grid */}
        <div style={styles.animatedGrid}>
          {Array.from({ length: 144 }).map((_, i) => (
            <div 
              key={i} 
              style={{
                ...styles.gridCell,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={{
          ...styles.heroContent,
          transform: isLoaded ? 'translateY(0)' : 'translateY(48px)',
          opacity: isLoaded ? 1 : 0
        }}>
          {/* Logo with Glow Effect */}
          <div style={styles.logoImageContainer}>
            <img src={logo} alt="LynqAI Logo" style={styles.logoImage} />
          </div>


          {/* Subtitle */}
          <p style={styles.subtitle}>
            Where artificial intelligence meets 
            <span style={styles.gradientText}> financial brilliance</span>.
            <br />Transform your money management into a masterpiece.
          </p>

          {/* CTA Buttons */}
          <div style={styles.ctaContainer}>
            <button
              style={styles.primaryButton}
              onClick={() => navigate('/login')}
            >
              <div style={styles.buttonOverlay} />
              <div style={styles.buttonContent}>
                Start Your Journey
                <span style={styles.chevron}>→</span>
              </div>
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => navigate('/demo')}
            >
              Watch Demo
            </button>
          </div>


          {/* Stats */}
          <div style={styles.statsContainer}>
            <div style={styles.stat}>
              <div style={styles.statNumber}>10K+</div>
              <div style={styles.statLabel}>Happy Users</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statNumber}>R50M+</div>
              <div style={styles.statLabel}>Money Managed</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statNumber}>99.9%</div>
              <div style={styles.statLabel}>Uptime</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statNumber}>5+</div>
              <div style={styles.statLabel}>AI Tools Integrated</div>
            </div>
          </div>
        </div>

        {/* Right Side - Woman Image Only */}
        <div style={{
          ...styles.phoneContainer,
          transform: isLoaded ? 'translateX(0)' : 'translateX(48px)',
          opacity: isLoaded ? 1 : 0
        }}>
          <img src={woman} alt="Portfolio Woman" style={styles.womanImage} />
        </div>

      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.featuresHeader}>
          <h2 style={styles.featuresTitle}>
            Why LynqAI Dominates
          </h2>
          <p style={styles.featuresSubtitle}>
            Four pillars of financial excellence that separate us from the ordinary
          </p>
        </div>

        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              style={{
                ...styles.featureCard,
                transform: `translateY(${isLoaded ? 0 : 50}px) scale(${hoveredCard === index ? 1.05 : 1})`,
                opacity: isLoaded ? 1 : 0,
                transitionDelay: `${index * 0.1}s`,
                borderColor: hoveredCard === index ? 'rgba(220, 20, 60, 0.5)' : 'rgba(75, 85, 99, 1)',
                boxShadow: hoveredCard === index ? '0 25px 50px -12px rgba(220, 20, 60, 0.2)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Gradient Background */}
              <div style={{
                ...styles.cardGradientBg,
                background: feature.gradient,
                opacity: hoveredCard === index ? 0.1 : 0
              }} />
              
              {/* Icon */}
              <div style={{
                ...styles.featureIcon,
                background: feature.gradient,
                transform: hoveredCard === index ? 'scale(1.1)' : 'scale(1)'
              }}>
                <span style={styles.iconEmoji}>{feature.icon}</span>
              </div>

              {/* Content */}
              <h3 style={{
                ...styles.featureTitle,
                color: hoveredCard === index ? '#f87171' : '#ffffff'
              }}>
                {feature.title}
              </h3>
              <p style={{
                ...styles.featureDescription,
                color: hoveredCard === index ? '#d1d5db' : '#9ca3af'
              }}>
                {feature.description}
              </p>

              {/* Hover Glow */}
              <div style={{
                ...styles.cardHoverGlow,
                background: feature.gradient,
                opacity: hoveredCard === index ? 1 : 0
              }} />
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={styles.bottomCTA}>
        <div style={styles.ctaCard}>
          <h3 style={styles.ctaTitle}>
            Ready to Revolutionize Your Finances?
          </h3>
          <p style={styles.ctaDescription}>
            Join thousands of South Africans who've already transformed their financial future with LynqAI
          </p>
          <button style={styles.ctaButton}>
            <div style={styles.ctaButtonOverlay} />
            <div style={styles.ctaButtonContent}>
              <span style={styles.ctaSparkle}>✨</span>
              Get Started Free
              <span style={styles.ctaChevron}>→</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    color: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden'
  },
  logoImageContainer: {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '-12rem',
  marginBottom: '-9rem',
},
logoImage: {
  height: '500px',
  objectFit: 'contain',
},

womanImage: {
  width: '600%',
  maxWidth: '800px',       // Increased from 400px to 600px
  marginLeft: '-35rem',
  borderRadius: '1rem',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
  animation: 'fadeInUp 1s ease-out',
},
  gradientOrb1: {
    position: 'absolute',
    width: '384px',
    height: '384px',
    borderRadius: '50%',
    opacity: 0.2,
    filter: 'blur(64px)',
    background: 'radial-gradient(circle, rgba(220,20,60,0.8) 0%, rgba(139,0,0,0.4) 50%, transparent 100%)',
    transform: 'translate(-50%, -50%)',
    transition: 'all 0.3s ease-out',
    animation: 'pulse 2s infinite'
  },
  gradientOrb2: {
    position: 'absolute',
    width: '288px',
    height: '288px',
    borderRadius: '50%',
    opacity: 0.15,
    filter: 'blur(64px)',
    background: 'radial-gradient(circle, rgba(255,20,147,0.6) 0%, rgba(220,20,60,0.3) 50%, transparent 100%)',
    transform: 'translate(50%, 50%)',
    transition: 'all 0.5s ease-out',
    animation: 'pulse 2s infinite',
    animationDelay: '2s'
  },
  animatedGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '1px',
    animation: 'pulse 3s infinite'
  },
  gridCell: {
    borderRight: '1px solid rgba(185, 28, 28, 0.2)',
    borderBottom: '1px solid rgba(185, 28, 28, 0.2)',
    transition: 'all 0.5s ease',
    animation: 'pulse 2s infinite'
  },
  hero: {
    position: 'relative',
    zIndex: 10,
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    gap: '48px'
  },
  heroContent: {
    flex: 1,
    maxWidth: '512px',
    transition: 'all 1s ease'
  },
  logoContainer: {
    position: 'relative',
    marginBottom: '32px'
  },
  logoGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    fontSize: '5rem',
    fontWeight: '900',
    background: 'linear-gradient(45deg, #dc2626, #ec4899, #dc2626)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    filter: 'blur(8px)',
    opacity: 0.5,
    animation: 'pulse 2s infinite'
  },
  logo: {
    position: 'relative',
    fontSize: '5rem',
    fontWeight: '900',
    background: 'linear-gradient(45deg, #dc2626, #ec4899, #dc2626)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  sparkle: {
    position: 'absolute',
    top: '-16px',
    right: '-16px',
    fontSize: '32px',
    animation: 'spin 3s linear infinite'
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#d1d5db',
    marginBottom: '32px',
    lineHeight: '1.6'
  },
  gradientText: {
    background: 'linear-gradient(45deg, #f87171, #fb7185)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: '600'
  },
  ctaContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '48px'
  },
  primaryButton: {
  position: 'relative',
  padding: '16px 32px',
  background: 'linear-gradient(45deg, #8A1F2C, #B02A3F)', // deep red gradient
  borderRadius: '50px',
  fontWeight: '600',
  fontSize: '18px',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: '0 10px 25px rgba(138, 31, 44, 0.4)' // matching shadow
},
  buttonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #ec4899, #dc2626)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  buttonContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  chevron: {
    transition: 'transform 0.3s ease'
  },
  secondaryButton: {
    padding: '16px 32px',
    border: '2px solid #4b5563',
    borderRadius: '50px',
    fontWeight: '600',
    fontSize: '18px',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  statsContainer: {
    display: 'flex',
    gap: '32px',
    fontSize: '14px'
  },
  stat: {
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f87171'
  },
  statLabel: {
    color: '#9ca3af'
  },
  phoneContainer: {
    flex: 1,
    maxWidth: '320px',
    transition: 'all 1s ease',
    transitionDelay: '0.3s'
  },
  phoneWrapper: {
    position: 'relative',
    margin: '0 auto'
  },
  phone: {
    position: 'relative',
    width: '320px',
    height: '384px',
    background: 'linear-gradient(135deg, #1f2937, #000000)',
    borderRadius: '24px',
    padding: '8px',
    boxShadow: '0 25px 50px rgba(220, 20, 60, 0.2)',
    transition: 'all 0.5s ease'
  },
  phoneScreen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative'
  },
  screenContent: {
    padding: '24px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  screenHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  },
  portfolioText: {
    fontSize: '14px',
    fontWeight: '600'
  },
  statusIndicator: {
    width: '24px',
    height: '24px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s infinite'
  },
  balanceCard: {
    background: 'linear-gradient(135deg, #dc2626, #ec4899)',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden'
  },
  balanceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)'
  },
  balanceContent: {
    position: 'relative'
  },
  balanceLabel: {
    fontSize: '12px',
    opacity: 0.8
  },
  balanceAmount: {
    fontSize: '24px',
    fontWeight: '700'
  },
  balanceChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    marginTop: '4px'
  },
  trendIcon: {
    fontSize: '14px'
  },
  changePercent: {
    color: '#86efac'
  },
  chartsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  chartItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: '12px'
  },
  chartLabel: {
    fontSize: '12px'
  },
  chartRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  chartBar: {
    width: '64px',
    height: '8px',
    borderRadius: '4px'
  },
  chartValue: {
    fontSize: '10px',
    color: '#9ca3af'
  },
  floatingElement1: {
    position: 'absolute',
    top: '-16px',
    left: '-16px',
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #9333ea, #ec4899)',
    borderRadius: '50%',
    animation: 'bounce 2s infinite',
    opacity: 0.8,
    filter: 'blur(2px)'
  },
  floatingElement2: {
    position: 'absolute',
    bottom: '-16px',
    right: '-16px',
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
    opacity: 0.6,
    filter: 'blur(2px)'
  },
  features: {
    position: 'relative',
    zIndex: 10,
    padding: '80px 32px'
  },
  featuresHeader: {
    textAlign: 'center',
    marginBottom: '64px'
  },
  featuresTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #ffffff, #d1d5db, #9ca3af)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '16px'
  },
  featuresSubtitle: {
    fontSize: '20px',
    color: '#9ca3af',
    maxWidth: '512px',
    margin: '0 auto'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  featureCard: {
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.5), rgba(17, 24, 39, 0.3))',
    backdropFilter: 'blur(8px)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #4b5563',
    transition: 'all 0.5s ease',
    cursor: 'pointer'
  },
  cardGradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    transition: 'opacity 0.5s ease'
  },
  featureIcon: {
    position: 'relative',
    width: '64px',
    height: '64px',
    marginBottom: '16px',
    borderRadius: '12px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.3s ease'
  },
  iconEmoji: {
    fontSize: '32px'
  },
  featureTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '12px',
    transition: 'color 0.3s ease'
  },
  featureDescription: {
    fontSize: '14px',
    lineHeight: '1.6',
    transition: 'color 0.3s ease'
  },
  cardHoverGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    opacity: 0.2,
    filter: 'blur(32px)',
    transition: 'opacity 0.5s ease',
    pointerEvents: 'none'
  },
  bottomCTA: {
    position: 'relative',
    zIndex: 10,
    padding: '80px 32px',
    textAlign: 'center'
  },
  ctaCard: {
    background: 'linear-gradient(45deg, rgba(185, 28, 28, 0.2), rgba(219, 39, 119, 0.2))',
    backdropFilter: 'blur(8px)',
    borderRadius: '24px',
    padding: '48px',
    border: '1px solid rgba(185, 28, 28, 0.3)',
    maxWidth: '800px',
    margin: '0 auto'
  },
  ctaTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '24px',
    background: 'linear-gradient(45deg, #f87171, #fb7185)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  ctaDescription: {
    fontSize: '20px',
    color: '#d1d5db',
    marginBottom: '32px',
    maxWidth: '512px',
    margin: '0 auto 32px'
  },
  ctaButton: {
    position: 'relative',
    padding: '24px 48px',
    background: 'linear-gradient(45deg, #dc2626, #ec4899)',
    borderRadius: '50px',
    fontWeight: '700',
    fontSize: '20px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 25px 50px rgba(220, 20, 60, 0.25)'
  },
  ctaButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #ec4899, #dc2626)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  ctaButtonContent: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  ctaSparkle: {
    animation: 'spin 3s linear infinite'
  },
  ctaChevron: {
    transition: 'transform 0.3s ease'
  }
};

export default LandingPage;