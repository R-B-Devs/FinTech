import React from 'react';
import { Banknote } from 'lucide-react';
import '../styles/MoneyTracker.css';

const transactions = [
  { id: 1, type: 'Income', category: 'Salary', amount: 15000, date: '2025-06-01' },
  { id: 2, type: 'Expense', category: 'Groceries', amount: 2500, date: '2025-06-03' },
  { id: 3, type: 'Expense', category: 'Transport', amount: 800, date: '2025-06-05' },
  { id: 4, type: 'Income', category: 'Freelance', amount: 5000, date: '2025-06-10' },
];

const MoneyTracker = () => {
  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="money-tracker-page">
      <h2><Banknote size={28} /> Money Tracker</h2>
      <p>Track your income and expenses to stay on top of your finances.</p>

      <div className="summary-cards">
        <div className="card income">
          <h3>Total Income</h3>
          <p>R {totalIncome.toLocaleString()}</p>
        </div>
        <div className="card expense">
          <h3>Total Expense</h3>
          <p>R {totalExpense.toLocaleString()}</p>
        </div>
        <div className="card balance">
          <h3>Balance</h3>
          <p>R {balance.toLocaleString()}</p>
        </div>
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount (R)</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{tx.date}</td>
              <td className={tx.type.toLowerCase()}>{tx.type}</td>
              <td>{tx.category}</td>
              <td>{tx.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MoneyTracker;
