import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useComplaint } from '../context/ComplaintContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const { complaints } = useComplaint();
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    const myComplaints = complaints.filter(c => c.userId === user.id);

    // Calculate stats
    const total = myComplaints.length;
    const pending = myComplaints.filter(c => ['New', 'Under Review', 'Escalated'].includes(c.status)).length;
    const resolved = myComplaints.filter(c => c.status === 'Resolved').length;
    const rejected = myComplaints.filter(c => c.status === 'Rejected').length;

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'New': return 'badge-new';
            case 'Under Review': return 'badge-review';
            case 'Resolved': return 'badge-resolved';
            case 'Rejected': return 'badge-rejected';
            case 'Escalated': return 'badge-escalated';
            default: return '';
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High': return 'priority-high';
            case 'Medium': return 'priority-medium';
            case 'Low': return 'priority-low';
            default: return '';
        }
    };

    return (
        <div className="animate-fade-in">
            {!selectedComplaint ? (
                <>
                    <div className="flex-between mb-8">
                        <div>
                            <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Welcome, {user.name}</h1>
                            <p style={{ margin: 0 }}>Track and manage your complaints efficiently</p>
                        </div>
                        {/* Notification Bell right side of header */}
                        <div style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', background: 'var(--surface)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.25rem' }}>🔔</span>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-title">Total</span>
                            <span className="stat-value">{total}</span>
                            <span className="stat-icon" style={{ color: '#60A5FA' }}>📄</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-title">Pending</span>
                            <span className="stat-value" style={{ color: 'var(--warning)' }}>{pending}</span>
                            <span className="stat-icon" style={{ color: 'var(--warning)' }}>🕒</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-title">Resolved</span>
                            <span className="stat-value" style={{ color: 'var(--success)' }}>{resolved}</span>
                            <span className="stat-icon" style={{ color: 'var(--success)' }}>✅</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-title">Rejected</span>
                            <span className="stat-value" style={{ color: 'var(--danger)' }}>{rejected}</span>
                            <span className="stat-icon" style={{ color: 'var(--danger)' }}>❌</span>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
                        <h3 className="mb-4">Recent Complaints</h3>

                        {myComplaints.length === 0 ? (
                            <div className="flex-center" style={{ padding: '2rem', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                                <p>You haven't submitted any complaints yet.</p>
                                <Link to="/submit" className="btn btn-primary mt-4">
                                    Submit your first complaint
                                </Link>
                            </div>
                        ) : (
                            <div className="recent-complaints-list">
                                {myComplaints.map(c => (
                                    <div key={c.id} className="complaint-list-item" onClick={() => setSelectedComplaint(c)}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.125rem' }}>{c.title}</span>
                                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {new Date(c.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    <div className="flex-between mb-6">
                        <h2 style={{ margin: 0 }}>Complaint Details</h2>
                        <button className="btn btn-secondary" onClick={() => setSelectedComplaint(null)}>
                            ← Back to list
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <div className="mb-4">
                                <span className="form-label">Title</span>
                                <p style={{ color: 'var(--text-primary)', fontSize: '1.125rem', fontWeight: 500 }}>{selectedComplaint.title}</p>
                            </div>
                            <div className="mb-4">
                                <span className="form-label">Description</span>
                                <p style={{ color: 'var(--text-primary)', background: 'rgba(15, 23, 42, 0.4)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                                    {selectedComplaint.description}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '2rem' }} className="mb-4">
                                <div>
                                    <span className="form-label">Category</span>
                                    <p style={{ color: 'var(--text-primary)' }}>{selectedComplaint.category}</p>
                                </div>
                                <div>
                                    <span className="form-label">Priority</span>
                                    <p className={getPriorityClass(selectedComplaint.priority)} style={{ fontWeight: 600 }}>{selectedComplaint.priority}</p>
                                </div>
                                <div>
                                    <span className="form-label">Submission Type</span>
                                    <p style={{ color: 'var(--text-primary)' }}>{selectedComplaint.submissionType}</p>
                                </div>
                            </div>
                            {selectedComplaint.fileName && (
                                <div className="mb-4">
                                    <span className="form-label">Attachment</span>
                                    <p style={{ color: 'var(--text-primary)' }}>📎 {selectedComplaint.fileName}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="mb-4">
                                <span className="form-label">Current Status</span>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span className={`badge ${getStatusBadgeClass(selectedComplaint.status)}`} style={{ fontSize: '1rem', padding: '0.35rem 1rem' }}>
                                        {selectedComplaint.status}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Assigned to: {selectedComplaint.assignedTo}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4 mt-6">
                                <span className="form-label" style={{ marginBottom: '1rem' }}>Timeline</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {selectedComplaint.timeline.map((item, idx) => (
                                        <div key={idx} style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--surface-border)' }}>
                                            <div style={{ position: 'absolute', left: '-5px', top: '0', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                                                {new Date(item.timestamp).toLocaleString()}
                                            </div>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                                                {item.status}
                                            </div>
                                            <div style={{ fontSize: '0.875rem' }}>{item.comment}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
