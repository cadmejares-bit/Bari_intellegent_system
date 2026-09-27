const express = require('express');
const cors = require('cors');
const incidentRoutes = require('./routes/incidentRoutes.js');
const patrolRoutes = require('./routes/patrolRoutes.js'); // 👈 1. Import your patrol routes

const app = express();

// Enable global access rules so Live Server can talk to port 5000
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());

// 🌟 Binds route files to start with '/api'
app.use('/api', incidentRoutes);
app.use('/api', patrolRoutes); // 

module.exports = app;