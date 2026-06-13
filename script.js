// ===== THEME TOGGLE =====
function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerHTML = theme === 'dark'
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }
}

document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
initTheme();

// ===== PARTICLES =====
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 40; i++) {
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

// ===== MOBILE MENU =====
document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('active');
});
document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('mobileMenu').classList.remove('active'));
});

// ===== TOAST =====
function showToast(msg, type = 'error') {
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ===== SHOW RESULT =====
function showResult(id, html) {
    const el = document.getElementById(id);
    el.innerHTML = html;
    el.classList.add('active');
}

function showLoading(id) {
    showResult(id, '<div class="loading"><i class="fas fa-spinner"></i> Searching...</div>');
}

// ===== BUTTON LOADING =====
function setButtonLoading(btn, loading) {
    if (loading) {
        btn.disabled = true;
        btn.dataset.originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Wait...';
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalHtml || btn.innerHTML;
    }
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text, event) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = event ? event.target.closest('button') || event.target : null;
        if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => btn.innerHTML = orig, 1500);
        }
        showToast('Copied!', 'success');
    }).catch(() => showToast('Copy failed'));
}

// ===== NAV HIGHLIGHT ON SCROLL =====
function setupNavHighlight() {
    const sections = document.querySelectorAll('.tool-card');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });
        mobileLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) link.classList.add('active');
        });
    });
}
setupNavHighlight();

