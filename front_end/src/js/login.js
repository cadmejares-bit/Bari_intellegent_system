const passwordInput = document.getElementById('password');
        const passwordToggle = document.getElementById('passwordToggle');
        const eyeIcon = document.getElementById('eyeIcon');

        const eyeOpenPath = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        `;
        const eyeClosedPath = `
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815 3 3m-3-3a10.452 10.452 0 0 1-5.134 1.432c-2.185 0-4.223-.667-5.914-1.812m10.048-10.048 3-3m-3 3-3.65 3.65m0 0a3 3 0 1 0-4.243 4.243m4.242-4.242L9.88 9.88" />
        `;

        // Toggles the visibility of password strings and flips matching eye paths
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
            eyeIcon.innerHTML = isPassword ? eyeClosedPath : eyeOpenPath;
        });

        // Intercept Form Submit Sequence for API Handshake Verification
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const errorDiv = document.getElementById('errorMessage');
            
            errorDiv.classList.add('hidden');

            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Authentication handshake rejected.');
                }

                // Cache credentials payload securely inside localStorage matrix
                localStorage.setItem('username', data.username || '');
                localStorage.setItem('userEmail', data.email || email || '');
                localStorage.setItem('userRole', data.role || '');
                
                // Read exact DB role parameter string ("captain" / "auditor")
                const targetRole = String(data.role).toLowerCase().trim();

                if (targetRole === 'captain') {
                    window.location.href = "captain_dashboard.html";
                } else if (targetRole === 'auditor' || targetRole === 'audit') {
                    window.location.href = "audit_dashboard.html";
                } else {
                    throw new Error(`Unrecognized role hierarchy (${data.role}). Access denied.`);
                }

            } catch (err) {
                errorDiv.innerText = err.message;
                errorDiv.classList.remove('hidden');
            }
        });

        