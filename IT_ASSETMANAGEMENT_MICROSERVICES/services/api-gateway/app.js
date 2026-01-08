const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const { routes } = require('./config/routes');
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cors({
    origin: true,
    credentials: true
}));

// Apply general rate limiter to all routes
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'api-gateway',
        timestamp: new Date().toISOString(),
        routes: routes.map(r => ({ path: r.path, description: r.description }))
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'IT Asset Management API Gateway',
        version: '1.0.0',
        endpoints: routes.map(r => ({
            path: r.path,
            target: r.target,
            description: r.description
        }))
    });
});

// Apply stricter rate limiter to auth routes
app.use('/api/auth', authLimiter);

// Setup proxy routes
routes.forEach(route => {
    app.use(
        route.path,
        createProxyMiddleware({
            target: route.target,
            changeOrigin: true,
            pathRewrite: route.pathRewrite,
            onProxyReq: (proxyReq, req, res) => {
                // Log requests
                console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} -> ${route.target}`);
            },
            onProxyRes: (proxyRes, req, res) => {
                // Log responses
                console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} <- ${proxyRes.statusCode}`);
            },
            onError: (err, req, res) => {
                console.error(`[${new Date().toISOString()}] Proxy error for ${req.path}:`, err.message);
                res.status(503).json({
                    error: 'Service temporarily unavailable',
                    service: route.description
                });
            }
        })
    );
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        availableRoutes: routes.map(r => r.path)
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Gateway error:', err);
    res.status(500).json({ error: 'Internal gateway error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Configured routes:');
    routes.forEach(route => {
        console.log(`  ${route.path} -> ${route.target} (${route.description})`);
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('API Gateway shutting down...');
    process.exit(0);
});