// ===== SCROLL TO TOP =====
function setupScrollToTop() {
    const btn = document.getElementById('scrollToTop');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
setupScrollToTop();

// ===== IP LOOKUP =====
async function lookupIP() {
    const ip = document.getElementById('ipInput').value.trim();
    if (!ip) return showToast('Enter an IP address');
    const btn = document.querySelector('#ip-lookup button');
    setButtonLoading(btn, true);
    showLoading('ipResult');
    try {
        const res = await fetch(`/api/ip-lookup/${encodeURIComponent(ip)}`);
        const data = await res.json();
        if (data.error) throw new Error(data.reason || 'Invalid IP');
        document.getElementById('ipInput').value = '';
        showResult('ipResult', `
            <div class="result-actions"><button onclick="copyToClipboard('${data.query}', event)"><i class="fas fa-copy"></i> Copy IP</button></div>
            <table>
                <tr><th>IP</th><td>${data.query}</td></tr>
                <tr><th>Country</th><td>${data.country} (${data.countryCode})</td></tr>
                <tr><th>Region</th><td>${data.regionName}</td></tr>
                <tr><th>City</th><td>${data.city}</td></tr>
                <tr><th>Postal</th><td>${data.zip || 'N/A'}</td></tr>
                <tr><th>Latitude</th><td>${data.lat}</td></tr>
                <tr><th>Longitude</th><td>${data.lon}</td></tr>
                <tr><th>ISP</th><td>${data.isp}</td></tr>
                <tr><th>Org</th><td>${data.org}</td></tr>
                <tr><th>Timezone</th><td>${data.timezone}</td></tr>
                <tr><th>ASN</th><td>${data.as}</td></tr>
                <tr><th>Mobile</th><td><span class="tag ${data.mobile ? 'tag-safe' : 'tag-warn'}">${data.mobile ? 'Yes' : 'No'}</span></td></tr>
                <tr><th>Proxy/VPN</th><td><span class="tag ${data.proxy ? 'tag-danger' : 'tag-safe'}">${data.proxy ? 'Yes' : 'No'}</span></td></tr>
                <tr><th>Hosting</th><td><span class="tag ${data.hosting ? 'tag-info' : 'tag-safe'}">${data.hosting ? 'Yes' : 'No'}</span></td></tr>
            </table>
        `);
    } catch (e) {
        showResult('ipResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${e.message}</div>`);
    } finally {
        setButtonLoading(btn, false);
    }
}

// ===== EMAIL LOOKUP =====
async function lookupEmail() {
    const email = document.getElementById('emailInput').value.trim();
    if (!email) return showToast('Enter an email');
    const btn = document.querySelector('#email-lookup button');
    setButtonLoading(btn, true);
    showLoading('emailResult');

    const parts = email.split('@');
    const isValid = parts.length === 2 && parts[1].includes('.');
    const domain = parts[1] || '';
    const md5 = await hashMD5(email.toLowerCase().trim());

    let domainInfo = '';
    try {
        const res = await fetch(`/api/email-domain/${encodeURIComponent(domain)}`);
        const d = await res.json();
        domainInfo = `
            <tr><th>Domain Country</th><td>${d.country || 'N/A'}</td></tr>
            <tr><th>Domain ISP</th><td>${d.org || 'N/A'}</td></tr>
        `;
    } catch (e) {}

    showResult('emailResult', `
        <div class="result-actions"><button onclick="copyToClipboard('${email}', event)"><i class="fas fa-copy"></i> Copy Email</button></div>
        <table>
            <tr><th>Email</th><td>${email}</td></tr>
            <tr><th>Valid Format</th><td><span class="tag ${isValid ? 'tag-safe' : 'tag-danger'}">${isValid ? 'Yes' : 'No'}</span></td></tr>
            <tr><th>Local Part</th><td>${parts[0] || 'N/A'}</td></tr>
            <tr><th>Domain</th><td>${domain}</td></tr>
            <tr><th>Gravatar</th><td><a href="https://gravatar.com/${md5}" target="_blank" style="color:var(--accent)">View Gravatar</a></td></tr>
            ${domainInfo}
        </table>
    `);
    document.getElementById('emailInput').value = '';
    setButtonLoading(btn, false);
}

async function hashMD5(str) {
    const msgUint8 = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('MD5', msgUint8).catch(() => null);
    if (!hashBuffer) {
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

// ===== USERNAME SEARCH =====
async function searchUsername() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) return showToast('Enter a username');
    const btn = document.querySelector('#username-search button');
    setButtonLoading(btn, true);
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

    let html = '<div class="username-grid">';

    const results = await Promise.allSettled(
        platforms.map(async (p) => {
            try {
                await fetch(p.url, { method: 'HEAD', mode: 'no-cors', redirect: 'follow' });
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
                <i class="fas ${p.found ? 'fa-check-circle' : 'fa-times-circle'}"></i>
            </a>
        `;
    });

    html += '</div>';
    html += `<p style="margin-top:1rem;color:var(--text-muted);font-size:0.72rem"><i class="fas fa-info-circle"></i> Results are approximate due to browser limitations. Click each link to verify.</p>`;
    showResult('usernameResult', html);
    document.getElementById('usernameInput').value = '';
    setButtonLoading(btn, false);
}

// ===== DOMAIN LOOKUP =====
async function lookupDomain() {
    const domain = document.getElementById('domainInput').value.trim().replace(/https?:\/\//, '').split('/')[0];
    if (!domain) return showToast('Enter a domain');
    const btn = document.querySelector('#domain-lookup button');
    setButtonLoading(btn, true);
    showLoading('domainResult');

    try {
        const res = await fetch(`/api/ip-lookup/${encodeURIComponent(domain)}`);
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
            <div class="result-actions"><button onclick="copyToClipboard('${domain}', event)"><i class="fas fa-copy"></i> Copy Domain</button></div>
            <table>
                <tr><th>Domain</th><td>${domain}</td></tr>
                <tr><th>IP</th><td>${data.query || 'N/A'}</td></tr>
                <tr><th>Country</th><td>${data.country || 'N/A'} (${data.countryCode || ''})</td></tr>
                <tr><th>City</th><td>${data.city || 'N/A'}</td></tr>
                <tr><th>ISP / Org</th><td>${data.org || 'N/A'}</td></tr>
                <tr><th>ASN</th><td>${data.as || 'N/A'}</td></tr>
                <tr><th>Timezone</th><td>${data.timezone || 'N/A'}</td></tr>
                ${whoisLinks}
            </table>
        `);
        document.getElementById('domainInput').value = '';
    } catch (e) {
        showResult('domainResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${e.message}. Try external tools: <a href="https://who.is/whois/${domain}" target="_blank" style="color:var(--accent)">who.is</a></div>`);
    } finally {
        setButtonLoading(btn, false);
    }
}

// ===== DNS LOOKUP =====
async function lookupDNS() {
    const domain = document.getElementById('dnsInput').value.trim();
    const type = document.getElementById('dnsType').value;
    if (!domain) return showToast('Enter a domain');
    const btn = document.querySelector('#dns-lookup button');
    setButtonLoading(btn, true);
    showLoading('dnsResult');

    try {
        const res = await fetch(`/api/dns-lookup?name=${encodeURIComponent(domain)}&type=${type}`);
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
            <div class="result-actions"><button onclick="copyToClipboard(\`${data.Answer.map(a => a.data).join('\\n')}\`, event)"><i class="fas fa-copy"></i> Copy All</button></div>
            <table>
                <tr><th>Domain</th><td>${domain}</td></tr>
                <tr><th>Record Type</th><td>${type}</td></tr>
                <tr><th>Records Found</th><td>${data.Answer.length}</td></tr>
                ${rows}
            </table>
        `);
        document.getElementById('dnsInput').value = '';
    } catch (e) {
        showResult('dnsResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> DNS query failed: ${e.message}</div>`);
    } finally {
        setButtonLoading(btn, false);
    }
}

// ===== OSINT LEAK SEARCH =====
async function searchLeaks() {
    const query = document.getElementById('leakInput').value.trim();
    if (!query) return showToast('Enter a search query');
    const btn = document.querySelector('#osint-leak-search button');
    setButtonLoading(btn, true);
    showLoading('leakResult');

    try {
        const res = await fetch('/api/leak-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, limit: 100 })
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            let errMsg = data.error || 'Search failed';
            if (errMsg.includes('too many requests') || errMsg.includes('invalid data') || errMsg.includes('requests again in')) {
                errMsg = 'Slow down bestie! Rate limit hit. Try again in a few seconds.';
            }
            throw new Error(errMsg);
        }

        if (!data.NumOfDatabase || data.NumOfDatabase === 'N/A') {
            throw new Error('API token expired hai bhai, .env mein naya token daal.');
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
                if (dbName === 'No results found') {
                    if (dbData.InfoLeak) {
                        html += `<tr><td colspan="2" style="color:var(--text-muted);font-style:italic;padding-top:1rem">${dbData.InfoLeak}</td></tr>`;
                    }
                    return;
                }

                html += `<tr><td colspan="2" style="background:var(--bg-card);border-bottom:2px solid var(--accent);padding-top:1rem">
                    <strong style="color:var(--accent)"><i class="fas fa-database"></i> ${dbName}</strong>
                    <span class="tag tag-info" style="margin-left:0.5rem">${dbData.NumOfResults || 0} records</span>
                </td></tr>`;

                if (dbData.Data && Array.isArray(dbData.Data)) {
                    dbData.Data.forEach((record) => {
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
                                        if (key.toLowerCase().includes('address') || key.toLowerCase().includes('адрес')) rowStyle = 'style="background:rgba(255,165,2,0.03)"';
                                        if (key.toLowerCase().includes('aadhaar') || key.toLowerCase().includes('passport') || key.toLowerCase().includes('id')) rowStyle = 'style="background:rgba(255,71,87,0.03)"';
                                        html += `<tr ${rowStyle}><th>${key}</th><td>${displayVal}</td></tr>`;
                                    }
                                });
                            }
                        }
                    });
                }

                if (dbData.InfoLeak && dbData.NumOfResults === 0) {
                    html += `<tr><td colspan="2" style="color:var(--text-muted);font-style:italic">${dbData.InfoLeak}</td></tr>`;
                }
            });

            if (resultCount === 0 && data.NumOfResults === 0) {
                html += `<tr><td colspan="2" style="color:var(--success);padding-top:1rem"><i class="fas fa-check-circle"></i> No results found for this query.</td></tr>`;
            }
        }

        html += '</table>';
        showResult('leakResult', html);
        document.getElementById('leakInput').value = '';
    } catch (e) {
        showResult('leakResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${e.message}</div>`);
    } finally {
        setButtonLoading(btn, false);
    }
}

