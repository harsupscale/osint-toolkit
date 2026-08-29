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
        const response = await fetch(`https://rack-72au.onrender.com/gmail-info?q=${encodeURIComponent(domain)}`);
        const data = await response.json();
        if (data.status === 'fail') {
            return res.status(400).json({ error: data.message || 'Invalid domain' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: `Domain lookup failed: ${err.message}` });
    }
});

// Email Breach Lookup (XposedOrNot - free, no API key)
app.get('/api/email-breaches/:email', async (req, res) => {
    const email = req.params.email;
    try {
        const response = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.breaches && Array.isArray(data.breaches)) {
            res.json({
                email: data.email || email,
                breaches: data.breaches,
                count: data.breaches.length
            });
        } else {
            res.json({ email, breaches: [], count: 0 });
        }
    } catch (err) {
        res.status(500).json({ error: `Breach lookup failed: ${err.message}` });
    }
});

// Email Account Check — checks if email is registered on platforms (Holehe-style, pure Node.js)
app.get('/api/email-accounts/:email', async (req, res) => {
    const email = req.params.email;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email required' });
    }

    const platforms = [
        { name: 'Instagram', check: async (e) => { const r = await fetch('https://www.instagram.com/accounts/web/', { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body: `email=${encodeURIComponent(e)}&real_djlg=true`, redirect: 'manual' }); return r.status === 302 || r.status === 200; } },
        { name: 'GitHub', check: async (e) => { const r = await fetch('https://github.com/session', { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'}, body: `authenticity_token=&login=${encodeURIComponent(e)}&password=fakepass123`, redirect: 'manual' }); return r.status === 302; } },
        { name: 'Twitter/X', check: async (e) => { const r = await fetch('https://api.twitter.com/1.1/account/begin_password_reset.json', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e}) }); return r.status === 200 || r.status === 400; } },
        { name: 'Spotify', check: async (e) => { const r = await fetch('https://spclient.wg.spotify.com/signup/public/v1/account?validate=1&email=' + encodeURIComponent(e), {headers:{'User-Agent':'Mozilla/5.0'}}); const t = await r.text(); return t.includes('true'); } },
        { name: 'Discord', check: async (e) => { const r = await fetch('https://discord.com/api/v9/auth/verify', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e}), redirect: 'manual' }); return r.status !== 404; } },
        { name: 'Pinterest', check: async (e) => { const r = await fetch('https://www.pinterest.com/resource/EmailExistsResource/get/?data=' + encodeURIComponent(JSON.stringify({"options":{"email":e}})), {headers:{'User-Agent':'Mozilla/5.0'}}); const t = await r.text(); return t.includes('"exists":true'); } },
        { name: 'Tumblr', check: async (e) => { const r = await fetch('https://www.tumblr.com/api/v2/account/lookup', { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'}, body: `email=${encodeURIComponent(e)}` }); return r.status === 200; } },
        { name: 'Snapchat', check: async (e) => { const r = await fetch('https://accounts.snapchat.com/accounts/v1/begin_reset_password', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e,username:''}) }); return r.status === 200; } },
        { name: 'Netflix', check: async (e) => { const r = await fetch('https://www.netflix.com/login', {redirect:'manual'}); return r.status === 200; } },
        { name: 'Ebay', check: async (e) => { const r = await fetch('https://www.ebay.com/signin/forgotpassword', { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'}, body: `email=${encodeURIComponent(e)}`, redirect: 'manual' }); return r.status === 302 || r.status === 200; } },
        { name: 'Quora', check: async (e) => { const r = await fetch('https://www.quora.com/registered_email_send_status', { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Mozilla/5.0'}, body: `email=${encodeURIComponent(e)}` }); return r.status === 200; } },
        { name: 'Medium', check: async (e) => { const r = await fetch('https://medium.com/_/api/1.1/users/exists?email=' + encodeURIComponent(e), {headers:{'User-Agent':'Mozilla/5.0'}}); const t = await r.text(); return t.includes('"exists":true') || t.includes('"hasPassword":true'); } },
        { name: 'Slack', check: async (e) => { const r = await fetch('https://slack.com/api/auth.findTeamBySubdomain', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e}) }); return r.status === 200; } },
        { name: 'Twitch', check: async (e) => { const r = await fetch('https://passport.twitch.tv/forgot/password/send', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e,login:''}) }); return r.status === 200; } },
        { name: 'Reddit', check: async (e) => { const r = await fetch('https://www.reddit.com/register/', {headers:{'User-Agent':'Mozilla/5.0'}}); return r.status === 200; } },
        { name: 'Pinterest', check: async (e) => { const r = await fetch('https://www.pinterest.com/resource/EmailExistsResource/get/?data=' + encodeURIComponent(JSON.stringify({options:{email:e}})), {headers:{'User-Agent':'Mozilla/5.0'}}); const t = await r.text(); return t.includes('"exists":true'); } },
        { name: 'Keybase', check: async (e) => { const r = await fetch('https://keybase.io/_/api/1.0/user/lookup.json?email=' + encodeURIComponent(e), {headers:{'User-Agent':'Mozilla/5.0'}}); const t = await r.text(); return t.includes('"them":[') && !t.includes('"them":[]'); } },
        { name: 'Replit', check: async (e) => { const r = await fetch('https://replit.com/api/user/find', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({query:e}) }); return r.status === 200; } },
        { name: 'Zoho', check: async (e) => { const r = await fetch('https://accounts.zoho.com/apibytype/smaccounts/getaccountidbysociallogin', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e}) }); return r.status === 200; } },
        { name: 'Wattpad', check: async (e) => { const r = await fetch('https://www.wattpad.com/api/v3/account/validate/' + encodeURIComponent(e), {headers:{'User-Agent':'Mozilla/5.0'}}); return r.status === 200; } },
        { name: 'Canva', check: async (e) => { const r = await fetch('https://www.canva.com/signup/check-email', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e}) }); return r.status === 200; } },
        { name: 'Figma', check: async (e) => { const r = await fetch('https://www.figma.com/api/signup/check-email', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e}) }); return r.status === 200; } },
        { name: 'Notion', check: async (e) => { const r = await fetch('https://www.notion.so/api/v3/signup', { method: 'POST', headers: {'Content-Type':'application/json','User-Agent':'Mozilla/5.0'}, body: JSON.stringify({email:e,source:'signup'}) }); return r.status === 200; } },
        { name: 'Duolingo', check: async (e) => { const r = await fetch('https://www.duolingo.com/2017-06-30/users?email=' + encodeURIComponent(e), {headers:{'User-Agent':'Mozilla/5.0'}}); const t = await r.text(); return t.includes('"users":[') && !t.includes('"users":[]'); } },
        { name: 'Steam', check: async (e) => { const r = await fetch('https://store.steampowered.com/join/', {headers:{'User-Agent':'Mozilla/5.0'}}); return r.status === 200; } },
    ];

    const checkPlatform = async (platform) => {
        try {
            const exists = await Promise.race([
                platform.check(email),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
            ]);
            return { name: platform.name, exists: !!exists, error: false };
        } catch (e) {
            return { name: platform.name, exists: false, error: true };
        }
    };

    const results = await Promise.allSettled(platforms.map(checkPlatform));
    const found = results.filter(r => r.status === 'fulfilled' && r.value.exists && !r.value.error).map(r => r.value.name);
    const notFound = results.filter(r => r.status === 'fulfilled' && !r.value.exists && !r.value.error).map(r => r.value.name);

    res.json({
        email,
        found,
        found_count: found.length,
        checked_count: platforms.length,
        not_found_count: notFound.length
    });
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

