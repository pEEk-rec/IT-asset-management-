const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const assetRoutes = require('./routes/assetRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();
const PORT = process.env.PORT || 5102;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27019/asset_db';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'asset-service',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/assets', assetRoutes);
app.use('/assignments', assignmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Asset Service running on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to Asset Database'))
    .catch((error) => console.error('Database connection error:', error));

// Handle MongoDB connection errors
mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Asset Service shutting down...');
    process.exit(0);
});
