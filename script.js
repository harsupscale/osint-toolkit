// Particles Background
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 15 + 10) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = particle.style.height = (Math.random() * 3 + 1) + 'px';
        container.appendChild(particle);
    }
}
createParticles();

// Mobile Menu
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('active');
});
document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('active'));
});

// Toast Notification
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Show Result
function showResult(id, html) {
    const el = document.getElementById(id);
    el.innerHTML = html;
    el.classList.add('active');
}

function showLoading(id) {
    showResult(id, '<div class="loading"><i class="fas fa-spinner"></i> Searching...</div>');
}

// IP Lookup
async function lookupIP() {
    const ip = document.getElementById('ipInput').value.trim();
    if (!ip) return showToast('Enter an IP address');
    showLoading('ipResult');
    try {
        const res = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();
        if (data.error) throw new Error(data.reason || 'Invalid IP');
        showResult('ipResult', `
            <table>
                <tr><th>IP</th><td>${data.ip}</td></tr>
                <tr><th>Type</th><td>${data.version}</td></tr>
                <tr><th>Country</th><td>${data.country_name} (${data.country_code})</td></tr>
                <tr><th>Region</th><td>${data.region}</td></tr>
                <tr><th>City</th><td>${data.city}</td></tr>
                <tr><th>Postal</th><td>${data.postal}</td></tr>
                <tr><th>Latitude</th><td>${data.latitude}</td></tr>
                <tr><th>Longitude</th><td>${data.longitude}</td></tr>
                <tr><th>ISP</th><td>${data.org}</td></tr>
                <tr><th>Timezone</th><td>${data.timezone}</td></tr>
                <tr><th>ASN</th><td>${data.asn}</td></tr>
            </table>
        `);
    } catch (e) {
        showResult('ipResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${e.message}</div>`);
    }
}

// Email Lookup
async function lookupEmail() {
    const email = document.getElementById('emailInput').value.trim();
    if (!email) return showToast('Enter an email');
    showLoading('emailResult');

    const parts = email.split('@');
    const isValid = parts.length === 2 && parts[1].includes('.');
    const domain = parts[1] || '';
    const md5 = await hashMD5(email.toLowerCase().trim());

    let domainInfo = '';
    try {
        const res = await fetch(`https://ipapi.co/${domain}/json/`);
        const d = await res.json();
        domainInfo = `
            <tr><th>Domain Country</th><td>${d.country_name || 'N/A'}</td></tr>
            <tr><th>Domain ISP</th><td>${d.org || 'N/A'}</td></tr>
        `;
    } catch (e) {}

    showResult('emailResult', `
        <table>
            <tr><th>Email</th><td>${email}</td></tr>
            <tr><th>Valid Format</th><td><span class="tag ${isValid ? 'tag-safe' : 'tag-danger'}">${isValid ? 'Yes' : 'No'}</span></td></tr>
            <tr><th>Local Part</th><td>${parts[0] || 'N/A'}</td></tr>
            <tr><th>Domain</th><td>${domain}</td></tr>
            <tr><th>Gravatar</th><td><a href="https://gravatar.com/${md5}" target="_blank" style="color:var(--accent)">View Gravatar</a></td></tr>
            ${domainInfo}
            <tr><th>Disposable</th><td><span class="tag tag-info">Check with HIBP</span></td></tr>
        </table>
    `);
}

async function hashMD5(str) {
    const msgUint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('MD5', msgUint8).catch(() => null);
    if (!hashBuffer) {
        // Fallback simple hash
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(16).padStart(32, '0');
    }
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Username Search
async function searchUsername() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) return showToast('Enter a username');
    showLoading('usernameResult');

    const platforms = [
        { name: 'GitHub', icon: 'fab fa-github', url: `https://github.com/${username}` },
        { name: 'Twitter/X', icon: 'fab fa-twitter', url: `https://x.com/${username}` },
        { name: 'Instagram', icon: 'fab fa-instagram', url: `https://instagram.com/${username}` },
        { name: 'Reddit', icon: 'fab fa-reddit', url: `https://reddit.com/user/${username}` },
        { name: 'YouTube', icon: 'fab fa-youtube', url: `https://youtube.com/@${username}` },
        { name: 'TikTok', icon: 'fab fa-tiktok', url: `https://tiktok.com/@${username}` },
        { name: 'LinkedIn', icon: 'fab fa-linkedin', url: `https://linkedin.com/in/${username}` },
        { name: 'Pinterest', icon: 'fab fa-pinterest', url: `https://pinterest.com/${username}` },
        { name: 'Twitch', icon: 'fab fa-twitch', url: `https://twitch.tv/${username}` },
        { name: 'Steam', icon: 'fab fa-steam', url: `https://steamcommunity.com/id/${username}` },
        { name: 'Medium', icon: 'fab fa-medium', url: `https://medium.com/@${username}` },
        { name: 'Dev.to', icon: 'fab fa-dev', url: `https://dev.to/${username}` },
        { name: 'Keybase', icon: 'fab fa-keybase', url: `https://keybase.io/${username}` },
        { name: 'HackerOne', icon: 'fab fa-hacker-news', url: `https://hackerone.com/${username}` },
        { name: 'BugCrowd', icon: 'fas fa-bug', url: `https://bugcrowd.com/${username}` },
        { name: 'GitLab', icon: 'fab fa-gitlab', url: `https://gitlab.com/${username}` },
        { name: 'BitBucket', icon: 'fab fa-bitbucket', url: `https://bitbucket.org/${username}` },
        { name: 'HackerRank', icon: 'fab fa-hackerrank', url: `https://hackerrank.com/${username}` },
        { name: 'LeetCode', icon: 'fas fa-code', url: `https://leetcode.com/${username}` },
        { name: 'Replit', icon: 'fas fa-code', url: `https://replit.com/@${username}` },
        { name: 'Mastodon', icon: 'fab fa-mastodon', url: `https://mastodon.social/@${username}` },
        { name: 'Telegram', icon: 'fab fa-telegram', url: `https://t.me/${username}` },
        { name: 'Tumblr', icon: 'fab fa-tumblr', url: `https://${username}.tumblr.com` },
        { name: 'Flickr', icon: 'fab fa-flickr', url: `https://flickr.com/people/${username}` },
        { name: 'Spotify', icon: 'fab fa-spotify', url: `https://open.spotify.com/user/${username}` },
        { name: 'SoundCloud', icon: 'fab fa-soundcloud', url: `https://soundcloud.com/${username}` },
        { name: 'Ebay', icon: 'fab fa-ebay', url: `https://ebay.com/usr/${username}` },
        { name: 'Patreon', icon: 'fab fa-patreon', url: `https://patreon.com/${username}` },
        { name: 'Gravatar', icon: 'fas fa-user-circle', url: `https://gravatar.com/${username}` },
        { name: 'About.me', icon: 'fas fa-user', url: `https://about.me/${username}` },
    ];

    // Check via a CORS-friendly approach: try fetching and check status
    let html = '<div class="username-grid">';

    const results = await Promise.allSettled(
        platforms.map(async (p) => {
            try {
                const res = await fetch(p.url, { method: 'HEAD', mode: 'no-cors', redirect: 'follow' });
                return { ...p, found: true };
            } catch {
                return { ...p, found: false };
            }
        })
    );

    results.forEach(r => {
        const p = r.value || r.reason;
        html += `
            <a href="${p.url}" target="_blank" class="username-item ${p.found ? 'found' : 'not-found'}">
                <i class="${p.icon}"></i>
                <span>${p.name}</span>
                <i class="fas ${p.found ? 'fa-check-circle' : 'fa-times-circle'}" style="margin-left:auto"></i>
            </a>
        `;
    });

    html += '</div>';
    html += `<p style="margin-top:1rem;color:var(--text-secondary);font-size:0.75rem"><i class="fas fa-info-circle"></i> Green = likely found. Click to verify manually.</p>`;
    showResult('usernameResult', html);
}

