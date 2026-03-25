const Message = require('../models/Message');
const Match = require('../models/Match');

class ChatController {
  async getMessages(req, res) {
    try {
      const { matchId } = req.params;
      const userId = req.user.id; // assumed set by auth middleware

      // Verify user is part of the match
      const match = await Match.findById(matchId);
      if (!match) {
        return res.status(404).json({ message: 'Match not found' });
      }

      if (match.user1.toString() !== userId && match.user2.toString() !== userId) {
        return res.status(403).json({ message: 'Unauthorized to view these messages' });
      }

      // Fetch messages sorted by oldest first
      const messages = await Message.find({ matchId })
        .sort({ createdAt: 1 })
        .populate('senderId', 'basicInfo.name photos');

      res.status(200).json({ messages });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ChatController();
