import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const handleViewUser = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}`);
      setSelectedUser(res.data.user);
      setUserStats(res.data.stats);
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!confirm(`Change user role to ${newRole}?`)) return;
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      alert('Role updated successfully');
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user and all their transactions?')) return;
    try {
      await api.delete(`/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers();
      if (selectedUser?._id === userId) {
        setSelectedUser(null);
        setUserStats(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container">
        <h2>Access Denied</h2>
        <p>Only admins can access this page.</p>
      </div>
    );
  }

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h2>User Management</h2>

      <div className="grid">
        <div className="card">
          <h3>All Users ({users.length})</h3>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.email}</td>
                    <td>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        disabled={u._id === user.id}
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="read-only">Read-only</option>
                      </select>
                    </td>
                    <td className="table-actions">
                      <button onClick={() => handleViewUser(u._id)} className="btn">
                        View
                      </button>
                      {u._id !== user.id && (
                        <button onClick={() => handleDeleteUser(u._id)} className="btn btn-danger">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedUser && (
          <div className="card">
            <h3>User Details</h3>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            {userStats && (
              <>
                <h4 style={{ marginTop: '20px' }}>Statistics</h4>
                <p><strong>Total Transactions:</strong> {userStats.totalTransactions}</p>
                <p style={{ color: '#2ecc71' }}><strong>Total Income:</strong> ₹{userStats.totalIncome}</p>
                <p style={{ color: '#e74c3c' }}><strong>Total Expense:</strong> ₹{userStats.totalExpense}</p>
                <p><strong>Balance:</strong> ₹{userStats.balance}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
