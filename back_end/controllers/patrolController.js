const pool = require('../src/config/db'); //  FIXED PATH

// GET: Fetch active patrols
exports.getAllPatrols = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM patrols ORDER BY deployment_date DESC, patrol_id DESC');
        res.status(200).json(result.rows || []);
    } catch (err) {
        res.status(500).send('Server Error: ' + err.message);
    }
};

// POST: Add new deployment logs
exports.createPatrol = async (req, res) => {
    try {
        const { squad_leader, purok_location, shift_assignment, deployment_date } = req.body;
        const queryText = `
            INSERT INTO patrols (squad_leader, purok_location, shift_assignment, deployment_date)
            VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(queryText, [squad_leader, purok_location, shift_assignment, deployment_date]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Server Error: ' + err.message);
    }
};

// DELETE: Terminate and clear rows
exports.deletePatrol = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM patrols WHERE patrol_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).send('Roster assignment entry not found.');
        res.status(200).send('Squad successfully recalled.');
    } catch (err) {
        res.status(500).send('Server Error: ' + err.message);
    }
};