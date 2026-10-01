/**
 * patrol_assign.js
 * Drives interactive scheduling updates mapping live data targets to operational boards.
 * Implements full server routing, failure maps, and custom non-blocking notification feeds.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inject current date field parameters automatically on system wake
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('patrol_date');
    if (dateInput) dateInput.value = today;

    loadPatrolRoster();

    // Hook up real-time form interceptions
    const formElement = document.getElementById('patrolForm');
    if (formElement) {
        formElement.addEventListener('submit', createPatrolAssignment);
    }
});

/**
 * Custom Toast Notification Engine
 * Replaces intrusive browser alert windows with smooth, animated slide-in status messages.
 */
function showNotification(message, type = 'success') {
    
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = "fixed top-6 justify-center z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none";
        document.body.appendChild(container);
    }

    // Initialize custom toast card instance
    const toast = document.createElement('div');
    
    // Assign structural color tokens matching system metrics
    let bgBorderColor = "bg-neutral-950 border-emerald-500/20 text-emerald-400";
    let icon = "✅";
    
    if (type === 'error') {
        bgBorderColor = "bg-neutral-950 border-red-500/20 text-red-400";
        icon = "❌";
    } else if (type === 'info') {
        bgBorderColor = "bg-neutral-950 border-cyan-500/20 text-cyan-400";
        icon = "ℹ️";
    }

    // Apply clean layouts matching the dashboard typography
    toast.className = `flex items-center gap-3 border ${bgBorderColor} p-4 rounded-xl shadow-2xl backdrop-blur-md translate-x-12 opacity-0 transition-all duration-300 ease-out pointer-events-auto`;
    
    toast.innerHTML = `
        <span class="text-sm">${icon}</span>
        <p class="text-xs font-medium text-gray-200 flex-1">${message}</p>
    `;

    container.appendChild(toast);

    // Trigger smooth slide-in layout framework transition
    setTimeout(() => {
        toast.classList.remove('translate-x-12', 'opacity-0');
    }, 10);

    // Gracefully slide back and destroy node after runtime window expires
    setTimeout(() => {
        toast.classList.add('translate-x-12', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3500);
}

/**
 * Reads active deployments straight out of the database log matrices
 */
async function loadPatrolRoster() {
    const container = document.getElementById('patrolRosterContainer');
    if (!container) return;

    try {
        const response = await fetch('http://localhost:5000/api/patrols');
        if (!response.ok) throw new Error("Backend logs connection unreachable.");

        const deployments = await response.json();
        container.innerHTML = '';

        if (deployments.length === 0) {
            container.innerHTML = `
                <div class="col-span-full bg-neutral-950/40 border border-dashed border-white/10 rounded-xl p-12 text-center">
                    <p class="text-xs text-gray-500">🚫 No active squads deployed to sectors today.</p>
                </div>`;
            return;
        }

        deployments.forEach(patrol => {
            const card = document.createElement('div');
            card.className = "bg-neutral-950 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-white/10 transition-all duration-300";
            
            const formattedDate = new Date(patrol.deployment_date || patrol.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            // Adaptive keys parsing layers matching snake_case or camelCase configurations
            const shift = patrol.shift_assignment || patrol.shift || 'Night';
            const location = patrol.purok_location || patrol.location || 'Unknown Sector';
            const leader = patrol.squad_leader || patrol.leader || patrol.reporting_tanod || 'Unnamed Officer';
            const patrolId = patrol.patrol_id || patrol.id;

            // Generate contextual color codes matching the scheduled deployment times
            let shiftBadgeColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            if (shift === 'Night') shiftBadgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            if (shift === 'Afternoon') shiftBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

            card.innerHTML = `
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[8px] font-bold text-gray-500 uppercase block">Active Zone</span>
                            <span class="text-xs font-bold text-emerald-400 uppercase tracking-wide">${location.toUpperCase()}</span>
                        </div>
                        <span class="text-[9px] px-2 py-0.5 border rounded-full font-medium ${shiftBadgeColor}">
                            ${shift} Shift
                        </span>
                    </div>

                    <div class="pt-2 border-t border-white/5">
                        <span class="text-[8px] font-bold text-gray-500 uppercase block">Squad Leader Assigned</span>
                        <p class="text-sm font-semibold text-gray-200 mt-0.5 truncate">${leader}</p>
                    </div>

                    <div class="text-[10px] text-gray-500 mt-1 font-medium">
                        🗓️ Scheduled: ${formattedDate}
                    </div>
                </div>

                <div class="pt-2 border-t border-white/5">
                    <button onclick="recallSquadDeployment(${patrolId})" 
                        class="w-full text-center cursor-pointer bg-neutral-900 hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 py-1.5 rounded text-xs font-medium active:scale-[0.98] transition-all">
                         Recall / End Shift
                    </button>
                </div>
            `;
            container.appendChild(card);
        });

        if (window.lucide) lucide.createIcons();

    } catch (err) {
        console.error("Roster rendering execution block crash:", err);
        container.innerHTML = `<p class="text-xs text-red-400 text-center col-span-full py-12">Failed to poll active patrol logs server matrices.</p>`;
    }
}

/**
 * Handles creation form dispatches, transmitting clean values directly to the database
 */
async function createPatrolAssignment(e) {
    e.preventDefault();

    const payload = getPatrolFormData();

    const errorMessage = validatePatrolFormData(payload);

    if (errorMessage) {
        showNotification(errorMessage, 'error');
        return;
    }

    await submitPatrolAssignment(payload);
}


function getPatrolFormData() {
    return {
        squad_leader: document.getElementById('patrol_leader').value,
        purok_location: document.getElementById('patrol_location').value,
        shift_assignment: document.getElementById('patrol_shift').value,
        deployment_date: document.getElementById('patrol_date').value
    };
}


function validatePatrolFormData(payload) {
    if (!payload.squad_leader) {
        return 'Please select a valid Squad Leader before authorizing deployment.';
    }

    if (!payload.purok_location) {
        return 'Please select a valid Location before authorizing deployment.';
    }

    if (!payload.shift_assignment) {
        return 'Please select a valid Shift before authorizing deployment.';
    }

    if (!payload.deployment_date) {
        return 'Please select a valid Deployment Date before authorizing deployment.';
    }

    return null;
}


async function submitPatrolAssignment(payload) {
    try {
        const response = await fetch('http://localhost:5000/api/patrols', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            document.getElementById('patrol_leader').selectedIndex = 0;

            loadPatrolRoster();

            showNotification(
                'Patrol assignment successfully submitted'
            );
        } else {
            showNotification(
                'Deployment dispatch rejected by server authorization logic.',
                'error'
            );
        }
    } catch (err) {
        console.error(
            "Network error on deployment form intercept:",
            err
        );

        showNotification(
            'Unable to submit patrol assignment',
            'error'
        );
    }
}
/**
 * Clears and revokes active rows inside PostgreSQL database log files
 */
async function recallSquadDeployment(id) {
    if (!id) return;
   
    try {
        const response = await fetch(`http://localhost:5000/api/patrols/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadPatrolRoster();
            showNotification('Squad successfully recalled. Shift logged as completed.', 'info');
        } else {
            showNotification('Server rejected task row clearing transactions.', 'error');
        }
    } catch (err) {
        console.error("Network error on routing actions:", err);
        showNotification('Network failure encountered during active recall execution.', 'error');
    }
}