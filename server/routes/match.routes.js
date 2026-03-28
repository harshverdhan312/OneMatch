const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const { requireAuth } = require('../middleware/auth.middleware'); // assuming requireAuth is the middleware

// Using a generic auth middleware name, fallback to just authMiddleware if it's the default export
const auth = requireAuth || require('../middleware/auth.middleware'); 

router.get('/current', auth, matchController.getCurrentMatch.bind(matchController));
router.post('/:id/respond', auth, matchController.respondToMatch.bind(matchController));
router.post('/wait', auth, matchController.enterWaitingPool.bind(matchController));
router.post('/:id/checkin/respond', auth, matchController.respondToCheckIn.bind(matchController));

module.exports = router;
