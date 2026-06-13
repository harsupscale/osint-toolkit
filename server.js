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

// No server-side rate limiting - API provider handles its own limits

// Blocked numbers - inke results nahi dikhenge 😎
const blockedNumbers = {
    '919634816397': [
        "Ain't no way bruh 💀 made a website and bro started OSINTing my number 😭",
        "Bro really thought he could find my leaks 💀🫵 nah bro nah"
    ],
    '919997534247': [
        "Nah twin this info locked 🔒"
    ],
    '917906648681': [
        "Twin you thought 💀 nah nah nah"
    ],
    '917906370607': [
        "Sorry twin but nah 💅✨"
    ],
    '919012228093': [
        "Lol twin really tried 💀🔒"
    ],
    '919045501889': [
        "You're safe here twin 🔒✨"
    ]
};

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

    // Check if number is blocked
    const cleanQuery = query.replace(/[^0-9]/g, '');
    for (const [blockedNum, msgs] of Object.entries(blockedNumbers)) {
        if (cleanQuery.includes(blockedNum) || blockedNum.includes(cleanQuery)) {
            const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
            return res.status(403).json({ error: randomMsg, blocked: true });
        }
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

        // Detect expired/invalid token responses
        if (data.NumOfResults === undefined && data.NumOfDatabase === undefined && data.List === undefined) {
            return res.status(400).json({ error: 'Invalid API response. Token may be expired. Please update LEAK_API_TOKEN in .env' });
        }

        // Detect empty/failed search
        if (data.NumOfDatabase === 'N/A' || data.NumOfDatabase === undefined) {
            return res.status(400).json({ error: 'API returned incomplete data. Token may be expired or invalid.' });
        }

        res.json(data);
    } catch (err) {
        console.error('Leak search error:', err.message);
        res.status(500).json({ error: `API Error: ${err.message}` });
    }
});

// IP Lookup proxy
app.get('/api/ip-lookup/:ip', async (req, res) => {
    const ip = req.params.ip;
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting,query`);
        const data = await response.json();
        if (data.status === 'fail') {
            return res.status(400).json({ error: data.message || 'Invalid IP' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: `IP lookup failed: ${err.message}` });
    }
});

// Email domain info proxy
app.get('/api/email-domain/:domain', async (req, res) => {
    const domain = req.params.domain;
    try {
        const response = await fetch(`http://ip-api.com/json/${domain}?fields=status,message,country,countryCode,regionName,city,isp,org,as,query`);
        const data = await response.json();
        if (data.status === 'fail') {
            return res.status(400).json({ error: data.message || 'Invalid domain' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: `Domain lookup failed: ${err.message}` });
    }
});

// DNS Lookup proxy
app.get('/api/dns-lookup', async (req, res) => {
    const { name, type } = req.query;
    if (!name) return res.status(400).json({ error: 'Domain name is required' });
    try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type || 'A'}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: `DNS lookup failed: ${err.message}` });
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
