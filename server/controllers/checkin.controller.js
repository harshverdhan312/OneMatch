const checkInService = require('../services/checkin.service');

class CheckInController {
  async respondToCheckIn(req, res, next) {
    try {
      const { matchId, type, response } = req.body;
      if (!['24h', '1w'].includes(type)) throw new Error('Invalid check-in type');
      if (!['yes', 'move_on'].includes(response)) throw new Error('Invalid response');

      const result = await checkInService.respondToCheckIn(req.user.userId, matchId, type, response);
      res.status(200).json({ message: 'Check-in response recorded', data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPendingCheckIn(req, res, next) {
    try {
      const checkIn = await checkInService.getPendingCheckIn(req.user.userId);
      res.status(200).json({ data: checkIn });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckInController();
