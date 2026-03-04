import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComplaint } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';

const SubmitComplaint = () => {
    const { addComplaint } = useComplaint();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        category: 'Academic',
        description: '',
        priority: 'Low',
        submissionType: 'Public',
        fileName: ''
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setFormData({ ...formData, fileName: files[0]?.name || '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const userId = formData.submissionType === 'Anonymous' ? 'anonymous' : user.id;
        addComplaint({
            title: formData.title,
            category: formData.category,
            description: formData.description,
            priority: formData.priority,
            submissionType: formData.submissionType,
            fileName: formData.fileName
        }, userId);

        navigate('/');
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="mb-8">
                <h1 style={{ marginBottom: '0.5rem' }}>Submit a Grievance</h1>
                <p>Please provide detailed information to help us resolve your issue.</p>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-6">
                        <label className="form-label">Complaint Title</label>
                        <input
                            type="text"
                            name="title"
                            className="form-control"
                            placeholder="Brief summary of the issue"
                            required
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="mb-6">
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                                <option value="Academic">Academic</option>
                                <option value="Infrastructure">Infrastructure</option>
                                <option value="Hostel">Hostel & Mess</option>
                                <option value="Administration">Administration</option>
                                <option value="Harassment">Harassment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Priority</label>
                            <select name="priority" className="form-control" value={formData.priority} onChange={handleChange}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group mb-6">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-control"
                            rows="5"
                            placeholder="Provide detailed information about your grievance..."
                            required
                            value={formData.description}
                            onChange={handleChange}
                            style={{ resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="mb-6">
                        <div className="form-group">
                            <label className="form-label">Submission Type</label>
                            <select name="submissionType" className="form-control" value={formData.submissionType} onChange={handleChange}>
                                <option value="Public">Public (Include my details)</option>
                                <option value="Anonymous">Anonymous</option>
                            </select>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                {formData.submissionType === 'Anonymous' ? 'Your identity will be hidden from admins. Notifications will not be available.' : 'Your identity will be visible to administrators resolving this issue.'}
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Attach Evidence (Optional)</label>
                            <input
                                type="file"
                                name="file"
                                className="form-control"
                                style={{ padding: '0.5rem' }}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex-between" style={{ marginTop: '2rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                            Submit Grievance
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitComplaint;
