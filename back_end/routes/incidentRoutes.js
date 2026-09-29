const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

router.get('/incidents', incidentController.getIncidents);

router.get('/purok-stats', incidentController.getPurokIncidentStats);

router.post('/incidents', incidentController.createIncident);

router.patch('/incidents/:id/status', incidentController.verifyIncidentStatus);

router.put('/incidents/:id', incidentController.updateIncidentStatus);

router.delete('/incidents/:id', incidentController.deleteIncidentRecord);

module.exports = router;