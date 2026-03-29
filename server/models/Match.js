const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  user2: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  compatibilityScore: { 
    type: Number, 
    required: true 
  },
  overlapDetails: {
    interests: [{ type: String }],
    spotifyArtists: [{ type: String }],
    spotifyTracks: [{ type: String }]
  },
  user1Action: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined'], 
    default: 'pending' 
  },
  user2Action: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined'], 
    default: 'pending' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'matched', 'chatting', 'declined', 'dissolved'], 
    default: 'pending' 
  },
  matchedAt: {
    type: Date
  }
}, { timestamps: true });

// To prevent same pair matching multiple times
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

module.exports = mongoose.model('Match', matchSchema);
