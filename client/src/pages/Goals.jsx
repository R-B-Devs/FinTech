import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Goals.css';
// src/index.js
import '@fortawesome/fontawesome-free/css/all.min.css';


const Goals = () => {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Savings Goal',
      target: 50000,
      progress: 37200,
      icon: '',
    },
    {
      id: 2,
      title: 'Investment Goal',
      target: 100000,
      progress: 61750,
      icon: '',
    },
  ]);

  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    id: null,
    title: '',
    target: '',
    progress: '',
    icon: '',
  });

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);


  const openModal = (mode, goal = null) => {
    setModalMode(mode);
    if (goal) {
      setNewGoal(goal);
    } else {
setNewGoal({ id: null, title: '', target: '', progress: '', icon: '' });
    }
    setShowModal(true);
  };

  const handleChange = (e) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { id, title, target, progress, icon } = newGoal;

    if (!title || !target) return;

    if (modalMode === 'add') {
      const newId = Date.now();
      setGoals([
        ...goals,
        {
          id: newId,
          title,
          target: parseFloat(target),
          progress: parseFloat(progress) || 0,
          icon: icon || '',
        },
      ]);
    } else {
      setGoals(goals.map(g => g.id === id ? {
        ...g,
        title,
        target: parseFloat(target),
        progress: parseFloat(progress) || 0,
        icon: icon || ''
      } : g));
    }

    setShowModal(false);
  };

  const deleteGoal = (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  return (
    <div className="goals-page">
       <Link to="/Dashboard" className="nav-link">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>Back</span>
                </Link>
      <h2>Your Financial Goals</h2>
      <p>Track your progress and set new goals to stay on top of your finances.</p>

      <button className="add-goal-btn" onClick={() => openModal('add')}>
        <i className="fas fa-circle-plus"></i> New Goal
      </button>


      <div className="goals-grid">
  {goals.map((goal) => {
    const percent = (goal.progress / goal.target) * 100;

    return (
      <div className="goals-section" key={goal.id}>
        <div className="goal-header">
          <h3>{goal.icon} {goal.title}</h3>
          <div className="goal-actions">
  <button className="edit-btn" onClick={() => openModal('edit', goal)} title="Edit Goal">
    <i class="fa-regular fa-pen-to-square"></i>
  </button>

  {confirmDeleteId === goal.id ? (
    <>
      <span className="confirm-delete-text">Delete?</span>
      <button
        className="confirm-btn"
        onClick={() => {
          setGoals(goals.filter(g => g.id !== goal.id));
          setConfirmDeleteId(null);
        }}
      >
        Yes
      </button>
      <button
        className="cancel-btn"
        onClick={() => setConfirmDeleteId(null)}
      >
        No
      </button>
    </>
  ) : (
    <button
      className="delete-btn"
      onClick={() => setConfirmDeleteId(goal.id)} title="Delete Goal"
    >
      <i className="fas fa-trash"></i>
    </button>
  )}
</div>
</div>



        <p>Target: R{goal.target.toLocaleString()}</p>
        <p>Progress: R{goal.progress.toLocaleString()}</p>
        <div className="custom-progress-bar">
          <div className="custom-progress" style={{ width: `${percent}%` }}></div>
        </div>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>{percent.toFixed(1)}% complete</p>
      </div>
    );
  })}
</div>


      {/* Modal */}
      {showModal && (
        <div className="goal-modal">
          <div className="goal-modal-content">
            <h3>{modalMode === 'add' ? 'New Goal' : 'Edit Goal'}</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Goal Name"
                value={newGoal.title}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="target"
                placeholder="Target Amount"
                value={newGoal.target}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="progress"
                placeholder="Current Progress"
                value={newGoal.progress}
                onChange={handleChange}
              />
              <div className="modal-actions">
                <button type="submit">{modalMode === 'add' ? 'Add Goal' : 'Update Goal'}</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
