import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Target, CreditCard, PiggyBank, Brain, Users, Bell, Settings, Filter, Download, RefreshCw } from 'lucide-react';
import "../styles/MoneyTracker.css";

const MoneyTracker = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(3);
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
      const response = await fetch(`http://localhost:3001/api/analytics/cash-flow?timeRange=${timeRange}`, {
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
      const response = await fetch(`http://localhost:3001/api/analytics/spending-categories?timeRange=${timeRange}`, {
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
      const response = await fetch(`http://localhost:3001/api/analytics/top-merchants?timeRange=${timeRange}`, {
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
      const response = await fetch(`http://localhost:3001/api/analytics/overview?timeRange=${timeRange}`, {
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

  // Fetch all data when component mounts or timeRange changes
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
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [timeRange]);

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

  const StatusCard = ({ title, value, change, icon: Icon, trend, onClick }) => (
    <div 
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={{
        backgroundColor: '#1a1a1a',
        borderColor: '#2a2a2a',
        color: '#ffffff'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: '#ffffff' }}>{value}</p>
        </div>
        <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
      {change && (
        <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          <span className="text-sm font-medium">{change}</span>
        </div>
      )}
    </div>
  );

  const MetricCard = ({ metric, value, target, status, description }) => {
    const percentage = (value / target) * 100;
    const getStatusColor = () => {
      switch(status) {
        case 'excellent': return '#10B981';
        case 'good': return '#3B82F6';
        case 'warning': return '#F59E0B';
        case 'danger': return '#EF4444';
        default: return '#6B7280';
      }
    };

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-all duration-200" 
           style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{metric}</h4>
          <span 
            className="px-2 py-1 text-xs rounded-full text-white"
            style={{ backgroundColor: getStatusColor() }}
          >
            {status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold" style={{ color: '#ffffff' }}>
            {metric.includes('Fund') ? `${value} months` : `${value}%`}
          </span>
          <span className="text-sm" style={{ color: '#94a3b8' }}>
            / {metric.includes('Fund') ? `${target} months` : `${target}%`}
          </span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2" style={{ backgroundColor: '#3a3a3a' }}>
          <div 
            className="h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: getStatusColor()
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>{description}</p>
      </div>
    );
  };

  const InsightCard = ({ insight, index }) => (
    <div 
      className="bg-white rounded-xl p-6 shadow-sm border-l-4 hover:shadow-md transition-all duration-200"
      style={{ 
        backgroundColor: '#1a1a1a', 
        borderLeftColor: insight.type === 'prediction' ? '#3B82F6' : insight.type === 'opportunity' ? '#10B981' : '#F59E0B'
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {insight.type === 'prediction' && <Brain className="w-6 h-6" style={{ color: '#3B82F6' }} />}
          {insight.type === 'opportunity' && <Target className="w-6 h-6" style={{ color: '#10B981' }} />}
          {insight.type === 'alert' && <AlertTriangle className="w-6 h-6" style={{ color: '#F59E0B' }} />}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>{insight.title}</h4>
          <p className="mb-3" style={{ color: '#e2e8f0' }}>{insight.message}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm" style={{ color: '#94a3b8' }}>Confidence:</span>
              <div className="w-24 rounded-full h-2" style={{ backgroundColor: '#3a3a3a' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${insight.confidence}%`,
                    backgroundColor: '#3B82F6'
                  }}
                />
              </div>
              <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{insight.confidence}%</span>
            </div>
            <button 
              className="px-3 py-1 text-xs rounded-full transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: '#8A1F2C', color: '#ffffff' }}
            >
              {insight.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border" style={{ backgroundColor: '#1a1a1a', borderColor: '#2a2a2a' }}>
          <p className="font-medium" style={{ color: '#ffffff' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: R{entry.value}
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
          <p style={{ color: '#cbd5e1' }}>Loading financial data...</p>
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
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>MoneyTracker</h1>
            <p style={{ color: '#cbd5e1' }}>AI-powered financial insights and cash flow monitoring</p>
          </div>
          <button 
            onClick={handleRefreshData}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#8A1F2C', color: '#ffffff' }}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-2">
            {['3months', '6months', '1year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  timeRange === range 
                    ? 'text-white' 
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: timeRange === range ? '#8A1F2C' : '#2a2a2a',
                  color: timeRange === range ? '#ffffff' : '#cbd5e1'
                }}
              >
                {range === '3months' ? '3 Months' : range === '6months' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" style={{ color: '#cbd5e1' }} />
            <Download className="w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity" style={{ color: '#cbd5e1' }} />
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Net Cash Flow"
            value={`R${overviewStats.netCashFlow?.toLocaleString() || '0'}`}
            change={overviewStats.netCashFlowChange || 'N/A'}
            icon={DollarSign}
            trend={overviewStats.netCashFlowTrend || 'neutral'}
          />
          <StatusCard
            title="Avg Daily Spending"
            value={`R${overviewStats.avgDailySpending?.toLocaleString() || '0'}`}
            change={overviewStats.avgDailySpendingChange || 'N/A'}
            icon={TrendingDown}
            trend={overviewStats.avgDailySpendingTrend || 'neutral'}
          />
          <StatusCard
            title="Financial Health"
            value={`${overviewStats.financialHealth || '0'}/10`}
            change={overviewStats.financialHealthChange || 'N/A'}
            icon={Target}
            trend={overviewStats.financialHealthTrend || 'neutral'}
          />
          <StatusCard
            title="Savings Rate"
            value={`${overviewStats.savingsRate || '0'}%`}
            change={overviewStats.savingsRateChange || 'N/A'}
            icon={PiggyBank}
            trend={overviewStats.savingsRateTrend || 'neutral'}
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 p-1 shadow-sm rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
          {[
            { id: 'overview', label: 'Cash Flow', icon: TrendingUp },
            { id: 'health', label: 'Financial Health', icon: Target },
            { id: 'insights', label: 'AI Insights', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? '#8A1F2C' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#cbd5e1'
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cash Flow Chart */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Cash Flow Trends</h3>
              {cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="month" stroke="#cbd5e1" />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                    <Line type="monotone" dataKey="netFlow" stroke="#3B82F6" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64" style={{ color: '#94a3b8' }}>
                  No cash flow data available
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending by Category */}
              <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Spending by Category</h3>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`R${value}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64" style={{ color: '#94a3b8' }}>
                    No category data available
                  </div>
                )}
              </div>

              {/* Upcoming Bills */}
              <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Upcoming Bills</h3>
                <div className="space-y-3">
                  {upcomingBills.length > 0 ? upcomingBills.map((bill, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: bill.status === 'upcoming' ? '#F59E0B' : '#10B981' }}
                        />
                        <div>
                          <p className="font-medium" style={{ color: '#ffffff' }}>{bill.name}</p>
                          <p className="text-sm" style={{ color: '#94a3b8' }}>{bill.daysLeft} days left</p>
                        </div>
                      </div>
                      <span className="font-semibold" style={{ color: '#ffffff' }}>R{bill.amount}</span>
                    </div>
                  )) : (
                    <p style={{ color: '#94a3b8' }}>No upcoming bills</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-6">
            {/* Financial Health Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {financialHealthMetrics.map((item, index) => (
                <MetricCard key={index} {...item} />
              ))}
            </div>

            {/* Health Score Breakdown */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>
                Financial Health Score: {overviewStats.financialHealth || '0'}/10
              </h3>
              <div className="space-y-4">
                {financialHealthMetrics.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span style={{ color: '#e2e8f0' }}>{item.metric}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 rounded-full h-2" style={{ backgroundColor: '#3a3a3a' }}>
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(item.value / item.target) * 100}%`, 
                            backgroundColor: item.status === 'excellent' ? '#10B981' : 
                                           item.status === 'good' ? '#3B82F6' : 
                                           item.status === 'warning' ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
                        {item.value}/{item.target}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="grid gap-6">
              {aiInsights.length > 0 ? aiInsights.map((insight, index) => (
                <InsightCard key={index} insight={insight} index={index} />
              )) : (
                <div className="text-center py-12" style={{ color: '#94a3b8' }}>
                  No AI insights available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoneyTracker;