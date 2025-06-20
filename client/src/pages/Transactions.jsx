import React from 'react';
import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/Transactions.css';

const transactionsData = [
  {
    id: 1,
    date: '2025-06-10',
    description: 'Grocery Store',
    amount: -150.75,
    type: 'debit',
    status: 'Completed',
  },
  {
    id: 2,
    date: '2025-06-08',
    description: 'Salary Payment',
    amount: 5000,
    type: 'credit',
    status: 'Completed',
  },
  {
    id: 3,
    date: '2025-06-05',
    description: 'Electricity Bill',
    amount: -320.40,
    type: 'debit',
    status: 'Pending',
  },
  {
    id: 4,
    date: '2025-06-02',
    description: 'Movie Tickets',
    amount: -75.00,
    type: 'debit',
    status: 'Completed',
  },
];

const Transactions = () => {
  return (
    <div className="transactions-page">
      <Link to="/Dashboard" className="nav-link">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>Back</span>
        </Link>
      <h2><Activity size={28} /> Recent Transactions</h2>
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount (ZAR)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactionsData.map(({ id, date, description, amount, type, status }) => (
            <tr key={id} className={type === 'credit' ? 'credit' : 'debit'}>
              <td>{date}</td>
              <td>{description}</td>
              <td>{amount < 0 ? `-R${Math.abs(amount).toFixed(2)}` : `R${amount.toFixed(2)}`}</td>
              <td className={`status ${status.toLowerCase()}`}>{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;

