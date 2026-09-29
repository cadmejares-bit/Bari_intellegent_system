/**
 * reports.js - Standalone Incident Reports Module
 * Decoupled data visualization table with an isolated modal tracking engine.
 */

document.addEventListener('DOMContentLoaded', () => {
    initializeReportsGrid();
});

function initializeReportsGrid() {
    const tableWrapper = document.getElementById("reports-table-wrapper");
    if (!tableWrapper) return;

    new gridjs.Grid({
        columns: [
            { id: "incident_id", name: "ID" },
            { 
                id: "incident_date", 
                name: "Date", 
                formatter: (cell) => cell ? new Date(cell).toISOString().split('T')[0] : 'N/A' 
            },
            { id: "incident_time", name: "Time" },
            { id: "incident_type", name: "Type" }, 
            { id: "purok_location", name: "Location" },
            { id: "reporting_tanod", name: "Reporting Tanod" },
            { 
                id: "status", 
                name: "Status",
                formatter: () => gridjs.html(`<span class="text-xs font-semibold text-emerald-400">Verified</span>`)
            },
            {
                id: "actions",
                name: "Audit Log Details",
                sort: false,
                formatter: (cell, row) => {
                    const rowData = {
                        id: row.cells[0].data,
                        date: row.cells[1].data,
                        time: row.cells[2].data,
                        type: row.cells[3].data,
                        location: row.cells[4].data,
                        tanod: row.cells[5].data,
                        reason: row.cells[7]?.data || 'No descriptive text logged.',
                        created_at: row.cells[8]?.data || 'N/A'
                    };
                    
                    const payloadString = encodeURIComponent(JSON.stringify(rowData));
                    return gridjs.html(`
                        <button onclick="revealIncidentDetails('${payloadString}')" 
                            class="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-0 p-0 transition-colors">
                            View Records
                        </button>
                    `);
                }
            },
            // Hidden columns mapping structural data into client rows memory
            { id: "reason", name: "HiddenReason", hidden: true },
            { id: "created_at", name: "HiddenTimestamp", hidden: true }
        ],
        server: {
            url: 'http://localhost:5000/api/incidents',
            then: data => data.map(item => ({
                incident_id: item.incident_id,
                incident_date: item.incident_date,
                incident_time: item.incident_time || item.time,
                incident_type: item.incident_type || 'General Incident',
                purok_location: item.purok_location || item.location,
                reporting_tanod: item.reporting_tanod || item.reporter || 'System Log',
                status: item.status,
                reason: item.reason, 
                created_at: item.created_at
            }))
        },
        search: { selector: (cell) => cell },
        sort: true,
        pagination: { limit: 5 },
        className: {
            container: 'bg-black p-0 border-0', 
            table: 'w-full text-left border-collapse text-sm text-gray-400 bg-black',
            thead: 'bg-neutral-900/40 text-gray-300 uppercase text-xs tracking-wider',
            th: 'px-4 py-3 font-semibold text-gray-300 border border-white/5 bg-black',
            td: 'px-4 py-3.5 text-gray-300 border border-white/5 bg-black transition-colors',
            footer: 'bg-black px-4 py-3 text-gray-500 text-xs',
            pagination: 'flex justify-between items-center text-xs text-gray-500 bg-black',
            paginationButton: 'bg-black border border-white/10 text-gray-300 rounded px-2.5 py-1 mx-0.5 hover:bg-neutral-900 disabled:opacity-20 disabled:hover:bg-black transition-all'
        }
    }).render(tableWrapper);
}

/**
 * Global Interceptor Panel Triggers
 */
window.revealIncidentDetails = function(encodedPayload) {
    const data = JSON.parse(decodeURIComponent(encodedPayload));
    
    let modal = document.getElementById('incident-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'incident-detail-modal';
        modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-xl p-6 shadow-2xl transform scale-95 transition-transform duration-300 max-h-[90vh] overflow-y-auto font-['Inter']">
            <div class="flex justify-between items-start border-b border-white/5 pb-4 mb-4">
                <div>
                    <span class="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">Audit Reference Sequence</span>
                    <h3 class="text-base font-bold text-gray-100 tracking-wide">Case File Entry #${data.id}</h3>
                </div>
                <button onclick="dismissIncidentDetails()" class="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm p-1">✕</button>
            </div>

            <div class="grid grid-cols-2 gap-4 text-xs mb-6">
                <div>
                    <span class="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-0.5">Classification Type</span>
                    <p class="text-gray-200 font-medium">${data.type}</p>
                </div>
                <div>
                    <span class="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-0.5">Assigned Sector Bounds</span>
                    <p class="text-emerald-400 font-semibold uppercase">${data.location}</p>
                </div>
                <div>
                    <span class="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-0.5">Date of Occurrence</span>
                    <p class="text-gray-200 font-medium">${data.date ? new Date(data.date).toISOString().split('T')[0] : 'N/A'}</p>
                </div>
                <div>
                    <span class="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-0.5">Time Component</span>
                    <p class="text-gray-200 font-medium">${data.time}</p>
                </div>
                <div>
                    <span class="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-0.5">Reporting Tanod Officer</span>
                    <p class="text-gray-200 font-medium">${data.tanod}</p>
                </div>
                <div>
                    <span class="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-0.5">PostgreSQL Audit Timestamp</span>
                    <p class="text-gray-400 font-mono text-[11px]">${data.created_at ? data.created_at.replace('T', ' ').slice(0,19) : 'N/A'}</p>
                </div>
            </div>

            <div class="bg-black border border-white/5 p-4 rounded-lg mb-6">
                <span class="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-2">Detailed Case Record Descriptors</span>
                <p class="text-xs text-gray-300 leading-relaxed font-normal whitespace-pre-wrap">${data.reason}</p>
            </div>

            <div class="flex justify-end pt-4 border-t border-white/5">
                <button onclick="dismissIncidentDetails()" 
                    class="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-gray-300 text-xs font-medium rounded border border-white/10 transition-colors cursor-pointer">
                    Dismiss Record View
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('pointer-events-none', 'opacity-0');
    setTimeout(() => modal.querySelector('div').classList.remove('scale-95'), 10);
};

window.dismissIncidentDetails = function() {
    const modal = document.getElementById('incident-detail-modal');
    if (modal) {
        modal.querySelector('div').classList.add('scale-95');
        modal.classList.add('opacity-0', 'pointer-events-none');
    }
};