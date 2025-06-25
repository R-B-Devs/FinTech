import React from 'react';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8E44AD'];

function SpendingChart({ data }) {
  const grouped = {};

  data.forEach((entry) => {
    const category = entry.Category || 'Other';
    const amount = parseFloat(entry.Amount) || 0;
    grouped[category] = (grouped[category] || 0) + amount;
  });

  const chartData = Object.keys(grouped).map((key) => ({
    name: key,
    value: Math.abs(grouped[key]),
  }));

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>💸 Spending Breakdown</h3>
      <PieChart width={400} height={300}>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}

export default SpendingChart;
