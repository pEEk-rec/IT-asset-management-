const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /auth/signup - Register new user
router.post('/signup', authController.signup);

// POST /auth/login - Login user
router.post('/login', authController.login);

// GET /auth/verify - Verify token
router.get('/verify', authController.verify);

// POST /auth/logout - Logout user
router.post('/logout', authController.logout);

// POST /auth/refresh - Refresh token
router.post('/refresh', authController.refresh);

module.exports = router;
