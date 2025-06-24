// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

const searchInput = document.getElementById('user-search');
const resultsContainer = document.getElementById('search-results');

if (searchInput && resultsContainer) {
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();
        if (!query) {
            resultsContainer.innerHTML = '';
            return;
        }

        const res = await fetch(`/Search/Users?query=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const users = await res.json();
        resultsContainer.innerHTML = '';
        users.forEach(u => {
            const div = document.createElement('div');
            div.className = 'list-group-item d-flex justify-content-between align-items-center';
            div.textContent = u.userName;
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-primary ms-2';
            btn.textContent = 'Add';
            btn.addEventListener('click', async () => {
                await fetch('/Friends/Add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `friendId=${encodeURIComponent(u.id)}`
                });
            });
            div.appendChild(btn);
            resultsContainer.appendChild(div);
        });
    });
}

// Theme switcher
function getStoredTheme() {
    return localStorage.getItem('theme');
}

function getPreferredTheme() {
    const stored = getStoredTheme();
    if (stored) {
        return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.body.classList.remove("theme-dark", "theme-light");
    const cls = theme === "dark" ? "theme-dark" : "theme-light";
    document.documentElement.classList.add(cls);
    document.body.classList.add(cls);
}

applyTheme(getPreferredTheme());

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!getStoredTheme()) {
        applyTheme(getPreferredTheme());
    }
});

document.querySelectorAll('[data-theme-value]').forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        const theme = btn.getAttribute('data-theme-value');
        if (theme === 'system') {
            localStorage.removeItem('theme');
        } else {
            localStorage.setItem('theme', theme);
        }
        applyTheme(getPreferredTheme());
    });
});

// Like buttons ajax
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.like-form').forEach(form => {
        form.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = form.querySelector('.like-btn');
            const id = btn.dataset.postId;
            const res = await fetch('/Post/Like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: `postId=${encodeURIComponent(id)}`
            });
            if (res.ok) {
                const data = await res.json();
                btn.textContent = (data.liked ? 'Unlike' : 'Like') + ` (${data.likes})`;
            }
        });
    });

    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const p = link.parentElement;
            p.querySelector('.more-text').classList.remove('d-none');
            p.querySelector('.ellipsis').classList.add('d-none');
            link.remove();
        });
    });

    const statusSelect = document.getElementById('status-select');
    if (statusSelect) {
        statusSelect.addEventListener('change', async () => {
            const val = statusSelect.value;
            await fetch('/User/UpdateStatus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Requested-With': 'XMLHttpRequest' },
                body: `status=${encodeURIComponent(val)}`
            });
        });
    }

    const friendSearch = document.getElementById('friend-search');
    const friendResults = document.getElementById('friend-search-results');
    if (friendSearch && friendResults) {
        friendSearch.addEventListener('input', async () => {
            const q = friendSearch.value.trim();
            if (!q) { friendResults.innerHTML = ''; return; }
            const res = await fetch(`/Search/Users?query=${encodeURIComponent(q)}`);
            if (!res.ok) return;
            const users = await res.json();
            friendResults.innerHTML = '';
            users.forEach(u => {
                const div = document.createElement('div');
                div.className = 'list-group-item d-flex justify-content-between align-items-center';
                div.textContent = u.userName;
                const btn = document.createElement('button');
                btn.className = 'btn btn-sm btn-primary ms-2';
                btn.textContent = 'Add';
                btn.addEventListener('click', async () => {
                    await fetch('/Friends/Add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `friendId=${encodeURIComponent(u.id)}`
                    });
                    window.location.reload();
                });
                div.appendChild(btn);
                friendResults.appendChild(div);
            });
        });
    }
});
