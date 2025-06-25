import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Info, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  BarChart3,
  Target,
  Bell,
  Calendar,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/CreditHealth.css';

const CreditHealth = () => {
  const [creditData, setCreditData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('12months');

  // Fetch credit health data
  const fetchCreditHealth = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('Not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/credit-health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setCreditData(data);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch credit health data');
      }
    } catch (err) {
      setError('Server connection failed');
      console.error('Fetch credit health error:', err);
    }
  };

  // Fetch credit score trends
  const fetchTrends = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/credit-health/trends?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setTrends(data.trends || []);
      }
    } catch (err) {
      console.error('Fetch trends error:', err);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/credit-health/alerts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error('Fetch alerts error:', err);
    }
  };

  // Refresh credit score
  const refreshCreditScore = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    setRefreshing(true);
    try {
      const response = await fetch('http://localhost:3001/api/credit-health/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Credit score updated! New score: ${data.newScore} (${data.change >= 0 ? '+' : ''}${data.change} points)`);
        await fetchCreditHealth();
        await fetchTrends();
      } else {
        alert(data.error || 'Failed to refresh credit score');
      }
    } catch (err) {
      console.error('Refresh credit score error:', err);
      alert('Failed to refresh credit score');
    } finally {
      setRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCreditHealth(),
        fetchTrends(),
        fetchAlerts()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Reload trends when period changes
  useEffect(() => {
    fetchTrends();
  }, [selectedPeriod]);

  const getCreditRating = (score) => {
    if (score >= 800) return { rating: 'Exceptional', color: '#10b981', description: 'You have excellent credit!' };
    if (score >= 750) return { rating: 'Excellent', color: '#10b981', description: 'You have excellent credit!' };
    if (score >= 700) return { rating: 'Good', color: '#3b82f6', description: 'You have good credit.' };
    if (score >= 650) return { rating: 'Fair', color: '#f59e0b', description: 'Your credit is fair.' };
    if (score >= 600) return { rating: 'Poor', color: '#ef4444', description: 'Your credit needs improvement.' };
    return { rating: 'Very Poor', color: '#dc2626', description: 'Your credit needs significant improvement.' };
  };

  const getFactorColor = (factor, value) => {
    switch (factor) {
      case 'utilization':
        if (value <= 10) return '#10b981';
        if (value <= 30) return '#f59e0b';
        return '#ef4444';
      case 'payment':
        if (value >= 98) return '#10b981';
        if (value >= 90) return '#f59e0b';
        return '#ef4444';
      case 'age':
        if (value >= 24) return '#10b981';
        if (value >= 12) return '#f59e0b';
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-blue-500" />;
    }
  };

  // Prepare pie chart data for factors
  const factorChartData = creditData ? [
    { name: 'Payment History', value: creditData.factors.onTimePaymentRate, color: getFactorColor('payment', creditData.factors.onTimePaymentRate) },
    { name: 'Credit Utilization', value: 100 - creditData.factors.creditUtilization, color: getFactorColor('utilization', creditData.factors.creditUtilization) },
    { name: 'Credit Mix', value: creditData.factors.creditMixScore, color: '#8b5cf6' },
    { name: 'Account Age', value: Math.min(100, creditData.factors.avgAccountAge * 2), color: getFactorColor('age', creditData.factors.avgAccountAge) }
  ] : [];

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
          <p style={{ color: '#cbd5e1' }}>Loading your credit health data...</p>
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
            onClick={() => window.location.reload()}
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

  const creditRating = creditData ? getCreditRating(creditData.creditScore) : null;

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link 
          to="/Dashboard" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#8A1F2C',
            textDecoration: 'none',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity size={32} style={{ color: '#8A1F2C' }} />
              Credit Health Overview
            </h2>
            <p style={{ color: '#b3b3b3', margin: 0 }}>
              Monitor and improve your credit score with personalized insights
            </p>
          </div>
          
          <button 
            onClick={refreshCreditScore}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#8A1F2C',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: refreshing ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Updating...' : 'Update Score'}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={20} />
            Recent Alerts
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {alerts.slice(0, 3).map((alert, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  border: `1px solid ${alert.type === 'positive' ? '#10b981' : alert.type === 'negative' ? '#ef4444' : '#3b82f6'}`
                }}
              >
                {alert.type === 'positive' ? <TrendingUp size={18} style={{ color: '#10b981' }} /> :
                 alert.type === 'negative' ? <TrendingDown size={18} style={{ color: '#ef4444' }} /> :
                 alert.type === 'warning' ? <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> :
                 <Info size={18} style={{ color: '#3b82f6' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{alert.title}</div>
                  <div style={{ fontSize: '12px', color: '#b3b3b3' }}>{alert.message}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {new Date(alert.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Score Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        {/* Main Credit Score */}
        <div style={{
          gridColumn: 'span 2',
          padding: '32px',
          backgroundColor: '#2a2a2a',
          borderRadius: '16px',
          border: '1px solid #404040',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #2a2a2a, #1a1a1a)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Your Credit Score</h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: creditRating?.color || '#ffffff'
            }}>
              {creditData?.creditScore || '---'}
            </div>
            {creditData?.creditTrend && getTrendIcon(creditData.creditTrend)}
          </div>
          
          {creditRating && (
            <>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: creditRating.color,
                marginBottom: '8px'
              }}>
                {creditRating.rating}
              </div>
              <p style={{ color: '#b3b3b3', margin: '0 0 16px 0' }}>
                {creditRating.description}
              </p>
            </>
          )}
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px',
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Health Grade</div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: creditData?.healthScore >= 80 ? '#10b981' : creditData?.healthScore >= 60 ? '#f59e0b' : '#ef4444'
              }}>
                {creditData?.healthGrade || 'N/A'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Health Score</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {creditData?.healthScore || 0}/100
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Last Updated</div>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>
                {creditData?.lastUpdated ? new Date(creditData.lastUpdated).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Credit Utilization */}
        <div style={{
          padding: '24px',
          backgroundColor: '#2a2a2a',
          borderRadius: '16px',
          border: '1px solid #404040'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CreditCard size={24} style={{ color: getFactorColor('utilization', creditData?.factors.creditUtilization || 0) }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Credit Utilization</h4>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: getFactorColor('utilization', creditData?.factors.creditUtilization || 0) }}>
                {creditData?.factors.creditUtilization || 0}%
              </span>
              <span style={{ fontSize: '12px', color: '#b3b3b3' }}>
                of R{creditData?.utilization.limit?.toLocaleString() || '0'} limit
              </span>
            </div>
            
            <div style={{ width: '100%', height: '8px', backgroundColor: '#404040', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${Math.min(creditData?.factors.creditUtilization || 0, 100)}%`, 
                  height: '100%', 
                  backgroundColor: getFactorColor('utilization', creditData?.factors.creditUtilization || 0),
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
          
          <div style={{ fontSize: '12px', color: '#b3b3b3' }}>
            Used: R{creditData?.utilization.used?.toLocaleString() || '0'}
          </div>
          <p style={{ fontSize: '12px', color: '#d1d5db', margin: '8px 0 0 0' }}>
            💡 Keep utilization under 30% for optimal credit health
          </p>
        </div>

        {/* Payment History */}
        <div style={{
          padding: '24px',
          backgroundColor: '#2a2a2a',
          borderRadius: '16px',
          border: '1px solid #404040'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <ShieldCheck size={24} style={{ color: getFactorColor('payment', creditData?.factors.onTimePaymentRate || 0) }} />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Payment History</h4>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: getFactorColor('payment', creditData?.factors.onTimePaymentRate || 0), marginBottom: '8px' }}>
              {creditData?.factors.onTimePaymentRate || 0}%
            </div>
            
            <div style={{ width: '100%', height: '8px', backgroundColor: '#404040', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${creditData?.factors.onTimePaymentRate || 0}%`, 
                  height: '100%', 
                  backgroundColor: getFactorColor('payment', creditData?.factors.onTimePaymentRate || 0),
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
          
          <p style={{ fontSize: '12px', color: '#d1d5db', margin: 0 }}>
            On-time payments
          </p>
          <p style={{ fontSize: '12px', color: '#d1d5db', margin: '8px 0 0 0' }}>
            💡 Payment history is 35% of your credit score
          </p>
        </div>
      </div>

      {/* Credit Score Trends */}
      {trends.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} />
              Credit Score Trends
            </h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #404040',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '14px'
              }}
            >
              <option value="6months">6 Months</option>
              <option value="12months">12 Months</option>
              <option value="24months">24 Months</option>
            </select>
          </div>
          
          <div style={{
            padding: '24px',
            backgroundColor: '#2a2a2a',
            borderRadius: '16px',
            border: '1px solid #404040'
          }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis 
                  dataKey="date" 
                  stroke="#b3b3b3"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                />
                <YAxis 
                  stroke="#b3b3b3"
                  tick={{ fontSize: 12 }}
                  domain={['dataMin - 20', 'dataMax + 20']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [value, 'Credit Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8A1F2C" 
                  strokeWidth={3}
                  dot={{ fill: '#8A1F2C', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8A1F2C', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Credit Factors Breakdown */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px', 
        marginBottom: '32px' 
      }}>
        {/* Factors Chart */}
        <div style={{
          padding: '24px',
          backgroundColor: '#2a2a2a',
          borderRadius: '16px',
          border: '1px solid #404040'
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Credit Factors</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={factorChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {factorChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Account Summary */}
        <div style={{
          padding: '24px',
          backgroundColor: '#2a2a2a',
          borderRadius: '16px',
          border: '1px solid #404040'
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} />
            Account Summary
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#b3b3b3', fontSize: '14px' }}>Total Accounts:</span>
              <span style={{ fontWeight: '600' }}>{creditData?.accounts.total || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#b3b3b3', fontSize: '14px' }}>Credit Accounts:</span>
              <span style={{ fontWeight: '600' }}>{creditData?.accounts.credit || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#b3b3b3', fontSize: '14px' }}>Avg Account Age:</span>
              <span style={{ fontWeight: '600' }}>{creditData?.factors.avgAccountAge || 0} months</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#b3b3b3', fontSize: '14px' }}>Recent Inquiries:</span>
              <span style={{ fontWeight: '600', color: creditData?.factors.recentInquiries > 3 ? '#ef4444' : '#10b981' }}>
                {creditData?.factors.recentInquiries || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {creditData?.recommendations && creditData.recommendations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={20} />
            Personalized Recommendations
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {creditData.recommendations.map((rec, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '20px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '12px',
                  border: `1px solid ${rec.type === 'urgent' ? '#ef4444' : rec.type === 'warning' ? '#f59e0b' : rec.type === 'success' ? '#10b981' : '#3b82f6'}`
                }}
              >
                <div style={{ flexShrink: 0 }}>
                  {getRecommendationIcon(rec.type)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{rec.title}</h4>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: rec.impact === 'High' ? '#ef4444' : rec.impact === 'Medium' ? '#f59e0b' : '#10b981',
                      color: 'white'
                    }}>
                      {rec.impact} Impact
                    </span>
                  </div>
                  
                  <p style={{ margin: '0 0 12px 0', color: '#d1d5db', fontSize: '14px' }}>
                    {rec.description}
                  </p>
                  
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#1a1a1a', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#e5e7eb'
                  }}>
                    <strong>Action:</strong> {rec.action}
                  </div>
                </div>
                
                <div style={{ flexShrink: 0, fontSize: '24px' }}>
                  {rec.icon}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Tips */}
      <div style={{
        padding: '24px',
        backgroundColor: '#2a2a2a',
        borderRadius: '16px',
        border: '1px solid #404040'
      }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} />
          Credit Health Tips
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#10b981', fontSize: '14px' }}>💡 Payment History</h5>
            <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db' }}>
              Always pay at least the minimum amount on time. Set up automatic payments to never miss a due date.
            </p>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#3b82f6', fontSize: '14px' }}>💡 Credit Utilization</h5>
            <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db' }}>
              Keep your credit utilization below 30% of your total limit, ideally under 10% for the best scores.
            </p>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#f59e0b', fontSize: '14px' }}>💡 Credit Applications</h5>
            <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db' }}>
              Avoid applying for multiple credit accounts in a short period. Space out applications by at least 6 months.
            </p>
          </div>
          
          <div style={{ padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#8b5cf6', fontSize: '14px' }}>💡 Account Age</h5>
            <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db' }}>
              Keep older accounts open to maintain a longer average credit history, even if you don't use them often.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditHealth;