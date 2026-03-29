const Match = require('../models/Match');
const Profile = require('../models/Profile');
const mongoose = require('mongoose');

class MatchService {
  /**
   * Generates matches for all eligible, unmatched users.
   */
  async generateMatches() {
    console.log('Starting match generation process...');
    
    // 1. Get all active matches (pending or matched)
    const activeMatches = await Match.find({ status: { $in: ['pending', 'matched'] } });
    
    // Users currently in an active match
    const matchedUserIds = new Set();
    activeMatches.forEach(m => {
      matchedUserIds.add(m.user1.toString());
      matchedUserIds.add(m.user2.toString());
    });

    // 2. Get all completed profiles not in active matches
    const eligibleProfiles = await Profile.find({
      isComplete: true,
      inWaitingPool: true,
      userId: { $nin: Array.from(matchedUserIds) }
    });

    console.log(`Found ${eligibleProfiles.length} eligible unmatched profiles.`);

    // Keep track of who we match in this run
    const freshlyMatched = new Set();

    for (let i = 0; i < eligibleProfiles.length; i++) {
      const user1 = eligibleProfiles[i];
      if (freshlyMatched.has(user1.userId.toString())) continue;

      let bestCandidate = null;
      let highestScore = -1;
      let bestOverlap = null;

      for (let j = i + 1; j < eligibleProfiles.length; j++) {
        const user2 = eligibleProfiles[j];
        if (freshlyMatched.has(user2.userId.toString())) continue;

        // Skip if they already had a match historically (even declined)
        const pastMatch = await Match.findOne({
          $or: [
            { user1: user1.userId, user2: user2.userId },
            { user1: user2.userId, user2: user1.userId }
          ]
        });
        if (pastMatch) continue;

        // Check mutual filters
        if (!this.passesFilters(user1, user2)) continue;

        // Calculate overlap and score
        const { score, overlapDetails } = this.calculateCompatibility(user1, user2);

        if (score > highestScore) {
          highestScore = score;
          bestCandidate = user2;
          bestOverlap = overlapDetails;
        }
      }

      // If we found a candidate, create a Match
      if (bestCandidate) {
        console.log(`Matching ${user1.userId} with ${bestCandidate.userId} (Score: ${highestScore})`);
        
        await Match.create({
          user1: user1.userId,
          user2: bestCandidate.userId,
          compatibilityScore: highestScore,
          overlapDetails: bestOverlap,
          status: 'pending'
        });

        await Profile.updateMany(
          { userId: { $in: [user1.userId, bestCandidate.userId] } },
          { $set: { inWaitingPool: false } }
        );

        freshlyMatched.add(user1.userId.toString());
        freshlyMatched.add(bestCandidate.userId.toString());
      }
    }
    
    console.log('Match generation complete.');
  }

  passesFilters(p1, p2) {
    // City exact match
    if (p1.basicInfo?.city?.toLowerCase() !== p2.basicInfo?.city?.toLowerCase()) return false;

    // Gender preference
    const p1Wants = p1.preferences?.genderPreference?.toLowerCase();
    const p2Wants = p2.preferences?.genderPreference?.toLowerCase();
    
    const p1Gender = p1.basicInfo?.gender?.toLowerCase();
    const p2Gender = p2.basicInfo?.gender?.toLowerCase();

    // 'anyone' or 'both' could be handled if needed, assuming strict gender match for MVP or just 'male'/'female'
    if (p1Wants && p1Wants !== 'everyone' && p1Wants !== p2Gender) return false;
    if (p2Wants && p2Wants !== 'everyone' && p2Wants !== p1Gender) return false;

    return true;
  }

  calculateCompatibility(p1, p2) {
    let score = 0;
    const overlapDetails = {
      interests: [],
      spotifyArtists: [],
      spotifyTracks: []
    };

    // Interests
    const p1Interests = p1.interests || [];
    const p2Interests = p2.interests || [];
    overlapDetails.interests = p1Interests.filter(i => p2Interests.includes(i));
    score += overlapDetails.interests.length * 10;

    // Spotify Artists
    const p1Artists = (p1.spotifyProfile?.artists || []).map(a => a.name);
    const p2Artists = (p2.spotifyProfile?.artists || []).map(a => a.name);
    overlapDetails.spotifyArtists = p1Artists.filter(a => p2Artists.includes(a));
    score += overlapDetails.spotifyArtists.length * 15;

    // Spotify Tracks
    const p1Tracks = (p1.spotifyProfile?.tracks || []).map(t => t.name);
    const p2Tracks = (p2.spotifyProfile?.tracks || []).map(t => t.name);
    overlapDetails.spotifyTracks = p1Tracks.filter(t => p2Tracks.includes(t));
    score += overlapDetails.spotifyTracks.length * 5;

    // Base score so it's not 0
    score += 10;

    // Cap score at 100 or leave as raw number. Raw is fine.
    const finalScore = Math.min(score, 100);

    return { score: finalScore, overlapDetails };
  }

  // Handle Accept/Decline with active match check
  async respondToMatch(userId, matchId, action) {
    const match = await Match.findById(matchId);
    if (!match) throw new Error('Match not found');

    if (action === 'accepted') {
      // Check if user already has an active match
      const existingActive = await Match.findOne({
        $or: [{ user1: userId }, { user2: userId }],
        status: { $in: ['matched', 'chatting'] },
        _id: { $ne: matchId }
      });
      if (existingActive) throw new Error('You already have an active match');
    }

    if (match.user1.toString() === userId.toString()) {
      match.user1Action = action;
    } else if (match.user2.toString() === userId.toString()) {
      match.user2Action = action;
    } else {
      throw new Error('Not authorized for this match');
    }

    if (action === 'declined') {
      match.status = 'declined';
      // Put users back in pool
      await Profile.updateMany(
        { userId: { $in: [match.user1, match.user2] } },
        { $set: { inWaitingPool: true } }
      );
    } else if (match.user1Action === 'accepted' && match.user2Action === 'accepted') {
      match.status = 'matched';
      match.matchedAt = new Date();
      
      // Update User matchState
      const User = require('../models/User');
      await User.updateMany(
        { _id: { $in: [match.user1, match.user2] } },
        { $set: { matchState: 'matched' } }
      );
    }

    await match.save();
    return match;
  }

  // Get current active match
  async getCurrentMatch(userId) {
    // Find pending, matched, or chatting
    const match = await Match.findOne({
      $or: [{ user1: userId }, { user2: userId }],
      status: { $in: ['pending', 'matched', 'chatting'] }
    });
    return match;
  }

  // Final match dissolution helper (used by check-in or manual move-on)
  async dissolveMatch(matchId) {
    const match = await Match.findById(matchId);
    if (!match) return;
    
    match.status = 'dissolved';
    await match.save();

    // Reset users to waiting pool
    await Profile.updateMany(
      { userId: { $in: [match.user1, match.user2] } },
      { $set: { inWaitingPool: true } }
    );

    const User = require('../models/User');
    await User.updateMany(
      { _id: { $in: [match.user1, match.user2] } },
      { $set: { matchState: 'waiting' } }
    );
  }

  // Enter Waiting Pool
  async enterWaitingPool(userId) {
    const profile = await Profile.findOne({ userId });
    if (!profile) throw new Error('Profile not found');
    
    // Check if already in an active match
    const activeMatch = await this.getCurrentMatch(userId);
    if (activeMatch) {
      throw new Error('You cannot enter the waiting pool while having an active match.');
    }

    profile.inWaitingPool = true;
    await profile.save();
    return profile;
  }
}

module.exports = new MatchService();
