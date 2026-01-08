const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5101';

// Middleware to verify JWT token by calling Auth Service
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // Call Auth Service to verify token
        const response = await axios.get(`${AUTH_SERVICE_URL}/auth/verify`, {
            headers: { Authorization: token }
        });

        if (response.data.valid) {
            req.user = response.data.user; // Attach user info to request
            next();
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        if (error.response?.status === 401) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        console.error('Token verification error:', error.message);
        res.status(503).json({ error: 'Authentication service unavailable' });
    }
};

module.exports = { verifyToken };
