// import React, { useState, useEffect } from 'react'; 
// import { Link, Outlet } from 'react-router-dom';
// import "../styles/Dashboard.css";
// import { 
//   TrendingUp, 
//   TrendingDown, 
//   Shield, 
//   Brain,
//   Banknote,
//   Wallet, 
//   CreditCard, 
//   PieChart, 
//   BarChart3, 
//   AlertTriangle, 
//   CheckCircle, 
//   DollarSign, 
//   Target, 
//   Tag,
//   Activity,
//   Zap,
//   Lock,
//   Database,
//   Bell,
//   Settings,
//   User,
//   ChevronRight,
//   Eye,
//   EyeOff,
//   Menu,
//   MessageCircle,
//   Phone,
//   Video,
//   UserCircle,
//   X
// } from 'lucide-react';

// const Dashboard = () => {
//   const [selectedTimeframe, setSelectedTimeframe] = useState('month');
//   const [aiInsightsVisible, setAiInsightsVisible] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [currentTime, setCurrentTime] = useState(new Date());

//   const financialData = {
//     totalBalance: 127500,
//     investments: 85300,
//     creditScore: 820,
//     savingsGoal: 78
//   };

//   const timeframes = ['week', 'month', 'quarter', 'year'];

//   const aiInsights = [
//     {
//       type: 'success',
//       icon: <CheckCircle className="icon" />,
//       title: 'Spending Optimization',
//       message: 'Your grocery spending is 15% below average. Consider investing the savings.',
//       confidence: 94
//     },
//     {
//       type: 'warning',
//       icon: <AlertTriangle className="icon" />,
//       title: 'Bill Prediction',
//       message: 'Electricity bill likely to increase by R180 next month based on usage patterns.',
//       confidence: 87
//     },
//     {
//       type: 'info',
//       icon: <TrendingUp className="icon" />,
//       title: 'Investment Opportunity',
//       message: 'Stock market trends suggest a good time to increase your portfolio by 5%.',
//       confidence: 91
//     }
//   ];

//   const recentTransactions = [
//     {
//       id: 1,
//       description: 'Salary Deposit',
//       category: 'Income',
//       amount: '25,000.00',
//       time: '2 hours ago',
//       type: 'credit'
//     },
//     {
//       id: 2,
//       description: 'Woolworths Grocery',
//       category: 'Groceries',
//       amount: '1,245.50',
//       time: '1 day ago',
//       type: 'debit'
//     },
//     {
//       id: 3,
//       description: 'Netflix Subscription',
//       category: 'Entertainment',
//       amount: '199.00',
//       time: '2 days ago',
//       type: 'debit'
//     },
//     {
//       id: 4,
//       description: 'Investment Return',
//       category: 'Investments',
//       amount: '3,750.00',
//       time: '3 days ago',
//       type: 'credit'
//     },
//     {
//       id: 5,
//       description: 'Petrol - Shell',
//       category: 'Transport',
//       amount: '850.00',
//       time: '4 days ago',
//       type: 'debit'
//     }
//   ];

//   const securityMetrics = [
//     { label: '2FA Status', value: 'Active' },
//     { label: 'Encryption', value: '256-bit' },
//     { label: 'Last Scan', value: '2 min ago' },
//     { label: 'Threats', value: '0 detected' }
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//   <div className="dashboard-container">
//     <header className="dashboard-header">
//       <div className="header-content">
//         <div className="header-left">
//           <button className="mobile-menu-btn" onClick={toggleSidebar}>
//             <Menu className="menu-icon" />
//           </button>
//           <div className="logo">
//             <span className="logo-text">Lynq</span>
//             <span className="logo-accent">AI</span>
//           </div>
//           <div className="header-divider"></div>
//           <h1 className="page-title">Financial Dashboard</h1>
//         </div>

//         <div className="header-right">
//           <div className="current-time">
//             {currentTime.toLocaleTimeString()}
//           </div>

//           <button className="header-btn">
//             <Bell className="header-icon" />
//           </button>

