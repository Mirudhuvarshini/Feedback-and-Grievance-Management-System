import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, logout, getUserNotifications, markNotificationsRead } = useAuth();

    const notifications = getUserNotifications(user?.id || '');
    const unreadCount = notifications.filter(n => !n.read).length;

    if (!user) return null;

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="mb-8">
                <h1 style={{ marginBottom: '0.5rem' }}>My Profile</h1>
                <p>Manage your account and view notifications.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
                    <div className="flex-center mb-6" style={{ flexDirection: 'column' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', marginBottom: '1rem', fontWeight: 'bold' }}>
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h3 style={{ margin: 0 }}>{user.name}</h3>
                        <span className={`badge ${user.role === 'admin' ? 'badge-escalated' : 'badge-new'}`} style={{ marginTop: '0.5rem' }}>
                            {user.role === 'admin' ? 'Administrator' : 'Student'}
                        </span>
                    </div>

                    <div className="mb-4">
                        <span className="form-label" style={{ fontSize: '0.75rem' }}>Email Address</span>
                        <p style={{ color: 'var(--text-primary)' }}>{user.email}</p>
                    </div>

                    <div className="mb-4">
                        <span className="form-label" style={{ fontSize: '0.75rem' }}>Member Since</span>
                        <p style={{ color: 'var(--text-primary)' }}>{new Date(user.memberSince).toLocaleDateString()}</p>
                    </div>

                    <button
                        onClick={logout}
                        className="btn btn-danger"
                        style={{ width: '100%', marginTop: '1rem', background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                        🚪 Logout
                    </button>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div className="flex-between mb-6">
                        <h3 style={{ margin: 0 }}>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="btn btn-secondary" onClick={() => markNotificationsRead(user.id)} style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="flex-center" style={{ padding: '2rem', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</div>
                            <p>No notifications yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notifications.map(n => (
                                <div key={n.id} style={{
                                    padding: '1rem',
                                    backgroundColor: n.read ? 'rgba(30, 41, 59, 0.4)' : 'rgba(79, 70, 229, 0.1)',
                                    borderLeft: `4px solid ${n.read ? 'transparent' : 'var(--primary)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    transition: 'all 0.2s'
                                }}>
                                    <div className="flex-between mb-2">
                                        <span style={{ fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)' }}>
                                            {n.type === 'success' && '✅ '}
                                            {n.type === 'error' && '❌ '}
                                            {n.type === 'warning' && '⚠️ '}
                                            {n.type === 'info' && 'ℹ️ '}
                                            System Alert
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {new Date(n.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>{n.message}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
