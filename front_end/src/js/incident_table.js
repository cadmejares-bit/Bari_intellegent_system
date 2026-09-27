// Update your Grid.js instance inside front_end/js/app.js

const grid = new gridjs.Grid({
    columns: [
        { id: "incident_id", name: "ID" },
        { 
            id: "incident_date", 
            name: "Date", 
            formatter: (cell) => cell ? new Date(cell).toISOString().split('T')[0] : 'N/A' 
        },
        { id: "incident_time", name: "Time" },
        { id: "purok_location", name: "Location" },
        { id: "reporting_tanod", name: "Reporting Tanod" },
        { 
            id: "status", 
            name: "Status",
            // 🌟 MODIFIED FORMATTER: Formats the cell content so it renders clean text or custom html badges
            formatter: (cell) => {
                // Option A: If you want to force everything to display as "Verified" cleanly
                return gridjs.html(`<span class="text-xs font-semibold text-emerald-400">Verified</span>`);
                
                /* // Option B: Alternative dynamic check if you want it to support multiple backend states later:
                const statusText = (cell === 'Pending' || !cell) ? 'Verified' : cell;
                return gridjs.html(`<span class="text-xs font-semibold text-emerald-400">${statusText}</span>`);
                */
            }
        },
    ],
    server: {
        url: 'http://localhost:5000/api/incidents',
        // FIX: Convert your server array payload format cleanly into the structure Grid.js expects
        then: data => data.map(item => ({
            incident_id: item.incident_id,
            incident_date: item.incident_date,
            incident_time: item.incident_time,
            purok_location: item.purok_location,
            reporting_tanod: item.reporting_tanod || item.reporter, // Fallback safe check for mismatched keys
            status: item.status
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
}).render(document.getElementById("automated-table-wrapper"));

