const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database Tables
const initDB = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'student',
                memberSince DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS complaints (
                id VARCHAR(100) PRIMARY KEY,
                userId VARCHAR(100),
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                priority VARCHAR(20) NOT NULL,
                description TEXT NOT NULL,
                submissionType VARCHAR(50) NOT NULL,
                fileName VARCHAR(255),
                status VARCHAR(50) DEFAULT 'New',
                assignedTo VARCHAR(100) DEFAULT 'Unassigned',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                lastUpdated DATETIME ON UPDATE CURRENT_TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Ensure a dummy timeline table or handle timelines inside a JSON column.
        // For simplicity, we can store timelines as a JSON string within the complaints table.
        // MySQL 5.7.8+ supports JSON type.

        console.log("Database tables initialized.");
    } catch (err) {
        console.error("Failed to initialize tables:", err.message);
    }
};

initDB();

// ====== ROUTES ====== //

// 1. Auth Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { id, name, email, password, role } = req.body;
        // In a real app, hash password with bcrypt here
        await db.query('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [id, name, email, password, role || 'student']
        );
        res.status(201).json({ message: 'User created successfully', user: { id, name, email, role: role || 'student' } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error or user already exists.' });
    }
});

// 2. Auth Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            const user = rows[0];
            // Don't send password back
            delete user.password;
            res.json({ user });
        } else {
            res.status(401).json({ error: 'Invalid Email or Password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// 3. Get Complaints
app.get('/api/complaints', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM complaints ORDER BY createdAt DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error fetching complaints' });
    }
});

// 4. Add Complaint
app.post('/api/complaints', async (req, res) => {
    try {
        const { id, userId, title, category, priority, description, submissionType, fileName } = req.body;
        await db.query(`
            INSERT INTO complaints 
            (id, userId, title, category, priority, description, submissionType, fileName, status, assignedTo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', 'Unassigned')
        `, [id, userId === 'anonymous' ? null : userId, title, category, priority, description, submissionType, fileName]);

        res.status(201).json({ message: 'Complaint created' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create complaint' });
    }
});

// 5. Update Complaint Status & Assignee
app.put('/api/complaints/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedTo } = req.body;
        await db.query(`
            UPDATE complaints SET status = ?, assignedTo = ? WHERE id = ?
        `, [status, assignedTo, id]);

        res.json({ message: 'Complaint updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update complaint' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