//           {/* Settings and Profile Links */}
//           <div className="header-container">
//             <div className="header-content">
//               {/* Settings Button */}
//               <Link to="/dashboard/settings" className="header-btn">
//                 <Settings className="header-icon" />
//               </Link>

//               {/* User Avatar Button */}
//               <Link to="/dashboard/profile" className="user-avatar">
//                 <User className="user-icon" />
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>

//       <div className="dashboard-layout">
//         {/* Sidebar */}
//         <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
//           <div className="sidebar-overlay" onClick={toggleSidebar}></div>
//           <div className="sidebar-content">
//             <button className="sidebar-close" onClick={toggleSidebar}>
//               <X className="close-icon" />
//             </button>
//             <nav className="sidebar-nav">
//               <div className="nav-section">
//                 <div className="nav-section-title">AI Powered</div>
//                 <div className="nav-links">
//                   <Link to="/dashboard" className="nav-link nav-link-active">
//                     <Brain className="nav-icon" />
//                     <span>Dashboard</span>
//                   </Link>
//                   <Link to="/dashboard/analytics" className="nav-link">
//                     <PieChart className="nav-icon" />
//                     <span>Analytics</span>
//                   </Link>
//                   <Link to="/dashboard/goals" className="nav-link">
//                     <Target className="nav-icon" />
//                     <span>Goals</span>
//                   </Link>
//                   <Link to="/dashboard/offers" className="nav-link">
//                     <Tag className="nav-icon" />
//                     <span>Offers</span>
//                   </Link>
//                   <Link to="/dashboard/credit-health" className="nav-link">
//                     <Activity className="nav-icon" />
//                     <span>Credit Health</span>
//                   </Link>
//                   <Link to="/dashboard/money-tracker" className="nav-link">
//                     <Banknote className="nav-icon" />
//                     <span>Money Tracker</span>
//                   </Link>
//                   <Link to="/dashboard/chat" className="nav-link nav-link">
//                     <MessageCircle className="nav-icon" />
//                     <span>AI Chat</span>
//                   </Link>
//                 </div>
//               </div>

//               <div className="nav-section">
//                 <div className="nav-section-title">Financial</div>
//                 <div className="nav-links">
//                   <Link to="/dashboard/transactions" className="nav-link">
//                     <Wallet className="nav-icon" />
//                     <span>Transactions</span>
//                   </Link>
//                   <Link to="/dashboard/cards" className="nav-link">
//                     <CreditCard className="nav-icon" />
//                     <span>Cards</span>
//                   </Link>
//                   <Link to="/dashboard/investments" className="nav-link">
//                     <BarChart3 className="nav-icon" />
//                     <span>Investments</span>
//                   </Link>
//                 </div>
//               </div>

//               <div className="nav-section">
//                 <div className="nav-section-title">Security</div>
//                 <div className="nav-links">
//                   <Link to="/dashboard/profile" className="nav-link">
//                     <UserCircle className="nav-icon" />
//                     <span>Profile</span>
//                   </Link>
//                   <Link to="/dashboard/settings" className="nav-link">
//                     <Settings className="nav-icon" />
//                     <span>Settings</span>
//                   </Link>
//                 </div>
//               </div>
//             </nav>
//           </div>
//         </aside>

//         {/* This is where routed content (like Analytics, Goals, etc.) will appear */}
//         <Outlet />
          

