const express = require('express');
const chatController = require('../controllers/chat.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.post('/send', chatController.sendMessage.bind(chatController));
router.get('/:matchId', chatController.getMessages.bind(chatController));

module.exports = router;
