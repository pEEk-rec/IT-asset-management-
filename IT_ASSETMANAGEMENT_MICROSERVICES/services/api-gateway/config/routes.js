// Service URLs from environment variables
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5101';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5103';
const ASSET_SERVICE_URL = process.env.ASSET_SERVICE_URL || 'http://localhost:5102';

// Route configuration for API Gateway
const routes = [
    {
        path: '/api/auth',
        target: AUTH_SERVICE_URL,
        pathRewrite: { '^/api/auth': '/auth' },
        description: 'Authentication Service'
    },
    {
        path: '/api/users',
        target: USER_SERVICE_URL,
        pathRewrite: { '^/api/users': '/users' },
        description: 'User Service'
    },
    {
        path: '/api/assets',
        target: ASSET_SERVICE_URL,
        pathRewrite: { '^/api/assets': '/assets' },
        description: 'Asset Service'
    },
    {
        path: '/api/assignments',
        target: ASSET_SERVICE_URL,
        pathRewrite: { '^/api/assignments': '/assignments' },
        description: 'Assignment Service (part of Asset Service)'
    }
];

module.exports = { routes, AUTH_SERVICE_URL, USER_SERVICE_URL, ASSET_SERVICE_URL };
