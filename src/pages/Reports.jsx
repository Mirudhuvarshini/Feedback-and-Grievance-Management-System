import React from 'react';
import { useComplaint } from '../context/ComplaintContext';

const Reports = () => {
    const { complaints } = useComplaint();

    // Aggregate stats
    const total = complaints.length;

    const statusStats = {
        New: complaints.filter(c => c.status === 'New').length,
        'Under Review': complaints.filter(c => c.status === 'Under Review').length,
        Resolved: complaints.filter(c => c.status === 'Resolved').length,
        Rejected: complaints.filter(c => c.status === 'Rejected').length,
        Escalated: complaints.filter(c => c.status === 'Escalated').length,
    };

    const categories = [...new Set(complaints.map(c => c.category))];
    const categoryStats = {};
    categories.forEach(cat => {
        categoryStats[cat] = complaints.filter(c => c.category === cat).length;
    });

    const generateCSV = () => {
        // Headers
        const headers = ['ID', 'User ID', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Created At', 'Last Updated'];

        // Rows
        const rows = complaints.map(c => [
            c.id,
            c.userId,
            `"${c.title.replace(/"/g, '""')}"`, // escape quotes
            c.category,
            c.priority,
            c.status,
            c.assignedTo,
            new Date(c.createdAt).toLocaleString(),
            new Date(c.lastUpdated).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `grievance_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="flex-between mb-8">
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>System Reports</h1>
                    <p>Analytics and data export for system grievances.</p>
                </div>
                <button className="btn btn-primary" onClick={generateCSV} style={{ gap: '0.5rem' }}>
                    <span>📥</span> Export to CSV
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{total}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Complaints</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--success)' }}>{statusStats['Resolved']}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Resolved Issues</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--warning)' }}>{statusStats['Escalated']}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Escalated Cases</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {total ? Math.round((statusStats['Resolved'] / total) * 100) : 0}%
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Resolution Rate</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 className="mb-6">Complaints by Status</h3>
                    <div className="css-chart">
                        {Object.entries(statusStats).map(([status, count], i) => (
                            <div key={status} className="chart-bar-container">
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{count}</span>
                                <div
                                    className="chart-bar"
                                    style={{
                                        height: total ? `${Math.max((count / total) * 100, 5)}%` : '5%',
                                        background: status === 'Resolved' ? 'var(--success)' :
                                            status === 'Escalated' ? 'var(--warning)' :
                                                status === 'Rejected' ? 'var(--danger)' : 'var(--primary)'
                                    }}
                                ></div>
                                <div className="chart-label" style={{ transform: 'rotate(-45deg)', transformOrigin: 'left', marginTop: '1rem', whiteSpace: 'nowrap' }}>{status}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 className="mb-6">Complaints by Category</h3>
                    <div className="css-chart">
                        {Object.entries(categoryStats).map(([cat, count], i) => (
                            <div key={cat} className="chart-bar-container">
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{count}</span>
                                <div
                                    className="chart-bar"
                                    style={{
                                        height: total ? `${Math.max((count / total) * 100, 5)}%` : '5%',
                                        background: 'linear-gradient(to top, #10B981, #34D399)'
                                    }}
                                ></div>
                                <div className="chart-label" style={{ transform: 'rotate(-45deg)', transformOrigin: 'left', marginTop: '1rem', whiteSpace: 'nowrap' }}>{cat}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
