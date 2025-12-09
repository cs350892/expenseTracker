import { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import api from '../api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="container">Loading...</div>;
  if (!data) return <div className="container">No data</div>;

  const pieData = {
    labels: Object.keys(data.categoryBreakdown),
    datasets: [{
      data: Object.values(data.categoryBreakdown),
      backgroundColor: ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#34495e']
    }]
  };

  const months = Object.keys(data.last6Months).reverse();
  const barData = {
    labels: months,
    datasets: [
      { label: 'Income', data: months.map(m => data.last6Months[m].income), backgroundColor: '#2ecc71' },
      { label: 'Expense', data: months.map(m => data.last6Months[m].expense), backgroundColor: '#e74c3c' }
    ]
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      
      <div className="card" style={{ textAlign: 'center', marginBottom: '30px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <h2 style={{ margin: '10px 0', fontSize: '32px' }}>
          Current Balance: ₹{data.balance}
        </h2>
        <p style={{ fontSize: '14px', opacity: 0.9 }}>
          Total Income: ₹{data.totalIncome} - Total Expenses: ₹{data.totalExpense}
        </p>
      </div>
      
      <div className="grid">
        <div className="card">
          <h3>Total Income</h3>
          <p style={{ fontSize: '24px', color: '#2ecc71' }}>₹{data.totalIncome}</p>
        </div>
        <div className="card">
          <h3>Total Expense</h3>
          <p style={{ fontSize: '24px', color: '#e74c3c' }}>₹{data.totalExpense}</p>
        </div>
        <div className="card">
          <h3>Balance</h3>
          <p style={{ fontSize: '24px', color: data.balance >= 0 ? '#2ecc71' : '#e74c3c' }}>
            ₹{data.balance}
          </p>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Category Breakdown</h3>
          <Pie data={pieData} />
        </div>
        <div className="card">
          <h3>Last 6 Months</h3>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