// Domain Lookup
async function lookupDomain() {
    const domain = document.getElementById('domainInput').value.trim().replace(/https?:\/\//, '').split('/')[0];
    if (!domain) return showToast('Enter a domain');
    showLoading('domainResult');

    try {
        const res = await fetch(`https://ipapi.co/${domain}/json/`);
        const data = await res.json();

        let whoisLinks = `
            <tr><th>Whois</th><td>
                <a href="https://who.is/whois/${domain}" target="_blank" style="color:var(--accent)">who.is</a> |
                <a href="https://www.whois.com/whois/${domain}" target="_blank" style="color:var(--accent)">whois.com</a>
            </td></tr>
            <tr><th>Certificates</th><td><a href="https://crt.sh/?q=${domain}" target="_blank" style="color:var(--accent)">crt.sh (CT Logs)</a></td></tr>
            <tr><th>URLScan</th><td><a href="https://urlscan.io/search/#domain:${domain}" target="_blank" style="color:var(--accent)">urlscan.io</a></td></tr>
            <tr><th>Shodan</th><td><a href="https://www.shodan.io/search?query=hostname:${domain}" target="_blank" style="color:var(--accent)">shodan.io</a></td></tr>
        `;

        showResult('domainResult', `
            <table>
                <tr><th>Domain</th><td>${domain}</td></tr>
                <tr><th>IP</th><td>${data.ip || 'N/A'}</td></tr>
                <tr><th>Country</th><td>${data.country_name || 'N/A'} (${data.country_code || ''})</td></tr>
                <tr><th>City</th><td>${data.city || 'N/A'}</td></tr>
                <tr><th>ISP / Org</th><td>${data.org || 'N/A'}</td></tr>
                <tr><th>ASN</th><td>${data.asn || 'N/A'}</td></tr>
                <tr><th>Timezone</th><td>${data.timezone || 'N/A'}</td></tr>
                ${whoisLinks}
            </table>
        `);
    } catch (e) {
        showResult('domainResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${e.message}. Try external tools: <a href="https://who.is/whois/${domain}" target="_blank" style="color:var(--accent)">who.is</a></div>`);
    }
}

// OSINT Leak Search
async function searchLeaks() {
    const query = document.getElementById('leakInput').value.trim();
    if (!query) return showToast('Enter a search query');
    showLoading('leakResult');

    try {
        const res = await fetch('/api/leak-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, limit: 100 })
        });

        const data = await res.json();
        console.log('Leak API Response:', data);

        if (!res.ok || data.error) {
            throw new Error(data.error || 'Search failed');
        }

        let html = '<table>';
        html += `<tr><th>Query</th><td>${query}</td></tr>`;
        html += `<tr><th>Results Found</th><td><span class="tag tag-info">${data.NumOfResults || 0}</span></td></tr>`;
        html += `<tr><th>Databases Searched</th><td>${data.NumOfDatabase || 'N/A'}</td></tr>`;
        html += `<tr><th>Free Requests Left</th><td>${data.free_requests_left || 'N/A'}</td></tr>`;
        html += `<tr><th>Search Time</th><td>${data['search time'] || 'N/A'}s</td></tr>`;

        if (data.List && typeof data.List === 'object') {
            let resultCount = 0;

            Object.entries(data.List).forEach(([dbName, dbData]) => {
                // Skip "No results found" key
                if (dbName === 'No results found') {
                    if (dbData.InfoLeak) {
                        html += `<tr><td colspan="2" style="color:var(--text-secondary);font-style:italic;padding-top:1rem">${dbData.InfoLeak}</td></tr>`;
                    }
                    return;
                }

                // Database header
                html += `<tr><td colspan="2" style="background:var(--bg-card);border-bottom:2px solid var(--accent);padding-top:1rem">
                    <strong style="color:var(--accent)"><i class="fas fa-database"></i> ${dbName}</strong>
                    <span class="tag tag-info" style="margin-left:0.5rem">${dbData.NumOfResults || 0} records</span>
                </td></tr>`;

                // Each record in Data array
                if (dbData.Data && Array.isArray(dbData.Data)) {
                    dbData.Data.forEach((record, i) => {
                        if (typeof record === 'object' && record !== null) {
                            resultCount++;
                            const keys = Object.keys(record);
                            if (keys.length > 0 && !(keys.length === 1 && keys[0] === 'No results found')) {
                                html += `<tr><td colspan="2" style="border-bottom:1px solid var(--border);padding-top:0.5rem">
                                    <strong style="color:var(--info)">Record ${resultCount}</strong>
                                </td></tr>`;
                                Object.entries(record).forEach(([key, value]) => {
                                    if (value !== null && value !== undefined && value !== '') {
                                        let displayVal = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
                                        // Highlight sensitive fields
                                        let rowStyle = '';
                                        if (key.toLowerCase().includes('address') || key.toLowerCase().includes('адрес')) rowStyle = 'style="background:rgba(255,165,2,0.05)"';
                                        if (key.toLowerCase().includes('aadhaar') || key.toLowerCase().includes('passport') || key.toLowerCase().includes('id')) rowStyle = 'style="background:rgba(255,71,87,0.05)"';
                                        html += `<tr ${rowStyle}><th>${key}</th><td>${displayVal}</td></tr>`;
                                    }
                                });
                            }
                        }
                    });
                }

                // InfoLeak message if any
                if (dbData.InfoLeak && dbData.NumOfResults === 0) {
                    html += `<tr><td colspan="2" style="color:var(--text-secondary);font-style:italic">${dbData.InfoLeak}</td></tr>`;
                }
            });

            if (resultCount === 0 && data.NumOfResults === 0) {
                html += `<tr><td colspan="2" style="color:var(--success);padding-top:1rem"><i class="fas fa-check-circle"></i> No results found for this query.</td></tr>`;
            }
        }

        html += '</table>';
        showResult('leakResult', html);
    } catch (e) {
        showResult('leakResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${e.message}</div>`);
    }
}

// Phone Number Lookup
async function lookupPhone() {
    const phone = document.getElementById('phoneInput').value.trim();
    if (!phone) return showToast('Enter a phone number');
    showLoading('phoneResult');

    try {
        const res = await fetch('/api/leak-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: phone, limit: 100 })
        });

        const data = await res.json();
        console.log('Phone API Response:', data);

        if (!res.ok || data.error) {
            throw new Error(data.error || 'Lookup failed');
        }

        let html = '<table>';
        html += `<tr><th>Phone Number</th><td>${phone}</td></tr>`;
        html += `<tr><th>Leaks Found</th><td><span class="tag tag-danger">${data.NumOfResults || 0}</span></td></tr>`;
        html += `<tr><th>Databases Searched</th><td>${data.NumOfDatabase || 'N/A'}</td></tr>`;
        html += `<tr><th>Free Requests Left</th><td>${data.free_requests_left || 'N/A'}</td></tr>`;
        html += `<tr><th>Search Time</th><td>${data['search time'] || 'N/A'}s</td></tr>`;

        if (data.List && typeof data.List === 'object') {
            let resultCount = 0;

            Object.entries(data.List).forEach(([dbName, dbData]) => {
                if (dbName === 'No results found') {
                    if (dbData.InfoLeak) {
                        html += `<tr><td colspan="2" style="color:var(--text-secondary);font-style:italic;padding-top:1rem">${dbData.InfoLeak}</td></tr>`;
                    }
                    return;
                }

                html += `<tr><td colspan="2" style="background:var(--bg-card);border-bottom:2px solid var(--danger);padding-top:1rem">
                    <strong style="color:var(--danger)"><i class="fas fa-database"></i> ${dbName}</strong>
                    <span class="tag tag-danger" style="margin-left:0.5rem">${dbData.NumOfResults || 0} records</span>
                </td></tr>`;

                if (dbData.Data && Array.isArray(dbData.Data)) {
                    dbData.Data.forEach((record, i) => {
                        if (typeof record === 'object' && record !== null) {
                            resultCount++;
                            const keys = Object.keys(record);
                            if (keys.length > 0 && !(keys.length === 1 && keys[0] === 'No results found')) {
                                html += `<tr><td colspan="2" style="border-bottom:1px solid var(--border);padding-top:0.5rem">
                                    <strong style="color:var(--info)">Record ${resultCount}</strong>
                                </td></tr>`;
                                Object.entries(record).forEach(([key, value]) => {
                                    if (value !== null && value !== undefined && value !== '') {
                                        let displayVal = typeof value === 'object' ? JSON.stringify(value, null, 2) : value;
                                        let rowStyle = '';
                                        if (key.toLowerCase().includes('address') || key.toLowerCase().includes('адрес')) rowStyle = 'style="background:rgba(255,165,2,0.05)"';
                                        if (key.toLowerCase().includes('aadhaar') || key.toLowerCase().includes('passport') || key.toLowerCase().includes('id')) rowStyle = 'style="background:rgba(255,71,87,0.05)"';
                                        html += `<tr ${rowStyle}><th>${key}</th><td>${displayVal}</td></tr>`;
                                    }
                                });
                            }
                        }
                    });
                }

                if (dbData.InfoLeak && dbData.NumOfResults === 0) {
                    html += `<tr><td colspan="2" style="color:var(--text-secondary);font-style:italic">${dbData.InfoLeak}</td></tr>`;
                }
            });

            if (resultCount === 0 && data.NumOfResults === 0) {
                html += `<tr><td colspan="2" style="color:var(--success);padding-top:1rem"><i class="fas fa-check-circle"></i> No leaks found for this number.</td></tr>`;
            }
        }

        html += '</table>';
        showResult('phoneResult', html);
    } catch (e) {
        showResult('phoneResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${e.message}</div>`);
    }
}

// DNS Lookup
async function lookupDNS() {
    const domain = document.getElementById('dnsInput').value.trim();
    const type = document.getElementById('dnsType').value;
    if (!domain) return showToast('Enter a domain');
    showLoading('dnsResult');

    try {
        const res = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
        const data = await res.json();

        if (!data.Answer || data.Answer.length === 0) {
            showResult('dnsResult', `
                <table>
                    <tr><th>Domain</th><td>${domain}</td></tr>
                    <tr><th>Record Type</th><td>${type}</td></tr>
                    <tr><th>Status</th><td><span class="tag tag-warn">No records found</span></td></tr>
                </table>
            `);
            return;
        }

        let rows = data.Answer.map(a => `
            <tr>
                <th>${type} Record</th>
                <td>${a.data}</td>
                <td>TTL: ${a.TTL}s</td>
            </tr>
        `).join('');

        showResult('dnsResult', `
            <table>
                <tr><th>Domain</th><td>${domain}</td></tr>
                <tr><th>Record Type</th><td>${type}</td></tr>
                <tr><th>Records Found</th><td>${data.Answer.length}</td></tr>
                ${rows}
            </table>
        `);
    } catch (e) {
        showResult('dnsResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> DNS query failed: ${e.message}</div>`);
    }
}

// Header Security Check
async function checkHeaders() {
    let url = document.getElementById('headerInput').value.trim();
    if (!url) return showToast('Enter a URL');
    if (!url.startsWith('http')) url = 'https://' + url;
    showLoading('headerResult');

    try {
        const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        const headers = {};

        // Note: due to CORS, we can only get limited headers
        // Provide analysis based on common security headers
        const securityHeaders = [
            { name: 'Content-Security-Policy', desc: 'Prevents XSS, injection attacks', important: true },
            { name: 'X-Frame-Options', desc: 'Prevents clickjacking', important: true },
            { name: 'X-Content-Type-Options', desc: 'Prevents MIME sniffing', important: true },
            { name: 'Strict-Transport-Security', desc: 'Enforces HTTPS', important: true },
            { name: 'X-XSS-Protection', desc: 'Legacy XSS filter', important: false },
            { name: 'Referrer-Policy', desc: 'Controls referrer info', important: true },
            { name: 'Permissions-Policy', desc: 'Controls browser features', important: true },
            { name: 'Cross-Origin-Opener-Policy', desc: 'Cross-origin isolation', important: false },
            { name: 'Cross-Origin-Resource-Policy', desc: 'Resource sharing policy', important: false },
        ];

        let html = `
            <p style="margin-bottom:1rem;color:var(--text-secondary);font-size:0.8rem">
                <i class="fas fa-info-circle"></i> Note: Due to browser security, full header analysis requires a backend proxy.
                Below are recommendations for security headers.
            </p>
            <table>
                <tr><th>URL</th><td><a href="${url}" target="_blank" style="color:var(--accent)">${url}</a></td></tr>
        `;

        securityHeaders.forEach(h => {
            html += `
                <tr>
                    <th>${h.name}</th>
                    <td>
                        <span class="tag tag-info">${h.important ? 'Important' : 'Recommended'}</span>
                        <br><small style="color:var(--text-secondary)">${h.desc}</small>
                    </td>
                </tr>
            `;
        });

        html += `
            <tr><th>Full Report</th><td>
                <a href="https://securityheaders.com/?q=${encodeURIComponent(url)}" target="_blank" style="color:var(--accent)">
                    <i class="fas fa-external-link-alt"></i> Check on SecurityHeaders.com
                </a>
            </td></tr>
            <tr><th>SslLabs</th><td>
                <a href="https://www.ssllabs.com/ssltest/analyze.html?d=${new URL(url).hostname}" target="_blank" style="color:var(--accent)">
                    <i class="fas fa-external-link-alt"></i> SSL/TLS Analysis
                </a>
            </td></tr>
        `;

        html += '</table>';
        showResult('headerResult', html);
    } catch (e) {
        showResult('headerResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> Could not check: ${e.message}</div>`);
    }
}

// Password Check
async function checkPassword() {
    const pw = document.getElementById('passwordInput').value;
    if (!pw) return showToast('Enter a password');

    // Strength analysis
    let score = 0;
    let feedback = [];
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    if (!/(.)\1{2,}/.test(pw)) score++; // no repeated chars

    const commonPatterns = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome', 'abc123', 'password1'];
    if (commonPatterns.some(p => pw.toLowerCase().includes(p))) {
        score = Math.max(score - 3, 0);
        feedback.push('Contains common pattern');
    }

    let strength = 'weak';
    let label = 'Weak';
    let color = 'var(--danger)';
    if (score >= 7) { strength = 'strong'; label = 'Strong'; color = 'var(--success)'; }
    else if (score >= 5) { strength = 'good'; label = 'Good'; color = 'var(--info)'; }
    else if (score >= 3) { strength = 'fair'; label = 'Fair'; color = 'var(--warning)'; }

    // Breach check via HIBP k-anonymity
    let breachCount = null;
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(pw);
        const hashBuffer = await crypto.subtle.digest('SHA-1', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        const prefix = hashHex.substring(0, 5);
        const suffix = hashHex.substring(5);

        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text = await res.text();
        const lines = text.split('\n');
        const match = lines.find(l => l.startsWith(suffix));
        if (match) {
            breachCount = parseInt(match.split(':')[1].trim());
        }
    } catch (e) {
        feedback.push('Breach check failed (CORS/network)');
    }

    let html = `
        <div class="strength-label" style="color:${color}">Strength: ${label}</div>
        <div class="strength-bar"><div class="strength-fill ${strength}"></div></div>
        <table>
            <tr><th>Length</th><td>${pw.length} characters</td></tr>
            <tr><th>Score</th><td>${score}/8</td></tr>
    `;

    if (breachCount !== null) {
        html += `<tr><th>Breaches</th><td><span class="tag ${breachCount > 0 ? 'tag-danger' : 'tag-safe'}">${breachCount > 0 ? `Found in ${breachCount.toLocaleString()} breaches!` : 'Not found in any breaches'}</span></td></tr>`;
    }

    if (feedback.length > 0) {
        html += `<tr><th>Warnings</th><td>${feedback.map(f => `<span class="tag tag-warn">${f}</span>`).join(' ')}</td></tr>`;
    }

    html += `
        <tr><th>Tips</th><td style="color:var(--text-secondary);font-size:0.8rem">
            Use 12+ chars, mix uppercase/lowercase/numbers/symbols, avoid common words
        </td></tr>
        </table>
    `;

    showResult('passwordResult', html);
}

// Toggle Password Visibility
function togglePassword() {
    const input = document.getElementById('passwordInput');
    const icon = document.getElementById('toggleIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

// Enter key support
document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const btn = input.closest('.input-group').querySelector('button:not([onclick="togglePassword()"])');
            if (btn) btn.click();
        }
    });
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
