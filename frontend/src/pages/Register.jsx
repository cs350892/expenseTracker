import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [role, setRole] = useState('user');
  const [err, setErr] = useState('');
  const { register, loading, user } = useAuth();
  const nav = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      nav('/dashboard', { replace: true });
    }
  }, [user, nav]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    
    if (!email || !pwd) {
      setErr('Please fill all fields');
      return;
    }
    
    const result = await register(email, pwd, role);
    if (result.success) {
      console.log('Registration successful, redirecting to dashboard...');
      nav('/dashboard', { replace: true });
    } else {
      setErr(result.error);
    }
  };

  return (
    <div className="form">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="read-only">Read-only</option>
          </select>
        </div>
        {err && <div className="error">{err}</div>}
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Loading...' : 'Register'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