// Phone Info Lookup (rack-numinfo API)
app.get('/api/phone-info/:phone', async (req, res) => {
    let phone = req.params.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('91') && phone.length > 10) {
        phone = phone.slice(-10);
    }
    if (phone.length !== 10) {
        return res.status(400).json({ error: 'Enter a valid 10-digit Indian number' });
    }
    try {
        const response = await fetch(`https://rack-numinfo.vercel.app/api/lookup?phone=${phone}`);
        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error || 'Lookup failed' });
        }
        if (data.data && data.data.error) {
            return res.status(429).json({ error: data.data.error });
        }
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
            return res.status(404).json({ error: 'No records found for this number' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: `Phone lookup failed: ${err.message}` });
    }
});

// Vehicle Info Lookup
app.get('/api/vehicle-info/:regNo', async (req, res) => {
    const regNo = req.params.regNo.toUpperCase().replace(/\s+/g, '').trim();
    if (!regNo || regNo.length < 4) {
        return res.status(400).json({ error: 'Enter a valid vehicle number (e.g. MH12DE1234)' });
    }
    try {
        const response = await fetch(`https://vehicleinfo-byrack.vercel.app/api?search=${encodeURIComponent(regNo)}`);
        const data = await response.json();
        if (!data.response || !data.response.rtoData) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: `Vehicle lookup failed: ${err.message}` });
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
