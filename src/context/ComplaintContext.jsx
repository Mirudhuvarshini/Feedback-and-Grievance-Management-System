import React, { createContext, useState, useEffect, useContext } from 'react';
import { getItem, setItem } from '../utils/localStorage';
import { useAuth } from './AuthContext';

export const ComplaintContext = createContext();

export const useComplaint = () => useContext(ComplaintContext);

export const ComplaintProvider = ({ children }) => {
    const [complaints, setComplaints] = useState([]);
    const { addNotification } = useAuth();

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await fetch('/api/complaints');
                if (res.ok) {
                    const data = await res.json();
                    // parse timeline if it was stored as JSON or string, assuming it's basic objects for now.
                    // For a robust system, timelines should be their own SQL table. 
                    // However, we mock parse it here just in case.
                    const parsedData = data.map(c => ({
                        ...c,
                        timeline: c.timeline ? (typeof c.timeline === 'string' ? JSON.parse(c.timeline) : c.timeline) : []
                    }));
                    setComplaints(parsedData);
                }
            } catch (err) {
                console.error("Failed to fetch complaints", err);
            }
        };
        fetchComplaints();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            let changed = false;

            const updated = complaints.map(c => {
                if (c.status === 'New' || c.status === 'Under Review') {
                    const createdTime = new Date(c.createdAt).getTime();
                    if (now - createdTime > 3 * 60 * 1000) {
                        changed = true;
                        if (c.userId !== 'anonymous' && c.userId) {
                            addNotification(c.userId, `Your complaint "${c.title}" has been escalated to Senior Admin.`, 'warning');
                        }

                        // Fire and forget backend update for escalation
                        fetch(`/api/complaints/${c.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'Escalated', assignedTo: 'Senior Admin' })
                        }).catch(e => console.error("Auto-escalate backend sync failed:", e));

                        return {
                            ...c,
                            status: 'Escalated',
                            assignedTo: 'Senior Admin',
                            lastUpdated: new Date().toISOString(),
                            timeline: [
                                ...(c.timeline || []),
                                {
                                    status: 'Escalated',
                                    timestamp: new Date().toISOString(),
                                    comment: 'Automatically escalated due to 3-minute timeout'
                                }
                            ]
                        };
                    }
                }
                return c;
            });

            if (changed) {
                setComplaints(updated);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [complaints, addNotification]);

    const addComplaint = async (complaintData, userId) => {
        const newComplaint = {
            id: `CMP-${Date.now().toString().slice(-6)}`,
            userId,
            ...complaintData,
            status: 'New',
            assignedTo: 'Unassigned',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            timeline: [
                {
                    status: 'New',
                    timestamp: new Date().toISOString(),
                    comment: 'Complaint submitted'
                }
            ]
        };

        try {
            const res = await fetch('/api/complaints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComplaint)
            });

            if (res.ok) {
                setComplaints([newComplaint, ...complaints]);
                if (userId !== 'anonymous') {
                    addNotification(userId, `Complaint "${complaintData.title}" submitted successfully.`, 'success');
                }
            }
        } catch (error) {
            console.error("Failed to add complaint to backend", error);
            if (userId !== 'anonymous') {
                addNotification(userId, `Failed to submit complaint due to server error.`, 'error');
            }
        }
    };

    const updateComplaint = async (id, newStatus, comment, adminName = 'Admin', assignee) => {
        try {
            const target = complaints.find(c => c.id === id);
            const statusToUpdate = newStatus || target.status;
            const assigneeToUpdate = assignee || target.assignedTo;

            const res = await fetch(`/api/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: statusToUpdate, assignedTo: assigneeToUpdate })
            });

            if (res.ok) {
                setComplaints(prev => prev.map(c => {
                    if (c.id === id) {
                        const updated = {
                            ...c,
                            status: statusToUpdate,
                            assignedTo: assigneeToUpdate,
                            lastUpdated: new Date().toISOString(),
                            timeline: [
                                ...(c.timeline || []),
                                {
                                    status: statusToUpdate,
                                    timestamp: new Date().toISOString(),
                                    comment: comment || 'Status updated by Admin'
                                }
                            ]
                        };
                        if ((statusToUpdate === 'Resolved' || statusToUpdate === 'Rejected') && c.userId && c.userId !== 'anonymous') {
                            addNotification(c.userId, `Your complaint "${c.title}" has been ${statusToUpdate.toLowerCase()}.`, statusToUpdate === 'Resolved' ? 'success' : 'error');
                        }
                        return updated;
                    }
                    return c;
                }));
            }
        } catch (error) {
            console.error("Failed to update complaint on backend", error);
        }
    };

    return (
        <ComplaintContext.Provider value={{ complaints, addComplaint, updateComplaint }}>
            {children}
        </ComplaintContext.Provider>
    );
};
