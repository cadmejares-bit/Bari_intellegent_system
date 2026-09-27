const express = require('express');
const app = require('./app.js'); // ✅ Loads your pre-configured app instance
const pool = require('./src/config/db'); 
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// 🔑 Login Authentication Route (Kept directly as yours)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide both email and password' });
        }

        const userQuery = await pool.query('SELECT * FROM "users" WHERE "email" = $1', [email]);

        if (!userQuery.rows || userQuery.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = userQuery.rows[0];

        if (!user.password_ || password !== user.password_) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        let userRole = user.roles || user.role || 'user';

        return res.json({
            username: user.username,
            role: userRole
        });

    } catch (err) {
        console.error("EXPRESS CRASH LOG:", err.message);
        return res.status(500).json({ error: `Server Query Error: ${err.message}` });
    }
});

// 🔄 Change Password Route (Aligned with your exact app architecture)
app.post('/api/change-password', async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    try {
        if (!email || !currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Missing mandatory credential parameters.' });
        }

        // Find user by their email in the users table
        const userQuery = await pool.query('SELECT * FROM "users" WHERE "email" = $1', [email]);

        if (!userQuery.rows || userQuery.rows.length === 0) {
            return res.status(404).json({ error: "Identity mismatch. Target user profile not found." });
        }

        const user = userQuery.rows[0];

        // Match current password string against database password_ parameter
        if (!user.password_ || user.password_ !== currentPassword) {
            return res.status(401).json({ error: "Current operational credentials invalid." });
        }

        // Commit updated authentication value parameter string into persistence layer
        await pool.query('UPDATE "users" SET "password_" = $1 WHERE "email" = $2', [newPassword, email]);

        return res.json({ message: "Credential configuration sequence updated." });
    } catch (err) {
        console.error("CHANGE PASSWORD ERROR:", err.message);
        return res.status(500).json({ error: `Server Mutation Error: ${err.message}` });
    }
});

// 🚀 Start the Express App and listen on Port 5000
app.listen(PORT, () => {
    console.log(`🚀 Server is flying on http://localhost:${PORT}`);
});