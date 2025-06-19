import React, { useState, useEffect } from 'react';
import "../styles/MoneyTracker.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Target, CreditCard, PiggyBank, Brain, Users } from 'lucide-react';

const MoneyTracker = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6months');

  // Mock data for demonstrations (South African Rands)
  const cashFlowData = [
    { month: 'Jan', income: 28500, expenses: 22800, netFlow: 5700 },
    { month: 'Feb', income: 28500, expenses: 24200, netFlow: 4300 },
    { month: 'Mar', income: 28500, expenses: 21900, netFlow: 6600 },
    { month: 'Apr', income: 28500, expenses: 23400, netFlow: 5100 },
    { month: 'May', income: 28500, expenses: 24700, netFlow: 3800 },
    { month: 'Jun', income: 28500, expenses: 22800, netFlow: 5700 }
  ];

  const spendingPatternData = [
    { day: 'Mon', amount: 250, transactions: 3 },
    { day: 'Tue', amount: 210, transactions: 2 },
    { day: 'Wed', amount: 340, transactions: 4 },
    { day: 'Thu', amount: 305, transactions: 5 },
    { day: 'Fri', amount: 495, transactions: 7 },
    { day: 'Sat', amount: 690, transactions: 8 },
    { day: 'Sun', amount: 420, transactions: 4 }
  ];

  const financialHealthMetrics = [
    { metric: 'Debt-to-Income', value: 28, target: 30, status: 'good' },
    { metric: 'Emergency Fund', value: 4.2, target: 6, status: 'warning' },
    { metric: 'Savings Rate', value: 18, target: 20, status: 'good' },
    { metric: 'Credit Utilization', value: 15, target: 30, status: 'excellent' }
  ];

  const topMerchants = [
    { name: 'Takealot', amount: 1890, transactions: 12, category: 'Shopping' },
    { name: 'Mugg & Bean', amount: 865, transactions: 24, category: 'Food' },
    { name: 'Shell', amount: 1605, transactions: 8, category: 'Transport' },
    { name: 'Pick n Pay', amount: 2470, transactions: 6, category: 'Groceries' },
    { name: 'Netflix', amount: 169, transactions: 1, category: 'Entertainment' }
  ];

  const upcomingBills = [
    { name: 'Rent', amount: 6500, date: '2025-06-25', status: 'upcoming' },
    { name: 'Car Insurance', amount: 495, date: '2025-06-28', status: 'upcoming' },
    { name: 'Cell Phone', amount: 360, date: '2025-07-02', status: 'scheduled' },
    { name: 'Fibre Internet', amount: 439, date: '2025-07-05', status: 'scheduled' }
  ];

  const aiInsights = [
    {
      type: 'prediction',
      title: 'Spending Forecast',
      message: 'Based on your patterns, you\'ll likely spend R23,600 next month - R830 more than usual due to vacation season.',
      confidence: 89
    },
    {
      type: 'opportunity',
      title: 'Savings Opportunity',
      message: 'You could save R250/month by switching to a different coffee subscription plan.',
      confidence: 76
    },
    {
      type: 'alert',
      title: 'Unusual Activity',
      message: 'Your dining out expenses are 34% higher than last month. Consider meal planning.',
      confidence: 92
    }
  ];

  const StatusCard = ({ title, value, change, icon: Icon, trend }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
      {change && (
        <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          <span className="text-sm font-medium">{change}</span>
        </div>
      )}
    </div>
  );

  const MetricCard = ({ metric, value, target, status }) => {
    const percentage = (value / target) * 100;
    const getStatusColor = () => {
      switch(status) {
        case 'excellent': return 'bg-green-500';
        case 'good': return 'bg-blue-500';
        case 'warning': return 'bg-yellow-500';
        case 'danger': return 'bg-red-500';
        default: return 'bg-gray-500';
      }
    };

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">{metric}</h4>
          <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">
            {metric.includes('Fund') ? `${value} months` : `${value}%`}
          </span>
          <span className="text-sm text-gray-500">
            / {metric.includes('Fund') ? `${target} months` : `${target}%`}
          </span>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getStatusColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">MoneyTracker</h1>
          <p className="text-gray-600">AI-powered financial insights and cash flow monitoring</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {['3months', '6months', '1year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  timeRange === range 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range === '3months' ? '3 Months' : range === '6months' ? '6 Months' : '1 Year'}
              </button>
            ))}
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
        <div className="flex space-x-1 mb-6 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Cash Flow', icon: TrendingUp },
            { id: 'patterns', label: 'Spending Patterns', icon: Calendar },
            { id: 'health', label: 'Financial Health', icon: Target },
            { id: 'insights', label: 'AI Insights', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
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
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R${value}`, '']} />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="netFlow" stroke="#3B82F6" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Upcoming Bills */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Bills</h3>
              <div className="space-y-3">
                {upcomingBills.map((bill, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${bill.status === 'upcoming' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="font-medium text-gray-900">{bill.name}</p>
                        <p className="text-sm text-gray-600">{bill.date}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">R{bill.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className="space-y-6">
            {/* Weekly Spending Pattern */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Spending Patterns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendingPatternData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Merchants */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Merchants</h3>
              <div className="space-y-4">
                {topMerchants.map((merchant, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-700">
                          {merchant.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{merchant.name}</p>
                        <p className="text-sm text-gray-600">{merchant.transactions} transactions • {merchant.category}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">R{merchant.amount}</span>
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
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health Score: 8.4/10</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Debt Management</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <span className="text-sm font-medium">8.5/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Emergency Preparedness</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                    <span className="text-sm font-medium">7.0/10</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Investment Growth</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                    <span className="text-sm font-medium">9.0/10</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="grid gap-6">
              {aiInsights.map((insight, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {insight.type === 'prediction' && <Brain className="w-6 h-6 text-blue-600" />}
                      {insight.type === 'opportunity' && <Target className="w-6 h-6 text-green-600" />}
                      {insight.type === 'alert' && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h4>
                      <p className="text-gray-700 mb-3">{insight.message}</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Confidence:</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{width: `${insight.confidence}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Predictive Analytics */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Forecast</h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2">Next Month Prediction</p>
                <p className="text-2xl font-bold text-gray-900">R23,600</p>
                <p className="text-sm text-gray-600">+R830 increase expected due to seasonal trends</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Groceries</p>
                  <p className="text-lg font-semibold text-gray-900">R3,780</p>
                  <p className="text-xs text-green-600">-5% vs avg</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Entertainment</p>
                  <p className="text-lg font-semibold text-gray-900">R1,890</p>
                  <p className="text-xs text-red-600">+25% vs avg</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Transport</p>
                  <p className="text-lg font-semibold text-gray-900">R1,610</p>
                  <p className="text-xs text-gray-600">Steady</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoneyTracker;