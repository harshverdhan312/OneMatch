const matchService = require('../services/match.service');

class MatchController {
  async getCurrentMatch(req, res) {
    try {
      const match = await matchService.getCurrentMatch(req.user.id);
      if (!match) {
        return res.status(404).json({ message: 'No current match found' });
      }
      
      // Populate matched user details to display on frontend
      await match.populate('user1', 'name basicInfo photos spotifyProfile interests');
      await match.populate('user2', 'name basicInfo photos spotifyProfile interests');
      
      const isUser1 = match.user1._id.toString() === req.user.id;
      const matchedUser = isUser1 ? match.user2 : match.user1;
      const currentUserAction = isUser1 ? match.user1Action : match.user2Action;

      res.status(200).json({ match, matchedUser, currentUserAction });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async respondToMatch(req, res) {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'accepted' or 'declined'
      if (!['accepted', 'declined'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action. Must be accepted or declined.' });
      }
      
      const match = await matchService.respondToMatch(req.user.id, id, action);
      res.status(200).json({ message: `Match ${action} successfully`, match });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async enterWaitingPool(req, res) {
    try {
      await matchService.enterWaitingPool(req.user.id);
      res.status(200).json({ message: 'Successfully entered waiting pool' });
    } catch (error) {
      if (error.message === 'You cannot enter the waiting pool while having an active match.') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async respondToCheckIn(req, res) {
    try {
      const { id } = req.params;
      const { checkType, response } = req.body; // checkType: '24h' or '1w', response: 'yes' or 'move_on'
      
      if (!['24h', '1w'].includes(checkType)) {
        return res.status(400).json({ message: 'Invalid checkType' });
      }
      if (!['yes', 'move_on'].includes(response)) {
        return res.status(400).json({ message: 'Invalid response' });
      }

      const match = await matchService.respondToCheckIn(req.user.id, id, checkType, response);
      res.status(200).json({ message: 'Check-in response recorded', match });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new MatchController();
