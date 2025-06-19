import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell, Tooltip, Legend, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Download, Filter, AlertTriangle } from 'lucide-react';

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

  // Goal tracking data
  const goalData = [
    { goal: 'Emergency Fund', target: 50000, current: 32000, percentage: 64 },
    { goal: 'Vacation Fund', target: 15000, current: 8500, percentage: 57 },
    { goal: 'Car Down Payment', target: 25000, current: 18000, percentage: 72 },
    { goal: 'Investment Portfolio', target: 100000, current: 45000, percentage: 45 },
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
    <div className={`insight-alert ${insight.type} ${insight.priority}`}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#4caf50" fill="#4caf50" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="expenses" stackId="2" stroke="#f44336" fill="#f44336" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="net" stroke="#ffce56" strokeWidth={2} />
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
            <div className="chart-card full-width">
              <h3>Budget vs Actual Spending</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                  <Legend />
                  <Bar dataKey="budget" fill="#4a4a4a" name="Budget" />
                  <Bar dataKey="value" fill="#a10d2f" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="category-breakdown">
              <h3>Category Analysis</h3>
              {spendingData.map((category) => {
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
              })}
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
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="month" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4caf50" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={2} />
                <Line type="monotone" dataKey="savings" stroke="#36a2eb" strokeWidth={2} />
                <Line type="monotone" dataKey="investments" stroke="#ffce56" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
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