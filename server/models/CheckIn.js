const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  type: {
    type: String,
    enum: ['24h', '1w'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'completed'],
    default: 'pending'
  },
  userResponses: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    response: { type: String, enum: ['yes', 'move_on'] },
    respondedAt: { type: Date, default: Date.now }
  }],
  sentAt: {
    type: Date
  }
}, { timestamps: true });

// Ensure unique check-in per match and type
checkInSchema.index({ matchId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('CheckIn', checkInSchema);
