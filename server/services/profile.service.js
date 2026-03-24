const Profile = require('../models/Profile');
const spotifyService = require('./spotify.service');

class ProfileService {
  async getProfile(userId) {
    let profile = await Profile.findOne({ userId });
    if (!profile) {
      profile = new Profile({ userId });
      await profile.save();
    }
    return profile;
  }

  async updateStep(userId, stepNumber, data) {
    const profile = await this.getProfile(userId);
    
    switch (stepNumber) {
      case 1:
        profile.basicInfo = data.basicInfo;
        break;
      case 2:
        profile.preferences = data.preferences;
        break;
      case 3:
        profile.interests = data.interests;
        break;
      case 4:
        profile.questions = data.questions;
        break;
      case 5:
        if (data.spotifyToken) {
          profile.spotifyProfile = await spotifyService.fetchAndNormalize(data.spotifyToken);
        } else if (data.spotifyProfile) {
          profile.spotifyProfile = data.spotifyProfile;
        }
        break;
      default:
        throw new Error('Invalid onboarding step');
    }

    profile.onboardingStep = stepNumber;
    profile.isComplete = this.computeCompleteness(profile);
    
    await profile.save();
    return profile;
  }

  async updateProfile(userId, updateData) {
    const profile = await this.getProfile(userId);
    
    if (updateData.basicInfo) profile.basicInfo = updateData.basicInfo;
    if (updateData.preferences) profile.preferences = updateData.preferences;
    if (updateData.interests) profile.interests = updateData.interests;
    if (updateData.questions) profile.questions = updateData.questions;

    await profile.save();
    return profile;
  }

  async addPhoto(userId, photoData) {
    const profile = await this.getProfile(userId);
    const isFirstPhoto = !profile.photos || profile.photos.length === 0;
    
    if (!profile.photos) profile.photos = [];

    profile.photos.push({
      url: photoData.url,
      publicId: photoData.publicId,
      isMain: isFirstPhoto
    });

    await profile.save();
    return profile;
  }

  computeCompleteness(profile) {
    const hasBasicInfo = !!(profile.basicInfo && profile.basicInfo.name && profile.basicInfo.city);
    const hasPreferences = !!(profile.preferences && profile.preferences.genderPreference);
    const hasInterests = !!(profile.interests && profile.interests.length > 0);
    const hasQuestions = !!(profile.questions && profile.questions.length > 0);
    const hasSpotify = !!(profile.spotifyProfile && (profile.spotifyProfile.artists?.length > 0 || profile.spotifyProfile.tracks?.length > 0));

    return hasBasicInfo && hasPreferences && hasInterests && hasQuestions && hasSpotify;
  }
}

module.exports = new ProfileService();
