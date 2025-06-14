require('ts-node/register');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the web build
app.use(express.static(path.join(__dirname, 'web-build')));

// API Routes
app.use('/api/auth', require('./api/auth').default);
app.use('/api/public', require('./api/public').default);
app.use('/api/protected', require('./api/protected').default);

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'web-build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 