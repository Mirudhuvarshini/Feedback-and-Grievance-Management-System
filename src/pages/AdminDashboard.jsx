import React, { useState } from 'react';
import { useComplaint } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { complaints, updateComplaint } = useComplaint();
    const { user } = useAuth();
    const [selectedComplaint, setSelectedComplaint] = useState(null);

    // Form state for updates
    const [newStatus, setNewStatus] = useState('');
    const [assignee, setAssignee] = useState('');
    const [comment, setComment] = useState('');

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

    const openDetails = (complaint) => {
        setSelectedComplaint(complaint);
        setNewStatus(complaint.status);
        setAssignee(complaint.assignedTo);
        setComment('');
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (selectedComplaint) {
            updateComplaint(
                selectedComplaint.id,
                newStatus,
                comment,
                user.name,
                assignee
            );
            // Update local state to reflect immediately
            setSelectedComplaint({
                ...selectedComplaint,
                status: newStatus,
                assignedTo: assignee,
                lastUpdated: new Date().toISOString()
            });
            setComment('');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="flex-between mb-8">
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                    <p>Manage, assign, and resolve user complaints.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="glass-panel text-center" style={{ padding: '1rem 2rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{complaints.length}</span>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</p>
                    </div>
                    <div className="glass-panel text-center" style={{ padding: '1rem 2rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{complaints.filter(c => c.status === 'New' || c.status === 'Escalated').length}</span>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Action Required</p>
                    </div>
                </div>
            </div>

            {!selectedComplaint ? (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    {complaints.length === 0 ? (
                        <div className="flex-center" style={{ padding: '3rem', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '3rem', margin: '1rem' }}>✅</div>
                            <h3>All caught up</h3>
                            <p>No complaints in the system.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User ID</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Assigned To</th>
                                        <th>Last Updated</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {complaints.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{c.id}</td>
                                            <td style={{ fontSize: '0.75rem' }}>{c.userId === 'anonymous' ? 'Anonymous' : c.userId}</td>
                                            <td>{c.title}</td>
                                            <td>{c.category}</td>
                                            <td className={getPriorityClass(c.priority)} style={{ fontWeight: 500 }}>{c.priority}</td>
                                            <td><span className={`badge ${getStatusBadgeClass(c.status)}`}>{c.status}</span></td>
                                            <td>{c.assignedTo}</td>
                                            <td>{new Date(c.lastUpdated).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                                    onClick={() => openDetails(c)}
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
                    <div className="flex-between mb-6">
                        <h2 style={{ margin: 0 }}>Manage Complaint: {selectedComplaint.id}</h2>
                        <button className="btn btn-secondary" onClick={() => setSelectedComplaint(null)}>
                            ← Back to Dashboard
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
                        <div>
                            <div className="mb-4">
                                <span className="form-label">Grievance Details</span>
                                <div style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                    <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>{selectedComplaint.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                                        {selectedComplaint.description}
                                    </p>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <span className="form-label" style={{ fontSize: '0.75rem' }}>User / Submit Type</span>
                                            <p style={{ color: 'var(--text-primary)', margin: 0 }}>
                                                {selectedComplaint.userId === 'anonymous' ? 'Anonymous' : `Student ID: ${selectedComplaint.userId}`}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="form-label" style={{ fontSize: '0.75rem' }}>Category</span>
                                            <p style={{ color: 'var(--text-primary)', margin: 0 }}>{selectedComplaint.category}</p>
                                        </div>
                                        <div>
                                            <span className="form-label" style={{ fontSize: '0.75rem' }}>Priority</span>
                                            <p className={getPriorityClass(selectedComplaint.priority)} style={{ fontWeight: 600, margin: 0 }}>
                                                {selectedComplaint.priority}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="form-label" style={{ fontSize: '0.75rem' }}>Evidence Attachment</span>
                                            <p style={{ color: 'var(--primary)', margin: 0 }}>
                                                {selectedComplaint.fileName ? `📎 ${selectedComplaint.fileName}` : 'None provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Admin Actions</h3>

                            <form onSubmit={handleUpdate}>
                                <div className="form-group mb-4">
                                    <label className="form-label">Assign To</label>
                                    <select
                                        className="form-control"
                                        value={assignee}
                                        onChange={(e) => setAssignee(e.target.value)}
                                    >
                                        <option value="Unassigned">Unassigned</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Senior Admin">Senior Admin</option>
                                        <option value="IT Support">IT Support</option>
                                        <option value="Maintenance Dept">Maintenance Dept</option>
                                    </select>
                                </div>

                                <div className="form-group mb-4">
                                    <label className="form-label">Update Status</label>
                                    <select
                                        className="form-control"
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                    >
                                        <option value="New">New</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Escalated">Escalated</option>
                                    </select>
                                </div>

                                <div className="form-group mb-6">
                                    <label className="form-label">Admin Comment / Resolution Notes</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Enter notes visible in timeline..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                    Save Changes & Update Timeline
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
