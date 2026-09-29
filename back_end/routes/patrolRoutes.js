const express = require('express');
const router = express.Router();
const patrolController = require('../controllers/patrolController');

router.get('/patrols', patrolController.getAllPatrols);
router.post('/patrols', patrolController.createPatrol);
router.delete('/patrols/:id', patrolController.deletePatrol);

module.exports = router;