import React, { useState } from 'react';

const LinkedAccounts = () => {
  const [accounts, setAccounts] = useState([
    {
      bankName: 'Absa',
      accountType: 'Main Account',
      accountNumber: '**** 4567',
      status: 'Active',
    },
    {
      bankName: 'Absa',
      accountType: 'Cheque',
      accountNumber: '**** 1234',
      status: 'Pending Verification',
    },
    {
      bankName: 'Absa',
      accountType: 'Credit Card',
      accountNumber: '**** 7890',
      status: 'Active',
    },
  ]);

  const [selectedAccountIndex, setSelectedAccountIndex] = useState(null);
  const [editData, setEditData] = useState({ accountType: '', status: '' });

  const openModal = (index) => {
    setSelectedAccountIndex(index);
    setEditData({
      accountType: accounts[index].accountType,
      status: accounts[index].status,
    });
  };

  const closeModal = () => {
    setSelectedAccountIndex(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const saveChanges = () => {
    const updatedAccounts = [...accounts];
    updatedAccounts[selectedAccountIndex] = {
      ...updatedAccounts[selectedAccountIndex],
      ...editData,
    };
    setAccounts(updatedAccounts);
    closeModal();
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      
      <div style={styles.header}>
        <h1 style={styles.title}>Linked Accounts</h1>
        <p style={styles.subtitle}>
          Manage your connected bank accounts and payment methods with ease.
        </p>
      </div>

      <div style={styles.accountsList}>
        {accounts.map((account, index) => (
          <div key={index} style={styles.accountCard}>
            <div style={styles.cardGlow}></div>
            <div style={styles.cardContent}>
              <div style={styles.cardHeader}>
                <div style={styles.bankInfo}>
                  <h3 style={styles.bankName}>{account.bankName}</h3>
                  <div style={styles.accountTypeChip}>
                    {account.accountType}
                  </div>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: account.status === 'Active' ? '#10b981' : '#f59e0b',
                  boxShadow: account.status === 'Active' 
                    ? '0 0 20px rgba(16, 185, 129, 0.3)' 
                    : '0 0 20px rgba(245, 158, 11, 0.3)',
                }}>
                  {account.status}
                </span>
              </div>
              
              <div style={styles.cardBody}>
                <div style={styles.accountDetail}>
                  <span style={styles.label}>Account Number</span>
                  <span style={styles.value}>{account.accountNumber}</span>
                </div>
                <div style={styles.accountDetail}>
                  <span style={styles.label}>Last Updated</span>
                  <span style={styles.value}>Today</span>
                </div>
              </div>
              
              <button 
                style={styles.manageButton} 
                onClick={() => openModal(index)}
                onMouseEnter={(e) => {
                  e.target.style.background = '#6d1a24';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(138, 31, 44, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#8A1F2C';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(138, 31, 44, 0.3)';
                }}
              >
                <span style={styles.buttonText}>Manage Account</span>
                <span style={styles.buttonIcon}>→</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAccountIndex !== null && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalGlow}></div>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Edit Account Details</h2>
                <button 
                  style={styles.closeButton} 
                  onClick={closeModal}
                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                >
                  ×
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Account Type</label>
                  <input
                    name="accountType"
                    value={editData.accountType}
                    onChange={handleEditChange}
                    style={styles.input}
                    onFocus={(e) => e.target.style.borderColor = '#8A1F2C'}
                    onBlur={(e) => e.target.style.borderColor = '#374151'}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.inputLabel}>Status</label>
                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleEditChange}
                    style={styles.select}
                    onFocus={(e) => e.target.style.borderColor = '#8A1F2C'}
                    onBlur={(e) => e.target.style.borderColor = '#374151'}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button 
                  style={styles.cancelBtn} 
                  onClick={closeModal}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#374151';
                    e.target.style.borderColor = '#8A1F2C';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#374151';
                  }}
                >
                  Cancel
                </button>
                <button 
                  style={styles.saveBtn} 
                  onClick={saveChanges}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#6d1a24';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#8A1F2C';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    color: '#ffffff',
    padding: '2rem',
    fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
    `,
    zIndex: 0,
  },
  header: {
    marginBottom: '3rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #8A1F2C 0%, #b82841 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.02em',
    textShadow: '0 0 30px rgba(138, 31, 44, 0.5)',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#cbd5e1',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
    fontWeight: '400',
  },
  accountsList: {
    display: 'grid',
    gap: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  accountCard: {
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    transform: 'translateY(0)',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(138, 31, 44, 0.1) 0%, rgba(184, 40, 65, 0.1) 100%)',
    borderRadius: '20px',
    zIndex: 0,
  },
  cardContent: {
    position: 'relative',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: '2rem',
    zIndex: 1,
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  bankInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  bankName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  accountTypeChip: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: 'linear-gradient(135deg, rgba(138, 31, 44, 0.2) 0%, rgba(184, 40, 65, 0.2) 100%)',
    border: '1px solid rgba(138, 31, 44, 0.3)',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#cbd5e1',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusBadge: {
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  cardBody: {
    marginBottom: '2rem',
  },
  accountDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  label: {
    fontSize: '0.9rem',
    color: '#9ca3af',
    fontWeight: '500',
  },
  value: {
    fontSize: '0.9rem',
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: 'Monaco, monospace',
  },
  manageButton: {
    width: '100%',
    padding: '1rem 2rem',
    background: '#8A1F2C',
    color: '#ffffff',
    border: 'none',
    borderRadius: '15px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(138, 31, 44, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonText: {
    zIndex: 1,
  },
  buttonIcon: {
    fontSize: '1.2rem',
    transition: 'transform 0.3s ease',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease',
  },
  modal: {
    width: '100%',
    maxWidth: '500px',
    margin: '1rem',
    position: 'relative',
    borderRadius: '20px',
    overflow: 'hidden',
  },
  modalGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(138, 31, 44, 0.1) 0%, rgba(184, 40, 65, 0.1) 100%)',
    zIndex: 0,
  },
  modalContent: {
    position: 'relative',
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    zIndex: 1,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2rem 2rem 0 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '1rem',
    marginBottom: '2rem',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #8A1F2C 0%, #b82841 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: '0.5rem',
    lineHeight: 1,
    transition: 'color 0.2s ease',
    borderRadius: '10px',
  },
  modalBody: {
    padding: '0 2rem',
  },
  inputGroup: {
    marginBottom: '2rem',
  },
  inputLabel: {
    display: 'block',
    marginBottom: '0.75rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
    backdropFilter: 'blur(10px)',
  },
  select: {
    width: '100%',
    padding: '1rem',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
    backdropFilter: 'blur(10px)',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    padding: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '2rem',
  },
  cancelBtn: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    border: '1px solid #374151',
    borderRadius: '12px',
    color: '#9ca3af',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  saveBtn: {
    padding: '1rem 2rem',
    background: '#8A1F2C',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    boxShadow: '0 4px 15px rgba(138, 31, 44, 0.3)',
  },
};

export default LinkedAccounts;