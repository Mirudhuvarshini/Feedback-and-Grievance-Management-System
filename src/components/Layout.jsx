import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Toast = ({ notifications }) => {
    if (!notifications || notifications.length === 0) return null;
    const recent = notifications.slice(0, 3).filter(n => !n.read);

    return (
        <div className="toast-container">
            {recent.map((n) => (
                <div key={n.id} className={`toast toast-${n.type}`}>
                    {n.message}
                </div>
            ))}
        </div>
    );
};

const Layout = () => {
    const { user, logout, getUserNotifications, markNotificationsRead } = useAuth();
    const navigate = useNavigate();
    const notifications = user ? getUserNotifications(user.id) : [];
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (unreadCount > 0) {
            const timer = setTimeout(() => {
                markNotificationsRead(user.id);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [unreadCount, user.id, markNotificationsRead]);

    return (
        <div className="app-layout">
            <main className="main-content">
                <Outlet />
            </main>

            <nav className="bottom-nav">
                {user.role === 'admin' ? (
                    <>
                        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">📊</span>
                            Dashboard
                        </NavLink>
                        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">📈</span>
                            Reports
                        </NavLink>
                    </>
                ) : (
                    <>
                        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">🏠</span>
                            Dashboard
                        </NavLink>
                        <NavLink to="/submit" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <span className="nav-icon">➕</span>
                            Submit
                        </NavLink>
                    </>
                )}

                <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon">👤</span>
                    Profile
                    {unreadCount > 0 && (
                        <span style={{
                            position: 'absolute', top: '2px', right: '15px',
                            backgroundColor: 'var(--danger)', color: 'white',
                            borderRadius: '50%', width: '16px', height: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', fontWeight: 'bold'
                        }}>
                            {unreadCount}
                        </span>
                    )}
                </NavLink>
            </nav>

            <Toast notifications={notifications} />
        </div>
    );
};

export default Layout;
