const pool = require('../src/config/db');

// 1. Fetch the data in the dashboard from pgadmin
exports.getIncidents = async (req, res) => {
    try {
        const status = (req.query.status && typeof req.query.status === 'string') ? req.query.status : null;
        
        let sqlQuery = 'SELECT incident_id, incident_type_id, schedule_id, incident_date, incident_time, purok_location, complainant_reason, reporting_tanod, status, created_at FROM incidents';
        let queryParams = [];

        if (status) {
            sqlQuery += ' WHERE status = $1';
            queryParams.push(status);
        }

        sqlQuery += ' ORDER BY created_at DESC';

        const result = await pool.query(sqlQuery, queryParams);
        
        // Safety Fallback check
        if (!result || !result.rows) {
            return res.status(200).json([]);
        }
        
        // 🌟 FIX: Return real object arrays to match your Grid.js 'id' specifications!
        const formattedData = result.rows.map(row => ({
            incident_id: row.incident_id,
            incident_date: row.incident_date,
            incident_time: row.incident_time,
            purok_location: row.purok_location,
            complainant_reason: row.complainant_reason,
            reporting_tanod: row.reporting_tanod,
            status: row.status,
            created_at: row.created_at
        }));

        return res.json(formattedData);
    } catch (err) {
        console.error("Fetch Incidents Error:", err.message);
        return res.status(500).json([]);
    }
};


exports.createIncident = async (req, res) => {
    console.log("WHAT THE BACKEND COPIED FROM FRONTEND:", req.body);

    try {
        const { reporter, time, reason, incident_date, location, status } = req.body;

        const queryText = `
            INSERT INTO incidents (
                incident_date, 
                incident_time, 
                purok_location,
                complainant_reason,
                reporting_tanod,    
                status
            ) VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *
        `;

        const queryValues = [
            incident_date,   // $1
            time,            // $2
            location,        // $3
            reason,          // $4
            reporter,        // $5
            status           // $6
        ];

        const newIncident = await pool.query(queryText, queryValues);
        res.status(201).json(newIncident.rows[0]);
    } catch (err) {
        console.error("Database Insert Error:", err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
};


exports.getPurokIncidentStats = async (req, res) => {
    try {
        const { range } = req.query; // Grabs 'week', 'month', 'year', or 'all'
        let timeCondition = "";
        
        // 🌟 ALL TIME FALLBACK: If range is 'all', timeCondition stays empty to check every record
        if (range === 'week') {
            timeCondition = "WHERE incident_date >= NOW() - INTERVAL '7 days'";
        } else if (range === 'month') {
            timeCondition = "WHERE incident_date >= NOW() - INTERVAL '30 days'";
        } else if (range === 'year') {
            timeCondition = "WHERE incident_date >= NOW() - INTERVAL '1 year'";
        }

        const statsQuery = `
            SELECT 
                LOWER(REPLACE(purok_location, ' ', '')) AS purok_location, 
                COUNT(*)::int AS incident_count
            FROM incidents
            ${timeCondition}
            GROUP BY LOWER(REPLACE(purok_location, ' ', ''))
            ORDER BY purok_location ASC;
        `;

        const result = await pool.query(statsQuery);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Purok Stats Database Error:", err.message);
        res.status(500).send('Server Error');
    }
};
// 4. Update status column for status validation buttons
exports.verifyIncidentStatus = async (req, res) => {
    try {
        const { id } = req.params;   
        const { status } = req.body; 

        const updateQuery = await pool.query(
            `UPDATE incidents 
             SET status = $1 
             WHERE incident_id = $2 
             RETURNING *`,
            [status, id]
        );

        if (updateQuery.rows.length === 0) {
            return res.status(404).json({ error: 'Incident not found' });
        }

        res.status(200).json(updateQuery.rows[0]);
    } catch (err) {
        console.error("Verification Status Database Error:", err.message);
        res.status(500).send('Server Error');
    }
};

/// UPDATE Case verification status parameter
exports.updateIncidentStatus = async (req, res) => {
    try {
        const { id } = req.params; // This grabs the '21' or '20' from the URL
        const { status } = req.body; // This grabs 'Resolved'
        
        // 🌟 FIXED: Changed WHERE id = $2 to WHERE incident_id = $2
        const updateQuery = `
            UPDATE incidents 
            SET status = $1 
            WHERE incident_id = $2 
            RETURNING *
        `;
        
        const result = await pool.query(updateQuery, [status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('Record not found.');
        }
        
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Critical Backend Status Update Error:", err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// DELETE False reports completely out of core log books
exports.deleteIncidentRecord = async (req, res) => {
    try {
        const { id } = req.params;
        
        // 🌟 FIXED: Changed WHERE id = $1 to WHERE incident_id = $1
        const deleteQuery = `
            DELETE FROM incidents 
            WHERE incident_id = $1 
            RETURNING *
        `;
        
        const result = await pool.query(deleteQuery, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('Record not found.');
        }
        
        res.status(200).send('Record purged successfully.');
    } catch (err) {
        console.error("Critical Backend Deletion Error:", err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
};

