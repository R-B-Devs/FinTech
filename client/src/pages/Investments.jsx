import React from 'react';
import { BarChart2 } from 'lucide-react';
import '../styles/Investments.css';
import BackToDashboardButton from '../pages/BackToDashboardButton';

const investments = [
  { id: 1, name: 'Tech Growth Fund', type: 'Mutual Fund', value: 25000, change: 5.2 },
  { id: 2, name: 'Blue Chip Stocks', type: 'Stocks', value: 18000, change: -1.1 },
  { id: 3, name: 'Government Bonds', type: 'Bonds', value: 12000, change: 2.3 },
  { id: 4, name: 'Real Estate Trust', type: 'REIT', value: 15000, change: 3.8 },
];

const Investments = () => {
  return (
    <div className="investments-page">
      <BackToDashboardButton />
      <h2><BarChart2 size={28} /> Investments Portfolio</h2>
      <p>Overview of your current investments and their performance.</p>

      <table className="investments-table">
        <thead>
          <tr>
            <th>Investment</th>
            <th>Type</th>
            <th>Current Value (R)</th>
            <th>Change (%)</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.name}</td>
              <td>{inv.type}</td>
              <td>R {inv.value.toLocaleString()}</td>
              <td className={inv.change >= 0 ? 'positive' : 'negative'}>
                {inv.change > 0 ? '+' : ''}
                {inv.change}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Investments;
