const Message = require('../models/Message');
const Match = require('../models/Match');

class ChatService {
  async sendMessage(senderId, matchId, text) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match not found');

    if (match.status !== 'matched' && match.status !== 'chatting') {
      throw new Error('Chat is only available for active matches');
    }

    const message = new Message({
      matchId,
      sender: senderId,
      text
    });

    await message.save();

    // Transition match state if this is the first message
    if (match.status === 'matched') {
      match.status = 'chatting';
      await match.save();
    }

    return message;
  }

  async getMessages(matchId) {
    return await Message.find({ matchId }).sort({ createdAt: 1 });
  }
}

module.exports = new ChatService();
