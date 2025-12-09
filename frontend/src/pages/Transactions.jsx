import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import TransactionForm from '../components/TransactionForm';
import api from '../api';

const Transactions = () => {
  const { user } = useAuth();
  const readOnly = user?.role === 'read-only';

  const [txs, setTxs] = useState([]);
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const fetchTxs = async () => {
    try {
      const params = { page, limit: 10 };
      if (desc) params.desc = desc;
      if (type) params.type = type;
      if (category) params.category = category;
      
      console.log('Fetching transactions with params:', params);
      const res = await api.get('/transactions', { params });
      console.log('Fetched transactions:', res.data);
      setTxs(res.data.transactions);
      setTotal(res.data.pagination.pages);
    } catch (err) {
      console.error('Fetch error:', err);
      console.error('Error response:', err.response?.data);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, [page, desc, type, category]);

  useEffect(() => {
    console.log('Transactions loaded:', txs.length);
  }, [txs]);

  const handleSubmit = async (data) => {
    try {
      console.log('Submitting transaction:', data);
      let res;
      if (editTx) {
        console.log('Updating transaction:', editTx._id);
        res = await api.put(`/transactions/${editTx._id}`, data);
      } else {
        console.log('Creating new transaction');
        res = await api.post('/transactions', data);
      }
      console.log('Response:', res.data);
      setShowForm(false);
      setEditTx(null);
      await fetchTxs();
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.response?.data?.error || err.message || 'Error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTxs();
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const openAdd = () => { setEditTx(null); setShowForm(true); };
  const openEdit = (tx) => { setEditTx(tx); setShowForm(true); };

  return (
    <div className="container">
      <h2>Transactions</h2>

      <div className="filters">
        <input 
          placeholder="Search description" 
          value={desc} 
          onChange={(e) => setDesc(e.target.value)} 
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Salary">Salary</option>
          <option value="Rent">Rent</option>
          <option value="Other">Other</option>
          <option value="Freelance">Freelance</option>
        </select>
        {!readOnly && (
          <button onClick={openAdd} className="btn">Add Transaction</button>
        )}
      </div>

      <div className="table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description</th>
              {!readOnly && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {txs.map(tx => (
              <tr key={tx._id}>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
                <td>{tx.type}</td>
                <td>{tx.category}</td>
                <td style={{ color: tx.type === 'income' ? '#2ecc71' : '#e74c3c' }}>
                  ₹{tx.amount}
                </td>
                <td>{tx.description}</td>
                {!readOnly && (
                  <td className="table-actions">
                    <button onClick={() => openEdit(tx)} className="btn">Edit</button>
                    <button onClick={() => handleDelete(tx._id)} className="btn btn-danger">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn">
          Prev
        </button>
        <span>Page {page} / {total}</span>
        <button onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total} className="btn">
          Next
        </button>
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => { setShowForm(false); setEditTx(null); }}
          onSubmit={handleSubmit}
          initial={editTx}
        />
      )}
    </div>
  );
};

export default Transactions;
