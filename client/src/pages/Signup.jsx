import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <h1>Signup</h1>
        <p>Create an Admin or Member account for this demo app.</p>
        {error && <div className="alert">{error}</div>}
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          Email
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <label>
          Role
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            <option>Member</option>
            <option>Admin</option>
          </select>
        </label>
        <button type="submit">Create account</button>
        <span>
          Already registered? <Link to="/login">Login</Link>
        </span>
      </form>
    </div>
  );
};

export default Signup;
