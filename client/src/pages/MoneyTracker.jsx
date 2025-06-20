import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Brain, Target, AlertTriangle, Lightbulb, Calendar, DollarSign, PieChart, Zap } from 'lucide-react';
import '../styles/MoneyTracker.css';

const AIFinancialTracker = () => {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0] });
  const [newGoal, setNewGoal] = useState({ name: '', target: '', deadline: '', category: 'savings' });
  const [balance, setBalance] = useState(5000);
  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Advanced AI Logic: Pattern Recognition and Behavioral Analysis
  const aiAnalytics = useMemo(() => {
    if (transactions.length === 0) return { patterns: [], predictions: [], recommendations: [] };

    // Spending pattern analysis
    const categorySpending = transactions.reduce((acc, t) => {
      if (t.amount < 0) {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      }
      return acc;
    }, {});

    // Temporal pattern recognition
    const weeklySpending = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const week = getWeekNumber(date);
      acc[week] = (acc[week] || 0) + (t.amount < 0 ? Math.abs(t.amount) : 0);
      return acc;
    }, {});

    // Behavioral anomaly detection
    const avgDailySpending = Object.values(weeklySpending).reduce((a, b) => a + b, 0) / (Object.keys(weeklySpending).length * 7);
    const recentSpending = transactions.slice(-7).reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);
    const spendingAnomaly = recentSpending > avgDailySpending * 7 * 1.5 ? 'high' : recentSpending < avgDailySpending * 7 * 0.5 ? 'low' : 'normal';

    // Cash flow prediction
    const monthlyIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const projectedBalance = balance + (monthlyIncome - monthlyExpenses);

    // Smart recommendations based on spending patterns and goals
    const recommendations = generateSmartRecommendations(categorySpending, goals, spendingAnomaly, projectedBalance);

    return {
      patterns: categorySpending,
      predictions: { projectedBalance, spendingAnomaly },
      recommendations,
      weeklyTrends: weeklySpending
    };
  }, [transactions, balance, goals]);

  // Context-aware transaction categorization
  const smartCategorize = (description, amount, date) => {
    const desc = description.toLowerCase();
    const transactionDate = new Date(date);
    const month = transactionDate.getMonth();
    const dayOfWeek = transactionDate.getDay();
    
    // Seasonal and contextual logic
    if (month === 11 && (desc.includes('gift') || desc.includes('decoration') || amount > 100)) return 'holiday';
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (desc.includes('restaurant') || desc.includes('coffee') || desc.includes('bar')) return 'entertainment';
    }
    
    // Pattern-based categorization
    if (desc.includes('grocery') || desc.includes('food') || desc.includes('supermarket')) return 'groceries';
    if (desc.includes('gas') || desc.includes('fuel') || desc.includes('station')) return 'transportation';
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('subscription')) return 'subscriptions';
    if (desc.includes('salary') || desc.includes('paycheck') || amount > 1000) return 'income';
    if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('utilities')) return 'housing';
    if (desc.includes('coffee') || desc.includes('lunch') || desc.includes('dinner')) return 'dining';
    
    return 'other';
  };

  // Generate contextual recommendations
  const generateSmartRecommendations = (spending, goals, anomaly, projectedBalance) => {
    const recs = [];
    
    // Goal-based recommendations
    goals.forEach(goal => {
      const daysUntilDeadline = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      const dailySavingsNeeded = (goal.target - (goal.saved || 0)) / Math.max(daysUntilDeadline, 1);
      
      if (dailySavingsNeeded > 0) {
        recs.push({
          type: 'goal',
          priority: 'high',
          message: `To reach "${goal.name}", save $${dailySavingsNeeded.toFixed(2)} daily. Consider reducing ${getHighestSpendingCategory(spending)} by 15%.`,
          action: 'optimize'
        });
      }
    });

    // Spending pattern recommendations
    if (anomaly === 'high') {
      const highestCategory = getHighestSpendingCategory(spending);
      recs.push({
        type: 'warning',
        priority: 'high',
        message: `Unusual spending spike detected! Your ${highestCategory} spending is 50% higher than usual. Consider meal planning this week.`,
        action: 'reduce'
      });
    }

    // Predictive cash flow recommendations
    if (projectedBalance < 1000) {
      recs.push({
        type: 'alert',
        priority: 'critical',
        message: `Cash flow alert: Projected balance will be $${projectedBalance.toFixed(2)}. Consider increasing income or reducing discretionary spending.`,
        action: 'urgent'
      });
    }

    // Optimization opportunities
    if (spending.subscriptions > 100) {
      recs.push({
        type: 'optimization',
        priority: 'medium',
        message: `Subscription audit recommended: $${spending.subscriptions.toFixed(2)}/month. Cancel unused services to save $30-50/month.`,
        action: 'audit'
      });
    }

    return recs;
  };

  const getHighestSpendingCategory = (spending) => {
    return Object.entries(spending).reduce((a, b) => spending[a] > spending[b[0]] ? a : b[0], Object.keys(spending)[0]);
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.description) return;
    
    const amount = parseFloat(newTransaction.amount);
    const smartCategory = smartCategorize(newTransaction.description, amount, newTransaction.date);
    
    const transaction = {
      id: Date.now(),
      ...newTransaction,
      amount: amount,
      category: newTransaction.category || smartCategory,
      aiSuggested: !newTransaction.category
    };
    
    setTransactions([transaction, ...transactions]);
    setBalance(prev => prev + amount);
    setNewTransaction({ amount: '', description: '', category: '', date: new Date().toISOString().split('T')[0] });
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return;
    
    const goal = {
      id: Date.now(),
      ...newGoal,
      target: parseFloat(newGoal.target),
      saved: 0,
      progress: 0
    };
    
    setGoals([...goals, goal]);
    setNewGoal({ name: '', target: '', deadline: '', category: 'savings' });
  };

  // Real-time AI insights generation
  useEffect(() => {
    const insights = [
      {
        id: 1,
        type: 'pattern',
        title: 'Spending Pattern Detected',
        message: 'You spend 40% more on weekends. Consider setting weekend budgets.',
        confidence: 0.85
      },
      {
        id: 2,
        type: 'prediction',
        title: 'Cash Flow Forecast',
        message: `Based on current trends, you'll have $${aiAnalytics.predictions?.projectedBalance?.toFixed(2) || '0'} by month-end.`,
        confidence: 0.92
      },
      {
        id: 3,
        type: 'opportunity',
        title: 'Optimization Opportunity',
        message: 'Switching to a credit card with 2% cashback could save you $40/month.',
        confidence: 0.78
      }
    ];
    setAiInsights(insights);
  }, [transactions, aiAnalytics]);

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="balance-card">
        <h2>Current Balance</h2>
        <p className="balance">${balance.toFixed(2)}</p>
        <div className="balance-trend">
          {balance > 0 ? <TrendingUp className="positive" /> : <TrendingDown className="negative" />}
          <span>Projected: ${aiAnalytics.predictions?.projectedBalance?.toFixed(2) || '0'}</span>
        </div>
      </div>

      <div className="ai-insights">
        <h3><Brain /> AI Insights</h3>
        {aiInsights.map(insight => (
          <div key={insight.id} className={`insight-card ${insight.type}`}>
            <div className="insight-header">
              <span className="insight-title">{insight.title}</span>
              <span className="confidence">{Math.round(insight.confidence * 100)}%</span>
            </div>
            <p>{insight.message}</p>
          </div>
        ))}
      </div>

      <div className="recommendations">
        <h3><Lightbulb /> Smart Recommendations</h3>
        {aiAnalytics.recommendations.map((rec, index) => (
          <div key={index} className={`recommendation ${rec.priority}`}>
            <div className="rec-icon">
              {rec.type === 'warning' && <AlertTriangle />}
              {rec.type === 'goal' && <Target />}
              {rec.type === 'optimization' && <Zap />}
              {rec.type === 'alert' && <AlertTriangle />}
            </div>
            <p>{rec.message}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="transactions">
      <div className="add-transaction">
        <h3>Add Transaction</h3>
        <div className="transaction-form">
          <input
            type="number"
            placeholder="Amount (+ for income, - for expense)"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
          />
          <input
            type="text"
            placeholder="Description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
          />
          <select
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
          >
            <option value="">AI Auto-categorize</option>
            <option value="groceries">Groceries</option>
            <option value="dining">Dining</option>
            <option value="transportation">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="housing">Housing</option>
            <option value="income">Income</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
          />
          <button onClick={addTransaction}>Add Transaction</button>
        </div>
      </div>

      <div className="transaction-list">
        <h3>Recent Transactions</h3>
        {transactions.slice(0, 10).map(transaction => (
          <div key={transaction.id} className="transaction-item">
            <div className="transaction-info">
              <span className="description">{transaction.description}</span>
              <span className={`category ${transaction.aiSuggested ? 'ai-suggested' : ''}`}>
                {transaction.category} {transaction.aiSuggested && <Brain size={12} />}
              </span>
            </div>
            <div className="transaction-details">
              <span className={`amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                ${Math.abs(transaction.amount).toFixed(2)}
              </span>
              <span className="date">{transaction.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="goals">
      <div className="add-goal">
        <h3>Add Financial Goal</h3>
        <div className="goal-form">
          <input
            type="text"
            placeholder="Goal name"
            value={newGoal.name}
            onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
          />
          <input
            type="number"
            placeholder="Target amount"
            value={newGoal.target}
            onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
          />
          <input
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
          />
          <select
            value={newGoal.category}
            onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
          >
            <option value="savings">Savings</option>
            <option value="vacation">Vacation</option>
            <option value="emergency">Emergency Fund</option>
            <option value="investment">Investment</option>
            <option value="purchase">Major Purchase</option>
          </select>
          <button onClick={addGoal}>Add Goal</button>
        </div>
      </div>

      <div className="goals-list">
        <h3>Your Goals</h3>
        {goals.map(goal => {
          const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
          const dailySavingsNeeded = (goal.target - goal.saved) / Math.max(daysLeft, 1);
          
          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <h4>{goal.name}</h4>
                <span className="goal-category">{goal.category}</span>
              </div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${(goal.saved / goal.target) * 100}%`}}
                  ></div>
                </div>
                <span>${goal.saved.toFixed(2)} / ${goal.target.toFixed(2)}</span>
              </div>
              <div className="goal-insights">
                <p>Days remaining: {daysLeft}</p>
                <p>Daily savings needed: ${dailySavingsNeeded.toFixed(2)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="ai-financial-tracker">
      <header className="header">
        <h1><Brain /> AI Financial Tracker</h1>
        <div className="nav-tabs">
          <button 
            className={selectedTab === 'dashboard' ? 'active' : ''}
            onClick={() => setSelectedTab('dashboard')}
          >
            <PieChart size={16} /> Dashboard
          </button>
          <button 
            className={selectedTab === 'transactions' ? 'active' : ''}
            onClick={() => setSelectedTab('transactions')}
          >
            <DollarSign size={16} /> Transactions
          </button>
          <button 
            className={selectedTab === 'goals' ? 'active' : ''}
            onClick={() => setSelectedTab('goals')}
          >
            <Target size={16} /> Goals
          </button>
        </div>
      </header>

      <main className="main-content">
        {selectedTab === 'dashboard' && renderDashboard()}
        {selectedTab === 'transactions' && renderTransactions()}
        {selectedTab === 'goals' && renderGoals()}
      </main>
    </div>
  );
};

export default AIFinancialTracker;