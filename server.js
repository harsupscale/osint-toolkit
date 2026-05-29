const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests. Try again in a minute.' }
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// OSINT Leak Search proxy
app.post('/api/leak-search', async (req, res) => {
    const { query, limit } = req.body;

    if (!query || !query.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const token = process.env.LEAK_API_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'API token not configured on server' });
    }

    try {
        const response = await fetch('https://leakosintapi.com/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: token,
                request: query.trim(),
                limit: limit || 100,
                lang: 'en'
            })
        });

        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));

        if (data.error) {
            return res.status(400).json({ error: data.error });
        }

        res.json(data);
    } catch (err) {
        console.error('Leak search error:', err.message);
        res.status(500).json({ error: `API Error: ${err.message}` });
    }
});

// SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  ╔════════════════════════════════════════════╗`);
    console.log(`  ║   OSINT Toolkit Server Running             ║`);
    console.log(`  ║   Local:  http://localhost:${PORT}            ║`);
    console.log(`  ║   Network: http://192.168.29.56:${PORT}       ║`);
    console.log(`  ║   Leak Search API: leakosintapi.com        ║`);
    console.log(`  ╚════════════════════════════════════════════╝\n`);
});
