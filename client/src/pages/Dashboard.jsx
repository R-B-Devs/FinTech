import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import "../styles/Dashboard.css";
import {
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Brain,
  Banknote,
  Wallet, 
  CreditCard, 
  PieChart, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Target, 
  Tag,
  Activity,
  Zap,
  Lock,
  Database,
  Bell,
  Settings,
  User,
  ChevronRight,
  Eye,
  EyeOff,
  Menu,
  MessageCircle,
  Phone,
  Video,
  RefreshCw,
  UserCircle,
  X,
  LogOut
} from 'lucide-react';

const timeframes = ['week', 'month', 'quarter', 'year'];

const securityMetrics = [
  { label: '2FA Status', value: 'Active' },
  { label: 'Encryption', value: '256-bit' },
  { label: 'Last Scan', value: '2 min ago' },
  { label: 'Threats', value: '0 detected' }
];

// Color palette for categories
const categoryColors = [
  '#ef4444', '#f97316', '#22c55e', '#14b8a6', 
  '#3b82f6', '#ec4899', '#8b5cf6', '#6366f1'
];

const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [aiInsightsVisible, setAiInsightsVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [financialData, setFinancialData] = useState({
    totalBalance: 0,
    investments: 0,
    creditScore: null,
    savingsGoal: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  
  // New state for dynamic data
  const [aiInsights, setAiInsights] = useState([]);
  const [spendingByCategory, setSpendingByCategory] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // For getting the current user name
  let localUser = {};
  try {
    localUser = JSON.parse(localStorage.getItem('user') || '{}');
  } catch { localUser = {}; }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data on mount
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setApiError('');
      const token = localStorage.getItem('jwt');
      if (!token) {
        setApiError('You are not logged in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/users/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setFinancialData({
            totalBalance: data.totalBalance,
            investments: data.investments,
            creditScore: data.creditScore,
            savingsGoal: data.savingsGoal
          });
          setRecentTransactions(data.recentTransactions || []);
        } else {
          setApiError(data.error || 'Could not fetch dashboard data.');
        }
      } catch {
        setApiError('Server error. Could not connect.');
      }
      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  // Fetch AI insights and dynamic data
  useEffect(() => {
    async function fetchInsights() {
      setInsightsLoading(true);
      const token = localStorage.getItem('jwt');
      if (!token) {
        setInsightsLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching insights from API...');
        const response = await fetch('http://localhost:3001/api/ai/dashboard-insights', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('📊 Received insights data:', data);
        
        setAiInsights(data.aiInsights || []);
        setSpendingByCategory(data.spendingByCategory || []);
        setMonthlyChartData(data.monthlyChartData || []);
        
        console.log('✅ Data set successfully:', {
          aiInsights: data.aiInsights?.length || 0,
          spendingCategories: data.spendingByCategory?.length || 0,
          monthlyData: data.monthlyChartData?.length || 0,
          spendingData: data.spendingByCategory
        });
      } catch (error) {
        console.error('❌ Failed to fetch insights:', error);
        
        // Set fallback data for testing - THIS WILL HELP US DEBUG
        setSpendingByCategory([
          { category: 'Groceries', amount: 850 },
          { category: 'Transport', amount: 450 },
          { category: 'Entertainment', amount: 200 }
        ]);
        setMonthlyChartData([
          { month: 'Jan', income: 5000, expenses: 3500 },
          { month: 'Feb', income: 5200, expenses: 4000 },
          { month: 'Mar', income: 4800, expenses: 3200 }
        ]);
        setAiInsights([
          {
            type: 'warning',
            title: 'API Connection Issue',
            message: 'Using sample data - check your API connection',
            confidence: 100
          }
        ]);
      }
      setInsightsLoading(false);
    }
    fetchInsights();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Helper function to get icon for insight type
  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="icon" />;
      case 'warning': return <AlertTriangle className="icon" />;
      case 'info': return <TrendingUp className="icon" />;
      default: return <CheckCircle className="icon" />;
    }
  };

  // Calculate total spending for percentages
  const totalSpending = spendingByCategory.reduce((sum, item) => sum + (item.amount || 0), 0);

  // FIXED: Generate pie chart segments with proper calculation
  const generatePieChart = () => {
    console.log('🥧 Generating pie chart for:', spendingByCategory);
    
    if (!spendingByCategory || spendingByCategory.length === 0) {
      console.log('❌ No spending data for pie chart');
      return [];
    }
    
    let currentAngle = 0;
    const segments = spendingByCategory.map((item, index) => {
      const percentage = totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
      const angle = (percentage / 100) * 360;
      
      const segment = {
        category: item.category,
        amount: item.amount,
        percentage: percentage.toFixed(1),
        color: categoryColors[index % categoryColors.length],
        startAngle: currentAngle,
        sweepAngle: angle
      };
      
      currentAngle += angle;
      console.log(`📊 Segment ${index}:`, segment);
      return segment;
    });
    
    console.log('✅ Generated pie segments:', segments);
    return segments;
  };

  const pieSegments = generatePieChart();

  // Loading state
  if (loading) 
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#8A1F2C' }} />
          <p style={{ color: '#cbd5e1' }}>Just a moment — we're refreshing things...</p>
        </div>
      </div>
    );
  
  if (apiError) 
    return <div className="dashboard-error">{apiError}</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              <Menu className="menu-icon" />
            </button>
            <div className="logo">
              <span className="logo-text">Lynq</span>
              <span className="logo-accent">AI</span>
            </div>
            <div className="header-divider"></div>
            <h1 className="page-title">Financial Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="current-time">
              {currentTime.toLocaleTimeString()}
            </div>
            <button className="header-btn">
              <Bell className="header-icon" />
            </button>

            <div className="header-container">
              <div className="header-content">
                <Link to="/login" className="header-btn">
                  <LogOut className="header-icon" /> 
                </Link>
              </div>

              <div className="header-container">
                <Link to="/dashboard/profile" className="user-avatar">
                  <User className="user-icon" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          <div className="sidebar-content">
            <button className="sidebar-close" onClick={toggleSidebar}>
              <X className="close-icon" />
            </button>
            <nav className="sidebar-nav">
              <div className="nav-section">
                <div className="nav-section-title">AI Powered</div>
                <div className="nav-links">
                  <Link to="/dashboard" className="nav-link nav-link-active">
                    <Brain className="nav-icon" />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/dashboard/analytics" className="nav-link">
                    <PieChart className="nav-icon" />
                    <span>Analytics</span>
                  </Link>
                  <Link to="/dashboard/goals" className="nav-link">
                    <Target className="nav-icon" />
                    <span>Goals</span>
                  </Link>
                  <Link to="/dashboard/offers" className="nav-link">
                    <Tag className="nav-icon" />
                    <span>Offers</span>
                  </Link>
                  <Link to="/dashboard/credit-health" className="nav-link">
                    <Activity className="nav-icon" />
                    <span>Credit Health</span>
                  </Link>
                  <Link to="/dashboard/money-tracker" className="nav-link">
                    <Banknote className="nav-icon" />
                    <span>Money Tracker</span>
                  </Link>
                  <Link to="/dashboard/chat" className="nav-link">
                    <MessageCircle className="nav-icon" />
                    <span>AI Chat</span>
                  </Link>
                </div>
              </div>
              <div className="nav-section">
                <div className="nav-section-title">Financial</div>
                <div className="nav-links">
                  <Link to="/dashboard/transactions" className="nav-link">
                    <Wallet className="nav-icon" />
                    <span>Transactions</span>
                  </Link>
                  <Link to="/dashboard/cards" className="nav-link">
                    <CreditCard className="nav-icon" />
                    <span>Cards</span>
                  </Link>
                  <Link to="/dashboard/investments" className="nav-link">
                    <BarChart3 className="nav-icon" />
                    <span>Investments</span>
                  </Link>
                </div>
              </div>
              <div className="nav-section">
                <div className="nav-section-title">Security</div>
                <div className="nav-links">
                  <Link to="/dashboard/profile" className="nav-link">
                    <UserCircle className="nav-icon" />
                    <span>Profile</span>
                  </Link>
                  <Link to="/dashboard/settings" className="nav-link">
                    <Settings className="nav-icon" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Routed content */}
        <Outlet />

        {/* Main Content */}
        <main className="main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-text">
                <h2 className="welcome-title">
                  Welcome back, {localUser.first_name ? localUser.first_name : "User"}
                </h2>
                <p className="welcome-subtitle">Your financial intelligence is powered by AI and secured by enterprise-grade systems</p>
              </div>
              <div className="status-badges">
                <div className="status-badge status-secure">
                  <Shield className="status-icon" />
                  <span>Secure</span>
                </div>
                <div className="status-badge status-ai">
                  <Brain className="status-icon" />
                  <span>AI Active</span>
                </div>
                <div className="status-badge status-phone">
                  <Phone className="status-icon" />
                  <span>Phone Call</span>
                </div>
                <div className="status-badge status-video">
                  <Video className="status-icon" />
                  <span>Video Call</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon metric-icon-green">
                  <DollarSign className="icon" />
                </div>
                <span className="metric-change metric-change-positive">+12.5%</span>
              </div>
              <div className="metric-value">
                R{Number(financialData.totalBalance).toLocaleString()}
              </div>
              <div className="metric-label">Total Balance</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon metric-icon-blue">
                  <TrendingUp className="icon" />
                </div>
                <span className="metric-change metric-change-positive">+8.2%</span>
              </div>
              <div className="metric-value">
                R{Number(financialData.investments).toLocaleString()}
              </div>
              <div className="metric-label">Investments</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon metric-icon-purple">
                  <Activity className="icon" />
                </div>
                <span className="metric-change">
                  {financialData.creditScore !== null ? financialData.creditScore : 'N/A'}
                </span>
              </div>
              <div className="metric-value">
                {financialData.creditScore ? 'Excellent' : 'N/A'}
              </div>
              <div className="metric-label">Credit Score</div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon metric-icon-orange">
                  <Target className="icon" />
                </div>
                <span className="metric-change">
                  {financialData.savingsGoal ?? 0}%
                </span>
              </div>
              <div className="metric-value">On Track</div>
              <div className="metric-label">Savings Goal</div>
            </div>
          </div>

          {/* Financial Overview Section */}
          <div className="financial-overview">
            {/* Charts Grid */}
            <div className="charts-grid">
              {/* FIXED: Spending by Category PIE CHART */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Spending by Category</h3>
                  <p className="chart-subtitle">Your expense breakdown (DEBIT transactions only)</p>
                </div>
                <div className="chart-content">
                  {insightsLoading ? (
                    <div className="chart-loading" style={{ textAlign: 'center', padding: '40px' }}>
                      <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto 16px' }} />
                      <p>Loading spending data...</p>
                    </div>
                  ) : pieSegments.length > 0 ? (
                    <>
                      <div className="pie-chart-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <svg 
                          width="240" 
                          height="240" 
                          viewBox="0 0 240 240"
                          style={{ maxWidth: '100%' }}
                        >
                          <circle
                            cx="120"
                            cy="120"
                            r="100"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="2"
                          />
                          {pieSegments.map((segment, index) => {
                            const radius = 100;
                            const centerX = 120;
                            const centerY = 120;
                            
                            // Convert angles to radians
                            const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
                            const endAngleRad = (segment.startAngle + segment.sweepAngle - 90) * (Math.PI / 180);
                            
                            // Calculate path coordinates
                            const x1 = centerX + radius * Math.cos(startAngleRad);
                            const y1 = centerY + radius * Math.sin(startAngleRad);
                            const x2 = centerX + radius * Math.cos(endAngleRad);
                            const y2 = centerY + radius * Math.sin(endAngleRad);
                            
                            const largeArcFlag = segment.sweepAngle > 180 ? 1 : 0;
                            
                            const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
                            
                            // Calculate label position
                            const labelAngle = (segment.startAngle + segment.sweepAngle / 2 - 90) * (Math.PI / 180);
                            const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
                            const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);
                            
                            return (
                              <g key={index}>
                                <path
                                  d={pathData}
                                  fill={segment.color}
                                  stroke="white"
                                  strokeWidth="3"
                                />
                                {parseFloat(segment.percentage) > 5 && (
                                  <text
                                    x={labelX}
                                    y={labelY}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill="white"
                                    fontSize="14"
                                    fontWeight="bold"
                                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                                  >
                                    {segment.percentage}%
                                  </text>
                                )}
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                      <div className="chart-legend">
                        {pieSegments.map((segment, index) => (
                          <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <div 
                              className="legend-color" 
                              style={{ 
                                backgroundColor: segment.color,
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                marginRight: '8px'
                              }}
                            ></div>
                            <span className="legend-label" style={{ flex: 1 }}>{segment.category}</span>
                            <span className="legend-amount" style={{ fontWeight: 'bold' }}>
                              R{Number(segment.amount).toLocaleString()} ({segment.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="chart-no-data" style={{ textAlign: 'center', padding: '40px' }}>
                      <PieChart size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      <p><strong>No expense data available</strong></p>
                      <p style={{ fontSize: '0.9em', opacity: 0.7 }}>
                        Add DEBIT transactions to see your spending breakdown
                      </p>
                      <p style={{ fontSize: '0.8em', color: '#666' }}>
                        Total spending detected: R{totalSpending.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* FIXED: Monthly Income vs Expenses BAR CHART */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Monthly Income vs Expenses</h3>
                  <p className="chart-subtitle">CREDIT vs DEBIT transactions by month</p>
                </div>
                <div className="chart-content">
                  {insightsLoading ? (
                    <div className="chart-loading" style={{ textAlign: 'center', padding: '40px' }}>
                      <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto 16px' }} />
                      <p>Loading monthly data...</p>
                    </div>
                  ) : monthlyChartData.length > 0 ? (
                    <>
                      <div className="bar-chart" style={{ position: 'relative', height: '300px', display: 'flex' }}>
                        <div className="chart-y-axis" style={{ 
                          display: 'flex', 
                          flexDirection: 'column-reverse', 
                          justifyContent: 'space-between',
                          height: '260px',
                          marginRight: '10px',
                          fontSize: '12px'
                        }}>
                          {(() => {
                            const maxValue = Math.max(...monthlyChartData.map(d => Math.max(d.income || 0, d.expenses || 0)));
                            if (maxValue === 0) return [<span key="0">R0</span>];
                            
                            return [
                              <span key="4" className="y-label">R{Math.round(maxValue).toLocaleString()}</span>,
                              <span key="3" className="y-label">R{Math.round(maxValue * 0.75).toLocaleString()}</span>,
                              <span key="2" className="y-label">R{Math.round(maxValue * 0.5).toLocaleString()}</span>,
                              <span key="1" className="y-label">R{Math.round(maxValue * 0.25).toLocaleString()}</span>,
                              <span key="0" className="y-label">R0</span>
                            ];
                          })()}
                        </div>
                        <div className="chart-bars" style={{ 
                          display: 'flex', 
                          alignItems: 'end', 
                          height: '260px', 
                          flex: 1,
                          gap: '20px',
                          justifyContent: 'space-around'
                        }}>
                          {monthlyChartData.map((data, index) => {
                            const maxValue = Math.max(...monthlyChartData.map(d => Math.max(d.income || 0, d.expenses || 0)));
                            const incomeHeight = maxValue > 0 ? ((data.income || 0) / maxValue) * 240 : 5;
                            const expenseHeight = maxValue > 0 ? ((data.expenses || 0) / maxValue) * 240 : 5;
                            
                            return (
                              <div key={index} className="bar-group" style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'end', gap: '5px', height: '240px' }}>
                                  <div 
                                    className="bar bar-income" 
                                    style={{
                                      height: `${Math.max(incomeHeight, 3)}px`,
                                      width: '25px',
                                      backgroundColor: '#22c55e',
                                      borderRadius: '3px 3px 0 0',
                                      position: 'relative'
                                    }}
                                    title={`Income: R${(data.income || 0).toLocaleString()}`}
                                  >
                                    <span style={{
                                      position: 'absolute',
                                      top: '-20px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      fontSize: '10px',
                                      color: '#22c55e',
                                      fontWeight: 'bold'
                                    }}>
                                      {data.income > 0 ? `R${(data.income/1000).toFixed(0)}k` : ''}
                                    </span>
                                  </div>
                                  <div 
                                    className="bar bar-expense" 
                                    style={{
                                      height: `${Math.max(expenseHeight, 3)}px`,
                                      width: '25px',
                                      backgroundColor: '#ef4444',
                                      borderRadius: '3px 3px 0 0',
                                      position: 'relative'
                                    }}
                                    title={`Expenses: R${(data.expenses || 0).toLocaleString()}`}
                                  >
                                    <span style={{
                                      position: 'absolute',
                                      top: '-20px',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      fontSize: '10px',
                                      color: '#ef4444',
                                      fontWeight: 'bold'
                                    }}>
                                      {data.expenses > 0 ? `R${(data.expenses/1000).toFixed(0)}k` : ''}
                                    </span>
                                  </div>
                                </div>
                                <span className="bar-label" style={{ 
                                  fontSize: '12px', 
                                  fontWeight: 'bold',
                                  marginTop: '5px'
                                }}>
                                  {data.month}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="chart-legend chart-legend-horizontal" style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '20px',
                        marginTop: '20px'
                      }}>
                        <div className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ 
                            width: '16px', 
                            height: '16px', 
                            backgroundColor: '#22c55e',
                            marginRight: '8px',
                            borderRadius: '3px'
                          }}></div>
                          <span className="legend-label">Income (CREDIT)</span>
                        </div>
                        <div className="legend-item" style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ 
                            width: '16px', 
                            height: '16px', 
                            backgroundColor: '#ef4444',
                            marginRight: '8px',
                            borderRadius: '3px'
                          }}></div>
                          <span className="legend-label">Expenses (DEBIT)</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="chart-no-data" style={{ textAlign: 'center', padding: '40px' }}>
                      <BarChart3 size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                      <p><strong>No monthly data available</strong></p>
                      <p style={{ fontSize: '0.9em', opacity: 0.7 }}>
                        Add CREDIT (income) and DEBIT (expense) transactions to see trends
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="content-grid">
            {/* Dynamic AI Insights */}
            <div className="content-left">
              <div className="insights-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <div className="card-icon card-icon-ai">
                      <Brain className="icon" />
                    </div>
                    <h3 className="card-title">AI Financial Insights</h3>
                  </div>
                  <button 
                    onClick={() => setAiInsightsVisible(!aiInsightsVisible)}
                    className="toggle-btn"
                  >
                    {aiInsightsVisible ? <Eye className="toggle-icon" /> : <EyeOff className="toggle-icon" />}
                  </button>
                </div>
                {aiInsightsVisible && (
                  <div className="insights-content">
                    {insightsLoading ? (
                      <div className="insights-loading" style={{ textAlign: 'center', padding: '20px' }}>
                        <RefreshCw className="w-6 h-6 animate-spin" style={{ margin: '0 auto 16px' }} />
                        <p>Generating AI insights...</p>
                      </div>
                    ) : aiInsights.length > 0 ? (
                      aiInsights.map((insight, index) => (
                        <div key={index} className={`insight-item insight-${insight.type}`}>
                          <div className={`insight-icon-wrapper insight-icon-${insight.type}`}>
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="insight-content">
                            <div className="insight-header">
                              <h4 className="insight-title">{insight.title}</h4>
                              <span className="insight-confidence">{insight.confidence}% confidence</span>
                            </div>
                            <p className="insight-message">{insight.message}</p>
                          </div>
                          <ChevronRight className="insight-arrow" />
                        </div>
                      ))
                    ) : (
                      <div className="insights-no-data" style={{ textAlign: 'center', padding: '20px' }}>
                        <Brain size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <p>No AI insights available</p>
                        <p style={{ fontSize: '0.9em', opacity: 0.7 }}>Add more financial data to get personalized insights</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="transactions-card">
                <div className="card-header">
                  <h3 className="card-title">Recent Transactions</h3>
                  <div className="timeframe-buttons">
                    {timeframes.map((timeframe) => (
                      <button
                        key={timeframe}
                        onClick={() => setSelectedTimeframe(timeframe)}
                        className={`timeframe-btn ${selectedTimeframe === timeframe ? 'timeframe-btn-active' : ''}`}
                      >
                        {timeframe}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="transactions-list">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.transaction_id} className="transaction-item">
                      <div className="transaction-info">
                        <div className={`transaction-icon ${transaction.transaction_type?.toLowerCase() === 'credit' ? 'transaction-icon-credit' : 'transaction-icon-debit'}`}>
                          {transaction.transaction_type?.toLowerCase() === 'credit' ? 
                            <TrendingUp className="icon" /> : 
                            <TrendingDown className="icon" />
                          }
                        </div>
                        <div className="transaction-details">
                          <div className="transaction-description">{transaction.description || transaction.category || '-'}</div>
                          <div className="transaction-meta">
                            {transaction.category} • {transaction.transaction_date ? (new Date(transaction.transaction_date)).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </div>
                      <div className={`transaction-amount ${transaction.transaction_type?.toLowerCase() === 'credit' ? 'transaction-amount-credit' : 'transaction-amount-debit'}`}>
                        {transaction.transaction_type?.toLowerCase() === 'credit' ? '+' : '-'}R{Number(transaction.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                                        <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      <Wallet size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                      <p>No recent transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar Content */}
            <div className="content-right">
              {/* Security Status */}
              <div className="security-card">
                <div className="card-header">
                  <div className="card-title-section">
                    <div className="card-icon card-icon-security">
                      <Shield className="icon" />
                    </div>
                    <h3 className="card-title">Security Status</h3>
                  </div>
                  <div className="live-indicator">
                    <div className="live-dot"></div>
                    <span className="live-text">Live</span>
                  </div>
                </div>
                <div className="security-metrics">
                  {securityMetrics.map((metric, index) => (
                    <div key={index} className="security-metric">
                      <span className="security-label">{metric.label}</span>
                      <div className="security-value">
                        <span className="security-text">{metric.value}</span>
                        <CheckCircle className="security-check" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cobol-status">
                  <div className="cobol-indicator">
                    <Lock className="cobol-icon" />
                    <span className="cobol-text">COBOL mainframe integration active</span>
                  </div>
                </div>
              </div>

              {/* Personalized Financial Advice */}
              <div className="actions-card">
                <h3 className="card-title">Personalized Financial Tips</h3>
                <div className="actions-list">
                  <button className="action-btn action-btn-primary">
                    <Zap className="action-icon" />
                    <span className="action-text">Spend Less Than You Earn</span>
                  </button>
                  <button className="action-btn action-btn-primary">
                    <PieChart className="action-icon" />
                    <span className="action-text">Invest Early and Regularly</span>
                  </button>
                  <button className="action-btn action-btn-primary">
                    <Target className="action-icon" />
                    <span className="action-text">Track Your Expenses</span>
                  </button>
                  <button className="action-btn action-btn-primary">
                    <Database className="action-icon" />
                    <span className="action-text">Avoid High-Interest Debt</span>
                  </button>
                  <button className="action-btn action-btn-primary">
                    <Database className="action-icon" />
                    <span className="action-text">Build an Emergency Fund</span>
                  </button>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="performance-card">
                <h3 className="card-title">System Performance</h3>
                <div className="performance-metrics">
                  <div className="performance-metric">
                    <div className="performance-header">
                      <span className="performance-label">AI Processing</span>
                      <span className="performance-value performance-value-green">98%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill progress-fill-green" style={{width: '98%'}}></div>
                    </div>
                  </div>
                  <div className="performance-metric">
                    <div className="performance-header">
                      <span className="performance-label">COBOL Uptime</span>
                      <span className="performance-value performance-value-blue">99.9%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill progress-fill-blue" style={{width: '99.9%'}}></div>
                    </div>
                  </div>
                  <div className="performance-metric">
                    <div className="performance-header">
                      <span className="performance-label">Security Score</span>
                      <span className="performance-value performance-value-purple">100%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill progress-fill-purple" style={{width: '100%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;