//         {/* Main Content */}
//         <main className="main-content">
//           {/* Welcome Section */}
//           <div className="welcome-section">
//             <div className="welcome-content">
//               <div className="welcome-text">
//                 <h2 className="welcome-title">Welcome back, Alex</h2>
//                 <p className="welcome-subtitle">Your financial intelligence is powered by AI and secured by enterprise-grade systems</p>
//               </div>
//               <div className="status-badges">
//                 <div className="status-badge status-secure">
//                   <Shield className="status-icon" />
//                   <span>Secure</span>
//                 </div>
//                 <div className="status-badge status-ai">
//                   <Brain className="status-icon" />
//                   <span>AI Active</span>
//                 </div>
//                 <div className="status-badge status-phone">
//                   <Phone className="status-icon" />
//                   <span>Phone Call</span>
//                 </div>
//                 <div className="status-badge status-video">
//                   <Video className="status-icon" />
//                   <span>Video Call</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Key Metrics Grid */}
//           <div className="metrics-grid">
//             <div className="metric-card">
//               <div className="metric-header">
//                 <div className="metric-icon metric-icon-green">
//                   <DollarSign className="icon" />
//                 </div>
//                 <span className="metric-change metric-change-positive">+12.5%</span>
//               </div>
//               <div className="metric-value">R{financialData.totalBalance.toLocaleString()}</div>
//               <div className="metric-label">Total Balance</div>
//             </div>

//             <div className="metric-card">
//               <div className="metric-header">
//                 <div className="metric-icon metric-icon-blue">
//                   <TrendingUp className="icon" />
//                 </div>
//                 <span className="metric-change metric-change-positive">+8.2%</span>
//               </div>
//               <div className="metric-value">R{financialData.investments.toLocaleString()}</div>
//               <div className="metric-label">Investments</div>
//             </div>

//             <div className="metric-card">
//               <div className="metric-header">
//                 <div className="metric-icon metric-icon-purple">
//                   <Activity className="icon" />
//                 </div>
//                 <span className="metric-change">{financialData.creditScore}</span>
//               </div>
//               <div className="metric-value">Excellent</div>
//               <div className="metric-label">Credit Score</div>
//             </div>

//             <div className="metric-card">
//               <div className="metric-header">
//                 <div className="metric-icon metric-icon-orange">
//                   <Target className="icon" />
//                 </div>
//                 <span className="metric-change">{financialData.savingsGoal}%</span>
//               </div>
//               <div className="metric-value">On Track</div>
//               <div className="metric-label">Savings Goal</div>
//             </div>
//           </div>

