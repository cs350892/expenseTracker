import { useState } from 'react';

const cats = ['Food', 'Transport', 'Entertainment', 'Salary', 'Rent', 'Other', 'Freelance'];

const TransactionForm = ({ onClose, onSubmit, initial }) => {
  const [form, setForm] = useState(() => {
    if (initial) {
      return {
        type: initial.type || 'expense',
        amount: initial.amount || '',
        category: initial.category || 'Food',
        description: initial.description || '',
        date: initial.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
    }
    return {
      type: 'expense',
      amount: '',
      category: 'Food',
      description: '',
      date: new Date().toISOString().split('T')[0]
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || !form.category) {
      alert('Please fill amount and category');
      return;
    }
    const txData = {
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      description: form.description,
      date: form.date
    };
    console.log('Submitting:', txData);
    onSubmit(txData);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
        <h3>Transaction Form</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input name="amount" type="number" value={form.amount} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {cats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
            <input name="description" value={form.description} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn">Save</button>
            <button type="button" onClick={onClose} className="btn btn-danger">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
