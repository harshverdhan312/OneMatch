const express = require('express');
const checkInController = require('../controllers/checkin.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/respond', checkInController.respondToCheckIn.bind(checkInController));
router.get('/pending', checkInController.getPendingCheckIn.bind(checkInController));

module.exports = router;
