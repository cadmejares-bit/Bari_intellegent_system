/**
 * purokchart.js
 * Renders multiple slender, parallel geographic bars inside a single shared container block.
 */

const MAX_SCALE = 10;

async function loadPurokRiskChart() {
    const filterDropdown = document.getElementById('chartTimeFilter');
    const selectedRange = filterDropdown ? filterDropdown.value : 'week';

    try {
        //  CACHE-BUSTER FIX: Appended unique timestamp parameter forcing browser to read live DB data
        const cacheBuster = new Date().getTime();
        const response = await fetch(`http://localhost:5000/api/purok-stats?range=${selectedRange}&nocache=${cacheBuster}`);
        if (!response.ok) throw new Error("Failed to load chart backend array");

        const databasePayload = await response.json();
        console.log("Live Database Payload Received:", databasePayload); // Check your console to see the exact numbers!

        const chartContainer = document.getElementById('purokChartContainer');
        if (!chartContainer) return;
        chartContainer.innerHTML = ''; 

        // Explicitly define zones to scan against the database rows
        const zonesConfig = [
            { name: 'Purok 1', keys: ['purok1', 'purok 1', '1'], color: 'bg-cyan-500', track: 'bg-cyan-950/20' },
            { name: 'Purok 2', keys: ['purok2', 'purok 2', '2'], color: 'bg-purple-500', track: 'bg-purple-950/20' },
            { name: 'Purok 3', keys: ['purok3', 'purok 3', '3'], color: 'bg-emerald-500', track: 'bg-emerald-950/20' }
        ];

        zonesConfig.forEach(zone => {
            // Find data in database payload array matching current zone keys
            const record = databasePayload.find(row => {
                const normalized = String(row.purok_location || '').toLowerCase().trim();
                return zone.keys.includes(normalized);
            });

            const count = record ? (parseInt(record.incident_count) || 0) : 0;
            const heightPercent = Math.min((count / MAX_SCALE) * 100, 100);

            // RED TRIGGER WARNING SYSTEM (Triggers if incident count >= 5)
            const isCritical = count >= 5;
            const barFillClass = isCritical ? 'bg-red-500' : zone.color;
            const barTrackClass = isCritical ? 'bg-red-950/40' : zone.track;
            const countLabelColor = isCritical ? 'text-red-400 font-bold' : 'text-gray-400';

            const barColumn = document.createElement('div');
            barColumn.className = "flex flex-col items-center justify-end h-full flex-1 relative max-w-[24px]";
            barColumn.innerHTML = `
                <div class="absolute -top-5 text-[10px] ${countLabelColor} font-medium tracking-tight flex items-center gap-0.5">
                    <span>${count}</span>
                    ${isCritical ? '<span class="text-[8px] animate-pulse"></span>' : ''}
                </div>

                <div class="w-full ${barTrackClass} border border-white/5 rounded-t-xs overflow-hidden flex flex-col justify-end h-24 transition-all duration-300">
                    <div class="w-full ${barFillClass} transition-all duration-500 ease-out" style="height: ${heightPercent}%"></div>
                </div>

                <span class="text-[10px] text-gray-400 font-medium tracking-wide mt-1.5 whitespace-nowrap text-center">
                    ${zone.name}
                </span>
            `;
            
            chartContainer.appendChild(barColumn);
        });

    } catch (err) {
        console.error("Shared Chart geometry rendering error layers crash:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const filterSelect = document.getElementById('chartTimeFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', loadPurokRiskChart);
    }
    loadPurokRiskChart();
});