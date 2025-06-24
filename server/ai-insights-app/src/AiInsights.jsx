import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#4a90e2', '#50e3c2', '#f5a623', '#d0021b', '#9013fe', '#7ed321'];

function LoadingDots() {
  return (
    <div style={{ fontSize: 18, fontWeight: 600, color: '#555', textAlign: 'center', marginBottom: 24 }}>
      Analyzing your financial data
      <span className="dots" style={{ marginLeft: 6 }}></span>
      <style>{`
        .dots::after {
          content: '';
          display: inline-block;
          animation: dots 1.5s steps(4, end) infinite;
          width: 1ch;
          text-align: left;
          color: #4a90e2;
          font-weight: 700;
        }
        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  );
}

function SkeletonBlock({ width = '100%', height = 20, style = {} }) {
  return (
    <div
      style={{
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        marginBottom: 12,
        width,
        height,
        animation: 'pulse 1.6s ease-in-out infinite',
        ...style,
      }}
    />
  );
}

export default function AiInsights() {
  const [aiInsight, setAiInsight] = useState('');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5001/analyze');
        setAiInsight(res.data.insights);

        const categories = {};
        res.data.data.forEach((item) => {
          const cat = item.Category || 'Other';
          const amt = parseFloat(item.Amount || 0);
          if (!isNaN(amt)) {
            categories[cat] = (categories[cat] || 0) + Math.abs(amt);
          }
        });

        const pie = Object.entries(categories).map(([name, value]) => ({ name, value }));
        setChartData(pie);
      } catch (err) {
        console.error('❌ Could not fetch AI insights', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 700,
          margin: '40px auto',
          padding: 24,
          background: '#fafafa',
          borderRadius: 12,
          boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
        }}
      >
        <LoadingDots />
        <SkeletonBlock width="80%" height={24} />
        <SkeletonBlock width="90%" height={16} />
        <SkeletonBlock width="70%" height={16} />
        <SkeletonBlock width="60%" height={16} />
        <SkeletonBlock width="40%" height={150} style={{ borderRadius: 12, marginTop: 32 }} />
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '40px auto',
        padding: 24,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
        color: '#333',
      }}
    >
      {aiInsight && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16, color: '#4a90e2' }}>
            💼 AI Financial Insights
          </h2>
          <p style={{ whiteSpace: 'pre-line', fontSize: 16, lineHeight: 1.5 }}>{aiInsight}</p>
        </section>
      )}

      {chartData.length > 0 && (
        <section>
          <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 16, color: '#4a90e2' }}>
            📊 Spending by Category
          </h2>
          <PieChart width={500} height={350}>
  <Pie
    data={chartData}
    dataKey="value"
    cx="50%"
    cy="50%"
    outerRadius={110}
    labelLine={false}
    label={({ name, percent }) =>
      `${name}: ${(percent * 100).toFixed(1)}%`
    }
  >
    {chartData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip
    formatter={(value) =>
      new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
      }).format(value)
    }
  />
  <Legend verticalAlign="bottom" layout="horizontal" />
</PieChart>

        </section>
      )}
    </div>
  );
}
