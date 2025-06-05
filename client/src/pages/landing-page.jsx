import React from 'react';

const LandingPage = () => {
  return (
    <div style={styles.page}>
      {/* Animated Background Lines */}
      <div style={styles.backgroundLines}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B0000" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#DC143C" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#B22222" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path 
            d="M-200,300 Q200,100 600,200 T1200,150 L1200,0 L0,0 Z" 
            fill="url(#lineGradient)" 
            style={styles.animatedPath}
          />
          <path 
            d="M-100,500 Q300,250 700,350 T1400,300 L1400,0 L0,0 Z" 
            fill="url(#lineGradient)" 
            opacity="0.4"
            style={{ ...styles.animatedPath, animationDelay: '2s' }}
          />
        </svg>
      </div>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          {/* Title */}
          <h1 style={styles.title}>
            Lynq<span style={styles.ai}>AI</span>
          </h1>
          <p style={styles.subtitle}>Smarter Finances. Personalized for You.</p>
          <button style={styles.getStarted}>Get Started</button>
        </div>

        {/* Illustration Section */}
        <div style={styles.illustrationContainer}>
          {/* Laptop with Realistic Screen */}
          <div style={styles.laptop}>
            {/* Laptop Lid */}
            <div style={styles.laptopLid}>
              <div style={styles.laptopBrand}>LYNQ</div>
            </div>
            
            {/* Laptop Screen */}
            <div style={styles.laptopScreen}>
              <div style={styles.screenBezel}>
                <div style={styles.webcam}></div>
                <div style={styles.dashboard}>
                  <div style={styles.dashboardHeader}>
                    <div style={styles.windowControls}>
                      <div style={styles.windowButton}></div>
                      <div style={styles.windowButton}></div>
                      <div style={styles.windowButton}></div>
                    </div>
                    <span style={styles.aiAssistantLabel}>LynqAI Dashboard</span>
                  </div>
                  
                  <div style={styles.dashboardContent}>
                    {/* Left side - Stats */}
                    <div style={styles.leftPanel}>
                      <div style={styles.socialIcons}>
                        <div style={{ ...styles.socialIcon, backgroundColor: '#4267B2' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                        <div style={{ ...styles.socialIcon, backgroundColor: '#1DA1F2' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </div>
                      </div>
                      <div style={styles.monthlySpend}>
                        <div style={styles.amount}>$3,840</div>
                        <div style={styles.period}>This Month</div>
                      </div>
                      <div style={styles.budgetBar}>
                        <div style={styles.budgetProgress}></div>
                      </div>
                    </div>

                    {/* Right side - Budget and Chart */}
                    <div style={styles.rightPanel}>
                      <div style={styles.budgetSection}>
                        <div style={styles.budgetLabel}>Budget</div>
                        <div style={styles.budgetAmount}>$5,200</div>
                        <div style={styles.budgetPeriod}>This Month</div>
                      </div>
                      
                      {/* Donut Chart */}
                      <div style={styles.chartContainer}>
                        <svg width="60" height="60" style={styles.donutChart}>
                          <circle cx="30" cy="30" r="25" fill="none" stroke="#1a1a1a" strokeWidth="6"/>
                          <circle 
                            cx="30" 
                            cy="30" 
                            r="25" 
                            fill="none" 
                            stroke="#DC143C" 
                            strokeWidth="6"
                            strokeDasharray="94"
                            strokeDashoffset="30"
                            transform="rotate(-90 30 30)"
                          />
                          <circle 
                            cx="30" 
                            cy="30" 
                            r="25" 
                            fill="none" 
                            stroke="#FF6B6B" 
                            strokeWidth="6"
                            strokeDasharray="94"
                            strokeDashoffset="60"
                            transform="rotate(-90 30 30)"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bottom section */}
                  <div style={styles.bottomSection}>
                    <div style={styles.expenseLabel}>Expense Trend</div>
                    <div style={styles.chartLine}>
                      <svg width="280" height="30">
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B0000" />
                            <stop offset="100%" stopColor="#DC143C" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M10,20 Q50,15 90,18 Q130,12 170,16 Q210,10 250,14" 
                          stroke="url(#chartGradient)" 
                          strokeWidth="2" 
                          fill="none"
                        />
                        <circle cx="250" cy="14" r="3" fill="#DC143C" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Laptop Base */}
            <div style={styles.laptopBase}>
              <div style={styles.laptopKeyboard}>
                <div style={styles.trackpad}></div>
              </div>
            </div>
          </div>

          {/* Realistic Woman Character */}
          <div style={styles.character}>
            {/* Head */}
            <div style={styles.characterHead}>
              <div style={styles.characterFace}>
                <div style={styles.characterEyes}>
                  <div style={styles.eye}></div>
                  <div style={styles.eye}></div>
                </div>
                <div style={styles.characterNose}></div>
                <div style={styles.characterMouth}></div>
              </div>
              <div style={styles.characterHair}></div>
            </div>
            
            {/* Body */}
            <div style={styles.characterBody}>
              <div style={styles.characterTorso}>
                <div style={styles.characterArm}></div>
                <div style={styles.characterHand}></div>
              </div>
            </div>
          </div>

          {/* AI Avatar Floating */}
          <div style={styles.aiAvatar}>
            <div style={styles.aiAvatarCircle}>
              <div style={styles.aiAvatarIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#DC143C">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Choose LynqAI?</h2>
        <div style={styles.featureGrid}>
          {[
            {
              emoji: '🤖',
              title: 'AI-Powered Insights',
              text: 'Get real-time, intelligent suggestions based on your spending patterns.',
            },
            {
              emoji: '📈',
              title: 'Real-Time Budget Tracking',
              text: 'Visualize and manage your budget as it updates live.',
            },
            {
              emoji: '💡',
              title: 'Personalized Money Guidance',
              text: 'Your financial coach, tailored just for you by AI.',
            },
          ].map(({ emoji, title, text }, i) => (
            <div key={i} style={styles.featureCard}>
              <span style={styles.emoji}>{emoji}</span>
              <h3 style={styles.featureTitle}>{title}</h3>
              <p style={styles.featureText}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes wave {
          0% { transform: translateX(-50px); }
          100% { transform: translateX(50px); }
        }
        
        @keyframes screenGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(220, 20, 60, 0.3); }
          50% { box-shadow: 0 0 30px rgba(220, 20, 60, 0.5); }
        }
        
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 0, 0, 0.6);
        }
        
        .feature-card {
          transition: all 0.3s ease;
        }
        
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(220, 20, 60, 0.4);
        }
      `}</style>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: '#000000',
    background: 'linear-gradient(135deg, #000000 0%, #1a0000 30%, #330000 70%, #000000 100%)',
    color: '#ffffff',
    fontFamily: "'Inter', sans-serif",
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    opacity: 0.7,
  },
  animatedPath: {
    animation: 'wave 12s ease-in-out infinite alternate',
  },
  hero: {
    position: 'relative',
    zIndex: 2,
    padding: '4rem 2rem',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontSize: '4.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    margin: '0 0 1rem 0',
    textShadow: '0 0 20px rgba(220, 20, 60, 0.8)',
  },
  ai: {
    color: '#DC143C',
    textShadow: '0 0 30px #DC143C',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#cccccc',
    marginBottom: '2.5rem',
    fontWeight: 400,
  },
  getStarted: {
    padding: '1.2rem 3rem',
    backgroundColor: '#8B0000',
    color: '#fff',
    fontSize: '1.1rem',
    border: '2px solid #DC143C',
    borderRadius: '30px',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(139, 0, 0, 0.5)',
  },
  illustrationContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '900px',
    height: '450px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  laptop: {
    position: 'relative',
    zIndex: 3,
    marginRight: '3rem',
    perspective: '1000px',
  },
  laptopLid: {
    width: '380px',
    height: '240px',
    backgroundColor: '#1a1a1a',
    borderRadius: '15px 15px 0 0',
    border: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)',
    transform: 'rotateX(-10deg)',
    transformOrigin: 'bottom',
  },
  laptopBrand: {
    color: '#DC143C',
    fontSize: '1.2rem',
    fontWeight: 700,
    letterSpacing: '2px',
  },
  laptopScreen: {
    width: '380px',
    height: '240px',
    backgroundColor: '#000000',
    borderRadius: '10px',
    padding: '8px',
    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
    animation: 'screenGlow 3s ease-in-out infinite',
  },
  screenBezel: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
    borderRadius: '5px',
    position: 'relative',
    overflow: 'hidden',
  },
  webcam: {
    width: '8px',
    height: '8px',
    backgroundColor: '#333',
    borderRadius: '50%',
    position: 'absolute',
    top: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: '0 0 3px rgba(220, 20, 60, 0.5)',
  },
  dashboard: {
    width: '100%',
    height: '100%',
    padding: '15px',
    fontSize: '0.75rem',
    color: '#fff',
  },
  dashboardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '15px',
    paddingBottom: '8px',
    borderBottom: '1px solid #333',
  },
  windowControls: {
    display: 'flex',
    gap: '6px',
  },
  windowButton: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#666',
  },
  aiAssistantLabel: {
    color: '#DC143C',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  dashboardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '15px',
  },
  leftPanel: {
    flex: 1,
    paddingRight: '15px',
  },
  socialIcons: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  socialIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthlySpend: {
    marginBottom: '10px',
  },
  amount: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#fff',
  },
  period: {
    fontSize: '0.7rem',
    color: '#999',
  },
  budgetBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#333',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  budgetProgress: {
    width: '70%',
    height: '100%',
    backgroundColor: '#DC143C',
    borderRadius: '4px',
  },
  rightPanel: {
    flex: 1,
    textAlign: 'right',
  },
  budgetSection: {
    marginBottom: '15px',
  },
  budgetLabel: {
    fontSize: '0.75rem',
    color: '#999',
    marginBottom: '4px',
  },
  budgetAmount: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '2px',
  },
  budgetPeriod: {
    fontSize: '0.65rem',
    color: '#999',
  },
  chartContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  donutChart: {
    animation: 'float 4s ease-in-out infinite',
  },
  bottomSection: {
    marginTop: '10px',
  },
  expenseLabel: {
    fontSize: '0.75rem',
    color: '#999',
    marginBottom: '8px',
    textAlign: 'left',
  },
  chartLine: {
    height: '30px',
  },
  laptopBase: {
    width: '400px',
    height: '25px',
    backgroundColor: '#2a2a2a',
    borderRadius: '0 0 25px 25px',
    marginTop: '-10px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
    position: 'relative',
  },
  laptopKeyboard: {
    position: 'absolute',
    top: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '300px',
    height: '15px',
    backgroundColor: '#1a1a1a',
    borderRadius: '3px',
  },
  trackpad: {
    position: 'absolute',
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '8px',
    backgroundColor: '#333',
    borderRadius: '4px',
  },
  character: {
    position: 'relative',
    zIndex: 4,
    marginLeft: '2rem',
    animation: 'float 5s ease-in-out infinite',
  },
  characterHead: {
    position: 'relative',
    width: '70px',
    height: '85px',
    marginBottom: '10px',
  },
  characterFace: {
    width: '60px',
    height: '75px',
    backgroundColor: '#d4a574',
    borderRadius: '30px 30px 25px 25px',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  },
  characterEyes: {
    position: 'absolute',
    top: '22px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '12px',
  },
  eye: {
    width: '8px',
    height: '10px',
    backgroundColor: '#2c2c2c',
    borderRadius: '50%',
  },
  characterNose: {
    position: 'absolute',
    top: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '3px',
    height: '6px',
    backgroundColor: '#c49464',
    borderRadius: '2px',
  },
  characterMouth: {
    position: 'absolute',
    top: '42px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '12px',
    height: '3px',
    backgroundColor: '#DC143C',
    borderRadius: '2px',
  },
  characterHair: {
    position: 'absolute',
    top: '-8px',
    left: '8px',
    width: '45px',
    height: '35px',
    backgroundColor: '#654321',
    borderRadius: '25px 25px 0 0',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
  },
  characterBody: {
    position: 'relative',
  },
  characterTorso: {
    width: '90px',
    height: '120px',
    backgroundColor: '#8B0000',
    borderRadius: '25px',
    position: 'relative',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    border: '2px solid #DC143C',
  },
  characterArm: {
    position: 'absolute',
    right: '-25px',
    top: '25px',
    width: '35px',
    height: '12px',
    backgroundColor: '#d4a574',
    borderRadius: '6px',
    transform: 'rotate(-25deg)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
  characterHand: {
    position: 'absolute',
    right: '-40px',
    top: '30px',
    width: '15px',
    height: '15px',
    backgroundColor: '#d4a574',
    borderRadius: '50%',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
  aiAvatar: {
    position: 'absolute',
    top: '50px',
    right: '120px',
    zIndex: 5,
    animation: 'pulse 3s ease-in-out infinite',
  },
  aiAvatarCircle: {
    width: '70px',
    height: '70px',
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
    border: '2px solid #DC143C',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 25px rgba(220, 20, 60, 0.6)',
    backdropFilter: 'blur(5px)',
  },
  aiAvatarIcon: {
    fontSize: '1.5rem',
  },
  features: {
    position: 'relative',
    zIndex: 2,
    padding: '4rem 2rem',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    marginBottom: '3rem',
    fontWeight: 600,
    color: '#fff',
    textShadow: '0 0 10px rgba(220, 20, 60, 0.5)',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(220, 20, 60, 0.3)',
    padding: '2.5rem',
    borderRadius: '20px',
    textAlign: 'center',
    cursor: 'default',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  },
  emoji: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#fff',
  },
  featureText: {
    color: '#cccccc',
    lineHeight: 1.6,
  },
};

export default LandingPage;