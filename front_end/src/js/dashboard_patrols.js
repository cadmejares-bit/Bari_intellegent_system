/**
 * dashboard_patrols.js
 * Fetches active patrols and displays them inside the "On Duty Squad Status" dashboard panel.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardPatrols();

    // If you have a dropdown selector to filter squads by Purok area
    const squadSelector = document.getElementById('purokDutySelector');
    if (squadSelector) {
        squadSelector.addEventListener('change', loadDashboardPatrols);
    }
});

async function loadDashboardPatrols() {
    const targetContainer = document.getElementById('dutyTeamList');
    if (!targetContainer) return;

    try {
        // Fetch active deployments from your newly configured backend endpoint
        const response = await fetch('http://localhost:5000/api/patrols');
        if (!response.ok) throw new Error("Failed to load backend patrol rosters");

        const patrols = await response.json();
        
        // Wipe clean the baseline loading text fields
        targetContainer.innerHTML = '';

        // Check if your dashboard has a filtering dropdown element
        const selectorEl = document.getElementById('purokDutySelector');
        const selectedFilter = selectorEl ? selectorEl.value.toLowerCase().replace(/\s+/g, '') : 'all';

        // Filter the rows to display only the ones matching the selected Purok area
        const activeSquads = patrols.filter(squad => {
            if (selectedFilter === 'all') return true;
            const normalizedLocation = String(squad.purok_location || '').toLowerCase().replace(/\s+/g, '');
            return normalizedLocation === selectedFilter || normalizedLocation.endsWith(selectedFilter);
        });

        // Fallback layout state if no matches exist for this sector
        if (activeSquads.length === 0) {
            targetContainer.innerHTML = `
                <div class="py-4 text-center border border-white/5 bg-neutral-950/20 rounded-xl">
                    <p class="text-xs text-gray-500">🌙 No active patrol units assigned to this zone.</p>
                </div>`;
            return;
        }

        // Generate ultra-compact list items matching your dashboard's thin visual style
        activeSquads.forEach(squad => {
            const rowItem = document.createElement('div');
            rowItem.className = "flex items-center justify-between bg-neutral-950 border border-white/5 p-3 rounded-xl hover:border-white/10 transition-all duration-200";
            
            // Pick a custom emblem or color token based on the active shift assignment
            let shiftColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
            let shiftIcon = "";
            if (squad.shift_assignment === 'Night') {
                shiftColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                shiftIcon = "";
            } else if (squad.shift_assignment === 'Afternoon') {
                shiftColor = "text-amber-400 bg-amber-500/10 border-amber-500/20";
                shiftIcon = "";
            }

            rowItem.innerHTML = `
                <div class="flex items-center gap-3">
                    <!-- Mini Status Signal Light Indicator -->
                    <div class="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40 animate-pulse"></div>
                    <div>
                        <span class="text-xs font-semibold text-gray-200 block">${squad.squad_leader}</span>
                        <span class="text-[10px] text-gray-500 font-medium tracking-wide">Assigned to ${squad.purok_location.toUpperCase()}</span>
                    </div>
                </div>
                
                <!-- Tiny Metadata Badges -->
                <div class="flex items-center gap-2">
                    <span class="text-[9px] px-2 py-0.5 border rounded-full font-medium ${shiftColor}">
                        ${shiftIcon} ${squad.shift_assignment}
                    </span>
                </div>
            `;
            
            targetContainer.appendChild(rowItem);
        });

    } catch (err) {
        console.error("Dashboard patrol interface feed failure:", err);
        targetContainer.innerHTML = `<p class="text-xs text-red-400">Failed to render active roster.</p>`;
    }
}