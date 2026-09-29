function formatIncidentData(data) {
    return data.map(item => ({
        incident_id: item.incident_id,
        incident_date: item.incident_date,
        incident_time: item.incident_time,
        purok_location: item.purok_location,
        reporting_tanod: item.reporting_tanod || item.reporter || 'N/A',
        status: item.status
    }));
}

module.exports = { formatIncidentData };