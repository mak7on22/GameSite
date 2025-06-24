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
    document.documentElement.classList.remove("theme-dark", "theme-light");
    document.documentElement.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
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