//           {/* Financial Overview Section */}
//           <div className="financial-overview">
//             {/* Charts Grid */}
//             <div className="charts-grid">
//               {/* Spending by Category */}
//               <div className="chart-card">
//                 <div className="chart-header">
//                   <h3 className="chart-title">Spending by Category</h3>
//                   <p className="chart-subtitle">Your spending breakdown for the current period</p>
//                 </div>
//                 <div className="chart-content">
//                   <div className="pie-chart-container">
//                     <div className="pie-chart">
//                       <div className="pie-slice pie-slice-red" style={{transform: 'rotate(0deg)'}}>
//                         <span className="pie-label">0: 23.0%</span>
//                       </div>
//                       <div className="pie-slice pie-slice-orange" style={{transform: 'rotate(83deg)'}}>
//                         <span className="pie-label">1: 21.7%</span>
//                       </div>
//                       <div className="pie-slice pie-slice-green" style={{transform: 'rotate(161deg)'}}>
//                         <span className="pie-label">2: 12.1%</span>
//                       </div>
//                       <div className="pie-slice pie-slice-teal" style={{transform: 'rotate(204deg)'}}>
//                         <span className="pie-label">3: 9.9%</span>
//                       </div>
//                       <div className="pie-slice pie-slice-blue" style={{transform: 'rotate(240deg)'}}>
//                         <span className="pie-label">4: 7.1%</span>
//                       </div>
//                       <div className="pie-slice pie-slice-pink" style={{transform: 'rotate(266deg)'}}>
//                         <span className="pie-label">5: 6.7%</span>
//                       </div>
//                       <div className="pie-slice pie-slice-purple" style={{transform: 'rotate(290deg)'}}>
//                         <span className="pie-label">6: 6.1%</span>
//                       </div>
//                       <div className="pie-slice pie-slice-indigo" style={{transform: 'rotate(312deg)'}}>
//                         <span className="pie-label">7: 4.7%</span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="chart-legend">
//                     <div className="legend-item">
//                       <div className="legend-color legend-color-red"></div>
//                       <span className="legend-label">Shopping</span>
//                     </div>
//                     <div className="legend-item">
//                       <div className="legend-color legend-color-orange"></div>
//                       <span className="legend-label">Bills & Utilities</span>
//                     </div>
//                     <div className="legend-item">
//                       <div className="legend-color legend-color-green"></div>
//                       <span className="legend-label">Groceries</span>
//                     </div>
//                     <div className="legend-item">
//                       <div className="legend-color legend-color-teal"></div>
//                       <span className="legend-label">Travel</span>
//                     </div>
//                     <div className="legend-item">
//                       <div className="legend-color legend-color-blue"></div>
//                       <span className="legend-label">Entertainment</span>
//                     </div>
//                     <div className="legend-item">
//                       <div className="legend-color legend-color-pink"></div>
//                       <span className="legend-label">Education</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Monthly Income vs Expenses */}
//               <div className="chart-card">
//                 <div className="chart-header">
//                   <h3 className="chart-title">Monthly Income vs Expenses</h3>
//                   <p className="chart-subtitle">Compare your monthly income and spending patterns</p>
//                 </div>
//                 <div className="chart-content">
//                   <div className="bar-chart">
//                     <div className="chart-y-axis">
//                       <span className="y-label">R28,000</span>
//                       <span className="y-label">R21,000</span>
//                       <span className="y-label">R14,000</span>
//                       <span className="y-label">R7,000</span>
//                       <span className="y-label">R0</span>
//                     </div>
//                     <div className="chart-bars">
//                       <div className="bar-group">
//                         <div className="bar bar-income" style={{height: '95%'}}></div>
//                         <div className="bar bar-expense" style={{height: '5%'}}></div>
//                         <span className="bar-label">Jan</span>
//                       </div>
//                       <div className="bar-group">
//                         <div className="bar bar-income" style={{height: '75%'}}></div>
//                         <div className="bar bar-expense" style={{height: '18%'}}></div>
//                         <span className="bar-label">Feb</span>
//                       </div>
//                       <div className="bar-group">
//                         <div className="bar bar-income" style={{height: '55%'}}></div>
//                         <div className="bar bar-expense" style={{height: '20%'}}></div>
//                         <span className="bar-label">Mar</span>
//                       </div>
//                       <div className="bar-group">
//                         <div className="bar bar-income" style={{height: '95%'}}></div>
//                         <div className="bar bar-expense" style={{height: '16%'}}></div>
//                         <span className="bar-label">Apr</span>
//                       </div>
//                       <div className="bar-group">
//                         <div className="bar bar-income" style={{height: '88%'}}></div>
//                         <div className="bar bar-expense" style={{height: '17%'}}></div>
//                         <span className="bar-label">May</span>
//                       </div>
//                       <div className="bar-group">
//                         <div className="bar bar-income" style={{height: '12%'}}></div>
//                         <div className="bar bar-expense" style={{height: '8%'}}></div>
//                         <span className="bar-label">Jun</span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="chart-legend chart-legend-horizontal">
//                     <div className="legend-item">
//                       <div className="legend-color legend-color-income"></div>
//                       <span className="legend-label">Income</span>
//                     </div>
//                     <div className="legend-item">
//                       <div className="legend-color legend-color-expense"></div>
//                       <span className="legend-label">Expenses</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="content-grid">
//             {/* AI Insights */}
//             <div className="content-left">
//               <div className="insights-card">
//                 <div className="card-header">
//                   <div className="card-title-section">
//                     <div className="card-icon card-icon-ai">
//                       <Brain className="icon" />
//                     </div>
//                     <h3 className="card-title">AI Financial Insights</h3>
//                   </div>
//                   <button 
//                     onClick={() => setAiInsightsVisible(!aiInsightsVisible)}
//                     className="toggle-btn"
//                   >
//                     {aiInsightsVisible ? <Eye className="toggle-icon" /> : <EyeOff className="toggle-icon" />}
//                   </button>
//                 </div>

