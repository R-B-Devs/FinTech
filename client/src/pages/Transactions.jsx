// import React from 'react';
// import { Activity } from 'lucide-react';
// import '../styles/Transactions.css';

// const transactionsData = [
//   {
//     id: 1,
//     date: '2025-06-10',
//     description: 'Grocery Store',
//     amount: -150.75,
//     type: 'debit',
//     status: 'Completed',
//   },
//   {
//     id: 2,
//     date: '2025-06-08',
//     description: 'Salary Payment',
//     amount: 5000,
//     type: 'credit',
//     status: 'Completed',
//   },
//   {
//     id: 3,
//     date: '2025-06-05',
//     description: 'Electricity Bill',
//     amount: -320.40,
//     type: 'debit',
//     status: 'Pending',
//   },
//   {
//     id: 4,
//     date: '2025-06-02',
//     description: 'Movie Tickets',
//     amount: -75.00,
//     type: 'debit',
//     status: 'Completed',
//   },
// ];

// const Transactions = () => {
//   return (
//     <div className="transactions-page">
//       <h2><Activity size={28} /> Recent Transactions</h2>
//       <table className="transactions-table">
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Description</th>
//             <th>Amount (ZAR)</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactionsData.map(({ id, date, description, amount, type, status }) => (
//             <tr key={id} className={type === 'credit' ? 'credit' : 'debit'}>
//               <td>{date}</td>
//               <td>{description}</td>
//               <td>{amount < 0 ? `-R${Math.abs(amount).toFixed(2)}` : `R${amount.toFixed(2)}`}</td>
//               <td className={`status ${status.toLowerCase()}`}>{status}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Transactions;

import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError('');

      // Retrieve JWT token
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/users/transactions', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        const data = await response.json();

        if (response.ok) {
          setTransactions(data.transactions);
        } else {
          setError(data.error || 'Failed to fetch transactions');
        }
      } catch (err) {
        setError('Server connection failed');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="transactions-page">
      <Link to="/Dashboard" className="nav-link">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>Back</span>
        </Link>
      <h2><Activity size={28} /> Recent Transactions</h2>
      {loading && <div className="loading">Loading transactions...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && (
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
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} style={{textAlign:'center', color:'gray'}}>No transactions found</td>
              </tr>
            ) : transactions.map(tx => (
              <tr key={tx.transaction_id} className={tx.transaction_type === 'credit' ? 'credit' : 'debit'}>
                <td>{tx.transaction_date ? tx.transaction_date.split('T')[0] : ''}</td>
                <td>{tx.description || tx.category || tx.merchant_name || '-'}</td>
                <td>
                  {tx.amount < 0
                    ? `-R${Math.abs(tx.amount).toFixed(2)}`
                    : `R${tx.amount.toFixed(2)}`}
                </td>
                <td className={`status ${tx.transaction_type}`}>
                  {tx.status || tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transactions;