import React, { useState } from 'react';

const LinkedAccounts = () => {
  const [accounts, setAccounts] = useState([
    {
      bankName: 'Capitec Bank',
      accountType: 'Savings',
      accountNumber: '**** 4567',
      status: 'Active',
    },
    {
      bankName: 'FNB',
      accountType: 'Cheque',
      accountNumber: '**** 1234',
      status: 'Pending Verification',
    },
    {
      bankName: 'Discovery Bank',
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
      <div style={styles.header}>
        <h1 style={styles.title}>Linked Accounts</h1>
        <p style={styles.subtitle}>
          Manage your connected bank accounts and payment methods.
        </p>
      </div>

      <div style={styles.accountsList}>
        {accounts.map((account, index) => (
          <div key={index} style={styles.accountCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.bankName}>{account.bankName}</h3>
              <span style={{
                ...styles.statusBadge,
                backgroundColor: account.status === 'Active' ? '#8A1F2C' : '#555',
              }}>
                {account.status}
              </span>
            </div>
            
            <div style={styles.cardBody}>
              <div style={styles.accountDetail}>
                <span style={styles.label}>Account Type</span>
                <span style={styles.value}>{account.accountType}</span>
              </div>
              <div style={styles.accountDetail}>
                <span style={styles.label}>Account Number</span>
                <span style={styles.value}>{account.accountNumber}</span>
              </div>
            </div>
            
            <button 
              style={styles.manageButton} 
              onClick={() => openModal(index)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#6d1a24'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#8A1F2C'}
            >
              Manage Account
            </button>
          </div>
        ))}
      </div>

      {selectedAccountIndex !== null && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Account Details</h2>
              <button style={styles.closeButton} onClick={closeModal}>×</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Account Type</label>
                <input
                  name="accountType"
                  value={editData.accountType}
                  onChange={handleEditChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Status</label>
                <select
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                  style={styles.select}
                >
                  <option value="Active">Active</option>
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
              <button style={styles.saveBtn} onClick={saveChanges}>Save Changes</button>
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
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '2.5rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: '3rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#ffffff',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#a1a1aa',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  accountsList: {
    display: 'grid',
    gap: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  accountCard: {
    backgroundColor: '#111111',
    border: '1px solid #27272a',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  bankName: {
    fontSize: '1.375rem',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  statusBadge: {
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardBody: {
    marginBottom: '1.5rem',
  },
  accountDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #27272a',
  },
  label: {
    fontSize: '0.875rem',
    color: '#a1a1aa',
    fontWeight: '500',
  },
  value: {
    fontSize: '0.875rem',
    color: '#ffffff',
    fontWeight: '600',
  },
  manageButton: {
    width: '100%',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#8A1F2C',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: '#111111',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '450px',
    margin: '1rem',
    border: '1px solid #27272a',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 1.5rem 0 1.5rem',
    borderBottom: '1px solid #27272a',
    paddingBottom: '1rem',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#a1a1aa',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem',
    lineHeight: 1,
    transition: 'color 0.2s ease',
  },
  modalBody: {
    padding: '0 1.5rem',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  inputLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#ffffff',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#000000',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#000000',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1.5rem',
    borderTop: '1px solid #27272a',
    marginTop: '1.5rem',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #27272a',
    borderRadius: '8px',
    color: '#a1a1aa',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#8A1F2C',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },
};

export default LinkedAccounts;