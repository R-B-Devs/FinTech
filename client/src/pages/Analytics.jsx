import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Download, Filter, AlertTriangle, RefreshCw } from 'lucide-react';
import BackToDashboardButton from '../pages/BackToDashboardButton';

const COLORS = ['#a10d2f', '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'];

const Analytics = () => {
  const [dateRange, setDateRange] = useState({ start: '2025-06-01', end: '2025-06-30' });
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for API data
  const [cashFlowData, setCashFlowData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [financialHealthMetrics, setFinancialHealthMetrics] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [overviewStats, setOverviewStats] = useState({
    netCashFlow: 0,
    avgDailySpending: 0,
    financialHealth: 0,
    savingsRate: 0
  });

  // API call functions
  const fetchCashFlowData = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('Not authenticated. Please log in.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/analytics/cash-flow?timeRange=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setCashFlowData(data.cashFlow || []);
      } else {
        setError(data.error || 'Failed to fetch cash flow data');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  const fetchCategoryData = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/analytics/spending-categories?timeRange=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setCategoryData(data.categories || []);
      } else {
        setError(data.error || 'Failed to fetch category data');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  const fetchFinancialHealth = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/analytics/financial-health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setFinancialHealthMetrics(data.metrics || []);
      } else {
        setError(data.error || 'Failed to fetch financial health data');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  const fetchTopMerchants = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/analytics/top-merchants?timeRange=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setTopMerchants(data.merchants || []);
      } else {
        setError(data.error || 'Failed to fetch merchant data');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  const fetchUpcomingBills = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/analytics/upcoming-bills', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUpcomingBills(data.bills || []);
      } else {
        setError(data.error || 'Failed to fetch bills data');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  const fetchAiInsights = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/analytics/ai-insights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setAiInsights(data.insights || []);
      } else {
        setError(data.error || 'Failed to fetch AI insights');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  const fetchOverviewStats = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:3001/api/analytics/overview?timeRange=${selectedPeriod}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        setOverviewStats(data.stats || {});
      } else {
        setError(data.error || 'Failed to fetch overview stats');
      }
    } catch (err) {
      setError('Server connection failed');
    }
  };

  // Fetch all data when component mounts or selectedPeriod changes
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      try {
        await Promise.all([
          fetchCashFlowData(),
          fetchCategoryData(),
          fetchFinancialHealth(),
          fetchTopMerchants(),
          fetchUpcomingBills(),
          fetchAiInsights(),
          fetchOverviewStats()
        ]);
      } catch (err) {
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [selectedPeriod]);

  const handleRefreshData = async () => {
    setLoading(true);
    setError('');

    try {
      await Promise.all([
        fetchCashFlowData(),
        fetchCategoryData(),
        fetchFinancialHealth(),
        fetchTopMerchants(),
        fetchUpcomingBills(),
        fetchAiInsights(),
        fetchOverviewStats()
      ]);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Generate KPI data from API data
  const kpiData = useMemo(() => {
    const totalIncome = cashFlowData.reduce((sum, item) => sum + (item.income || 0), 0);
    const totalExpenses = cashFlowData.reduce((sum, item) => sum + (item.expenses || 0), 0);
    const netSavings = totalIncome - totalExpenses;
    
    return [
      { 
        title: 'Total Income', 
        value: `R ${totalIncome.toLocaleString()}`, 
        change: '+8.5%', // You could calculate this from previous period
        trend: 'up',
        icon: DollarSign 
      },
      { 
        title: 'Total Expenses', 
        value: `R ${totalExpenses.toLocaleString()}`, 
        change: '+2.1%', 
        trend: 'up',
        icon: TrendingUp 
      },
      { 
        title: 'Net Savings', 
        value: `R ${netSavings.toLocaleString()}`, 
        change: '+15.3%', 
        trend: netSavings > 0 ? 'up' : 'down',
        icon: Target 
      },
      { 
        title: 'Financial Health', 
        value: `${overviewStats.financialHealth || 0}/10`, 
        change: overviewStats.financialHealthChange || '+0.5', 
        trend: 'up',
        icon: TrendingUp 
      },
    ];
  }, [cashFlowData, overviewStats]);

  // Convert category data to spending data format
  const spendingData = useMemo(() => {
    return categoryData.map((cat, index) => ({
      name: cat.name,
      value: cat.value,
      budget: cat.value * 1.2, // Mock budget (20% higher than actual)
      color: COLORS[index % COLORS.length]
    }));
  }, [categoryData]);

  // Convert cash flow data to monthly trend format
  const monthlyTrendData = useMemo(() => {
    return cashFlowData.map(item => ({
      month: item.month,
      income: item.income || 0,
      expenses: item.expenses || 0,
      savings: item.netFlow || 0,
      investments: Math.round((item.income || 0) * 0.1) // Mock 10% investment rate
    }));
  }, [cashFlowData]);

  // Convert to weekly cash flow (mock transformation)
  const weeklyFlowData = useMemo(() => {
    if (cashFlowData.length === 0) return [];
    
    const latestMonth = cashFlowData[cashFlowData.length - 1];
    return [
      { name: 'Week 1', income: Math.round((latestMonth.income || 0) / 4), expenses: Math.round((latestMonth.expenses || 0) / 4), net: Math.round((latestMonth.netFlow || 0) / 4) },
      { name: 'Week 2', income: Math.round((latestMonth.income || 0) / 4), expenses: Math.round((latestMonth.expenses || 0) / 4), net: Math.round((latestMonth.netFlow || 0) / 4) },
      { name: 'Week 3', income: Math.round((latestMonth.income || 0) / 4), expenses: Math.round((latestMonth.expenses || 0) / 4), net: Math.round((latestMonth.netFlow || 0) / 4) },
      { name: 'Week 4', income: Math.round((latestMonth.income || 0) / 4), expenses: Math.round((latestMonth.expenses || 0) / 4), net: Math.round((latestMonth.netFlow || 0) / 4) },
    ];
  }, [cashFlowData]);

  // Mock goal data (you can create an API endpoint for this later)
  const goalData = [
    { goal: 'Emergency Fund', target: 50000, current: 32000, percentage: 64 },
    { goal: 'Vacation Fund', target: 15000, current: 8500, percentage: 57 },
    { goal: 'Car Down Payment', target: 25000, current: 18000, percentage: 72 },
    { goal: 'Investment Portfolio', target: 100000, current: 45000, percentage: 45 },
  ];

  const totalBudget = useMemo(() => 
    spendingData.reduce((sum, item) => sum + item.budget, 0), 
    [spendingData]
  );

  const totalSpent = useMemo(() => 
    spendingData.reduce((sum, item) => sum + item.value, 0), 
    [spendingData]
  );

  const budgetUtilization = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      className={`tab-button ${active ? 'active' : ''}`}
      onClick={() => onClick(id)}
    >
      {label}
    </button>
  );

  const KPICard = ({ kpi }) => {
    const Icon = kpi.icon;
    return (
      <div className="kpi-card">
        <BackToDashboardButton />
        <div className="kpi-header">
          <Icon size={24} className="kpi-icon" />
          <span className={`kpi-trend ${kpi.trend}`}>
            {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {kpi.change}
          </span>
        </div>
        <h3 className="kpi-title">{kpi.title}</h3>
        <p className="kpi-value">{kpi.value}</p>
      </div>
    );
  };

  const InsightAlert = ({ insight }) => (
    <div className={`insight-alert ${insight.type} high`}>
      <AlertTriangle size={16} />
      <span>{insight.message}</span>
    </div>
  );

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <p className="font-medium" style={{ color: '#ffffff' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: R{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#8A1F2C' }} />
          <p style={{ color: '#cbd5e1' }}>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-4" style={{ color: '#EF4444' }} />
          <p style={{ color: '#EF4444' }}>{error}</p>
          <button 
            onClick={handleRefreshData}
            className="mt-4 px-4 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#8A1F2C', color: '#ffffff' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header Section */}
      <div className="analytics-header">
        <div className="header-content">
          <div>
            <h1>Financial Analytics</h1>
            <p className="date-range">
              <Calendar size={16} />
              {dateRange.start} → {dateRange.end}
            </p>
          </div>
          <div className="header-controls">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-selector"
            >
              <option value="3months">3 Months</option>
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
            </select>
            <button 
              onClick={handleRefreshData}
              className="export-btn"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="analytics-tabs">
          <TabButton id="overview" label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="spending" label="Spending Analysis" active={activeTab === 'spending'} onClick={setActiveTab} />
          <TabButton id="trends" label="Trends" active={activeTab === 'trends'} onClick={setActiveTab} />
          <TabButton id="goals" label="Goals" active={activeTab === 'goals'} onClick={setActiveTab} />
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="kpi-grid">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      {/* Budget Summary Card */}
      {spendingData.length > 0 && (
        <div className="budget-summary-card">
          <div className="budget-header">
            <h3>Budget Overview</h3>
            <span className={`budget-status ${budgetUtilization > 90 ? 'warning' : budgetUtilization > 70 ? 'caution' : 'good'}`}>
              {budgetUtilization}% Utilized
            </span>
          </div>
          <div className="budget-bar">
            <div 
              className="budget-progress" 
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            />
          </div>
          <div className="budget-amounts">
            <span>Spent: R {totalSpent.toLocaleString()}</span>
            <span>Budget: R {totalBudget.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Alert Section */}
      {aiInsights.length > 0 && (
        <div className="insights-section">
          <h3>AI Insights & Alerts</h3>
          <div className="insights-grid">
            {aiInsights.map((insight, index) => (
              <InsightAlert key={index} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Cash Flow Analysis</h3>
              {weeklyFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#f44336" fill="#f44336" fillOpacity={0.3} />
                    <Line type="monotone" dataKey="net" stroke="#ffce56" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64" style={{ color: '#94a3b8' }}>
                  No cash flow data available
                </div>
              )}
            </div>

            <div className="chart-card">
              <h3>Spending Distribution</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={spendingData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {spendingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`R ${value.toLocaleString()}`, 'Amount']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64" style={{ color: '#94a3b8' }}>
                  No category data available
                </div>
              )}
            </div>
          </div>

          {/* Top Merchants Section */}
          {topMerchants.length > 0 && (
            <div className="chart-card">
              <h3>Top Merchants</h3>
              <div className="space-y-3">
                {topMerchants.slice(0, 5).map((merchant, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" 
                           style={{ backgroundColor: '#a10d2f', color: '#ffffff' }}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#ffffff' }}>{merchant.name}</p>
                        <p className="text-sm" style={{ color: '#94a3b8' }}>{merchant.transactionCount} transactions</p>
                      </div>
                    </div>
                    <span className="font-semibold" style={{ color: '#ffffff' }}>R{merchant.totalSpent?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="tab-content">
          <div className="spending-analysis">
            <div className="chart-card full-width">
              <h3>Budget vs Actual Spending</h3>
              {spendingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={spendingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="budget" fill="#4a4a4a" name="Budget" />
                    <Bar dataKey="value" fill="#a10d2f" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64" style={{ color: '#94a3b8' }}>
                  No spending data available
                </div>
              )}
            </div>

            <div className="category-breakdown">
              <h3>Category Analysis</h3>
              {spendingData.length > 0 ? spendingData.map((category) => {
                const overBudget = category.value > category.budget;
                const percentage = (category.value / category.budget * 100).toFixed(1);
                
                return (
                  <div key={category.name} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{category.name}</span>
                      <span className={`category-status ${overBudget ? 'over' : 'under'}`}>
                        {percentage}% of budget
                      </span>
                    </div>
                    <div className="category-amounts">
                      <span>R {category.value.toLocaleString()} / R {category.budget.toLocaleString()}</span>
                      {overBudget && (
                        <span className="over-budget">+R {(category.value - category.budget).toLocaleString()}</span>
                      )}
                    </div>
                    <div className="category-progress-bar">
                      <div 
                        className={`progress-fill ${overBudget ? 'over-budget' : ''}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              }) : (
                <p style={{ color: '#94a3b8' }}>No category data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="tab-content">
          <div className="chart-card full-width">
            <h3>Monthly Financial Trends</h3>
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="month" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#4caf50" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={2} />
                  <Line type="monotone" dataKey="savings" stroke="#36a2eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="investments" stroke="#ffce56" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64" style={{ color: '#94a3b8' }}>
                No trend data available
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="tab-content">
          <div className="goals-grid">
            {goalData.map((goal) => (
              <div key={goal.goal} className="goal-card">
                <div className="goal-header">
                  <h4>{goal.goal}</h4>
                  <span className="goal-percentage">{goal.percentage}%</span>
                </div>
                <div className="goal-progress">
                  <div className="goal-progress-bar">
                    <div 
                      className="goal-progress-fill"
                      style={{ width: `${goal.percentage}%` }}
                    />
                  </div>
                  <div className="goal-amounts">
                    <span>R {goal.current.toLocaleString()}</span>
                    <span>R {goal.target.toLocaleString()}</span>
                  </div>
                </div>
                <div className="goal-remaining">
                  R {(goal.target - goal.current).toLocaleString()} remaining
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .analytics-container {
          padding: 2rem;
          background: #0a0a0a;
          color: #ffffff;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .analytics-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .header-content h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #a10d2f, #ff6384);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ccc;
          margin: 0.5rem 0 0 0;
        }

        .header-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .period-selector {
          background: #1a1a1a;
          border: 1px solid #333;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #a10d2f;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .export-btn:hover {
          background: #8a0b26;
        }

        .export-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .analytics-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid #333;
        }

        .tab-button {
          background: none;
          border: none;
          color: #ccc;
          padding: 1rem 1.5rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-button.active {
          color: #a10d2f;
          border-bottom-color: #a10d2f;
        }

        .tab-button:hover {
          color: #fff;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .kpi-card {
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(161, 13, 47, 0.15);
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .kpi-icon {
          color: #a10d2f;
        }

        .kpi-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .kpi-trend.up {
          color: #4caf50;
        }

        .kpi-trend.down {
          color: #f44336;
        }

        .kpi-title {
          font-size: 0.875rem;
          color: #ccc;
          margin: 0;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          margin: 0.5rem 0 0 0;
          color: #fff;
        }

        .budget-summary-card {
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .budget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .budget-header h3 {
          margin: 0;
          color: #fff;
        }

        .budget-status {
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
        }

        .budget-status.good {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .budget-status.caution {
          background: rgba(255, 206, 86, 0.2);
          color: #ffce56;
        }

        .budget-status.warning {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .budget-bar {
          width: 100%;
          height: 8px;
          background: #333;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .budget-progress {
          height: 100%;
          background: linear-gradient(90deg, #4caf50, #ffce56, #f44336);
          transition: width 0.3s ease;
        }

        .budget-amounts {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #ccc;
        }

        .insights-section {
          margin-bottom: 2rem;
        }

        .insights-section h3 {
          margin-bottom: 1rem;
          color: #fff;
        }

        .insights-grid {
          display: grid;
          gap: 1rem;
        }

        .insight-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid;
        }

        .insight-alert.warning {
          background: rgba(244, 67, 54, 0.1);
          border-left-color: #f44336;
          color: #ffcdd2;
        }

        .insight-alert.success {
          background: rgba(76, 175, 80, 0.1);
          border-left-color: #4caf50;
          color: #c8e6c9;
        }

        .insight-alert.info {
          background: rgba(54, 162, 235, 0.1);
          border-left-color: #36a2eb;
          color: #bbdefb;
        }

        .insight-alert.opportunity {
          background: rgba(76, 175, 80, 0.1);
          border-left-color: #4caf50;
          color: #c8e6c9;
        }

        .insight-alert.prediction {
          background: rgba(54, 162, 235, 0.1);
          border-left-color: #36a2eb;
          color: #bbdefb;
        }

        .insight-alert.alert {
          background: rgba(244, 67, 54, 0.1);
          border-left-color: #f44336;
          color: #ffcdd2;
        }

        .tab-content {
          margin-top: 2rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-card {
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .chart-card h3 {
          margin: 0 0 1rem 0;
          color: #fff;
        }

        .chart-card.full-width {
          grid-column: 1 / -1;
        }

        .spending-analysis {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .category-breakdown {
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .category-breakdown h3 {
          margin: 0 0 1.5rem 0;
          color: #fff;
        }

        .category-item {
          margin-bottom: 1.5rem;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .category-name {
          font-weight: 600;
          color: #fff;
        }

        .category-status {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .category-status.over {
          color: #f44336;
        }

        .category-status.under {
          color: #4caf50;
        }

        .category-amounts {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #ccc;
          margin-bottom: 0.5rem;
        }

        .over-budget {
          color: #f44336;
          font-weight: 600;
        }

        .category-progress-bar {
          width: 100%;
          height: 6px;
          background: #333;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #4caf50;
          transition: width 0.3s ease;
        }

        .progress-fill.over-budget {
          background: #f44336;
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .goal-card {
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .goal-header h4 {
          margin: 0;
          color: #fff;
        }

        .goal-percentage {
          font-size: 1.25rem;
          font-weight: 700;
          color: #a10d2f;
        }

        .goal-progress-bar {
          width: 100%;
          height: 8px;
          background: #333;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .goal-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #a10d2f, #ff6384);
          transition: width 0.3s ease;
        }

        .goal-amounts {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #ccc;
          margin-bottom: 0.5rem;
        }

        .goal-remaining {
          font-size: 0.875rem;
          color: #a10d2f;
          font-weight: 600;
        }

        .space-y-3 > * + * {
          margin-top: 0.75rem;
        }

        .flex {
          display: flex;
        }

        .items-center {
          align-items: center;
        }

        .justify-between {
          justify-content: space-between;
        }

        .justify-center {
          justify-content: center;
        }

        .space-x-3 > * + * {
          margin-left: 0.75rem;
        }

        .rounded-lg {
          border-radius: 0.5rem;
        }

        .p-3 {
          padding: 0.75rem;
        }

        .w-8 {
          width: 2rem;
        }

        .h-8 {
          height: 2rem;
        }

        .h-64 {
          height: 16rem;
        }

        .rounded-full {
          border-radius: 50%;
        }

        .text-sm {
          font-size: 0.875rem;
        }

        .font-bold {
          font-weight: 700;
        }

        .font-medium {
          font-weight: 500;
        }

        .font-semibold {
          font-weight: 600;
        }

        .min-h-screen {
          min-height: 100vh;
        }

        .text-center {
          text-align: center;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        .mb-4 {
          margin-bottom: 1rem;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        .px-4 {
          padding-left: 1rem;
          padding-right: 1rem;
        }

        .py-2 {
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }

        .transition-colors {
          transition-property: background-color, border-color, color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .duration-200 {
          transition-duration: 200ms;
        }

        .hover\\:opacity-80:hover {
          opacity: 0.8;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .analytics-container {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .spending-analysis {
            grid-template-columns: 1fr;
          }

          .analytics-tabs {
            overflow-x: auto;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;