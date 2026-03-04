import React, { createContext, useState, useEffect, useContext } from 'react';
import { getItem, setItem } from '../utils/localStorage';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getItem('currentUser', null));
    const [notifications, setNotifications] = useState(() => getItem('notifications', []));

    useEffect(() => {
        setItem('currentUser', user);
    }, [user]);

    useEffect(() => {
        setItem('notifications', notifications);
    }, [notifications]);

    const login = async (email, password, isAdmin) => {
        if (isAdmin) {
            if (email === 'admin' && password === '1234') {
                setUser({ id: 'admin', name: 'Admin', email: 'admin@portal.com', role: 'admin', memberSince: new Date().toISOString() });
                return { success: true };
            }
            return { success: false, error: 'Invalid admin credentials' };
        } else {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    setUser({ ...data.user, role: 'user' });
                    return { success: true };
                }
                return { success: false, error: data.error };
            } catch (err) {
                return { success: false, error: 'Database connection failed' };
            }
        }
    };

    const signup = async (name, email, password) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: `STU-${Date.now().toString().slice(-4)}`, name, email, password })
            });
            const data = await response.json();
            if (response.ok) {
                setUser({ ...data.user, role: 'user' });
                return { success: true };
            }
            return { success: false, error: data.error };
        } catch (err) {
            return { success: false, error: 'Database connection failed' };
        }
    };

    const logout = () => {
        setUser(null);
    };

    const addNotification = (userId, message, type = 'info') => {
        const newNotif = {
            id: Date.now().toString(),
            userId,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markNotificationsRead = (userId) => {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
    };

    const getUserNotifications = (userId) => {
        return notifications.filter(n => n.userId === userId);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            signup,
            logout,
            addNotification,
            getUserNotifications,
            markNotificationsRead
        }}>
            {children}
        </AuthContext.Provider>
    );
};
