const express = require('express');
const { getSessions, deleteSession } = require('../controllers/sessionCtrl');
const router = express.Router();

router.get('/:userId', getSessions);
router.delete('/:sessionId', deleteSession);

module.exports = router;
