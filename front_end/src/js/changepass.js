// Resolve DOM elements cleanly from the parent interface layer
const modal = document.getElementById('changePasswordModal');
const changeForm = document.getElementById('changePasswordForm');
const modalError = document.getElementById('modalError');
const modalSuccess = document.getElementById('modalSuccess');

const openSvg = `
    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
`;
const closedSvg = `
    <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3a10.452 10.452 0 0 1-5.134 1.432c-2.185 0-4.223-.667-5.914-1.812m10.048-10.048 3-3m-3 3-3.65 3.65m0 0a3 3 0 1 0-4.243 4.243m4.242-4.242L9.88 9.88" />
`;

// Dynamic Visibility Toggles for multi-field password configurations
document.querySelectorAll('.password-visibility-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const linkedInput = button.parentElement.querySelector('input');
        const svgIcon = button.querySelector('.eye-icon');
        const isMasked = linkedInput.getAttribute('type') === 'password';
        
        linkedInput.setAttribute('type', isMasked ? 'text' : 'password');
        svgIcon.innerHTML = isMasked ? closedSvg : openSvg;
    });
});

function openChangePasswordModal() {
    if(modalError) modalError.classList.add('hidden');
    if(modalSuccess) modalSuccess.classList.add('hidden');
    if(changeForm) changeForm.reset();
    if(modal) modal.classList.remove('hidden');
}

function closeChangePasswordModal() {
    if(modal) modal.classList.add('hidden');
    if(modalError) modalError.classList.add('hidden');
    if(modalSuccess) modalSuccess.classList.add('hidden');
    if(changeForm) changeForm.reset();
}

if (modal) {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeChangePasswordModal();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeChangePasswordModal();
    }
});

// Submit Request Interceptor Payload Handshake
if (changeForm) {
    changeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if(modalError) modalError.classList.add('hidden');
        if(modalSuccess) modalSuccess.classList.add('hidden');

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Client-side Validation Checks
        if (newPassword !== confirmPassword) {
            modalError.innerText = "Error: New password parameters do not match.";
            modalError.classList.remove('hidden');
            return;
        }

        if (newPassword.length < 4) {
            modalError.innerText = "Error: New key parameters must match complexity constraints.";
            modalError.classList.remove('hidden');
            return;
        }

        try {
            // Pull the signed-in user's identity parameters from localStorage
            const email = localStorage.getItem('userEmail') || localStorage.getItem('username');
            if (!email) {
                modalError.innerText = "Unable to resolve signed-in session identity. Please login again.";
                modalError.classList.remove('hidden');
                return;
            }

            const response = await fetch('http://localhost:5000/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email,
                    currentPassword, 
                    newPassword 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Modification protocol handshaking refused.");
            }

            modalSuccess.innerText = "Security key mutated successfully.";
            modalSuccess.classList.remove('hidden');
            
            setTimeout(() => {
                closeChangePasswordModal();
            }, 1500);

        } catch (err) {
            modalError.innerText = err.message;
            modalError.classList.remove('hidden');
        }
    });
}

/**
 * Role-Driven Deflection Cancel Router
 * Triggered programmatically via onclick="handleAbortNavigation()"
 */
function handleAbortNavigation() {
    // 1. Fetch user role parameter stored during login lifecycle sequence
    const userRole = localStorage.getItem('userRole');
    
    console.log("Session Storage Read - 'userRole' key value:", userRole);

    // Safeguard backup fallback loop if browser local states aren't initialized yet
    if (!userRole) {
        console.warn("Session userRole value absent. Redirecting dynamically to default gateway.");
        window.location.href = 'captain_dashboard.html';
        return;
    }

    // 2. Clear spacing buffers and standardize casing properties 
    const standardizedRole = userRole.trim().toLowerCase();
    console.log("Normalized role validation path:", standardizedRole);

    // 3. Routing Match Deflections
    if (standardizedRole.includes('admin')) {
        window.location.href = 'admin_dashboard.html';
    } 
    else if (standardizedRole.includes('secretary') || standardizedRole.includes('staff')) {
        window.location.href = 'secretary_dashboard.html';
    }
    else if (standardizedRole.includes('audit')) {
        // Explicit route mapped exactly for your user assignment profile
        window.location.href = 'audit_dashboard.html'; 
    }
    else {
        // Fallback catch-all default for Captains or undefined matches
        window.location.href = 'captain_dashboard.html';
    }
}