const CheckIn = require('../models/CheckIn');
const matchService = require('./match.service');

class CheckInService {
  async triggerCheckIns() {
    const Match = require('../models/Match');
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 24h Check-ins
    const matches24h = await Match.find({
      status: { $in: ['matched', 'chatting'] },
      matchedAt: { $lte: twentyFourHoursAgo }
    });

    for (const match of matches24h) {
      const existing = await CheckIn.findOne({ matchId: match._id, type: '24h' });
      if (!existing) {
        await CheckIn.create({ matchId: match._id, type: '24h', status: 'sent', sentAt: now });
        console.log(`24h check-in triggered for match ${match._id}`);
      }
    }

    // 1w Check-ins
    const matches1w = await Match.find({
      status: { $in: ['matched', 'chatting'] },
      matchedAt: { $lte: oneWeekAgo }
    });

    for (const match of matches1w) {
      const existing = await CheckIn.findOne({ matchId: match._id, type: '1w' });
      if (!existing) {
        await CheckIn.create({ matchId: match._id, type: '1w', status: 'sent', sentAt: now });
        console.log(`1w check-in triggered for match ${match._id}`);
      }
    }
  }

  async respondToCheckIn(userId, matchId, type, response) {
    const checkIn = await CheckIn.findOne({ matchId, type, status: 'sent' });
    if (!checkIn) throw new Error('No active check-in found for this type');

    // Add or update response
    const existingResponseIndex = checkIn.userResponses.findIndex(r => r.userId.toString() === userId.toString());
    if (existingResponseIndex > -1) {
      checkIn.userResponses[existingResponseIndex].response = response;
      checkIn.userResponses[existingResponseIndex].respondedAt = new Date();
    } else {
      checkIn.userResponses.push({ userId, response });
    }

    if (response === 'move_on') {
      checkIn.status = 'completed';
      await matchService.dissolveMatch(matchId);
    } else {
      // If both said yes, complete it
      const Match = require('../models/Match');
      const match = await Match.findById(matchId);
      const otherUserId = match.user1.toString() === userId.toString() ? match.user2 : match.user1;
      
      const otherRespondedYes = checkIn.userResponses.some(r => r.userId.toString() === otherUserId.toString() && r.response === 'yes');
      if (otherRespondedYes && response === 'yes') {
        checkIn.status = 'completed';
      }
    }

    await checkIn.save();
    return checkIn;
  }

  async getPendingCheckIn(userId) {
    const Match = require('../models/Match');
    const activeMatch = await Match.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: { $in: ['matched', 'chatting'] }
    });

    if (!activeMatch) return null;

    const pending = await CheckIn.findOne({
      matchId: activeMatch._id,
      status: 'sent',
      'userResponses.userId': { $ne: userId }
    });

    return pending;
  }
}

module.exports = new CheckInService();