// ===== PHONE NUMBER LOOKUP =====
async function lookupPhone() {
    const phone = document.getElementById('phoneInput').value.trim();
    if (!phone) return showToast('Enter a phone number');
    const btn = document.querySelector('#phone-lookup button');
    setButtonLoading(btn, true);
    showLoading('phoneResult');

    try {
        const res = await fetch('/api/leak-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: phone, limit: 100 })
        });

        const data = await res.json();

        if (!res.ok || data.error) {
            let errMsg = data.error || 'Lookup failed';
            if (errMsg.includes('too many requests') || errMsg.includes('invalid data') || errMsg.includes('requests again in')) {
                errMsg = 'Slow down bestie! Rate limit hit. Try again in a few seconds.';
            }
            throw new Error(errMsg);
        }

        if (!data.NumOfDatabase || data.NumOfDatabase === 'N/A') {
            throw new Error('API token expired hai bhai, .env mein naya token daal.');
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
                        html += `<tr><td colspan="2" style="color:var(--text-muted);font-style:italic;padding-top:1rem">${dbData.InfoLeak}</td></tr>`;
                    }
                    return;
                }

                html += `<tr><td colspan="2" style="background:var(--bg-card);border-bottom:2px solid var(--danger);padding-top:1rem">
                    <strong style="color:var(--danger)"><i class="fas fa-database"></i> ${dbName}</strong>
                    <span class="tag tag-danger" style="margin-left:0.5rem">${dbData.NumOfResults || 0} records</span>
                </td></tr>`;

                if (dbData.Data && Array.isArray(dbData.Data)) {
                    dbData.Data.forEach((record) => {
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
                                        if (key.toLowerCase().includes('address') || key.toLowerCase().includes('адрес')) rowStyle = 'style="background:rgba(255,165,2,0.03)"';
                                        if (key.toLowerCase().includes('aadhaar') || key.toLowerCase().includes('passport') || key.toLowerCase().includes('id')) rowStyle = 'style="background:rgba(255,71,87,0.03)"';
                                        html += `<tr ${rowStyle}><th>${key}</th><td>${displayVal}</td></tr>`;
                                    }
                                });
                            }
                        }
                    });
                }

                if (dbData.InfoLeak && dbData.NumOfResults === 0) {
                    html += `<tr><td colspan="2" style="color:var(--text-muted);font-style:italic">${dbData.InfoLeak}</td></tr>`;
                }
            });

            if (resultCount === 0 && data.NumOfResults === 0) {
                html += `<tr><td colspan="2" style="color:var(--success);padding-top:1rem"><i class="fas fa-check-circle"></i> No leaks found for this number.</td></tr>`;
            }
        }

        html += '</table>';
        showResult('phoneResult', html);
        document.getElementById('phoneInput').value = '';
    } catch (e) {
        showResult('phoneResult', `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${e.message}</div>`);
    } finally {
        setButtonLoading(btn, false);
    }
}

