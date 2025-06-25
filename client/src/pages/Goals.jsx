import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Target, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Lightbulb,
  ArrowLeft,
  Bot,
  X
} from 'lucide-react';
import '../styles/Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalMode, setModalMode] = useState('add');
  const [showModal, setShowModal] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [newGoal, setNewGoal] = useState({
    id: null,
    title: '',
    target: '',
    current: '',
    category: 'other',
    timeline: 'medium_term',
    icon: '🎯',
    description: ''
  });
  
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Category options with icons - memoized for performance
  const categoryOptions = useMemo(() => [
    { value: 'emergency_fund', label: 'Emergency Fund', icon: '🛡️' },
    { value: 'investment', label: 'Investment', icon: '📈' },
    { value: 'home_deposit', label: 'Home Down Payment', icon: '🏠' },
    { value: 'vacation', label: 'Vacation', icon: '✈️' },
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'retirement', label: 'Retirement', icon: '🏖️' },
    { value: 'debt_payoff', label: 'Debt Payoff', icon: '💳' },
    { value: 'vehicle', label: 'Vehicle', icon: '🚗' },
    { value: 'other', label: 'Other', icon: '🎯' }
  ], []);

  // API Functions with improved error handling
  const fetchGoals = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setError('Not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/goals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGoals(data.goals || []);
      setRecommendations(data.recommendations || []);
      setAnalysis(data.analysis || null);
      setError('');
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server connection failed' : err.message);
      console.error('Fetch goals error:', err);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:3001/api/goals/insights', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights || []);
      }
    } catch (err) {
      console.error('Fetch insights error:', err);
    }
  }, []);

  const createGoal = useCallback(async (goalData) => {
    const token = localStorage.getItem('jwt');
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch('http://localhost:3001/api/goals', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, goal: data.goal };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Create goal error:', err);
      return { success: false, error: 'Failed to create goal' };
    }
  }, []);

  const updateGoal = useCallback(async (goalId, goalData) => {
    const token = localStorage.getItem('jwt');
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`http://localhost:3001/api/goals/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, goal: data.goal };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Update goal error:', err);
      return { success: false, error: 'Failed to update goal' };
    }
  }, []);

  const deleteGoal = useCallback(async (goalId) => {
    const token = localStorage.getItem('jwt');
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`http://localhost:3001/api/goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Delete goal error:', err);
      return { success: false, error: 'Failed to delete goal' };
    }
  }, []);

  const updateProgress = useCallback(async (goalId, amount) => {
    const token = localStorage.getItem('jwt');
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`http://localhost:3001/api/goals/${goalId}/progress`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      const data = await response.json();
      if (response.ok) {
        return { success: true, goal: data.goal, isCompleted: data.isCompleted };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Update progress error:', err);
      return { success: false, error: 'Failed to update progress' };
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGoals(), fetchInsights()]);
      setLoading(false);
    };

    loadData();
  }, [fetchGoals, fetchInsights]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchGoals(), fetchInsights()]);
    setLoading(false);
  }, [fetchGoals, fetchInsights]);

  const openModal = useCallback((mode, goal = null) => {
    setModalMode(mode);
    if (goal) {
      setNewGoal({
        id: goal.id,
        title: goal.title,
        target: goal.target_amount,
        current: goal.current_amount,
        category: goal.category,
        timeline: goal.timeline,
        icon: goal.icon,
        description: goal.description || ''
      });
    } else {
      setNewGoal({
        id: null,
        title: '',
        target: '',
        current: '',
        category: 'other',
        timeline: 'medium_term',
        icon: '🎯',
        description: ''
      });
    }
    setShowModal(true);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
    
    // Auto-update icon when category changes
    if (name === 'category') {
      const category = categoryOptions.find(cat => cat.value === value);
      if (category) {
        setNewGoal(prev => ({ ...prev, icon: category.icon }));
      }
    }
  }, [categoryOptions]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const { id, title, target, current, category, timeline, icon, description } = newGoal;

    if (!title || !target) return;

    const goalData = {
      title,
      target: parseFloat(target),
      current: parseFloat(current) || 0,
      category,
      timeline,
      icon,
      description
    };

    let result;
    if (modalMode === 'add') {
      result = await createGoal(goalData);
    } else {
      result = await updateGoal(id, goalData);
    }

    if (result.success) {
      setShowModal(false);
      refreshData();
    } else {
      alert(result.error || 'Failed to save goal');
    }
  }, [newGoal, modalMode, createGoal, updateGoal, refreshData]);

  const handleDelete = useCallback(async (goalId) => {
    const result = await deleteGoal(goalId);
    if (result.success) {
      setConfirmDeleteId(null);
      refreshData();
    } else {
      alert(result.error || 'Failed to delete goal');
    }
  }, [deleteGoal, refreshData]);

  const handleProgressUpdate = useCallback(async (goalId, newProgress) => {
    const result = await updateProgress(goalId, newProgress);
    if (result.success) {
      if (result.isCompleted) {
        alert('🎉 Congratulations! You\'ve completed your goal!');
      }
      refreshData();
    } else {
      alert(result.error || 'Failed to update progress');
    }
  }, [updateProgress, refreshData]);

  const addRecommendedGoal = useCallback((recommendation) => {
    setNewGoal({
      id: null,
      title: recommendation.title,
      target: recommendation.target,
      current: recommendation.suggestedProgress || 0,
      category: recommendation.category,
      timeline: recommendation.timeline,
      icon: recommendation.icon,
      description: recommendation.description
    });
    setModalMode('add');
    setShowModal(true);
    setShowRecommendations(false);
  }, []);

  const getInsightIcon = useCallback((type) => {
    const iconProps = { className: "w-5 h-5" };
    switch (type) {
      case 'success': return <CheckCircle {...iconProps} style={{ color: '#10b981' }} />;
      case 'warning': return <AlertTriangle {...iconProps} style={{ color: '#f59e0b' }} />;
      case 'urgent': return <AlertTriangle {...iconProps} style={{ color: '#ef4444' }} />;
      case 'opportunity': return <TrendingUp {...iconProps} style={{ color: '#3b82f6' }} />;
      default: return <Lightbulb {...iconProps} style={{ color: '#8b5cf6' }} />;
    }
  }, []);

  const getPriorityColor = useCallback((priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: '#8A1F2C' }} />
          <p style={{ color: '#cbd5e1' }}>Loading your financial goals...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#1a1a1a' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle className="w-8 h-8 mx-auto mb-4" style={{ color: '#EF4444' }} />
          <p style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</p>
          <button 
            onClick={refreshData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#8A1F2C',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link 
          to="/Dashboard" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#8A1F2C',
            textDecoration: 'none',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
              Your Financial Goals
            </h2>
            <p style={{ color: '#b3b3b3', margin: 0 }}>
              AI-powered goal tracking based on your financial profile and spending patterns
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={() => setShowRecommendations(!showRecommendations)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                                padding: '10px 16px',
                backgroundColor: '#8A1F2C',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Plus size={16} />
              New Goal
            </button>
            
            <button 
              onClick={refreshData}
              disabled={loading}
              style={{
                padding: '10px',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      {analysis && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ padding: '16px', backgroundColor: '#2a2a2a', borderRadius: '12px', border: '1px solid #404040' }}>
            <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Total Balance</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
              R{analysis.totalBalance?.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#2a2a2a', borderRadius: '12px', border: '1px solid #404040' }}>
            <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Monthly Income</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
              R{analysis.monthlyIncome?.toLocaleString()}
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#2a2a2a', borderRadius: '12px', border: '1px solid #404040' }}>
            <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Savings Rate</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: analysis.savingsRate >= 20 ? '#10b981' : analysis.savingsRate >= 10 ? '#f59e0b' : '#ef4444' }}>
              {analysis.savingsRate?.toFixed(1)}%
            </div>
          </div>
          {analysis.creditScore && (
            <div style={{ padding: '16px', backgroundColor: '#2a2a2a', borderRadius: '12px', border: '1px solid #404040' }}>
              <div style={{ fontSize: '12px', color: '#b3b3b3' }}>Credit Score</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {analysis.creditScore}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#ffffff' }}>
            💡 AI Insights
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {insights.map((insight, index) => (
              <div 
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '12px',
                  border: '1px solid #404040'
                }}
              >
                {getInsightIcon(insight.type)}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{insight.title}</div>
                  <div style={{ fontSize: '14px', color: '#b3b3b3' }}>{insight.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations Panel */}
      {showRecommendations && recommendations.length > 0 && (
        <div style={{ 
          marginBottom: '24px', 
          padding: '20px', 
          backgroundColor: '#2a2a2a', 
          borderRadius: '12px',
          border: '1px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              🤖 AI Goal Recommendations
            </h3>
            <button 
              onClick={() => setShowRecommendations(false)}
              style={{
                padding: '6px',
                backgroundColor: 'transparent',
                color: '#b3b3b3',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                style={{
                  padding: '16px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '8px',
                  border: `2px solid ${getPriorityColor(rec.priority)}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }} role="img" aria-label="recommendation icon">{rec.icon}</span>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{rec.title}</h4>
                      <span 
                        style={{ 
                          fontSize: '12px', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          backgroundColor: getPriorityColor(rec.priority),
                          color: 'white'
                        }}
                      >
                        {rec.priority} priority
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => addRecommendedGoal(rec)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#8A1F2C',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Add Goal
                  </button>
                </div>
                
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#d1d5db' }}>
                  {rec.description}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#b3b3b3' }}>Target: </span>
                    <span style={{ fontWeight: '600' }}>R{rec.target.toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: '#b3b3b3' }}>Timeline: </span>
                    <span style={{ fontWeight: '600' }}>{rec.timeline}</span>
                  </div>
                  <div>
                    <span style={{ color: '#b3b3b3' }}>Monthly: </span>
                    <span style={{ fontWeight: '600' }}>R{rec.monthlyContribution.toLocaleString()}</span>
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '12px', 
                  padding: '8px', 
                  backgroundColor: '#374151', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#d1d5db'
                }}>
                  💡 <strong>AI Insight:</strong> {rec.aiReasoning}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '24px' 
      }}>
        {goals.map((goal) => {
          const percent = (goal.current_amount / goal.target_amount) * 100;
          const isCompleted = percent >= 100;
          
          return (
            <div 
              key={goal.id}
              style={{
                padding: '24px',
                backgroundColor: '#2a2a2a',
                borderRadius: '16px',
                border: isCompleted ? '2px solid #10b981' : '1px solid #404040',
                position: 'relative',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isCompleted) {
                  e.currentTarget.style.borderColor = '#8A1F2C';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCompleted) {
                  e.currentTarget.style.borderColor = '#404040';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Completed Badge */}
              {isCompleted && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '16px',
                  padding: '4px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  ✅ Completed!
                </div>
              )}

              {/* Goal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }} role="img" aria-label="goal icon">{goal.icon}</span>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>
                      {goal.title}
                    </h3>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: '#374151',
                      color: '#d1d5db'
                    }}>
                      {goal.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {confirmDeleteId === goal.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#ef4444' }}>Delete?</span>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                        aria-label="Confirm delete"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '10px'
                        }}
                        aria-label="Cancel delete"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => openModal('edit', goal)}
                        style={{
                          padding: '8px',
                          backgroundColor: 'transparent',
                          color: '#3b82f6',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        aria-label="Edit Goal"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(goal.id)}
                        style={{
                          padding: '8px',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: 'none',
                                                    borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        aria-label="Delete Goal"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Goal Description */}
              {goal.description && (
                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#d1d5db', lineHeight: '1.4' }}>
                  {goal.description}
                </p>
              )}

              {/* Goal Details */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Target:</span>
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>R{goal.target_amount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Progress:</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: isCompleted ? '#10b981' : '#ffffff' }}>
                    R{goal.current_amount.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Remaining:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    R{Math.max(0, goal.target_amount - goal.current_amount).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#b3b3b3' }}>Progress</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: isCompleted ? '#10b981' : '#ffffff' }}>
                    {percent.toFixed(1)}%
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#404040', 
                  borderRadius: '4px', 
                  overflow: 'hidden' 
                }}>
                  <div 
                    style={{ 
                      width: `${Math.min(percent, 100)}%`, 
                      height: '100%', 
                      backgroundColor: isCompleted ? '#10b981' : '#8A1F2C',
                      transition: 'width 0.3s ease',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>

              {/* Update Progress */}
              {!isCompleted && (
                <div>
                  <input
                    type="number"
                    placeholder="Update progress amount"
                    style={{
                      width: '100%',
                      padding: '10px',
                      marginBottom: '8px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const amount = parseFloat(e.target.value);
                        if (!isNaN(amount) && amount >= 0) {
                          handleProgressUpdate(goal.id, amount);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      const amount = parseFloat(input.value);
                      if (!isNaN(amount) && amount >= 0) {
                        handleProgressUpdate(goal.id, amount);
                        input.value = '';
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#374151',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
                  >
                    Update Progress
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* No goals message */}
      {goals.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px', 
          color: '#b3b3b3' 
        }}>
          <Target size={48} style={{ margin: '0 auto 16px', display: 'block' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>
            No goals set yet
          </h3>
          <p style={{ margin: '0 0 16px 0' }}>
            Start your financial journey by setting your first goal, or check out our AI recommendations.
          </p>
          {recommendations.length > 0 && (
            <button 
              onClick={() => setShowRecommendations(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              View AI Recommendations
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #404040'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                {modalMode === 'add' ? 'Create New Goal' : 'Edit Goal'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: '#b3b3b3',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d1d5db' }}>
                  Goal Name *
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Emergency Fund"
                  value={newGoal.title}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d1d5db' }}>
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Optional description of your goal"
                  value={newGoal.description}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d1d5db' }}>
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    name="target"
                    placeholder="10000"
                    value={newGoal.target}
                    onChange={handleChange}
                    required
                    min="1"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d1d5db' }}>
                    Current Progress
                  </label>
                  <input
                    type="number"
                    name="current"
                    placeholder="0"
                    value={newGoal.current}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d1d5db' }}>
                  Category
                </label>
                <select
                  name="category"
                  value={newGoal.category}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d1d5db' }}>
                    Timeline
                  </label>
                  <select
                    name="timeline"
                    value={newGoal.timeline}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="short_term">Short Term (&lt; 1 year)</option>
                    <option value="medium_term">Medium Term (1-5 years)</option>
                    <option value="long_term">Long Term (5+ years)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#d1d5db' }}>
                    Icon
                  </label>
                  <input
                    type="text"
                    name="icon"
                    placeholder="🎯"
                    value={newGoal.icon}
                    onChange={handleChange}
                    maxLength="2"
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: '#8A1F2C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7a1b26'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#8A1F2C'}
                >
                  {modalMode === 'add' ? 'Create Goal' : 'Update Goal'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;