import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  CreditCard, 
  TrendingUp, 
  Home, 
  Car, 
  Shield, 
  Banknote,
  Clock,
  Star,
  Filter,
  Heart,
  ArrowRight,
  Info,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const Offers = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [savedOffers, setSavedOffers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [userCreditScore, setUserCreditScore] = useState(null);
  const [eligibilityScore, setEligibilityScore] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);

  const categories = [
    { id: 'all', label: 'All Offers', icon: <Gift size={16} /> },
    { id: 'credit-cards', label: 'Credit Cards', icon: <CreditCard size={16} /> },
    { id: 'home-loans', label: 'Home Loans', icon: <Home size={16} /> },
    { id: 'vehicle-finance', label: 'Vehicle Finance', icon: <Car size={16} /> },
    { id: 'personal-loans', label: 'Personal Loans', icon: <Banknote size={16} /> },
    { id: 'investments', label: 'Investments', icon: <TrendingUp size={16} /> },
    { id: 'insurance', label: 'Insurance', icon: <Shield size={16} /> }
  ];

  const sortOptions = [
    { id: 'relevance', label: 'Most Relevant' },
    { id: 'approval', label: 'Highest Approval Chance' },
    { id: 'rate', label: 'Best Rate' },
    { id: 'expiry', label: 'Ending Soon' }
  ];

  // API Functions
  const fetchOffers = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('Not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/offers?category=${selectedFilter}&sortBy=${sortBy}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();
      if (response.ok) {
        setOffers(data.offers || []);
        setUserCreditScore(data.userCreditScore);
        setEligibilityScore(data.eligibilityScore);
        setTotalBalance(data.totalBalance);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch offers');
      }
    } catch (err) {
      setError('Server connection failed');
      console.error('Fetch offers error:', err);
    }
  };

  const fetchSavedOffers = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/offers/saved', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSavedOffers(data.savedOffers || []);
      }
    } catch (err) {
      console.error('Fetch saved offers error:', err);
    }
  };

  const fetchApplications = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/offers/applications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Fetch applications error:', err);
    }
  };

  const handleSaveOffer = async (offerId) => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/offers/${offerId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        if (data.saved) {
          setSavedOffers(prev => [...prev, offerId]);
        } else {
          setSavedOffers(prev => prev.filter(id => id !== offerId));
        }
      }
    } catch (err) {
      console.error('Save offer error:', err);
    }
  };

  const handleApplyOffer = async (offerId) => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/offers/${offerId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Application submitted successfully! Application ID: ${data.applicationId}`);
        fetchApplications(); // Refresh applications
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Apply offer error:', err);
      alert('Failed to submit application');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchOffers(),
      fetchSavedOffers(),
      fetchApplications()
    ]);
    setLoading(false);
  };

  // Load data on component mount and filter/sort changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOffers(),
        fetchSavedOffers(),
        fetchApplications()
      ]);
      setLoading(false);
    };

    loadData();
  }, [selectedFilter, sortBy]);

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getBadgeStyle = (color) => {
    const styles = {
      green: { backgroundColor: '#10b981', color: 'white' },
      blue: { backgroundColor: '#3b82f6', color: 'white' },
      purple: { backgroundColor: '#8b5cf6', color: 'white' },
      orange: { backgroundColor: '#f59e0b', color: 'white' },
      red: { backgroundColor: '#ef4444', color: 'white' },
      teal: { backgroundColor: '#14b8a6', color: 'white' },
      yellow: { backgroundColor: '#eab308', color: 'black' }
    };
    return styles[color] || styles.blue;
  };

  const getApprovalColor = (chance) => {
    if (chance >= 90) return '#10b981';
    if (chance >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const isOfferApplied = (offerId) => {
    return applications.some(app => app.offer_id === offerId);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#8A1F2C' }} />
          <p style={{ color: '#cbd5e1' }}>Loading personalized offers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle className="w-8 h-8 mx-auto mb-4" style={{ color: '#EF4444' }} />
          <p style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={refreshData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8A1F2C',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 8px 0' }}>
          Personalized Offers for You
        </h2>
        <p style={{ fontSize: '18px', color: '#b3b3b3', margin: '0 0 16px 0' }}>
          Based on your {userCreditScore ? `excellent credit score of ${userCreditScore}` : 'financial profile'}, you qualify for our best rates
        </p>
        
        {/* User Stats */}
        {eligibilityScore && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px', 
            flexWrap: 'wrap',
            marginTop: '16px'
          }}>
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#2a2a2a', 
              borderRadius: '8px',
              border: '1px solid #404040'
            }}>
              <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Credit Score</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                {userCreditScore}
              </div>
            </div>
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#2a2a2a', 
              borderRadius: '8px',
              border: '1px solid #404040'
            }}>
              <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Eligibility Score</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#3b82f6' }}>
                {eligibilityScore}/100
              </div>
            </div>
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#2a2a2a', 
              borderRadius: '8px',
              border: '1px solid #404040'
            }}>
              <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Total Balance</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffffff' }}>
                R{totalBalance?.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Sort */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Filter size={20} color="#b3b3b3" />
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedFilter(category.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                border: selectedFilter === category.id ? '1px solid #8A1F2C' : '1px solid #404040',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: selectedFilter === category.id ? '#dc2626' : '#2a2a2a',
                color: selectedFilter === category.id ? 'white' : '#b3b3b3',
                transition: 'all 0.2s'
              }}
            >
              {category.icon}
              {category.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #404040',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          
          <button
            onClick={refreshData}
            disabled={loading}
            style={{
              padding: '8px 12px',
              backgroundColor: '#8A1F2C',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Offers Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {offers.map((offer) => {
          const daysLeft = getDaysUntilExpiry(offer.expiryDate);
          const isApplied = isOfferApplied(offer.id);
          
          return (
            <div
              key={offer.id}
              style={{
                border: '1px solid #404040',
                borderRadius: '16px',
                padding: '24px',
                backgroundColor: '#2a2a2a',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(220, 38, 38, 0.3)';
                e.currentTarget.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = '#404040';
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#404040', 
                    borderRadius: '12px',
                    color: '#dc2626'
                  }}>
                    {offer.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
                      {offer.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#b3b3b3', fontWeight: '500' }}>
                      {offer.provider}
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span 
                    style={{
                      ...getBadgeStyle(offer.badgeColor),
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    {offer.badge}
                  </span>
                  <button
                    onClick={() => handleSaveOffer(offer.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#404040'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <Heart 
                      size={18} 
                      color={savedOffers.includes(offer.id) ? '#dc2626' : '#b3b3b3'}
                      fill={savedOffers.includes(offer.id) ? '#dc2626' : 'none'}
                    />
                  </button>
                </div>
              </div>

              {/* Applied Status */}
              {isApplied && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 12px',
                  backgroundColor: '#10b981',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <CheckCircle size={16} color="#ffffff" />
                  <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '500' }}>
                    Application Submitted
                  </span>
                </div>
              )}

              {/* Description */}
              <p style={{ color: '#d1d5db', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                {offer.description}
              </p>

              {/* Key Details */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '12px', 
                marginBottom: '16px',
                padding: '16px',
                backgroundColor: '#1a1a1a',
                borderRadius: '8px',
                border: '1px solid #404040'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: '500' }}>Rate/Price</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{offer.interestRate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: '500' }}>Annual Fee</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{offer.annualFee}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: '500' }}>Requirements</div>
                  <div style={{ fontSize: '14px', color: '#d1d5db' }}>{offer.requirements}</div>
                </div>
              </div>

              {/* Approval Chance */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: '500' }}>Approval Chance</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: getApprovalColor(offer.approvalChance) }}>
                    {offer.approvalChance}%
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#404040', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${offer.approvalChance}%`, 
                      height: '100%', 
                      backgroundColor: getApprovalColor(offer.approvalChance),
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* Benefits */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#b3b3b3', fontWeight: '500', marginBottom: '8px' }}>Key Benefits</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {offer.benefits.map((benefit, index) => (
                    <span 
                      key={index}
                      style={{
                        fontSize: '12px',
                        padding: '4px 8px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        borderRadius: '12px',
                        border: '1px solid #8A1F2C'
                      }}
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expiry Warning */}
              {daysLeft <= 7 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 12px',
                  backgroundColor: '#dc2626',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <Clock size={16} color="#ffffff" />
                  <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '500' }}>
                    Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => handleApplyOffer(offer.id)}
                  disabled={isApplied}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: isApplied ? '#6b7280' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isApplied ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background-color 0.2s',
                    opacity: isApplied ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isApplied) {
                      e.target.style.backgroundColor = '#b91c1c';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isApplied) {
                      e.target.style.backgroundColor = '#dc2626';
                    }
                  }}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle size={16} />
                      Applied
                    </>
                  ) : (
                    <>
                      Apply Now
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <button
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #8A1F2C',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#dc2626';
                  }}
                >
                  <Info size={16} />
                  Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No offers message */}
      {offers.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px', 
          color: '#b3b3b3' 
        }}>
          <Gift size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>No offers found</h3>
          <p style={{ margin: 0 }}>Try adjusting your filters to see more offers.</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '48px', 
        padding: '24px', 
        backgroundColor: '#2a2a2a', 
        borderRadius: '12px',
        textAlign: 'center',
        border: '1px solid #404040'
      }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#d1d5db' }}>
          💡 <strong style={{ color: '#dc2626' }}>Pro Tip:</strong> Your {userCreditScore ? `credit score of ${userCreditScore}` : 'excellent financial profile'} qualifies you for premium offers with the best rates.
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#b3b3b3' }}>
          Offers are personalized based on your financial profile and updated in real-time.
        </p>
        {eligibilityScore && (
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#b3b3b3' }}>
            Your eligibility score: <strong style={{ color: '#3b82f6' }}>{eligibilityScore}/100</strong>
          </p>
        )}
      </div>
    </div>
  );
};

export default Offers;