// ===== EMAIL PLATFORM CHECKER =====
async function checkEmailPlatforms() {
    const email = document.getElementById('emailPlatformInput').value.trim();
    if (!email) return showToast('Enter an email address');
    if (!email.includes('@') || !email.includes('.')) return showToast('Enter a valid email address');
    const btn = document.querySelector('#email-platforms button');
    setButtonLoading(btn, true);
    showLoading('emailPlatformResult');

    const username = email.split('@')[0];
    const domain = email.split('@')[1];
    const md5 = await hashMD5(email.toLowerCase().trim());

    let html = '';

    // Profile Photo via Gravatar
    let photoUrl = `https://www.gravatar.com/avatar/${md5}?d=mp&s=200`;
    let hasGravatar = false;
    try {
        const imgRes = await fetch(`https://www.gravatar.com/avatar/${md5}?d=404&s=200`);
        if (imgRes.ok) hasGravatar = true;
    } catch (e) {}

    // Profile header with photo
    html += `<div style="display:flex;gap:1.5rem;align-items:center;margin-bottom:1.5rem;padding:1.25rem;background:var(--bg-card);border:1px solid var(--border);border-radius:12px;flex-wrap:wrap">`;
    html += `<div style="position:relative">
        <img src="${photoUrl}" style="width:80px;height:80px;border-radius:50%;border:3px solid var(--accent);box-shadow:0 0 20px var(--accent-glow)">
        ${hasGravatar ? '<div style="position:absolute;bottom:2px;right:2px;width:18px;height:18px;background:var(--success);border-radius:50%;border:2px solid var(--bg-card);display:flex;align-items:center;justify-content:center;font-size:0.5rem;color:#000"><i class="fas fa-check"></i></div>' : ''}
    </div>`;
    html += `<div style="flex:1;min-width:200px">`;
    html += `<div style="font-size:0.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:0.2rem">Google Account</div>`;
    html += `<div style="font-size:1.1rem;font-weight:700;color:var(--text-primary);word-break:break-all">${email}</div>`;
    html += `<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.3rem">Gravatar: ${hasGravatar ? '<span style="color:var(--success)">Connected</span>' : '<span style="color:var(--text-muted)">Not found</span>'} &nbsp;|&nbsp; Domain: <span style="color:var(--accent)">${domain}</span></div>`;
    html += `</div>`;
    html += `</div>`;

    // Google Services
    html += `<h3 style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin-bottom:0.8rem"><i class="fas fa-google" style="color:#4285F4"></i> Google Services Activity</h3>`;
    html += `<div class="username-grid" style="margin-bottom:1.5rem">`;

    const googleServices = [
        { name: 'Google Profile', icon: 'fab fa-google', color: '#4285F4', url: `https://www.google.com/search?q="${email}"` },
        { name: 'YouTube Channel', icon: 'fab fa-youtube', color: '#FF0000', url: `https://www.youtube.com/@${username}` },
        { name: 'YouTube Comments', icon: 'fab fa-youtube', color: '#FF0000', url: `https://www.google.com/search?q=site:youtube.com+"${email}"+comment` },
        { name: 'Google Maps Reviews', icon: 'fas fa-map-marker-alt', color: '#34A853', url: `https://www.google.com/search?q=site:google.com/maps+"${email}"` },
        { name: 'Google Play Reviews', icon: 'fab fa-google-play', color: '#34A853', url: `https://www.google.com/search?q=site:play.google.com+"${email}"` },
        { name: 'Google Photos', icon: 'fas fa-images', color: '#4285F4', url: `https://www.google.com/search?q=site:photos.google.com+"${email}"` },
    ];

    googleServices.forEach(s => {
        html += `<a href="${s.url}" target="_blank" class="username-item found" style="border-left:3px solid ${s.color}">
            <i class="${s.icon}" style="color:${s.color}"></i>
            <span>${s.name}</span>
            <i class="fas fa-external-link-alt" style="font-size:0.55rem;opacity:0.4;margin-left:auto"></i>
        </a>`;
    });

    html += `</div>`;

    // Social Platforms
    html += `<h3 style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin-bottom:0.8rem"><i class="fas fa-globe" style="color:var(--accent)"></i> Social Platforms (username: ${username})</h3>`;
    html += `<div class="username-grid" style="margin-bottom:1rem">`;

    const socialPlatforms = [
        { name: 'Instagram', icon: 'fab fa-instagram', color: '#E1306C', url: `https://www.instagram.com/${username}/` },
        { name: 'Twitter / X', icon: 'fab fa-twitter', color: '#1DA1F2', url: `https://x.com/${username}` },
        { name: 'GitHub', icon: 'fab fa-github', color: '#f0f0f0', url: `https://github.com/${username}` },
        { name: 'Reddit', icon: 'fab fa-reddit', color: '#FF5700', url: `https://www.reddit.com/user/${username}` },
        { name: 'TikTok', icon: 'fab fa-tiktok', color: '#fff', url: `https://www.tiktok.com/@${username}` },
        { name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0077B5', url: `https://www.google.com/search?q=site:linkedin.com+"${email}"` },
        { name: 'Telegram', icon: 'fab fa-telegram', color: '#0088CC', url: `https://t.me/${username}` },
        { name: 'Spotify', icon: 'fab fa-spotify', color: '#1DB954', url: `https://open.spotify.com/user/${username}` },
        { name: 'Pinterest', icon: 'fab fa-pinterest', color: '#E60023', url: `https://pinterest.com/${username}/` },
        { name: 'Twitch', icon: 'fab fa-twitch', color: '#9146FF', url: `https://twitch.tv/${username}` },
        { name: 'Steam', icon: 'fab fa-steam', color: '#66c0f4', url: `https://steamcommunity.com/id/${username}` },
        { name: 'Medium', icon: 'fab fa-medium', color: '#fff', url: `https://medium.com/@${username}` },
    ];

    socialPlatforms.forEach(p => {
        html += `<a href="${p.url}" target="_blank" class="username-item found" style="border-left:3px solid ${p.color}">
            <i class="${p.icon}" style="color:${p.color}"></i>
            <span>${p.name}</span>
            <i class="fas fa-external-link-alt" style="font-size:0.55rem;opacity:0.4;margin-left:auto"></i>
        </a>`;
    });

    html += `</div>`;

    html += `<div style="padding:0.65rem;background:rgba(0,255,65,0.04);border:1px solid rgba(0,255,65,0.12);border-radius:8px;font-size:0.7rem;color:var(--text-secondary)">
        <i class="fas fa-info-circle" style="color:var(--accent)"></i> Profile photo fetched from Gravatar. DOB & calendar require Google OAuth login (coming soon). Click each link to investigate.
    </div>`;

    showResult('emailPlatformResult', html);
    document.getElementById('emailPlatformInput').value = '';
    setButtonLoading(btn, false);
}

// ===== ENTER KEY SUPPORT =====
document.querySelectorAll('.input-wrapper input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const btn = input.closest('.tool-card-body')?.querySelector('button');
            if (btn) btn.click();
        }
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});