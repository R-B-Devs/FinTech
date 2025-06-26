import React, { useState } from 'react';
import BackToDashboardButton from '../pages/BackToDashboardButton';

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
      <BackToDashboardButton />
      <h1 style={styles.title}>Linked Accounts</h1>
      <p style={styles.text}>
        Manage your connected bank accounts and payment methods.
      </p>

      <div style={styles.list}>
        {accounts.map((account, index) => (
          <div key={index} style={styles.card}>
            <h3 style={styles.cardTitle}>{account.bankName}</h3>
            <p style={styles.cardDetail}><strong>Account Type:</strong> {account.accountType}</p>
            <p style={styles.cardDetail}><strong>Account Number:</strong> {account.accountNumber}</p>
            <p style={styles.cardDetail}><strong>Status:</strong> {account.status}</p>
            <button style={styles.manageButton} onClick={() => openModal(index)}>Manage</button>
          </div>
        ))}
      </div>

      {selectedAccountIndex !== null && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2>Edit Account</h2>

            <label style={styles.label}>Account Type</label>
            <input
              name="accountType"
              value={editData.accountType}
              onChange={handleEditChange}
              style={styles.input}
            />

            <label style={styles.label}>Status</label>
            <select
              name="status"
              value={editData.status}
              onChange={handleEditChange}
              style={styles.input}
            >
              <option value="Active">Active</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div style={styles.modalButtons}>
              <button style={styles.saveBtn} onClick={saveChanges}>Save</button>
              <button style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
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
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #000000 100%)',
    color: 'white',
    padding: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1rem',
    color: '#ccc',
    marginBottom: '2rem',
  },
  list: {
    display: 'grid',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    padding: '1rem',
    borderRadius: '0.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  cardDetail: {
    fontSize: '0.95rem',
    color: '#ccc',
    marginBottom: '0.25rem',
  },
  manageButton: {
    marginTop: '0.75rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#8A1F2C', // Custom color as requested
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modal: {
    backgroundColor: '#1f2937',
    padding: '2rem',
    borderRadius: '0.5rem',
    width: '100%',
    maxWidth: '400px',
    color: 'white',
  },
  label: {
    display: 'block',
    marginTop: '1rem',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#2d3748',
    border: '1px solid #4a5568',
    borderRadius: '0.375rem',
    color: 'white',
  },
  modalButtons: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  saveBtn: {
    backgroundColor: '#dc143c',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: '#4a5568',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.375rem',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default LinkedAccounts;