//                 {aiInsightsVisible && (
//                   <div className="insights-content">
//                     {aiInsights.map((insight, index) => (
//                       <div key={index} className={`insight-item insight-${insight.type}`}>
//                         <div className={`insight-icon-wrapper insight-icon-${insight.type}`}>
//                           {insight.icon}
//                         </div>
//                         <div className="insight-content">
//                           <div className="insight-header">
//                             <h4 className="insight-title">{insight.title}</h4>
//                             <span className="insight-confidence">{insight.confidence}% confidence</span>
//                           </div>
//                           <p className="insight-message">{insight.message}</p>
//                         </div>
//                         <ChevronRight className="insight-arrow" />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Recent Transactions */}
//               <div className="transactions-card">
//                 <div className="card-header">
//                   <h3 className="card-title">Recent Transactions</h3>
//                   <div className="timeframe-buttons">
//                     {timeframes.map((timeframe) => (
//                       <button
//                         key={timeframe}
//                         onClick={() => setSelectedTimeframe(timeframe)}
//                         className={`timeframe-btn ${selectedTimeframe === timeframe ? 'timeframe-btn-active' : ''}`}
//                       >
//                         {timeframe}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="transactions-list">
//                   {recentTransactions.map((transaction) => (
//                     <div key={transaction.id} className="transaction-item">
//                       <div className="transaction-info">
//                         <div className={`transaction-icon ${transaction.type === 'credit' ? 'transaction-icon-credit' : 'transaction-icon-debit'}`}>
//                           {transaction.type === 'credit' ? 
//                             <TrendingUp className="icon" /> : 
//                             <TrendingDown className="icon" />
//                           }
//                         </div>
//                         <div className="transaction-details">
//                           <div className="transaction-description">{transaction.description}</div>
//                           <div className="transaction-meta">{transaction.category} • {transaction.time}</div>
//                         </div>
//                       </div>
//                       <div className={`transaction-amount ${transaction.type === 'credit' ? 'transaction-amount-credit' : 'transaction-amount-debit'}`}>
//                         {transaction.type === 'credit' ? '+' : '-'}R{transaction.amount}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Right Sidebar Content */}
//             <div className="content-right">
//               {/* Security Status */}
//               <div className="security-card">
//                 <div className="card-header">
//                   <div className="card-title-section">
//                     <div className="card-icon card-icon-security">
//                       <Shield className="icon" />
//                     </div>
//                     <h3 className="card-title">Security Status</h3>
//                   </div>
//                   <div className="live-indicator">
//                     <div className="live-dot"></div>
//                     <span className="live-text">Live</span>
//                   </div>
//                 </div>

