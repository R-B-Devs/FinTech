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
import { Activity, Loader2 } from 'lucide-react';
import '../styles/Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token');     // 🔐  JWT from login
      if (!token) {
        setError('You must be logged in to view transactions.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/users/transactions?limit=50&offset=0', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || 'Failed to fetch transactions');
        }

        const { transactions } = await res.json();
        setTransactions(transactions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="transactions-page">
        <Loader2 className="spinner" size={24} /> Loading transactions…
      </div>
    );
  }

  if (error) {
    return (
      <div className="transactions-page">
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <h2>
        <Activity size={28} /> Recent Transactions
      </h2>

      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount (ZAR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(
              ({
                transaction_id,
                transaction_date,
                description,
                amount,
                transaction_type,
                status = 'Completed', // Supabase field may be null
              }) => (
                <tr
                  key={transaction_id}
                  className={
                    transaction_type?.toLowerCase() === 'credit'
                      ? 'credit'
                      : 'debit'
                  }
                >
                  <td>{new Date(transaction_date).toLocaleDateString()}</td>
                  <td>{description}</td>
                  <td>
                    {amount < 0
                      ? `-R${Math.abs(amount).toFixed(2)}`
                      : `R${amount.toFixed(2)}`}
                  </td>
                  <td className={`status ${status.toLowerCase()}`}>{status}</td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Transactions;
