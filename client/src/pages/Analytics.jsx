import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Download, AlertTriangle } from 'lucide-react';

const COLORS = ['#a10d2f', '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40'];

const Analytics = () => {
  const [dateRange, setDateRange] = useState({ start: '2025-06-01', end: '2025-06-30' });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  // Enhanced KPI Data
  const kpiData = [
    { 
      title: 'Total Income', 
      value: 'R 12,000', 
      change: '+8.5%', 
      trend: 'up',
      icon: DollarSign 
    },
    { 
      title: 'Total Expenses', 
      value: 'R 7,800', 
      change: '+2.1%', 
      trend: 'up',
      icon: TrendingUp 
    },
    { 
      title: 'Net Savings', 
      value: 'R 4,200', 
      change: '+15.3%', 
      trend: 'up',
      icon: Target 
    },
    { 
      title: 'Investment Growth', 
      value: '+5.3%', 
      change: '+1.2%', 
      trend: 'up',
      icon: TrendingUp 
    },
  ];

  // Enhanced spending data with budgets
  const spendingData = [
    { name: 'Transport', value: 2500, budget: 3000, color: '#a10d2f' },
    { name: 'Food', value: 1800, budget: 2000, color: '#ff6384' },
    { name: 'Entertainment', value: 1200, budget: 1000, color: '#36a2eb' },
    { name: 'Utilities', value: 1300, budget: 1500, color: '#ffce56' },
    { name: 'Shopping', value: 800, budget: 1200, color: '#4bc0c0' },
    { name: 'Healthcare', value: 500, budget: 800, color: '#9966ff' },
  ];

  // Monthly trend data
  const monthlyTrendData = [
    { month: 'Jan', income: 11500, expenses: 7200, savings: 4300, investments: 1000 },
    { month: 'Feb', income: 11800, expenses: 7500, savings: 4300, investments: 1200 },
    { month: 'Mar', income: 12200, expenses: 7800, savings: 4400, investments: 1300 },
    { month: 'Apr', income: 11900, expenses: 7400, savings: 4500, investments: 1100 },
    { month: 'May', income: 12500, expenses: 8000, savings: 4500, investments: 1400 },
    { month: 'Jun', income: 12000, expenses: 7800, savings: 4200, investments: 1300 },
  ];

  // Weekly cash flow data
  const cashFlowData = [
    { name: 'Week 1', income: 3000, expenses: 2000, net: 1000 },
    { name: 'Week 2', income: 3200, expenses: 2100, net: 1100 },
    { name: 'Week 3', income: 2800, expenses: 2200, net: 600 },
    { name: 'Week 4', income: 3000, expenses: 1500, net: 1500 },
  ];

  // AI insights and alerts
  const insights = [
    { type: 'warning', message: 'Entertainment spending is 20% over budget this month', priority: 'high' },
    { type: 'success', message: 'You\'re on track to meet your savings goal 2 months early', priority: 'medium' },
    { type: 'info', message: 'Consider increasing investment allocation based on recent returns', priority: 'low' },
    { type: 'warning', message: 'Transport costs have increased 15% compared to last month', priority: 'medium' },
  ];

  const totalBudget = useMemo(() => 
    spendingData.reduce((sum, item) => sum + item.budget, 0), 
    [spendingData]
  );

  const totalSpent = useMemo(() => 
    spendingData.reduce((sum, item) => sum + item.value, 0), 
    [spendingData]
  );

  const budgetUtilization = Math.round((totalSpent / totalBudget) * 100);

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
        <div className="kpi-header">
          <div className="kpi-icon-wrapper">
            <Icon size={24} className="kpi-icon" />
          </div>
          <div className={`kpi-trend ${kpi.trend}`}>
            {kpi.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {kpi.change}
          </div>
        </div>
        <h3 className="kpi-title">{kpi.title}</h3>
        <p className="kpi-value">{kpi.value}</p>
      </div>
    );
  };

  const InsightAlert = ({ insight }) => (
    <div className={`insight-alert ${insight.type}`}>
      <AlertTriangle size={16} />
      <span>{insight.message}</span>
    </div>
  );

  return (
    <div className="analytics-container">
      {/* Header Section */}
      <div className="analytics-header">
        <div className="header-content">
          <div>
            <h1>Financial Analytics</h1>
            <div className="date-range">
              <Calendar size={16} />
              <span>{dateRange.start} → {dateRange.end}</span>
            </div>
          </div>
          <div className="header-controls">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-selector"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="export-btn">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="analytics-tabs">
          <TabButton id="overview" label="Overview" active={activeTab === 'overview'} onClick={setActiveTab} />
          <TabButton id="spending" label="Spending Analysis" active={activeTab === 'spending'} onClick={setActiveTab} />
          <TabButton id="trends" label="Trends" active={activeTab === 'trends'} onClick={setActiveTab} />
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="kpi-grid">
        {kpiData.map((kpi) => (
          <KPICard key={kpi.title} kpi={kpi} />
        ))}
      </div>

      {/* Budget Summary Card */}
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

      {/* Alert Section */}
      {insights.length > 0 && (
        <div className="insights-section">
          <h3>Insights & Alerts</h3>
          <div className="insights-grid">
            {insights.map((insight, index) => (
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
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="net" stroke="#F59E0B" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Spending Distribution</h3>
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
            </div>
          </div>
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="tab-content">
          <div className="spending-analysis">
            <div className="chart-card spending-chart">
              <h3>Budget vs Actual Spending</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      color: '#ffffff'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="budget" fill="#6B7280" name="Budget" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value" fill="#DC2626" name="Actual" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="category-breakdown">
              <h3>Category Analysis</h3>
              <div className="category-list">
                {spendingData.map((category) => {
                  const overBudget = category.value > category.budget;
                  const percentage = (category.value / category.budget * 100).toFixed(1);
                  
                  return (
                    <div key={category.name} className="category-item">
                      <div className="category-header">
                        <span className="category-name">{category.name}</span>
                        <span className={`category-status ${overBudget ? 'over' : 'under'}`}>
                          {percentage}%
                        </span>
                      </div>
                      <div className="category-amounts">
                        <span>R {category.value.toLocaleString()} / R {category.budget.toLocaleString()}</span>
                        {overBudget && (
                          <span className="over-budget">
                            +R {(category.value - category.budget).toLocaleString()}
                          </span>
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
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="tab-content">
          <div className="chart-card full-width">
            <h3>Monthly Financial Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#ffffff'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} />
                <Line type="monotone" dataKey="investments" stroke="#F59E0B" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <style jsx>{`
        .analytics-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
          color: #ffffff;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        }

        .analytics-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content h1 {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #a10d2f, #ff6384, #ff4757);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #9CA3AF;
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }

        .header-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .period-selector {
          background: rgba(31, 41, 55, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid #374151;
          color: #ffffff;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .period-selector:focus {
          border-color: #a10d2f;
          box-shadow: 0 0 0 3px rgba(161, 13, 47, 0.1);
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #a10d2f, #dc2626);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(161, 13, 47, 0.2);
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(161, 13, 47, 0.3);
        }

        .analytics-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #374151;
          overflow-x: auto;
          padding-bottom: 0;
        }

        .tab-button {
          background: none;
          border: none;
          color: #9CA3AF;
          padding: 1rem 1.5rem;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 0.95rem;
          white-space: nowrap;
          position: relative;
        }

        .tab-button.active {
          color: #a10d2f;
          border-bottom-color: #a10d2f;
          background: rgba(161, 13, 47, 0.05);
        }

        .tab-button:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .kpi-card {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(55, 65, 81, 0.5);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #a10d2f, #ff6384);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(161, 13, 47, 0.15);
          border-color: rgba(161, 13, 47, 0.3);
        }

        .kpi-card:hover::before {
          opacity: 1;
        }

        .kpi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .kpi-icon-wrapper {
          padding: 0.75rem;
          background: rgba(161, 13, 47, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-icon {
          color: #a10d2f;
        }

        .kpi-trend {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .kpi-trend.up {
          color: #10B981;
          background: rgba(16, 185, 129, 0.1);
        }

        .kpi-trend.down {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .kpi-title {
          font-size: 0.875rem;
          color: #9CA3AF;
          margin: 0;
          font-weight: 500;
        }

        .kpi-value {
          font-size: 2.25rem;
          font-weight: 800;
          margin: 0.5rem 0 0 0;
          color: #ffffff;
        }

        .budget-summary-card {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(55, 65, 81, 0.5);
          border-radius: 16px;
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
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .budget-status {
          font-weight: 700;
          padding: 0.5rem 1rem;
          border-radius: 25px;
          font-size: 0.875rem;
        }

        .budget-status.good {
          background: rgba(16, 185, 129, 0.2);
          color: #10B981;
        }

        .budget-status.caution {
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
        }

        .budget-status.warning {
          background: rgba(239, 68, 68, 0.2);
          color: #EF4444;
        }

        .budget-bar {
          width: 100%;
          height: 12px;
          background: #374151;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .budget-progress {
          height: 100%;
          background: linear-gradient(90deg, #10B981, #F59E0B, #EF4444);
          transition: width 0.5s ease;
          border-radius: 6px;
        }

        .budget-amounts {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: #9CA3AF;
          font-weight: 500;
        }

        .insights-section {
          margin-bottom: 2rem;
        }

        .insights-section h3 {
          margin-bottom: 1rem;
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .insights-grid {
          display: grid;
          gap: 1rem;
        }

        .insight-alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          border-left: 4px solid;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .insight-alert:hover {
          transform: translateX(4px);
        }

        .insight-alert.warning {
          background: rgba(239, 68, 68, 0.1);
          border-left-color: #EF4444;
          color: #FCA5A5;
        }

        .insight-alert.success {
          background: rgba(16, 185, 129, 0.1);
          border-left-color: #10B981;
          color: #A7F3D0;
        }

        .insight-alert.info {
          background: rgba(59, 130, 246, 0.1);
          border-left-color: #3B82F6;
          color: #BFDBFE;
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
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(55, 65, 81, 0.5);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .chart-card h3 {
          margin: 0 0 1rem 0;
          color: #ffffff;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .chart-card.full-width {
          grid-column: 1 / -1;
        }

        .spending-analysis {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
        }

        .spending-chart {
          grid-column: 1;
        }

        .category-breakdown {
          background: linear-gradient(135deg, rgba(31, 41, 55, 0.8), rgba(17, 24, 39, 0.9));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(55, 65, 81, 0.5);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .category-breakdown h3 {
          margin: 0 0 1.5rem 0;
          color: #ffffff;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .category-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-name {
          font-weight: 600;
          color: #ffffff;
          font-size: 0.95rem;
        }

        .category-status {
          font-size: 0.875rem;
          font-weight: 700;
        }

        .category-status.over {
          color: #EF4444;
        }

        .category-status.under {
          color: #10B981;
        }

        .category-amounts {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #9CA3AF;
        }

        .over-budget {
          color: #EF4444;
          font-weight: 700;
        }

        .category-progress-bar {
          width: 100%;
          height: 8px;
          background: #374151;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #10B981;
          transition: width 0.5s ease;
          border-radius: 4px;
        }

        .progress-fill.over-budget {
          background: #EF4444;
        }

        @media (max-width: 1024px) {
          .spending-analysis {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .analytics-container {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .analytics-tabs {
            margin-bottom: 1rem;
          }

          .tab-button {
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;