const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  basicInfo: {
    name: String,
    dob: Date,
    gender: String,
    city: String
  },
  preferences: {
    ageRange: { min: Number, max: Number },
    genderPreference: String,
    maxDistance: Number
  },
  interests: [String],
  questions: [{
    prompt: String,
    answer: String
  }],
  spotifyProfile: {
    artists: [{ id: String, name: String, images: [String], uri: String }],
    tracks: [{ id: String, name: String, images: [String], uri: String }],
    playlists: [{ id: String, name: String, images: [String], uri: String }]
  },
  photos: [{
    url: String,
    publicId: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  onboardingStep: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
