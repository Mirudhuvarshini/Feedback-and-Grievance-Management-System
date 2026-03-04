import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Auto-fill test values for empty fields if needed, but let's just show error
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        const { success, error: loginError } = login(email, password, isAdmin);

        if (success) {
            navigate(isAdmin ? '/admin' : '/');
        } else {
            setError(loginError);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: '1.5rem' }}>
            <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    Welcome Back
                </h2>

                {error && (
                    <div className="mb-4" style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: '#F87171' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-4">
                        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="checkbox"
                                checked={isAdmin}
                                onChange={(e) => setIsAdmin(e.target.checked)}
                                style={{ width: '1rem', height: '1rem' }}
                            />
                            Admin Login ?
                        </label>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Email / Username</label>
                        <input
                            type={isAdmin ? "text" : "email"}
                            className="form-control"
                            placeholder={isAdmin ? "e.g., admin" : "your@email.com"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group mb-6">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Login
                    </button>
                </form>

                {!isAdmin && (
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                        Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign up</Link>
                    </p>
                )}
            </div>
        </div>
    );
};

export default Login;
