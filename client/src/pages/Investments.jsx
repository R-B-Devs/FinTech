import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  RefreshCw,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  Info,
  ArrowLeft,
  Edit3,
  Trash2,
  DollarSign,
  Calendar,
  Award,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import '../styles/Investments.css';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [marketData, setMarketData] = useState([]);
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedPeriod, setSelectedPeriod] = useState('1year');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  // Form state
  const [investmentForm, setInvestmentForm] = useState({
    name: '',
    type: 'Mutual Fund',
    sector: 'Technology',
    purchaseValue: '',
    riskLevel: 'Medium'
  });

  // Fetch all investment data
  const fetchInvestments = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('Not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/investments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setInvestments(data.investments || []);
        setMetrics(data.metrics);
        setRecommendations(data.recommendations || []);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch investment data');
      }
    } catch (err) {
      setError('Server connection failed');
      console.error('Fetch investments error:', err);
    }
  };

  // Fetch performance data
  const fetchPerformance = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/investments/performance?period=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setPerformance(data.performance || []);
      }
    } catch (err) {
      console.error('Fetch performance error:', err);
    }
  };

  // Fetch analysis data
  const fetchAnalysis = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/investments/analysis', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Fetch analysis error:', err);
    }
  };

  // Fetch market data
  const fetchMarketData = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/investments/market-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setMarketData(data.marketData || []);
      }
    } catch (err) {
      console.error('Fetch market data error:', err);
    }
  };

  // Fetch research content
  const fetchResearch = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/investments/research', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setResearch(data);
      }
    } catch (err) {
      console.error('Fetch research error:', err);
    }
  };

  // Add new investment
  const addInvestment = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    if (!investmentForm.name || !investmentForm.purchaseValue) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/investments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(investmentForm)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Investment added successfully!');
        setShowAddForm(false);
        setInvestmentForm({
          name: '',
          type: 'Mutual Fund',
          sector: 'Technology',
          purchaseValue: '',
          riskLevel: 'Medium'
        });
        await fetchInvestments();
      } else {
        alert(data.error || 'Failed to add investment');
      }
    } catch (err) {
            console.error('Add investment error:', err);
      alert('Failed to add investment');
    }
  };

  // Update investment
  const updateInvestment = async (investmentId, updateData) => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/investments/${investmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (response.ok) {
        alert('Investment updated successfully!');
        setEditingInvestment(null);
        await fetchInvestments();
      } else {
        alert(data.error || 'Failed to update investment');
      }
    } catch (err) {
      console.error('Update investment error:', err);
      alert('Failed to update investment');
    }
  };

  // Delete investment
  const deleteInvestment = async (investmentId) => {
    if (!window.confirm('Are you sure you want to delete this investment?')) {
      return;
    }

    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/investments/${investmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert('Investment deleted successfully!');
        await fetchInvestments();
      } else {
        alert(data.error || 'Failed to delete investment');
      }
    } catch (err) {
      console.error('Delete investment error:', err);
      alert('Failed to delete investment');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchInvestments(),
        fetchPerformance(),
        fetchAnalysis(),
        fetchMarketData(),
        fetchResearch()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Reload performance when period changes
  useEffect(() => {
    fetchPerformance();
  }, [selectedPeriod]);

  const getChangeColor = (change) => {
    return change >= 0 ? '#10b981' : '#ef4444';
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />;
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Colors for charts
  const COLORS = ['#8A1F2C', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

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
          <p style={{ color: '#cbd5e1' }}>Loading your investment portfolio...</p>
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
              <BarChart2 size={32} style={{ color: '#8A1F2C' }} />
              Investment Portfolio
            </h2>
            <p style={{ color: '#b3b3b3', margin: 0 }}>
              Track and manage your investment portfolio performance
            </p>
          </div>
          
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#8A1F2C',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <Plus size={16} />
            Add Investment
          </button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      {metrics && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid #404040'
          }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <DollarSign size={20} style={{ color: '#8A1F2C' }} />
              <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Total Value</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
              R{metrics.totalValue?.toLocaleString() || '0'}
            </div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid #404040'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              {getChangeIcon(metrics.totalGainLoss)}
              <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Total Gain/Loss</span>
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: getChangeColor(metrics.totalGainLoss)
            }}>
              {metrics.totalGainLoss >= 0 ? '+' : ''}R{metrics.totalGainLoss?.toLocaleString() || '0'}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: getChangeColor(metrics.totalReturnPercent)
            }}>
              {metrics.totalReturnPercent >= 0 ? '+' : ''}{metrics.totalReturnPercent?.toFixed(2) || '0'}%
            </div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid #404040'
          }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={20} style={{ color: '#3b82f6' }} />
              <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Daily Change</span>
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: getChangeColor(metrics.dailyChange)
            }}>
              {metrics.dailyChange >= 0 ? '+' : ''}R{metrics.dailyChange?.toLocaleString() || '0'}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: getChangeColor(metrics.dailyChangePercent)
            }}>
              {metrics.dailyChangePercent >= 0 ? '+' : ''}{metrics.dailyChangePercent?.toFixed(2) || '0'}%
            </div>
          </div>

          <div style={{
            padding: '20px',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '1px solid #404040'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Target size={20} style={{ color: getRiskColor(metrics.overallRisk) }} />
              <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Risk Level</span>
            </div>
            <div style={{ 
              fontSize: '20px', 
              fontWeight: 'bold',
              color: getRiskColor(metrics.overallRisk)
            }}>
              {metrics.overallRisk}
            </div>
            <div style={{ fontSize: '12px', color: '#b3b3b3' }}>
              Diversification: {metrics.diversificationScore}/100
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '2px', backgroundColor: '#2a2a2a', borderRadius: '8px', padding: '4px' }}>
          {[
            { id: 'portfolio', label: 'Portfolio', icon: BarChart2 },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'analysis', label: 'Analysis', icon: PieChart },
            { id: 'research', label: 'Research', icon: BookOpen }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: activeTab === tab.id ? '#8A1F2C' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#b3b3b3',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s'
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Investment Form Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #404040',
            width: '100%',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              Add New Investment
            </h3>
            
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b3b3b3' }}>
                  Investment Name *
                </label>
                <input
                  type="text"
                  value={investmentForm.name}
                  onChange={(e) => setInvestmentForm({...investmentForm, name: e.target.value})}
                  placeholder="e.g., Apple Inc."
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b3b3b3' }}>
                    Type
                  </label>
                  <select
                    value={investmentForm.type}
                    onChange={(e) => setInvestmentForm({...investmentForm, type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Stocks">Stocks</option>
                    <option value="Bonds">Bonds</option>
                    <option value="REIT">REIT</option>
                    <option value="ETF">ETF</option>
                    <option value="Index Fund">Index Fund</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b3b3b3' }}>
                    Sector
                  </label>
                  <select
                    value={investmentForm.sector}
                    onChange={(e) => setInvestmentForm({...investmentForm, sector: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Financial">Financial</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Energy">Energy</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Diversified">Diversified</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b3b3b3' }}>
                    Purchase Value (R) *
                  </label>
                  <input
                    type="number"
                    value={investmentForm.purchaseValue}
                    onChange={(e) => setInvestmentForm({...investmentForm, purchaseValue: e.target.value})}
                    placeholder="10000"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#b3b3b3' }}>
                    Risk Level
                  </label>
                  <select
                    value={investmentForm.riskLevel}
                    onChange={(e) => setInvestmentForm({...investmentForm, riskLevel: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#b3b3b3',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addInvestment}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8A1F2C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Add Investment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'portfolio' && (
        <div>
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={20} />
                Investment Recommendations
              </h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '12px',
                      border: `1px solid ${rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981'}`
                    }}
                  >
                    <div style={{ fontSize: '24px' }}>{rec.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{rec.title}</div>
                      <div style={{ fontSize: '12px', color: '#b3b3b3' }}>{rec.description}</div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: rec.priority === 'high' ? '#ef4444' : rec.priority === 'medium' ? '#f59e0b' : '#10b981',
                      color: 'white',
                      textTransform: 'capitalize'
                    }}>
                      {rec.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Investments Table */}
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '16px',
            border: '1px solid #404040',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #404040' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Your Investments</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1a1a1a' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#b3b3b3' }}>
                      Investment
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#b3b3b3' }}>
                      Type
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#b3b3b3' }}>
                      Current Value
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#b3b3b3' }}>
                      Gain/Loss
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#b3b3b3' }}>
                      Return %
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#b3b3b3' }}>
                      Risk
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#b3b3b3' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment) => {
                    const gainLoss = investment.currentValue - investment.purchaseValue;
                    const returnPercent = (gainLoss / investment.purchaseValue) * 100;

                    return (
                      <tr key={investment.id} style={{ borderBottom: '1px solid #404040' }}>
                        <td style={{ padding: '16px' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{investment.name}</div>
                            <div style={{ fontSize: '12px', color: '#b3b3b3' }}>{investment.sector}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            backgroundColor: '#404040',
                            borderRadius: '12px'
                          }}>
                            {investment.type}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600' }}>
                          R{investment.currentValue.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'right', 
                          fontWeight: '600',
                          color: getChangeColor(gainLoss)
                        }}>
                          {gainLoss >= 0 ? '+' : ''}R{gainLoss.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '16px', 
                          textAlign: 'right', 
                          fontWeight: '600',
                          color: getChangeColor(returnPercent)
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                            {getChangeIcon(returnPercent)}
                            {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                          </div>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            backgroundColor: getRiskColor(investment.riskLevel),
                            borderRadius: '12px',
                            color: 'white'
                          }}>
                            {investment.riskLevel}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => setEditingInvestment(investment)}
                              style={{
                                padding: '6px',
                                backgroundColor: 'transparent',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: '#b3b3b3'
                              }}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => deleteInvestment(investment.id)}
                              style={{
                                padding: '6px',
                                backgroundColor: 'transparent',
                                border: '1px solid #ef4444',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: '#ef4444'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div>
          {/* Performance Chart */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                Portfolio Performance
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
                <option value="3months">3 Months</option>
                <option value="6months">6 Months</option>
                <option value="1year">1 Year</option>
              </select>
            </div>

            <div style={{
              padding: '24px',
              backgroundColor: '#2a2a2a',
              borderRadius: '16px',
              border: '1px solid #404040'
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#b3b3b3"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke="#b3b3b3"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value) => [`R${value.toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8A1F2C" 
                    strokeWidth={3}
                    dot={{ fill: '#8A1F2C', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#8A1F2C', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Data */}
          {marketData.length > 0 && (
            <div style={{
              padding: '24px',
              backgroundColor: '#2a2a2a',
              borderRadius: '16px',
              border: '1px solid #404040'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Market Overview</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {marketData.map((market, index) => (
                  <div key={index} style={{
                    padding: '16px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #404040'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      {market.name}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {market.price.toLocaleString()}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: getChangeColor(market.changePercent),
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {getChangeIcon(market.changePercent)}
                      {market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && analysis && (
        <div>
          {/* Allocation Charts */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px', 
            marginBottom: '24px' 
          }}>
            {/* Sector Allocation */}
            <div style={{
              padding: '24px',
              backgroundColor: '#2a2a2a',
              borderRadius: '16px',
              border: '1px solid #404040'
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Sector Allocation</h4>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={analysis.sectorAllocation}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="sector"
                  >
                    {analysis.sectorAllocation.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`R${value.toLocaleString()}`, '']} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '16px' }}>
                {analysis.sectorAllocation.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: COLORS[index % COLORS.length],
                        borderRadius: '2px'
                      }}></div>
                      <span style={{ fontSize: '12px' }}>{item.sector}</span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Allocation */}
            <div style={{
              padding: '24px',
              backgroundColor: '#2a2a2a',
              borderRadius: '16px',
              border: '1px solid #404040'
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Investment Type</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analysis.typeAllocation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#b3b3b3"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis 
                    stroke="#b3b3b3"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value) => [`${value}%`, 'Allocation']}
                  />
                  <Bar dataKey="percentage" fill="#8A1F2C" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Allocation */}
            <div style={{
              padding: '24px',
              backgroundColor: '#2a2a2a',
              borderRadius: '16px',
              border: '1px solid #404040'
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Risk Distribution</h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {analysis.riskAllocation.map((item, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>{item.risk} Risk</span>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.percentage}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#404040', borderRadius: '4px' }}>
                      <div 
                        style={{ 
                          width: `${item.percentage}%`, 
                          height: '100%', 
                          backgroundColor: getRiskColor(item.risk),
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div style={{
            padding: '24px',
            backgroundColor: '#2a2a2a',
            borderRadius: '16px',
            border: '1px solid #404040',
            marginBottom: '24px'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Performance Analysis</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                  {analysis.performance.winners}
                </div>
                <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Winning Investments</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                  {analysis.performance.losers}
                </div>
                <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Losing Investments</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                  {analysis.performance.winRate}%
                </div>
                <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Win Rate</div>
              </div>
            </div>

            {analysis.performance.bestPerformer && (
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#10b981' }}>🏆 Best Performer</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}>
                    +{analysis.performance.bestPerformer.yearlyReturn.toFixed(1)}%
                  </span>
                </div>
                <div style={{ fontSize: '14px' }}>{analysis.performance.bestPerformer.name}</div>
              </div>
            )}

            {analysis.performance.worstPerformer && (
              <div style={{ marginTop: '12px', padding: '16px', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600', color: '#ef4444' }}>📉 Needs Attention</span>
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>
                    {analysis.performance.worstPerformer.yearlyReturn.toFixed(1)}%
                  </span>
                </div>
                <div style={{ fontSize: '14px' }}>{analysis.performance.worstPerformer.name}</div>
              </div>
            )}
          </div>

          {/* Rebalancing Suggestions */}
          {analysis.rebalancingSuggestions && analysis.rebalancingSuggestions.length > 0 && (
            <div style={{
              padding: '24px',
              backgroundColor: '#2a2a2a',
              borderRadius: '16px',
              border: '1px solid #404040'
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Rebalancing Suggestions</h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                {analysis.rebalancingSuggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '16px',
                      backgroundColor: '#1a1a1a',
                      borderRadius: '8px',
                      border: '1px solid #f59e0b'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#f59e0b' }}>
                      {suggestion.type === 'reduce' ? '⚠️ Over-Concentrated' : '💡 Diversification Needed'}
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                      {suggestion.sector && `${suggestion.sector}: ${suggestion.currentPercent}% (suggest ${suggestion.suggestedPercent}%)`}
                      {suggestion.suggestion}
                    </div>
                    <div style={{ fontSize: '12px', color: '#b3b3b3' }}>
                      {suggestion.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Research Tab */}
      {activeTab === 'research' && research && (
        <div>
          {/* Market News */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Market News & Insights</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {research.news.map((article) => (
                <div 
                  key={article.id}
                  style={{
                    padding: '20px',
                    backgroundColor: '#2a2a2a',
                    borderRadius: '12px',
                    border: '1px solid #404040'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{article.title}</h4>
                    <span style={{
                      fontSize: '12px',
                      padding: '4px 8px',
                      backgroundColor: '#404040',
                      borderRadius: '12px'
                    }}>
                      {article.category}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 12px 0', color: '#d1d5db', fontSize: '14px' }}>
                    {article.summary}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#b3b3b3' }}>
                      {article.source} • {new Date(article.date).toLocaleDateString()}
                    </span>
                    <button style={{
                      padding: '6px 12px',
                      backgroundColor: '#8A1F2C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}>
                      Read More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment Insights */}
          <div style={{
            padding: '24px',
            backgroundColor: '#2a2a2a',
            borderRadius: '16px',
            border: '1px solid #404040'
          }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>Investment Insights</h4>
            <div style={{ display: 'grid', gap: '16px' }}>
              {research.insights.map((insight, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '16px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #404040'
                  }}
                >
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    color: insight.type === 'strategy' ? '#10b981' : insight.type === 'risk' ? '#f59e0b' : '#3b82f6'
                  }}>
                    {insight.type === 'strategy' ? '💡' : insight.type === 'risk' ? '⚠️' : '📚'} {insight.title}
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>
                    {insight.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;