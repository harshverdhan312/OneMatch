const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Handle variations of authMiddleware
const { requireAuth } = require('../middleware/auth.middleware');
const auth = requireAuth || require('../middleware/auth.middleware');

router.get('/:matchId/messages', auth, chatController.getMessages.bind(chatController));

module.exports = router;
