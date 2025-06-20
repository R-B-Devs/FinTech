import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Target, CreditCard, PiggyBank, Brain, Users, Bell, Settings, Filter, Download, RefreshCw } from 'lucide-react';

const MoneyTracker = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6months');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(3);

  // Enhanced mock data with more detailed information
  const cashFlowData = [
    { month: 'Jan', income: 28500, expenses: 22800, netFlow: 5700, savings: 5700 },
    { month: 'Feb', income: 28500, expenses: 24200, netFlow: 4300, savings: 4300 },
    { month: 'Mar', income: 28500, expenses: 21900, netFlow: 6600, savings: 6600 },
    { month: 'Apr', income: 28500, expenses: 23400, netFlow: 5100, savings: 5100 },
    { month: 'May', income: 28500, expenses: 24700, netFlow: 3800, savings: 3800 },
    { month: 'Jun', income: 28500, expenses: 22800, netFlow: 5700, savings: 5700 }
  ];

  const categoryData = [
    { name: 'Groceries', value: 4200, color: '#10B981' },
    { name: 'Transport', value: 1800, color: '#3B82F6' },
    { name: 'Entertainment', value: 1200, color: '#F59E0B' },
    { name: 'Shopping', value: 2100, color: '#8B5CF6' },
    { name: 'Bills', value: 3400, color: '#EF4444' },
    { name: 'Other', value: 800, color: '#6B7280' }
  ];

  const spendingPatternData = [
    { day: 'Mon', amount: 250, transactions: 3, avgPerTransaction: 83 },
    { day: 'Tue', amount: 210, transactions: 2, avgPerTransaction: 105 },
    { day: 'Wed', amount: 340, transactions: 4, avgPerTransaction: 85 },
    { day: 'Thu', amount: 305, transactions: 5, avgPerTransaction: 61 },
    { day: 'Fri', amount: 495, transactions: 7, avgPerTransaction: 71 },
    { day: 'Sat', amount: 690, transactions: 8, avgPerTransaction: 86 },
    { day: 'Sun', amount: 420, transactions: 4, avgPerTransaction: 105 }
  ];

  const financialHealthMetrics = [
    { metric: 'Debt-to-Income', value: 28, target: 30, status: 'good', description: 'Manageable debt levels' },
    { metric: 'Emergency Fund', value: 4.2, target: 6, status: 'warning', description: 'Build up emergency savings' },
    { metric: 'Savings Rate', value: 18, target: 20, status: 'good', description: 'Strong saving habits' },
    { metric: 'Credit Utilization', value: 15, target: 30, status: 'excellent', description: 'Excellent credit usage' }
  ];

  const topMerchants = [
    { name: 'Takealot', amount: 1890, transactions: 12, category: 'Shopping', trend: '+5%' },
    { name: 'Mugg & Bean', amount: 865, transactions: 24, category: 'Food', trend: '-12%' },
    { name: 'Shell', amount: 1605, transactions: 8, category: 'Transport', trend: '+8%' },
    { name: 'Pick n Pay', amount: 2470, transactions: 6, category: 'Groceries', trend: '+3%' },
    { name: 'Netflix', amount: 169, transactions: 1, category: 'Entertainment', trend: '0%' }
  ];

  const upcomingBills = [
    { name: 'Rent', amount: 6500, date: '2025-06-25', status: 'upcoming', daysLeft: 6 },
    { name: 'Car Insurance', amount: 495, date: '2025-06-28', status: 'upcoming', daysLeft: 9 },
    { name: 'Cell Phone', amount: 360, date: '2025-07-02', status: 'scheduled', daysLeft: 13 },
    { name: 'Fibre Internet', amount: 439, date: '2025-07-05', status: 'scheduled', daysLeft: 16 }
  ];

  const aiInsights = [
    {
      type: 'prediction',
      title: 'Spending Forecast',
      message: 'Based on your patterns, you\'ll likely spend R23,600 next month - R830 more than usual due to vacation season.',
      confidence: 89,
      action: 'Set budget alert'
    },
    {
      type: 'opportunity',
      title: 'Savings Opportunity',
      message: 'You could save R250/month by switching to a different coffee subscription plan.',
      confidence: 76,
      action: 'Compare plans'
    },
    {
      type: 'alert',
      title: 'Unusual Activity',
      message: 'Your dining out expenses are 34% higher than last month. Consider meal planning.',
      confidence: 92,
      action: 'View details'
    }
  ];

  const handleRefreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
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

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>MoneyTracker</h1>
            <p style={{ color: '#cbd5e1' }}>AI-powered financial insights and cash flow monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefreshData}
              className="p-2 rounded-lg transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: '#2a2a2a', color: '#ffffff' }}
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <Bell className="w-6 h-6" style={{ color: '#cbd5e1' }} />
              {notifications > 0 && (
                <span 
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: '#8A1F2C' }}
                >
                  {notifications}
                </span>
              )}
            </div>
            <Settings className="w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity" style={{ color: '#cbd5e1' }} />
          </div>
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
            value="R5,700"
            change="+R830 vs last month"
            icon={DollarSign}
            trend="up"
          />
          <StatusCard
            title="Avg Daily Spending"
            value="R790"
            change="-R45 vs last month"
            icon={TrendingDown}
            trend="down"
          />
          <StatusCard
            title="Financial Health"
            value="8.4/10"
            change="+0.3 improvement"
            icon={Target}
            trend="up"
          />
          <StatusCard
            title="Savings Rate"
            value="18%"
            change="Steady"
            icon={PiggyBank}
            trend="neutral"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 p-1 shadow-sm rounded-lg" style={{ backgroundColor: '#1a1a1a' }}>
          {[
            { id: 'overview', label: 'Cash Flow', icon: TrendingUp },
            { id: 'patterns', label: 'Spending Patterns', icon: Calendar },
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending by Category */}
              <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Spending by Category</h3>
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
              </div>

              {/* Upcoming Bills */}
              <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Upcoming Bills</h3>
                <div className="space-y-3">
                  {upcomingBills.map((bill, index) => (
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            {/* Weekly Spending Pattern */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Weekly Spending Patterns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendingPatternData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="day" stroke="#cbd5e1" />
                  <YAxis stroke="#cbd5e1" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Merchants */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Top Merchants</h3>
              <div className="space-y-4">
                {topMerchants.map((merchant, index) => (
                  <div key={index} className="flex items-center justify-between hover:opacity-80 transition-opacity">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#2a2a2a' }}>
                        <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>
                          {merchant.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: '#ffffff' }}>{merchant.name}</p>
                        <p className="text-sm" style={{ color: '#94a3b8' }}>
                          {merchant.transactions} transactions • {merchant.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold" style={{ color: '#ffffff' }}>R{merchant.amount}</span>
                      <p className={`text-sm ${merchant.trend.includes('+') ? 'text-green-400' : merchant.trend.includes('-') ? 'text-red-400' : 'text-gray-400'}`}>
                        {merchant.trend}
                      </p>
                    </div>
                  </div>
                ))}
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
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Financial Health Score: 8.4/10</h3>
              <div className="space-y-4">
                {[
                  { name: 'Debt Management', score: 8.5, color: '#10B981' },
                  { name: 'Emergency Preparedness', score: 7.0, color: '#F59E0B' },
                  { name: 'Investment Growth', score: 9.0, color: '#3B82F6' }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span style={{ color: '#e2e8f0' }}>{item.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 rounded-full h-2" style={{ backgroundColor: '#3a3a3a' }}>
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(item.score / 10) * 100}%`, backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{item.score}/10</span>
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
              {aiInsights.map((insight, index) => (
                <InsightCard key={index} insight={insight} index={index} />
              ))}
            </div>

            {/* Predictive Analytics */}
            <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#1a1a1a' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Spending Forecast</h3>
              <div className="rounded-lg p-4 mb-4" style={{ background: 'linear-gradient(to right, #1a2332, #1e2238)' }}>
                <p className="text-sm mb-2" style={{ color: '#94a3b8' }}>Next Month Prediction</p>
                <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>R23,600</p>
                <p className="text-sm" style={{ color: '#94a3b8' }}>+R830 increase expected due to seasonal trends</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { category: 'Groceries', amount: 3780, change: '-5%', color: 'text-green-400' },
                  { category: 'Entertainment', amount: 1890, change: '+25%', color: 'text-red-400' },
                  { category: 'Transport', amount: 1610, change: 'Steady', color: 'text-gray-400' }
                ].map((item, index) => (
                  <div key={index} className="text-center p-3 rounded-lg" style={{ backgroundColor: '#2a2a2a' }}>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>{item.category}</p>
                    <p className="text-lg font-semibold" style={{ color: '#ffffff' }}>R{item.amount}</p>
                    <p className={`text-xs ${item.color}`}>{item.change}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoneyTracker;