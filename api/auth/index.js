const express = require('express');
const router = express.Router();

// Import auth routes
const authorize = require('./authorize+api.ts');
const token = require('./token+api.ts');
const callback = require('./callback+api.ts');
const session = require('./session+api.ts');
const logout = require('./logout+api.ts');
const refresh = require('./refresh+api.ts');

// Auth routes
router.get('/authorize', authorize);
router.post('/token', token);
router.get('/callback', callback);
router.get('/session', session);
router.post('/logout', logout);
router.post('/refresh', refresh);

module.exports = router; 