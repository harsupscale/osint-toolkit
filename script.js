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
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 20 + 15) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = particle.style.height = (Math.random() * 2 + 1) + 'px';
        container.appendChild(particle);
    }
}
createParticles();

// ===== ISOMETRIC SHAPES =====
function createIsoShapes() {
    const container = document.getElementById('isoShapes');
    if (!container) return;
    const shapes = ['cube', 'diamond'];
    for (let i = 0; i < 6; i++) {
        const shape = document.createElement('div');
        shape.className = 'iso-shape ' + shapes[Math.floor(Math.random() * shapes.length)];
        shape.style.left = Math.random() * 100 + '%';
        shape.style.animationDuration = (Math.random() * 30 + 25) + 's';
        shape.style.animationDelay = Math.random() * 15 + 's';
        shape.style.opacity = (Math.random() * 0.08 + 0.03).toFixed(2);
        container.appendChild(shape);
    }
}
createIsoShapes();

// ===== 3D PARALLAX ON MOUSE MOVE =====
function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    let ticking = false;
    document.addEventListener('mousemove', (e) => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            heroContent.style.transform = `translate(${x * -5}px, ${y * -5}px)`;
            ticking = false;
        });
    });
}
initParallax();

// ===== HERO SEARCH =====
function heroSearchAction() {
    const query = document.getElementById('heroSearch')?.value.trim();
    if (!query) return showToast('Enter something to search');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const phoneRegex = /^\+?[\d\s-]{7,15}$/;

    if (emailRegex.test(query)) {
        window.location.href = 'identity.html';
    } else if (ipRegex.test(query)) {
        window.location.href = 'network.html';
    } else if (phoneRegex.test(query)) {
        window.location.href = 'identity.html';
    } else if (query.includes('.') && !query.includes(' ')) {
        window.location.href = 'network.html';
    } else {
        window.location.href = 'leaks.html';
    }
}

document.getElementById('heroSearch')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') heroSearchAction();
});

// ===== MOBILE MENU =====
document.getElementById('hamburger')?.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('active');
});
document.querySelectorAll('.mobile-menu a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('mobileMenu')?.classList.remove('active'));
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
    if (!el) return;
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
    const sections = document.querySelectorAll('.iso-tool-card, .iso-card');
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
            if (link.getAttribute('href')?.includes('#' + current)) link.classList.add('active');
        });
        mobileLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href')?.includes('#' + current)) link.classList.add('active');
        });
    });
}
setupNavHighlight();

// ===== SCROLL TO TOP =====
function setupScrollToTop() {
    const btn = document.getElementById('scrollToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
setupScrollToTop();

// ===== MD5 HASH (for email tools) =====
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

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offset = 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ===== ENTER KEY SUPPORT =====
document.querySelectorAll('.glass-input-wrapper input, .glass-input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const btn = input.closest('.iso-tool-body, .tool-card-body')?.querySelector('.glass-btn');
            if (btn) btn.click();
        }
    });
});
