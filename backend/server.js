const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// Create temp directory
const tempDir = process.env.TEMP_DIR || './tmp';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Mock recognize endpoint
app.post('/api/recognize', (req, res) => {
    res.json({
        success: true,
        result: {
            title: 'Sample Song',
            artist: 'Sample Artist',
            album: 'Sample Album',
            releaseDate: '2024-01-01',
            coverUrl: 'https://via.placeholder.com/300',
            acoustidScore: 0.95,
            lyrics: 'This is a sample lyrics...',
            links: {
                spotify: 'https://open.spotify.com',
                youtube: 'https://youtube.com'
            }
        }
    });
});

// Mock search endpoint
app.get('/api/search', (req, res) => {
    const { q } = req.query;
    res.json({
        success: true,
        query: q,
        results: [
            {
                title: 'Search Result 1',
                artist: 'Artist 1',
                album: 'Album 1',
                releaseDate: '2024-01-01',
                coverUrl: 'https://via.placeholder.com/300'
            }
        ]
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Not Found'
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🎵 SearchByVoice Backend Server`);
    console.log(`Running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);
    console.log(`Health check: http://localhost:${PORT}/health\n`);
});

module.exports = app;
