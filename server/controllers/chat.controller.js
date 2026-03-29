const chatService = require('../services/chat.service');

class ChatController {
  async sendMessage(req, res, next) {
    try {
      const { matchId, text } = req.body;
      const message = await chatService.sendMessage(req.user.userId, matchId, text);
      res.status(201).json({ message: 'Message sent successfully', message });
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { matchId } = req.params;
      const messages = await chatService.getMessages(matchId);
      res.status(200).json({ messages });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
