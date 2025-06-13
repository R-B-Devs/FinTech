import React, { useState, useEffect } from 'react';
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
  Phone,
  Video,
  UserCircle,
  X
} from 'lucide-react';

const Dashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [aiInsightsVisible, setAiInsightsVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeframes = ['week', 'month', 'quarter', 'year'];

  const financialData = {
    totalBalance: 125840.50,
    monthlyIncome: 25000,
    monthlyExpenses: 18750,
    creditScore: 785,
    savingsGoal: 75,
    investments: 84320.25,
    debt: 12450.00
  };

  const aiInsights = [
    {
      type: 'opportunity',
      icon: <TrendingUp className="insight-icon" />,
      title: 'Investment Opportunity',
      message: 'AI detected 12% growth potential in tech sector ETFs',
      confidence: 87
    },
    {
      type: 'warning',
      icon: <AlertTriangle className="insight-icon" />,
      title: 'Spending Alert',
      message: 'Dining expenses up 23% this month vs. budget',
      confidence: 94
    },
    {
      type: 'success',
      icon: <Target className="insight-icon" />,
      title: 'Goal Achievement',
      message: 'Emergency fund target reached 2 months early',
      confidence: 100
    }
  ];

  const recentTransactions = [
    { id: 1, type: 'credit', amount: 2500, description: 'Salary Deposit', category: 'Income', time: '2 hours ago' },
    { id: 2, type: 'debit', amount: 45.80, description: 'Grocery Store', category: 'Food', time: '5 hours ago' },
    { id: 3, type: 'debit', amount: 120.00, description: 'Utility Bill', category: 'Bills', time: '1 day ago' },
    { id: 4, type: 'credit', amount: 15.50, description: 'Cashback Reward', category: 'Rewards', time: '2 days ago' }
  ];

  const securityMetrics = [
    { label: 'Encryption Status', value: 'AES-256 Active', status: 'secure' },
    { label: 'COBOL Core', value: '99.9% Uptime', status: 'secure' },
    { label: 'Fraud Detection', value: 'Real-time', status: 'secure' },
    { label: 'Data Integrity', value: 'Verified', status: 'secure' }
  ];
  

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
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
            <button className="header-btn">
              <Settings className="header-icon" />
            </button>
            <div className="user-avatar">
              <User className="user-icon" />
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
                  <a href="#" className="nav-link nav-link-active">
                    <Brain className="nav-icon" />
                    <span>Dashboard</span>
                  </a>
                  <a href="#" className="nav-link">
                    <PieChart className="nav-icon" />
                    <span>Analytics</span>
                  </a>
                  <a href="#" className="nav-link">
                    <Target className="nav-icon" />
                    <span>Goals</span>
                  </a>
                  <a href="#" className="nav-link">
                    <Tag className="nav-icon" />
                    <span>Offers</span>
                  </a>
                  <a href="#" className="nav-link">
                    <Activity className="nav-icon" />
                    <span>Credit Health</span>
                  </a>
                  <a href="#" className="nav-link">
                    <Banknote className="nav-icon" />
                    <span>Money Tracker</span>

                  </a>
                </div>
              </div>

              <div className="nav-section">
                <div className="nav-section-title">Financial</div>
                <div className="nav-links">
                  <a href="#" className="nav-link">
                    <Wallet className="nav-icon" />
                    <span>Transactions</span>
                  </a>
                  <a href="#" className="nav-link">
                    <CreditCard className="nav-icon" />
                    <span>Cards</span>
                  </a>
                  <a href="#" className="nav-link">
                    <BarChart3 className="nav-icon" />
                    <span>Investments</span>
                  </a>
                </div>
              </div>

              <div className="nav-section">
                <div className="nav-section-title">Security</div>
                <div className="nav-links">
                  <a href="#" className="nav-link">
                    <UserCircle className="nav-icon" />
                    <span>Profile</span>
                  </a>
                  <a href="#" className="nav-link">
                    <Settings className="nav-icon" />
                    <span>Settings</span>
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-text">
                <h2 className="welcome-title">Welcome back, Alex</h2>
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
              <div className="metric-value">R{financialData.totalBalance.toLocaleString()}</div>
              <div className="metric-label">Total Balance</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon metric-icon-blue">
                  <TrendingUp className="icon" />
                </div>
                <span className="metric-change metric-change-positive">+8.2%</span>
              </div>
              <div className="metric-value">R{financialData.investments.toLocaleString()}</div>
              <div className="metric-label">Investments</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon metric-icon-purple">
                  <Activity className="icon" />
                </div>
                <span className="metric-change">{financialData.creditScore}</span>
              </div>
              <div className="metric-value">Excellent</div>
              <div className="metric-label">Credit Score</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <div className="metric-icon metric-icon-orange">
                  <Target className="icon" />
                </div>
                <span className="metric-change">{financialData.savingsGoal}%</span>
              </div>
              <div className="metric-value">On Track</div>
              <div className="metric-label">Savings Goal</div>
            </div>
          </div>

          

          <div className="content-grid">
            {/* AI Insights */}
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
                    {aiInsights.map((insight, index) => (
                      <div key={index} className={`insight-item insight-${insight.type}`}>
                        <div className={`insight-icon-wrapper insight-icon-${insight.type}`}>
                          {insight.icon}
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
                    ))}
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
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-info">
                        <div className={`transaction-icon ${transaction.type === 'credit' ? 'transaction-icon-credit' : 'transaction-icon-debit'}`}>
                          {transaction.type === 'credit' ? 
                            <TrendingUp className="icon" /> : 
                            <TrendingDown className="icon" />
                          }
                        </div>
                        <div className="transaction-details">
                          <div className="transaction-description">{transaction.description}</div>
                          <div className="transaction-meta">{transaction.category} • {transaction.time}</div>
                        </div>
                      </div>
                      <div className={`transaction-amount ${transaction.type === 'credit' ? 'transaction-amount-credit' : 'transaction-amount-debit'}`}>
                        {transaction.type === 'credit' ? '+' : '-'}R{transaction.amount}
                      </div>
                    </div>
                  ))}
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

              {/* Quick Actions */}
              <div className="actions-card">
                <h3 className="card-title">Quick Actions</h3>
                <div className="actions-list">
                  <button className="action-btn action-btn-primary">
                    <Zap className="action-icon" />
                    <span className="action-text">AI Optimization</span>
                  </button>
                  <button className="action-btn">
                    <PieChart className="action-icon" />
                    <span className="action-text">Generate Report</span>
                  </button>
                  <button className="action-btn">
                    <Target className="action-icon" />
                    <span className="action-text">Set New Goal</span>
                  </button>
                  <button className="action-btn">
                    <Database className="action-icon" />
                    <span className="action-text">System Check</span>
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