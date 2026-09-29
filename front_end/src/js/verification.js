/**
 * verification.js
 * Manages the live-connected validation and verification pipelines mapping UI cards to DB entries.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadVerificationQueue();
    
    const filterSelect = document.getElementById('queueLocationFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', loadVerificationQueue);
    }
});

async function loadVerificationQueue() {
    const container = document.getElementById('verificationContainer');
    if (!container) return;

    try {
        // Pull active data feed from your core incidents endpoint
        const response = await fetch('http://localhost:5000/api/incidents');
        if (!response.ok) throw new Error("Could not access backend database feed");

        const incidents = await response.json();
        
        // Filter specifically for items that need verification attention (Pending / Active states)
        const selectedPurok = document.getElementById('queueLocationFilter').value;
        const unverifiedLogs = incidents.filter(item => {
            const matchesStatus = item.status === 'Pending' || item.status === 'Active';
            if (selectedPurok === 'all') return matchesStatus;
            
            // Clean inputs to match lookups reliably
            const rowLocation = String(item.purok_location || '').toLowerCase().replace(/\s+/g, '');
            const targetFilter = String(selectedPurok).toLowerCase().replace(/\s+/g, '');
            return matchesStatus && (rowLocation === targetFilter || rowLocation.endsWith(targetFilter));
        });

        // Update top stats summary items metrics live
        document.getElementById('metric-pending').innerText = unverifiedLogs.filter(i => i.status === 'Pending').length;
        document.getElementById('metric-resolved').innerText = incidents.filter(i => i.status === 'Resolved').length;

        container.innerHTML = ''; // Wipe out baseline loading text fields

        if (unverifiedLogs.length === 0) {
            container.innerHTML = `
                <div class="col-span-full bg-neutral-950 border border-dashed border-white/10 rounded-xl p-12 text-center">
                    <p class="text-xs text-gray-500"> Verification queue completely clear! No entries require attention.</p>
                </div>`;
            return;
        }

        // Map outstanding entries into clean, compact card blocks
        unverifiedLogs.forEach(incident => {
            const card = document.createElement('div');
            card.className = "bg-neutral-950 border border-white/5 rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-white/10 transition-all duration-300";
            
            // Format timestamps for human readability
            const formattedDate = new Date(incident.incident_date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            });

            // Set state badge styles dynamically
            const statusBadgeClass = incident.status === 'Active' 
                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

            // 🌟 FAIL-SAFE DATABASE PRIMARY KEY MAPPING LAYER:
            // Automatically adapts to 'id', 'incident_id', or numeric fallbacks coming out of Postgres
            const dbRecordId = incident.id || incident.incident_id;

            // 🔄 FULLY RESTORED ORIGINAL FIRST UI MATRIX:
            card.innerHTML = `
                <div class="flex flex-col gap-2">
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500 block">Location Sector</span>
                            <span class="text-xs font-semibold text-cyan-400 uppercase tracking-wide">${incident.purok_location || 'Unknown Zone'}</span>
                        </div>
                        <span class="text-[10px] px-2 py-0.5 border rounded-full font-medium ${statusBadgeClass}">
                            ${incident.status}
                        </span>
                    </div>

                    <div class="pt-1 border-t border-white/5">
                        <span class="text-[9px] font-bold uppercase tracking-wider text-gray-500 block">Reported Case Matter</span>
                        <p class="text-sm font-medium text-gray-200 mt-0.5 line-clamp-2">${incident.complainant_reason || incident.reason || 'No description provided'}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-2 bg-black/40 p-2 rounded-lg border border-white/5 text-[11px] mt-1">
                        <div>
                            <span class="text-[8px] uppercase font-bold text-gray-600 block">Reporter / Tanod</span>
                            <span class="text-gray-400 truncate block font-medium">${incident.reporting_tanod || incident.reporter || 'Anonymous'}</span>
                        </div>
                        <div>
                            <span class="text-[8px] uppercase font-bold text-gray-600 block">Occurred At</span>
                            <span class="text-gray-400 block font-medium">${formattedDate} • ${incident.incident_time || incident.time || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button onclick="updateCaseStatus(${dbRecordId}, 'Resolved')" 
                        class="flex-1 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded shadow-lg shadow-emerald-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5">
                        <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Verify & Resolve
                    </button>
                    <button onclick="deleteCaseRecord(${dbRecordId})" 
                        class="cursor-pointer bg-neutral-900 hover:bg-red-950/40 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 p-2 rounded active:scale-[0.98] transition-all" 
                        title="Dismiss False Alarm Report">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });

        // Initialize Lucide iconography mapping definitions safely
        if (window.lucide) lucide.createIcons();

    } catch (err) {
        console.error("Verification screen view layer runtime crash:", err);
        container.innerHTML = `<p class="text-xs text-red-400 text-center col-span-full py-12">Failed to reach verification api endpoints matrix.</p>`;
    }
}

/**
 * Pushes a status update modification directly down onto PostgreSQL records
 */
async function updateCaseStatus(id, newStatus) {
    if (!id) {
        alert(" UI Error: Valid record ID missing from this card action handler.");
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/api/incidents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadVerificationQueue(); // Instantly reload and filter columns view
        } else {
            alert(' Database update transaction execution rejected.');
        }
    } catch (err) {
        console.error("Verification execution modification crash sequence:", err);
    }
}

/**
 * Removes a false alarm entry directly from the database
 */
async function deleteCaseRecord(id) {
    if (!id) {
        alert(" UI Error: Valid record ID missing from this card action handler.");
        return;
    }
    
    if (!confirm("Are you sure you want to dismiss this incident log entry as a false alarm? This completely deletes it from the database tracking logs.")) return;
    
    try {
        const response = await fetch(`http://localhost:5000/api/incidents/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadVerificationQueue(); // Clean out deleted item card instantly
        } else {
            alert(' Failed to clean target row record items.');
        }
    } catch (err) {
        console.error("Deletion route parsing error:", err);
    }
}