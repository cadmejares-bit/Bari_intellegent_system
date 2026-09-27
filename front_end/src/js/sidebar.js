/**
 * sidebar.js
 * Handles sidebar toggling, text crossfades, active link highlighting, 
 * and modular logout confirmation modals.
 */

// Track sidebar interactions smoothly without visual jumps or timing drops
document.addEventListener('click', (event) => {
    const btn = event.target.closest('#btn-toggle');
    
    if (btn) {
        const sidebar = document.getElementById('sidebar');
        const texts = document.querySelectorAll('.sidebar-text');
        const mainContent = document.getElementById('main-content');

        if (!sidebar) return;

        // 1. Alternate Sidebar sizing parameters
        sidebar.classList.toggle('w-50');
        sidebar.classList.toggle('w-20');

        // 2. Crossfade layout text labels cleanly
        const isCollapsed = sidebar.classList.contains('w-20');
        texts.forEach(text => {
            if (isCollapsed) {
                text.style.opacity = '0';
                text.style.visibility = 'hidden';
                setTimeout(() => { text.style.display = 'none'; }, 150);
            } else {
                text.style.display = 'block';
                setTimeout(() => {
                    text.style.opacity = '1';
                    text.style.visibility = 'visible';
                }, 50);
            }
        });

        // 3. Shift core layout wrapper alignment margins seamlessly
        if (mainContent) {
            mainContent.classList.toggle('ml-50');
            mainContent.classList.toggle('ml-20');
        }

        // 4. Fire Lucide rendering updates
        if (window.lucide) {
            setTimeout(() => { lucide.createIcons(); }, 150);
        }
        return;
    }

    // --- Modular Click Event Connectors for the Logout Modal ---
    if (event.target.closest('#btn-logout')) {
        event.preventDefault();
        toggleLogoutModalWindow(true);
        return;
    }

    if (event.target.closest('#modal-cancel-btn')) {
        toggleLogoutModalWindow(false);
        return;
    }

    if (event.target.closest('#modal-confirm-btn')) {
        executeUserTerminalLogout();
        return;
    }
});

// Sidebar asynchronous component injection template mapping
document.addEventListener("DOMContentLoaded", function() {
    const sidebarContainer = document.getElementById("sidebar-container");
    if (!sidebarContainer) return;

    fetch("../components/sidebar.html")
        .then(res => res.text())
        .then(data => {
            sidebarContainer.innerHTML = data;
            
            // Highlight links matching the user's terminal window path location
            highlightActiveSidebarLink();
            
            if (window.lucide) {
                lucide.createIcons();
            }
        })
        .catch(err => console.error("Error structuralizing sidebar element:", err));
});

/**
 * 🌟 HIGH-CONTRAST SYSTEM INDICATOR STATE ACCENTS
 */
function highlightActiveSidebarLink() {
    const currentPath = window.location.pathname.split("/").pop();
    const sidebarLinks = document.querySelectorAll("#sidebar a");

    sidebarLinks.forEach(link => {
        const linkTarget = link.getAttribute("href").split("/").pop();
        if (currentPath === linkTarget) {
            link.classList.add("bg-neutral-900", "text-sky-400", "border-l-2", "border-sky-500");
            link.classList.remove("text-gray-400", "hover:bg-neutral-900/50");
        }
    });
}

/**
 * DISMISS / RENDER LOGOUT PROMPT MODAL WINDOW
 */
function toggleLogoutModalWindow(show) {
    const overlay = document.getElementById('logoutModal');
    const card = document.getElementById('logoutCard');
    if (!overlay || !card) return;

    if (show) {
        overlay.classList.remove('hidden', 'pointer-events-none');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }, 20);
    } else {
        card.classList.remove('scale-100');
        card.classList.add('scale-95');
        overlay.classList.add('opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden', 'pointer-events-none');
        }, 300);
    }
}

/**
 * SECURE TERMINATION / EXPEL LOCAL CACHED SECURITY CRUMB DATA
 */
function executeUserTerminalLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('auth_session');
    sessionStorage.clear();
    localStorage.clear();
    
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    window.location.href = "index.html";
}