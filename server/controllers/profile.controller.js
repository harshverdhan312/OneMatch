const profileService = require('../services/profile.service');

class ProfileController {
  async getProfile(req, res) {
    try {
      const profile = await profileService.getProfile(req.user.userId);
      res.status(200).json({ profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async saveBasicInfo(req, res) {
    try {
      const profile = await profileService.updateStep(req.user.userId, 1, { basicInfo: req.body });
      res.status(200).json({ message: 'Basic info saved', profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async savePreferences(req, res) {
    try {
      const profile = await profileService.updateStep(req.user.userId, 2, { preferences: req.body });
      res.status(200).json({ message: 'Preferences saved', profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async saveInterests(req, res) {
    try {
      const profile = await profileService.updateStep(req.user.userId, 3, { interests: req.body.interests });
      res.status(200).json({ message: 'Interests saved', profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async saveQuestions(req, res) {
    try {
      const profile = await profileService.updateStep(req.user.userId, 4, { questions: req.body.questions });
      res.status(200).json({ message: 'Questions saved', profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async connectSpotify(req, res) {
    try {
      const profile = await profileService.updateStep(req.user.userId, 5, req.body);
      res.status(200).json({ message: 'Spotify connected', profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ProfileController();
