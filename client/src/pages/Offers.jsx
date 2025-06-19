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
  Info
} from 'lucide-react';

const Offers = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [savedOffers, setSavedOffers] = useState([]);
  const [userCreditScore] = useState(750); // Mock user credit score

  // Comprehensive South African financial offers
  const allOffers = [
    {
      id: 1,
      icon: <CreditCard size={28} />,
      title: 'FNB Premier Credit Card',
      description: 'Premium rewards card with airport lounge access and comprehensive travel insurance.',
      category: 'credit-cards',
      badge: 'Pre-approved',
      badgeColor: 'green',
      interestRate: '19.75%',
      annualFee: 'R0 first year',
      requirements: 'Min income: R30,000/month',
      expiryDate: '2025-07-15',
      approvalChance: 95,
      benefits: ['Airport lounge access', 'Travel insurance', 'Concierge service'],
      provider: 'FNB'
    },
    {
      id: 2,
      icon: <Home size={28} />,
      title: 'Standard Bank Home Loan',
      description: 'Competitive home loan rates with flexible repayment options.',
      category: 'home-loans',
      badge: 'Best Rate',
      badgeColor: 'blue',
      interestRate: '11.5%',
      annualFee: 'No fees',
      requirements: 'Min income: R25,000/month',
      expiryDate: '2025-12-31',
      approvalChance: 88,
      benefits: ['No transfer fees', 'Flexible repayment', 'Free bond origination'],
      provider: 'Standard Bank'
    },
    {
      id: 3,
      icon: <Car size={28} />,
      title: 'Nedbank Vehicle Finance',
      description: 'Finance your dream car with competitive rates and flexible terms.',
      category: 'vehicle-finance',
      badge: 'Special Rate',
      badgeColor: 'purple',
      interestRate: '12.25%',
      annualFee: 'R99/month',
      requirements: 'Min income: R15,000/month',
      expiryDate: '2025-08-30',
      approvalChance: 92,
      benefits: ['Up to 84 months terms', 'Balloon payment options', 'Insurance included'],
      provider: 'Nedbank'
    },
    {
      id: 4,
      icon: <TrendingUp size={28} />,
      title: 'Investec Investment Account',
      description: 'High-yield investment account with no minimum balance requirements.',
      category: 'investments',
      badge: 'New',
      badgeColor: 'orange',
      interestRate: '8.5% p.a.',
      annualFee: 'R0',
      requirements: 'Min deposit: R1,000',
      expiryDate: '2025-09-15',
      approvalChance: 98,
      benefits: ['No minimum balance', 'Daily compounding', 'Online access'],
      provider: 'Investec'
    },
    {
      id: 5,
      icon: <Banknote size={28} />,
      title: 'Absa Personal Loan',
      description: 'Quick personal loan approval with funds available within 48 hours.',
      category: 'personal-loans',
      badge: 'Fast Approval',
      badgeColor: 'red',
      interestRate: '15.5%',
      annualFee: 'No fees',
      requirements: 'Min income: R8,000/month',
      expiryDate: '2025-07-31',
      approvalChance: 85,
      benefits: ['48-hour approval', 'No collateral needed', 'Flexible terms'],
      provider: 'Absa'
    },
    {
      id: 6,
      icon: <Shield size={28} />,
      title: 'Discovery Life Insurance',
      description: 'Comprehensive life cover with Vitality rewards and health benefits.',
      category: 'insurance',
      badge: 'Exclusive',
      badgeColor: 'teal',
      interestRate: 'From R180/month',
      annualFee: 'R0',
      requirements: 'Age 18-65',
      expiryDate: '2025-11-30',
      approvalChance: 90,
      benefits: ['Vitality rewards', 'Health screening', 'Premium discounts'],
      provider: 'Discovery'
    },
    {
      id: 7,
      icon: <Gift size={28} />,
      title: 'Capitec Cashback Credit Card',
      description: 'Earn up to 5% cashback on all purchases with no spending caps.',
      category: 'credit-cards',
      badge: 'Popular',
      badgeColor: 'yellow',
      interestRate: '18.25%',
      annualFee: 'R99/year',
      requirements: 'Min income: R12,000/month',
      expiryDate: '2025-08-15',
      approvalChance: 78,
      benefits: ['Up to 5% cashback', 'No spending caps', 'Monthly rewards'],
      provider: 'Capitec'
    },
    {
      id: 8,
      icon: <TrendingUp size={28} />,
      title: 'African Bank Fixed Deposit',
      description: 'Secure your savings with guaranteed returns and flexible terms.',
      category: 'investments',
      badge: 'Guaranteed',
      badgeColor: 'green',
      interestRate: '9.75% p.a.',
      annualFee: 'R0',
      requirements: 'Min deposit: R5,000',
      expiryDate: '2025-12-31',
      approvalChance: 100,
      benefits: ['Guaranteed returns', 'Flexible terms', 'SARB protected'],
      provider: 'African Bank'
    }
  ];

  const [offers, setOffers] = useState(allOffers);

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

  // Filter and sort offers
  useEffect(() => {
    let filteredOffers = selectedFilter === 'all' 
      ? allOffers 
      : allOffers.filter(offer => offer.category === selectedFilter);

    // Sort offers
    switch (sortBy) {
      case 'approval':
        filteredOffers.sort((a, b) => b.approvalChance - a.approvalChance);
        break;
      case 'rate':
        filteredOffers.sort((a, b) => {
          const aRate = parseFloat(a.interestRate.replace('%', '').replace(' p.a.', ''));
          const bRate = parseFloat(b.interestRate.replace('%', '').replace(' p.a.', ''));
          return aRate - bRate;
        });
        break;
      case 'expiry':
        filteredOffers.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        break;
      default:
        // Keep original order for relevance
        break;
    }

    setOffers(filteredOffers);
  }, [selectedFilter, sortBy]);

  const handleSaveOffer = (offerId) => {
    setSavedOffers(prev => 
      prev.includes(offerId) 
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

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
          ✨ Personalized Offers for You
        </h2>
        <p style={{ fontSize: '18px', color: '#b3b3b3', margin: 0 }}>
          Based on your excellent credit score of {userCreditScore}, you qualify for our best rates
        </p>
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
                border: selectedFilter === category.id ? '1px solid #dc2626' : '1px solid #404040',
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
      </div>

      {/* Offers Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px' 
      }}>
        {offers.map((offer) => {
          const daysLeft = getDaysUntilExpiry(offer.expiryDate);
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
                        border: '1px solid #dc2626'
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
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  Apply Now
                  <ArrowRight size={16} />
                </button>
                <button
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: '1px solid #dc2626',
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
      {offers.length === 0 && (
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
        💡 <strong style={{ color: '#dc2626' }}>Pro Tip:</strong> Your credit score of {userCreditScore} qualifies you for premium offers with the best rates.
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: '#b3b3b3' }}>
          Offers are updated daily. Check back regularly for new opportunities.
        </p>
      </div>
    </div>
  );
};

export default Offers;