//                 <div className="security-metrics">
//                   {securityMetrics.map((metric, index) => (
//                     <div key={index} className="security-metric">
//                       <span className="security-label">{metric.label}</span>
//                       <div className="security-value">
//                         <span className="security-text">{metric.value}</span>
//                         <CheckCircle className="security-check" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="cobol-status">
//                   <div className="cobol-indicator">
//                     <Lock className="cobol-icon" />
//                     <span className="cobol-text">COBOL mainframe integration active</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Actions */}
//               <div className="actions-card">
//                 <h3 className="card-title">Personalized Financial Tips</h3>
//                 <div className="actions-list">
//                   <button className="action-btn action-btn-primary">
//                     <Zap className="action-icon" />
//                     <span className="action-text">Spend Less Than You Earn</span>
//                   </button>
//                   <button className="action-btn action-btn-primary">
//                     <PieChart className="action-icon" />
//                     <span className="action-text">Invest Early and Regularly</span>
//                   </button>
//                   <button className="action-btn action-btn-primary">
//                     <Target className="action-icon" />
//                     <span className="action-text">Track Your Expenses</span>
//                   </button>
//                   <button className="action-btn action-btn-primary">
//                     <Database className="action-icon" />
//                     <span className="action-text">Avoid High-Interest Debt</span>
//                   </button>
//                   <button className="action-btn action-btn-primary">
//                     <Database className="action-icon" />
//                     <span className="action-text">Build an Emergency Fund</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Performance Metrics */}
//               <div className="performance-card">
//                 <h3 className="card-title">System Performance</h3>
//                 <div className="performance-metrics">
//                   <div className="performance-metric">
//                     <div className="performance-header">
//                       <span className="performance-label">AI Processing</span>
//                       <span className="performance-value performance-value-green">98%</span>
//                     </div>
//                     <div className="progress-bar">
//                       <div className="progress-fill progress-fill-green" style={{width: '98%'}}></div>
//                     </div>
//                   </div>
//                   <div className="performance-metric">
//                     <div className="performance-header">
//                       <span className="performance-label">COBOL Uptime</span>
//                       <span className="performance-value performance-value-blue">99.9%</span>
//                     </div>
//                     <div className="progress-bar">
//                       <div className="progress-fill progress-fill-blue" style={{width: '99.9%'}}></div>
//                     </div>
//                   </div>
//                   <div className="performance-metric">
//                     <div className="performance-header">
//                       <span className="performance-label">Security Score</span>
//                       <span className="performance-value performance-value-purple">100%</span>
//                     </div>
//                     <div className="progress-bar">
//                       <div className="progress-fill progress-fill-purple" style={{width: '100%'}}></div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import "../styles/Dashboard.css";
import CallButton from './CallButton';
// import 'bootstrap/dist/css/bootstrap.min.css';

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

// Placeholders for metrics, AI insights, and security unless you make them dynamic
const aiInsights = [
  {
    type: 'success',
    icon: <CheckCircle className="icon" />,
    title: 'Spending Optimization',
    message: 'Your grocery spending is 15% below average. Consider investing the savings.',
    confidence: 94
  },
  {
    type: 'warning',
    icon: <AlertTriangle className="icon" />,
    title: 'Bill Prediction',
    message: 'Electricity bill likely to increase by R180 next month based on usage patterns.',
    confidence: 87
  },
  {
    type: 'info',
    icon: <TrendingUp className="icon" />,
    title: 'Investment Opportunity',
    message: 'Stock market trends suggest a good time to increase your portfolio by 5%.',
    confidence: 91
  }
];
const securityMetrics = [
  { label: '2FA Status', value: 'Active' },
  { label: 'Encryption', value: '256-bit' },
  { label: 'Last Scan', value: '2 min ago' },
  { label: 'Threats', value: '0 detected' }
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  //if (loading) 
  // return <div className="dashboard-loading">Loading dashboard data...</div>;

    // Loading state
  if (loading) 
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#8A1F2C' }} />
          <p style={{ color: '#cbd5e1' }}>Just a moment — we’re refreshing things...</p>
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
                  <CallButton clientName="John Doe" />{/* CallButton component for initiating calls */}
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
            {/* Charts Grid (remains static -- you can wire it up later) */}
            <div className="charts-grid">
              {/* Spending by Category */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Spending by Category</h3>
                  <p className="chart-subtitle">Your spending breakdown for the current period</p>
                </div>
                <div className="chart-content">
                  {/* Placeholders */}
                  <div className="pie-chart-container">
                    <div className="pie-chart">
                      <div className="pie-slice pie-slice-red" style={{transform: 'rotate(0deg)'}}>
                        <span className="pie-label">0: 23.0%</span>
                      </div>
                      <div className="pie-slice pie-slice-orange" style={{transform: 'rotate(83deg)'}}>
                        <span className="pie-label">1: 21.7%</span>
                      </div>
                      <div className="pie-slice pie-slice-green" style={{transform: 'rotate(161deg)'}}>
                        <span className="pie-label">2: 12.1%</span>
                      </div>
                      <div className="pie-slice pie-slice-teal" style={{transform: 'rotate(204deg)'}}>
                        <span className="pie-label">3: 9.9%</span>
                      </div>
                      <div className="pie-slice pie-slice-blue" style={{transform: 'rotate(240deg)'}}>
                        <span className="pie-label">4: 7.1%</span>
                      </div>
                      <div className="pie-slice pie-slice-pink" style={{transform: 'rotate(266deg)'}}>
                        <span className="pie-label">5: 6.7%</span>
                      </div>
                      <div className="pie-slice pie-slice-purple" style={{transform: 'rotate(290deg)'}}>
                        <span className="pie-label">6: 6.1%</span>
                      </div>
                      <div className="pie-slice pie-slice-indigo" style={{transform: 'rotate(312deg)'}}>
                        <span className="pie-label">7: 4.7%</span>
                      </div>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-color legend-color-red"></div><span className="legend-label">Shopping</span></div>
                    <div className="legend-item"><div className="legend-color legend-color-orange"></div><span className="legend-label">Bills & Utilities</span></div>
                    <div className="legend-item"><div className="legend-color legend-color-green"></div><span className="legend-label">Groceries</span></div>
                    <div className="legend-item"><div className="legend-color legend-color-teal"></div><span className="legend-label">Travel</span></div>
                    <div className="legend-item"><div className="legend-color legend-color-blue"></div><span className="legend-label">Entertainment</span></div>
                    <div className="legend-item"><div className="legend-color legend-color-pink"></div><span className="legend-label">Education</span></div>
                  </div>
                </div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Monthly Income vs Expenses</h3>
                  <p className="chart-subtitle">Compare your monthly income and spending patterns</p>
                </div>
                <div className="chart-content">
                  <div className="bar-chart">
                    <div className="chart-y-axis">
                      <span className="y-label">R28,000</span>
                      <span className="y-label">R21,000</span>
                      <span className="y-label">R14,000</span>
                      <span className="y-label">R7,000</span>
                      <span className="y-label">R0</span>
                    </div>
                    <div className="chart-bars">
                      <div className="bar-group">
                        <div className="bar bar-income" style={{height: '95%'}}></div>
                        <div className="bar bar-expense" style={{height: '5%'}}></div>
                        <span className="bar-label">Jan</span>
                      </div>
                      <div className="bar-group">
                        <div className="bar bar-income" style={{height: '75%'}}></div>
                        <div className="bar bar-expense" style={{height: '18%'}}></div>
                        <span className="bar-label">Feb</span>
                      </div>
                      <div className="bar-group">
                        <div className="bar bar-income" style={{height: '55%'}}></div>
                        <div className="bar bar-expense" style={{height: '20%'}}></div>
                        <span className="bar-label">Mar</span>
                      </div>
                      <div className="bar-group">
                        <div className="bar bar-income" style={{height: '95%'}}></div>
                        <div className="bar bar-expense" style={{height: '16%'}}></div>
                        <span className="bar-label">Apr</span>
                      </div>
                      <div className="bar-group">
                        <div className="bar bar-income" style={{height: '88%'}}></div>
                        <div className="bar bar-expense" style={{height: '17%'}}></div>
                        <span className="bar-label">May</span>
                      </div>
                      <div className="bar-group">
                        <div className="bar bar-income" style={{height: '12%'}}></div>
                        <div className="bar bar-expense" style={{height: '8%'}}></div>
                        <span className="bar-label">Jun</span>
                      </div>
                    </div>
                  </div>
                  <div className="chart-legend chart-legend-horizontal">
                    <div className="legend-item">
                      <div className="legend-color legend-color-income"></div>
                      <span className="legend-label">Income</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color legend-color-expense"></div>
                      <span className="legend-label">Expenses</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
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
                    <div key={transaction.transaction_id} className="transaction-item">
                      <div className="transaction-info">
                        <div className={`transaction-icon ${transaction.transaction_type === 'credit' ? 'transaction-icon-credit' : 'transaction-icon-debit'}`}>
                          {transaction.transaction_type === 'credit' ? 
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
                      <div className={`transaction-amount ${transaction.transaction_type === 'credit' ? 'transaction-amount-credit' : 'transaction-amount-debit'}`}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}R{Number(transaction.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#999' }}>No recent transactions</div>
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